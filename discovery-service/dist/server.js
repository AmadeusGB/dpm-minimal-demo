"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const registry_1 = require("./services/registry");
const websocket_1 = require("./services/websocket");
const app = (0, express_1.default)();
const router = (0, express_1.Router)();
const port = process.env.PORT || 3001;
const wsPort = process.env.WS_PORT || 3002;
// 启动WebSocket服务
const wsService = new websocket_1.WebSocketService(Number(wsPort));
// 中间件
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// 路由处理
router.post('/register', async (req, res) => {
    try {
        const { ipAddress, port, mailAddress } = req.body;
        const node = registry_1.registryService.registerNode({ ipAddress, port, mailAddress });
        res.json({ success: true, node });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});
router.get('/lookup', async (req, res) => {
    try {
        const query = req.query;
        const { mailAddress } = query;
        if (!mailAddress) {
            res.status(400).json({ success: false, error: 'Mail address is required' });
            return;
        }
        const node = registry_1.registryService.getNodeByMail(mailAddress);
        if (!node) {
            res.status(404).json({ success: false, error: 'Node not found' });
            return;
        }
        res.json({ success: true, node });
    }
    catch (error) {
        console.error('Lookup error:', error);
        res.status(500).json({ success: false, error: 'Lookup failed' });
    }
});
router.get('/nodes', async (req, res) => {
    try {
        const nodes = registry_1.registryService.getAllNodes();
        res.json({ success: true, nodes });
    }
    catch (error) {
        console.error('Get nodes error:', error);
        res.status(500).json({ success: false, error: 'Failed to get nodes' });
    }
});
router.post('/heartbeat', async (req, res) => {
    try {
        const { nodeId } = req.body;
        if (!nodeId) {
            res.status(400).json({ success: false, error: 'Node ID is required' });
            return;
        }
        const success = registry_1.registryService.updateHeartbeat(nodeId);
        if (!success) {
            res.status(404).json({ success: false, error: 'Node not found' });
            return;
        }
        res.json({ success: true });
    }
    catch (error) {
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
