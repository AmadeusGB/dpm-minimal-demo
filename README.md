# DPM (Deeper Mail) Minimal Demo

A minimal demo implementation of Deeper Mail, demonstrating the core concepts of decentralized email communication based on Deeper Network infrastructure.

## Project Vision

DPM aims to create a truly decentralized email system where:
- No central email servers (unlike traditional Gmail/SMTP)
- Each Deeper Node acts as a "micro mail relay node"
- Emails are transmitted directly between nodes
- Communication happens through DPN (Deeper Network) traffic
- Users maintain full control of their data

This demo represents Phase 1 (P1) of the project, focusing on basic email functionality within a single device.

## Current Implementation (P1)

This is the P1 phase implementation focusing on:
- Local email sending and receiving simulation
- Basic UI/UX for email operations
- Local storage using JSON files
- Core email data structures

### Features

- User authentication with `@deeper.mail` addresses
- Basic email composition and sending
- Inbox and sent mail management
- Local file-based storage for demonstration purposes

### Limitations (P1 Phase)

- Emails are stored locally only
- No actual network transmission
- No encryption or signature verification
- No DPN integration yet

## Tech Stack

- Next.js 15.3.1 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management
- File system for data storage

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/AmadeusGB/dpm-minimal-demo.git
cd dpm-minimal-demo
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Login with a `@deeper.mail` address (e.g., `alice@deeper.mail`)
2. Navigate to the Compose page to write a new email
3. Send emails to other `@deeper.mail` addresses
4. View received emails in the Inbox
5. View sent emails in the Sent folder

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
  └── store/            # Global state management
      └── useStore.ts   # Zustand store for email data

data/                   # Local storage directory
  ├── inbox_*.json      # User inbox files
  └── sent_*.json       # User sent files
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

### API Routes
- `/api/send`: Handle email sending
- `/api/inbox`: Fetch user's inbox
- `/api/sent`: Fetch user's sent emails

## Future Development

### Phase 2 (P2)
- Enable LAN device communication
- Implement WebSocket for real-time updates
- Add basic encryption

### Phase 3 (P3)
- Integrate with DPN
- Implement node discovery
- Add message routing

### Phase 4 (P4)
- Global address resolution
- Full encryption and signatures
- DHT-based routing

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is open source and available under the MIT license.
