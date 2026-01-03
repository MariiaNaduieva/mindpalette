import Lobby from '../../components/Lobby';
import GameBoard from '../../components/GameBoard';
import { useState } from 'react';

export default function Room({ roomId }) {
  const [inGame, setInGame] = useState(false);

  return (
    <main>
      {inGame ? <GameBoard /> : <Lobby onStartGame={() => setInGame(true)} />}
    </main>
  );
}