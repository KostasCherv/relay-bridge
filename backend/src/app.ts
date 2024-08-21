import express from 'express';
import bridgeRoutes from './routes/bridge';
import { bridgeService } from './services/BridgeService';
import * as dotenv from 'dotenv';
import connectDB from './database';
require('./services/taskPoller');
dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use('/api/bridge', bridgeRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  bridgeService.listenForBurnEvents();
});
