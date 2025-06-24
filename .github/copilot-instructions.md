# Copilot Instructions for RPSSL React TypeScript Application

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a modern React TypeScript application for the RPSSL (Rock Paper Scissors Spock Lizard) multiplayer game using Material-UI for the UI components and SignalR for real-time communication.

## Key Technologies and Patterns
- **React 18+** with TypeScript for type safety
- **Material-UI (MUI)** for consistent and modern UI components
- **SignalR** for real-time game notifications and updates
- **React Query (@tanstack/react-query)** for server state management
- **React Router** for navigation
- **Vite** as the build tool for fast development

## Code Standards and Best Practices
1. **TypeScript**: Use strict typing, define proper interfaces for all API responses and component props
2. **React Hooks**: Prefer functional components with hooks over class components
3. **Custom Hooks**: Extract reusable logic into custom hooks (e.g., `useSignalR`, `useGameState`)
4. **Error Handling**: Implement proper error boundaries and error handling for API calls
5. **Loading States**: Always handle loading and error states in components
6. **Responsive Design**: Use Material-UI's responsive utilities for mobile-first design

## Backend API Integration
The backend provides RESTful endpoints for:
- **Players**: Registration, authentication, player management
- **Games**: Create, join, start, cancel games
- **Choices**: Get available choices, make player choices
- **Results**: Game and round results

## SignalR Events
Listen for these real-time events:
- Game created/updated notifications
- Player joined/left game
- Round completed with results
- Game completed with final results

## Component Structure
- Use feature-based folder structure
- Separate presentation and logic components
- Create reusable UI components in a shared components folder
- Implement proper prop drilling avoidance using React Context or state management

## State Management
- Use React Query for server state (API calls, caching)
- Use React Context for global app state (current player, theme)
- Use local state for component-specific state
- Implement optimistic updates where appropriate

## Styling Guidelines
- Use Material-UI theme system for consistent styling
- Implement dark/light theme support
- Use Material-UI's sx prop for component-specific styling
- Create custom theme tokens for game-specific colors and spacing
