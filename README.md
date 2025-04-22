# DPM (Deeper Mail) Minimal Demo

A minimal demo implementation of Deeper Mail, demonstrating the core concepts of decentralized email communication based on Deeper Network infrastructure.

## Project Vision

DPM aims to create a truly decentralized email system where:
- No central email servers (unlike traditional Gmail/SMTP)
- Each Deeper Node acts as a "micro mail relay node"
- Emails are transmitted directly between nodes
- Communication happens through DPN (Deeper Network) traffic
- Users maintain full control of their data

This demo represents Phase 1 (P1) of the project, focusing on basic email functionality and node discovery within a local network.

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

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/AmadeusGB/dpm-minimal-demo.git
cd dpm-minimal-demo
```

2. Install dependencies for both main app and discovery service:
```bash
# Install main app dependencies
yarn install

# Install discovery service dependencies
cd discovery-service
yarn install
cd ..
```

3. Start both services:

Terminal 1 - Start the discovery service:
```bash
cd discovery-service
yarn build
yarn start
```

Terminal 2 - Start the main app:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

The discovery service will run on port 3002 and handle WebSocket connections.

## Usage

1. Login with a `@deeper.mail` address (e.g., `alice@deeper.mail`)
2. The app will automatically connect to the discovery service
3. Navigate to the Compose page to write a new email
4. Send emails to other `@deeper.mail` addresses
5. View received emails in the Inbox (updates in real-time)
6. View sent emails in the Sent folder

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
