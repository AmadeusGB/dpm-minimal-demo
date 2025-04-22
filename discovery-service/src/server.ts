import express, { Request, Response, Router } from 'express';
import cors from 'cors';
import { registryService } from './services/registry';
import { NodeRegistrationRequest, NodeLookupRequest, HeartbeatRequest } from './types/node';
import { ParamsDictionary } from 'express-serve-static-core';
import { WebSocketService } from './services/websocket';

const app = express();
const router = Router();
const port = process.env.PORT || 3001;
const wsPort = process.env.WS_PORT || 3002;

// 启动WebSocket服务
const wsService = new WebSocketService(Number(wsPort));

// 中间件
app.use(express.json());
app.use(cors());

// 路由处理
router.post('/register', async (req: Request<ParamsDictionary, any, NodeRegistrationRequest>, res: Response) => {
  try {
    const { ipAddress, port, mailAddress } = req.body;
    const node = registryService.registerNode({ ipAddress, port, mailAddress });
    res.json({ success: true, node });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

router.get('/lookup', async (req: Request<ParamsDictionary, any, any, NodeLookupRequest>, res: Response) => {
  try {
    const query = req.query as unknown as NodeLookupRequest;
    const { mailAddress } = query;
    if (!mailAddress) {
      res.status(400).json({ success: false, error: 'Mail address is required' });
      return;
    }

    const node = registryService.getNodeByMail(mailAddress);
    if (!node) {
      res.status(404).json({ success: false, error: 'Node not found' });
      return;
    }

    res.json({ success: true, node });
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ success: false, error: 'Lookup failed' });
  }
});

router.get('/nodes', async (req: Request, res: Response) => {
  try {
    const nodes = registryService.getAllNodes();
    res.json({ success: true, nodes });
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({ success: false, error: 'Failed to get nodes' });
  }
});

router.post('/heartbeat', async (req: Request<ParamsDictionary, any, HeartbeatRequest>, res: Response) => {
  try {
    const { nodeId } = req.body;
    if (!nodeId) {
      res.status(400).json({ success: false, error: 'Node ID is required' });
      return;
    }

    const success = registryService.updateHeartbeat(nodeId);
    if (!success) {
      res.status(404).json({ success: false, error: 'Node not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ success: false, error: 'Heartbeat update failed' });
  }
});

// 使用路由
app.use('/', router);

// 启动服务器
app.listen(port, () => {
  console.log(`Discovery service is running on port ${port}`);
  console.log(`WebSocket service is running on port ${wsPort}`);
}); 