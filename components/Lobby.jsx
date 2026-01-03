export default function Lobby({ onStartGame }) {
  return (
    <div>
      <h2>Lobby</h2>
      <button onClick={onStartGame}>Start Game</button>
    </div>
  );
}