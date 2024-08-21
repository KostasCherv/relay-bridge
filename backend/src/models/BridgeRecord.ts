import mongoose, { Schema, Document } from 'mongoose';

export interface IBridgeRecord extends Document {
  user: string;
  originChain: string;
  originTxHash?: string;
  originTaskId: string;
  originTaskStatus: string;
  targetChain: string;
  targetTxHash?: string;
  targetTaskId?: string;
  targetTaskStatus?: string;
  amount: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const TaskStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const BridgeStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

const BridgeRecordSchema: Schema = new Schema(
  {
    user: { type: String, required: true },
    originChain: { type: String, required: true },
    originTxHash: { type: String },
    originTaskId: { type: String, required: true },
    originTaskStatus: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.PENDING },
    targetChain: { type: String, required: true },
    targetTxHash: { type: String },
    targetTaskId: { type: String },
    targetTaskStatus: { type: String, enum: Object.values(TaskStatus) },
    amount: { type: String, required: true },
    status: { type: String, enum: Object.values(BridgeStatus), default: BridgeStatus.PENDING },
  },
  { timestamps: true }
);

export const BridgeRecord = mongoose.model<IBridgeRecord>('BridgeRecord', BridgeRecordSchema);
