# DPM Minimal Demo

A minimal demo implementation of Deeper Mail, demonstrating the core concepts of decentralized email communication.

## Features

- User authentication with `@deeper.mail` addresses
- Basic email composition and sending
- Inbox and sent mail management
- Local file-based storage for demonstration purposes

## Tech Stack

- Next.js 15.3.1
- React 19
- TypeScript
- Tailwind CSS
- Zustand for state management

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
  │   ├── compose/      # Email composition page
  │   ├── inbox/        # Inbox page
  │   ├── login/        # User login page
  │   └── sent/         # Sent emails page
  └── store/            # Global state management
```

## Development

- All email data is stored locally in the `data/` directory
- Each user's emails are stored in separate JSON files
- The project uses Next.js App Router for routing
- State management is handled by Zustand

## License

This project is open source and available under the MIT license.
