
import React from 'react';
import { GameProvider } from './context/GameContext';
import { Dashboard } from './components/Dashboard';

const App = () => {
  return (
    <GameProvider>
      <Dashboard />
    </GameProvider>
  );
};

export default App;
