import { rooms } from '../../../utils/rooms';

// Helper function to initialize room state
function initializeRoom(roomId) {
  return {
    players: [],
    state: 'lobby', // 'lobby', 'game', 'ended'
    owner: null, // room creator
    rounds: [], // array of round objects
    currentRound: 0,
    turnIndex: 0,
  };
}

// Helper function to validate late join
function canJoinRoom(roomState) {
  return roomState.state === 'lobby';
}

export default function handler(req, res) {
  const { roomId } = req.query;

  if (req.method === 'GET') {
    // Handle fetching room state
    res.status(200).json(rooms[roomId] || { error: 'Room not found' });
  } else if (req.method === 'POST') {
    const { action, name } = req.body;

    if (!rooms[roomId]) {
      // Create a new room
      rooms[roomId] = initializeRoom(roomId);
    }

    const roomState = rooms[roomId];

    switch (action) {
      case 'join-room': {
        if (!canJoinRoom(roomState)) {
          return res.status(400).json({ error: 'GAME_ALREADY_STARTED' });
        }

        const player = { id: Date.now(), name, chipColor: null, score: 0 };
        if (roomState.players.length === 0) {
          roomState.owner = player.id; // First player becomes room owner
        }
        roomState.players.push(player);
        return res.status(200).json(player);
      }

      case 'start-game': {
        if (roomState.owner !== req.body.playerId) {
          return res.status(403).json({ error: 'FORBIDDEN' });
        }
        roomState.state = 'game';
        roomState.rounds.push({ clue: '', chips: [], secretColor: null });
        return res.status(200).json({ message: 'Game started' });
      }

      // Additional actions to be implemented:
      // - submit-clue
      // - place-chip
      // - end-round
      // - next-round

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}