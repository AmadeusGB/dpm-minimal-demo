# DPM (Deeper Mail) Minimal Demo

A minimal demo implementation of Deeper Mail, demonstrating the core concepts of decentralized email communication based on Deeper Network infrastructure.

## Project Vision

DPM aims to create a truly decentralized email system where:
- No central email servers (unlike traditional Gmail/SMTP)
- Each Deeper Node acts as a "micro mail relay node"
- Emails are transmitted directly between nodes
- Communication happens through DPN (Deeper Network) traffic
- Users maintain full control of their data

## Logical Architecture

### 1. Network Architecture (DPN Device Perspective)
```
   ┌───────────────┐                  ┌───────────────┐
   │   Device A    │                  │   Device B    │
   │ alice@d.mail  │───────DPN───────▶│  bob@d.mail  │
   └───────┬───────┘                  └───────┬───────┘
           │                                  │
    Local Mail Service                Local Mail Service
           │                                  │
   ┌───────┴───────┐                  ┌──────┴────────┐
   │  Mail Engine  │                  │  Mail Engine  │
   │ ┌──────────┐  │                  │ ┌──────────┐  │
   │ │ Outbox   │  │                  │ │  Inbox   │  │
   │ └──────────┘  │                  │ └──────────┘  │
   │ ┌──────────┐  │                  │ ┌──────────┐  │
   │ │  Sender  │  │                  │ │Receiver  │  │
   │ └──────────┘  │                  │ └──────────┘  │
   └───────┬───────┘                  └───────┬───────┘
           │                                  │
   ┌───────┴──────────────────────────┴───────┐
   │              AtomOS Layer               │
   │    DPN Message Router + Local Storage   │
   └────────────────────────────────────────┘
```

### 2. Component Description

#### Device Layer
- **Device A/B**: Physical Deeper Network devices
- **Email Identity**: Each device associated with a `@deeper.mail` address
- **DPN Connection**: Direct peer-to-peer communication channel

#### Mail Service Layer
- **Local Mail Service**: Handles email operations on each device
- **Mail Engine**: Core processing unit for email operations
  - **Outbox**: Queues outgoing emails
  - **Inbox**: Stores incoming emails
  - **Sender**: Manages email transmission
  - **Receiver**: Handles incoming emails

#### Infrastructure Layer
- **AtomOS**: Operating system layer for Deeper devices
- **DPN Message Router**: Handles message routing between devices
- **Local Storage**: Persistent storage for emails and settings

### 3. Message Flow
1. User A composes email on Device A
2. Mail Engine processes and queues in Outbox
3. DPN Message Router establishes connection to recipient
4. Message transmitted through DPN network
5. Device B receives and processes message
6. Email stored in recipient's Inbox

## Current Implementation (P1)

This is the P1 phase implementation focusing on:
- Local email sending and receiving through WebSocket
- Node discovery and registration
- Basic UI/UX for email operations
- Local storage using JSON files
- Core email data structures

### Features

- User authentication with `@deeper.mail` addresses
- Basic email composition and sending
- Inbox and sent mail management
- Local file-based storage for demonstration purposes
- Real-time message delivery via WebSocket
- Node discovery and registration

### Limitations (P1 Phase)

- Limited to local network communication
- Basic node discovery mechanism
- No encryption or signature verification
- No DPN integration yet

## Tech Stack

- Next.js 15.3.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management
- WebSocket for real-time communication
- Node.js discovery service

## Environment Setup

Before starting, ensure your system meets these requirements:

### System Requirements
- OS: Windows 10+/macOS/Linux
- Node.js: v18.0.0 or higher
- Package Manager: yarn (recommended) or npm
- Browser: Latest Chrome/Firefox/Edge

