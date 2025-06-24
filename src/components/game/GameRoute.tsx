import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Game } from './Game';

export const GameRoute: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  if (!gameId) {
    navigate('/lobby');
    return null;
  }
  return (
    <Game 
      gameId={gameId} 
    />
  );
};
