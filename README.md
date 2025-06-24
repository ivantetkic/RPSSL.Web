# RPSSL Multiplayer Game

A modern React TypeScript application for playing Rock Paper Scissors Spock Lizard with multiple players in real-time.

## Features

- **Multiplayer Gameplay**: Play RPSSL with 2-6 players
- **Real-time Updates**: SignalR integration for live game notifications
- **Modern UI**: Material-UI components with dark/light theme support
- **Responsive Design**: Works on desktop and mobile devices
- **Player Management**: User registration and game lobby system

## Technologies Used

- **React 18+** with TypeScript
- **Material-UI (MUI)** for UI components
- **SignalR** for real-time communication
- **React Query** for server state management
- **React Router** for navigation
- **Vite** for fast development and building

## Game Rules

RPSSL is an extension of the classic Rock Paper Scissors game:

- **Rock** crushes Scissors and Lizard
- **Paper** covers Rock and disproves Spock
- **Scissors** cuts Paper and decapitates Lizard
- **Spock** vaporizes Rock and smashes Scissors
- **Lizard** eats Paper and poisons Spock

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A running RPSSL backend API server

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   VITE_API_BASE_URL=https://localhost:7001/api
   VITE_SIGNALR_HUB_URL=https://localhost:7001/gameHub
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── game/           # Game-related components
│   └── layout/         # Layout components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── services/           # API and SignalR services
├── theme/              # Material-UI theme configuration
└── types/              # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend API Integration

This application connects to a .NET backend API that provides:

- Player management endpoints
- Game creation and management
- Real-time SignalR notifications
- RPSSL game logic

Ensure your backend server is running and accessible at the configured API URL.
