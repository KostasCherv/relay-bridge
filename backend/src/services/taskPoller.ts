import { bridgeService } from './BridgeService';

const POLLING_INTERVAL = 10000; // 10 seconds

async function startPolling() {
  console.log('Starting task status polling...');
  while (true) {
    try {
      await bridgeService.updatePendingTasks();
    } catch (err) {
      console.error('Error while polling task status:', err);
    }
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }
}

startPolling();