### Tool Installation
1. Install Node.js
   - Visit [Node.js website](https://nodejs.org/)
   - Download and install LTS version
   - Verify installation:
     ```bash
     node --version
     # Should display v18.x.x or higher
     ```

2. Install yarn (if not installed)
   ```bash
   npm install -g yarn
   
   # Verify installation
   yarn --version
   ```

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/AmadeusGB/dpm-minimal-demo.git
   cd dpm-minimal-demo
   ```

2. Install main app dependencies:
   ```bash
   # In project root
   yarn install
   ```

3. Install discovery service dependencies:
   ```bash
   # Enter discovery service directory
   cd discovery-service
   yarn install
   ```

## Starting Services

You'll need two terminal windows to run both services.

### Terminal 1 - Discovery Service:
```bash
# If in project root, first cd to discovery-service
cd discovery-service

# Build service
yarn build

# Start service
yarn start

# Expected output:
# > discovery-service@1.0.0 start
# > node dist/server.js
# WebSocket server is running on port 3002
```

### Terminal 2 - Main Application:
```bash
# If in discovery-service directory, return to project root
cd ..

# Start development server
yarn dev

# Expected output:
# ready - started server on 0.0.0.0:3000
```

## Testing

1. Open browser at [http://localhost:3000](http://localhost:3000)

2. Multi-user testing:
   - Open two different browser windows (or one normal and one incognito)
   - Login as User A (e.g., `alice@deeper.mail`) in first window
   - Login as User B (e.g., `bob@deeper.mail`) in second window

3. Send test email:
   - In User A's window, click "Compose"
   - Enter User B's email (`bob@deeper.mail`)
   - Fill subject and content
   - Click "Send"

4. Verify real-time reception:
   - Switch to User B's window
   - Email should appear instantly in inbox
   - No page refresh needed

## Troubleshooting

### 1. Port Conflicts
If you see:
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
Solutions:
- Find and close the program using the port
- Or modify port number in `package.json` (requires code updates)

### 2. Connection Issues
If services won't connect:
- Verify both services are running
- Check browser console for errors
- Verify WebSocket connection (Browser DevTools -> Network -> WS)

### 3. Dependency Issues
If `yarn install` fails:
- Delete `node_modules` folder and `yarn.lock`
- Run `yarn install` again
- Try `npm install` if yarn continues to fail

### 4. Build Errors
If build fails:
- Verify Node.js version
- Clear build cache:
  ```bash
  # In discovery-service directory
  rm -rf dist
  yarn build
  ```

## Development Tips

1. VS Code Setup (Recommended)
   - Install TypeScript and ESLint extensions
   - Enable auto-formatting

2. Debugging
   - Use browser DevTools for WebSocket monitoring
   - Check terminal logs
   - Use console.log for code debugging

## Project Structure

```
src/
  ├── app/
  │   ├── api/          # API routes for email operations
  │   │   ├── send/     # Email sending endpoint
  │   │   ├── inbox/    # Fetch inbox emails
  │   │   └── sent/     # Fetch sent emails
  │   ├── compose/      # Email composition page
  │   ├── inbox/        # Inbox page
  │   ├── login/        # User login page
  │   └── sent/         # Sent emails page
  ├── services/         # Client services
  │   └── websocket.ts  # WebSocket client implementation
  └── store/            # Global state management
      └── useStore.ts   # Zustand store for email data

discovery-service/      # Node discovery and message relay service
  ├── src/
  │   ├── server.ts     # WebSocket server
  │   ├── services/     # Core services
  │   │   ├── registry.ts  # Node registry
  │   │   └── websocket.ts # WebSocket handler
  │   └── types/        # Type definitions
  │       ├── message.ts   # Message types
  │       └── node.ts      # Node types
  └── dist/            # Compiled JavaScript

data/                  # Local storage directory
  ├── inbox_*.json     # User inbox files
  └── sent_*.json      # User sent files
```

## Technical Details

### Data Storage
- Emails are stored in JSON files in the `data/` directory
- Each user has separate inbox and sent files
- File naming format: `inbox_username.json` and `sent_username.json`

### State Management
- Uses Zustand for global state management
- Maintains current user session
- Manages email lists (inbox/sent)
- Handles email operations (send/receive)
- Manages WebSocket connection state

### WebSocket Communication
- Discovery service runs WebSocket server on port 3002
- Clients connect on login with their email address
- Real-time message delivery between nodes
- Node registration and discovery
- Heartbeat mechanism for node status

### API Routes
- `/api/send`: Handle email sending
- `/api/inbox`: Fetch user's inbox
- `/api/sent`: Fetch user's sent emails

## Future Development

### Phase 2 (P2)
- ✅ Enable LAN device communication
- ✅ Implement WebSocket for real-time updates
- Add basic encryption

### Phase 3 (P3)
- Integrate with DPN
- Implement advanced node discovery
- Add message routing

### Phase 4 (P4)
- Global address resolution
- Full encryption and signatures
- DHT-based routing

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is open source and available under the MIT license.
