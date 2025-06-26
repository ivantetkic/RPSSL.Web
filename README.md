# 🎮 RPSSL - Rock Paper Scissors Spock Lizard

A modern, real-time multiplayer implementation of the classic Rock Paper Scissors Spock Lizard game, built with React, TypeScript, and Material-UI.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)](https://mui.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🚀 Features

- **Real-time Multiplayer** - Play with friends using SignalR for instant updates
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes** - Toggle between beautiful theme modes
- **Modern UI** - Built with Material-UI components for a polished experience
- **Type Safety** - Full TypeScript implementation with strict typing
- **Fast Development** - Powered by Vite for lightning-fast builds

## 🎯 Game Rules

Rock Paper Scissors Spock Lizard extends the classic game with two additional choices:

- **Rock** crushes Scissors and Lizard
- **Paper** covers Rock and disproves Spock
- **Scissors** cuts Paper and decapitates Lizard
- **Spock** smashes Scissors and vaporizes Rock
- **Lizard** poisons Spock and eats Paper

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Material-UI (MUI) v7
- **Real-time Communication**: SignalR
- **State Management**: React Query + React Context
- **Routing**: React Router v7
- **Build Tool**: Vite
- **Styling**: Emotion + MUI Theme System

### Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── game/           # Game-related components
│   └── layout/         # Layout components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
│   ├── useApi.ts       # API integration hook
│   └── useSignalR.ts   # SignalR connection hook
├── services/           # API and SignalR services
├── theme/              # Material-UI theme configuration
└── types/              # TypeScript type definitions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see [Backend Requirements](#backend-requirements))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rpssl-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to your hosting service
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BASE_URL=https://localhost:7001/api
VITE_ENABLE_DEVTOOLS=true
```

### Backend Requirements

The application expects a backend API with the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/players` | Player registration |
| `GET` | `/api/games` | List available games |
| `POST` | `/api/games` | Create new game |
| `POST` | `/api/games/{id}/join` | Join existing game |
| `GET` | `/api/games/{id}` | Get game details |
| `GET` | `/api/choices` | Get available choices |
| `POST` | `/api/games/{gameId}/choices` | Make player choice |

**SignalR Hub**: `/gameHub`

### SignalR Events

The application listens for these real-time events:

- `GameCreated` - New game available
- `GameUpdated` - Game state changed
- `PlayerJoined` - Player joined game
- `PlayerLeft` - Player left game
- `RoundCompleted` - Round finished with results
- `GameCompleted` - Game finished with final results

## 🎮 How to Play

1. **Register** - Enter your name to create a player profile
2. **Join/Create Game** - Browse available games or create a new one
3. **Wait for Players** - Games start when enough players join
4. **Make Your Choice** - Select Rock, Paper, Scissors, Spock, or Lizard
5. **View Results** - See round results and overall game progress
6. **Play Again** - Create or join new games

## 🎨 UI/UX Features

- **Responsive Grid Layout** - Adaptive design for all screen sizes
- **Loading States** - Smooth loading indicators and skeletons
- **Error Handling** - User-friendly error messages and retry options
- **Connection Status** - Visual indicator for real-time connection
- **Game Status Chips** - Color-coded game states (Waiting, In Progress, Completed)
- **Choice Icons** - Visual representation of game choices
- **Theme Toggle** - Switch between dark and light modes
- **Floating Action Button** - Quick access to primary actions

## 🛠️ Development

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Quality

- **TypeScript Strict Mode** - Full type safety
- **ESLint Configuration** - Code quality enforcement
- **Modern React Patterns** - Hooks, functional components
- **Custom Hooks** - Reusable logic extraction
- **Error Boundaries** - Graceful error handling

### Key Custom Hooks

- [`useApi`](src/hooks/useApi.ts) - API integration with React Query
- [`useSignalR`](src/hooks/useSignalR.ts) - SignalR connection management

## 🐳 Docker Support

```bash
# Build Docker image
docker build -t rpssl-web .

# Run container
docker run -p 80:80 rpssl-web
```

## 📱 Mobile Support

The application is fully responsive and optimized for:

- **Mobile Phones** - Touch-friendly interface
- **Tablets** - Optimized layout for medium screens
- **Desktop** - Full-featured experience

## 🔧 Troubleshooting

### Common Issues

1. **SignalR Connection Failed**
   - Ensure backend API is running
   - Check CORS configuration
   - Verify WebSocket support

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript version compatibility

3. **API Errors**
   - Verify backend endpoints are accessible
   - Check environment variables configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use Material-UI components and theme system
- Implement proper error handling and loading states
- Write responsive, mobile-first CSS
- Extract reusable logic into custom hooks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Project Status

✅ **Production Ready** - All core features implemented and tested

The application is fully functional with:
- Complete game flow implementation
- Real-time multiplayer support
- Responsive design
- Error handling and loading states
- TypeScript type safety
- Modern development practices

Ready for deployment and further enhancement!

---

Made with ❤️ using React, TypeScript, and Material-UI