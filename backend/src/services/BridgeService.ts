import { ethers } from 'ethers';
import { config } from '../config';
import MockERC20ABI from '../abis/MockERC20ABI.json';
import { CallWithERC2771Request, GelatoRelay, TaskState } from '@gelatonetwork/relay-sdk';
import { BridgeRecord, IBridgeRecord, TaskStatus, BridgeStatus } from '../models/BridgeRecord';

const relay = new GelatoRelay();

const chains: Record<string, { chainId: number; tokenAddress: string; provider: ethers.JsonRpcProvider }> =
  config.chains;

class BridgeService {
  private contracts: Record<string, ethers.Contract>;

  constructor() {
    this.contracts = this.initializeContracts();
  }

  private initializeContracts() {
    return Object.keys(chains).reduce(
      (acc, chain) => {
        acc[chain] = new ethers.Contract(chains[chain].tokenAddress, MockERC20ABI, chains[chain].provider);
        return acc;
      },
      {} as Record<string, ethers.Contract>
    );
  }

  public async listenForBurnEvents() {
    console.log('Listening for burn events');
    Object.keys(this.contracts).forEach((chain) => this.listenForEvents(chain));
  }

  private listenForEvents(chain: string) {
    const contract = this.contracts[chain];

    contract.on('Transfer', async (from: string, to: string, amount: BigInt, event: ethers.ContractEventPayload) => {
      if (to === ethers.ZeroAddress) {
        console.log(`Burn detected on ${chain}: ${amount.toString()} from ${from}`);
        await this.handleBurnEvent(chain, from, amount, event.log.transactionHash);
      } else if (from === ethers.ZeroAddress) {
        console.log(`Mint detected on ${chain}: ${amount.toString()} to ${to}`);
        await this.updateUserTasks(to);
      }
    });
  }

  private async handleBurnEvent(chain: string, user: string, amount: BigInt, originTxHash: string) {
    await this.updateUserTasks(user);
    const targetChain = this.getTargetChain(chain);

    const bridgeRecord = await BridgeRecord.findOne({ originTxHash });
    if (bridgeRecord) {
      const mintAmount = await this.calculateMintAmountAfterFee(amount.toString(), targetChain);
      const response = await this.sendMintTask(mintAmount, targetChain, user);
      bridgeRecord.targetTaskId = response.taskId;
      bridgeRecord.targetTaskStatus = TaskStatus.PENDING;
      await bridgeRecord.save();
    }
  }

  public async calculateMintAmountAfterFee(amount: string, chain: string): Promise<bigint> {
    const contract = this.contracts[chain];
    const burnFee = parseInt(await contract.burnFeePct()); // 100 means 1%
    const mintAmount: bigint = BigInt(amount) - (BigInt(amount) * BigInt(burnFee) / BigInt(10000));

    return mintAmount;
  }

  public async sendBurnTask(amount: BigInt, chain: string, user: string) {
    const calldata = this.buildCalldata('burn', [user, amount]);
    const response = await this.relayTransaction(chain, calldata);
    const targetChain = this.getTargetChain(chain);
    await this.saveBridgeRecord(user, chain, response.taskId, amount, targetChain);
  }

  public async sendMintTask(amount: BigInt, chain: string, user: string) {
    const calldata = this.buildCalldata('mint', [user, amount]);
    return await this.relayTransaction(chain, calldata);
  }

  private buildCalldata(method: string, args: any[]): string {
    const iface = new ethers.Interface(MockERC20ABI);
    return iface.encodeFunctionData(method, args);
  }

  private async relayTransaction(chain: string, calldata: string) {
    const chainConfig = chains[chain];
    if (!chainConfig) {
      throw new Error(`Chain ${chain} is not supported`);
    }

    const signer = new ethers.Wallet(config.operatorPrivateKey, chainConfig.provider);
    const request: CallWithERC2771Request = {
      chainId: BigInt(chainConfig.chainId),
      target: chainConfig.tokenAddress,
      data: calldata,
      user: signer.address,
    };

    try {
      return await relay.sponsoredCallERC2771(request, signer as any, config.relayerApiKey);
    } catch (error) {
      console.error(`Error relaying transaction on ${chain}:`, error);
      throw error;
    }
  }

  private async saveBridgeRecord(
    user: string,
    originChain: string,
    originTaskId: string,
    amount: BigInt,
    targetChain: string
  ) {
    const record = new BridgeRecord({
      user,
      originChain,
      originTaskId,
      originTaskStatus: TaskStatus.PENDING,
      amount: amount.toString(),
      targetChain,
    });
    await record.save();
  }

  public async updateBridgeRecord(taskId: string, type: 'origin' | 'target') {
    try {
      const task = await relay.getTaskStatus(taskId);
      if (!task) {
        console.log('No task found for this taskId:', taskId);
        return;
      }

      const record = await this.findAndUpdateRecord(taskId, type, task);
      if (record) {
        this.updateFinalBridgeStatus(record);
        await record.save();
      }
    } catch (error: any) {
      console.error('Error while updating bridge record:', error.message);
    }
  }

  private async findAndUpdateRecord(taskId: string, type: 'origin' | 'target', task: any) {
    const query = type === 'origin' ? { originTaskId: taskId } : { targetTaskId: taskId };
    const record = await BridgeRecord.findOne(query);

    if (record) {
      const taskStatus = this.determineTaskStatus(task.taskState);
      if (type === 'origin') {
        record.originTaskStatus = taskStatus;
        record.originTxHash = task.transactionHash || record.originTxHash;
      } else {
        record.targetTaskStatus = taskStatus;
        record.targetTxHash = task.transactionHash || record.targetTxHash;
      }
    }

    return record;
  }

  private determineTaskStatus(taskState: string): string {
    switch (taskState) {
      case TaskState.ExecPending:
      case TaskState.WaitingForConfirmation:
        return TaskStatus.PENDING;
      case TaskState.ExecReverted:
      case TaskState.Cancelled:
        return TaskStatus.FAILED;
      default:
        return TaskStatus.COMPLETED;
    }
  }

  private updateFinalBridgeStatus(record: IBridgeRecord) {
    if (record.originTaskStatus === TaskStatus.COMPLETED && record.targetTaskStatus === TaskStatus.COMPLETED) {
      record.status = BridgeStatus.COMPLETED;
    } else if (record.originTaskStatus === TaskStatus.FAILED || record.targetTaskStatus === TaskStatus.FAILED) {
      record.status = BridgeStatus.FAILED;
    } else {
      record.status = BridgeStatus.PENDING;
    }
  }

  public async updatePendingTasks() {
    const pendingRecords = await BridgeRecord.find({ status: BridgeStatus.PENDING });
    await this.updateTaskStatus(pendingRecords);
  }

  public async updateUserTasks(user: string) {
    try {
      const records = await BridgeRecord.find({ user });
      await this.updateTaskStatus(records);
    } catch (error: any) {
      console.error('Error updating user tasks:', error.message);
    }
  }

  private async updateTaskStatus(records: IBridgeRecord[]) {
    for (const record of records) {
      if (record.originTaskStatus === TaskStatus.PENDING) {
        await this.updateBridgeRecord(record.originTaskId, 'origin');
      }
      if (record.targetTaskStatus === TaskStatus.PENDING && record.targetTaskId) {
        await this.updateBridgeRecord(record.targetTaskId, 'target');
      }
    }
  }

  private getTargetChain(chain: string): string {
    return chain === 'arbitrum' ? 'optimism' : 'arbitrum';
  }
}

export const bridgeService = new BridgeService();
