import { Router } from 'express';
import { bridgeService } from '../services/BridgeService';
import { BridgeRecord } from '../models/BridgeRecord';

const router = Router();

router.get('/transactions/:user', async (req, res) => {
  try {
    const { user } = req.params;
    const { page, limit } = req.query;

    const records = await BridgeRecord.find({ user })
      .skip(page ? parseInt(page as string) : 0)
      .limit(limit ? parseInt(limit as string) : 10)
      .sort({ createdAt: -1 });

    res.send(records);
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/burn', async (req, res) => {
  const { amount, chain, user } = req.body;
  if (!amount || !chain || !user) {
    res.status(400).send({ error: 'Invalid request. Please provide amount, chain, and user' });
    return;
  }

  try {
    const response = await bridgeService.sendBurnTask(BigInt(amount), chain, user);
    res.send({ status: 'success', response });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

router.post('/mint', async (req, res) => {
  const { amount, chain, user } = req.body;
  if (!amount || !chain || !user) {
    res.status(400).send({ error: 'Invalid request. Please provide amount, chain, and user' });
    return;
  }

  try {
    const response = await bridgeService.sendMintTask(BigInt(amount), chain, user);
    res.send({ status: 'success', response });
  } catch (error: any) {
    res.status(500).send({ error: error.message });
  }
});

export default router;
