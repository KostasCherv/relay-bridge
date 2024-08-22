import {Redis} from 'ioredis';
import { config } from '../config';

export class QueueService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redisUrl);
  }

  public async publishEvent(type: string, payload: any) {
    await this.redis.lpush('eventQueue', JSON.stringify({ type, payload }));
  }

  public async consumeEvent(handler: (type: string, payload: any) => Promise<void>) {
    this.redis.blpop('eventQueue', 0, async (err, message) => {
      if (err) {
        console.error('Error consuming event:', err);
        return;
      }
      if (!message) {
        console.error('No message found');
        return;
      }
      const { type, payload } = JSON.parse(message[1]);
      await handler(type, payload);

      // Continue consuming
      this.consumeEvent(handler);
    });
  }
}

export const queueService = new QueueService();
