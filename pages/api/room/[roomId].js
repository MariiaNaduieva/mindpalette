import {
  getRoom,
  createRoom,
  addPlayer,
  startGame,
  submitClue,
  placeChip,
  nextRound,
  kickPlayer
} from '../../../utils/rooms';

/**
 * API Route: /api/room/[roomId]
 * 
 * Handles all game room actions:
 * - GET: Fetch current room state (for polling)
 * - POST: Execute actions (create, join, start-game, submit-clue, place-chip, next-round)
 */
export default async function handler(req, res) {
  const { roomId } = req.query;

  // GET: Return current room state (for client polling)
  if (req.method === 'GET') {
    const room = await getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'ROOM_NOT_FOUND' });
    }
    
    const { playerName } = req.query;
    
    // Return room state (hide secret color except for clue giver or reveal phase)
    const response = {
      ...room,
      gameState: room.gameState ? {
        ...room.gameState,
        secretColor: (room.gameState.phase === 'reveal' || 
                     (playerName && room.players[room.gameState.clueGiverIndex]?.name === playerName && 
                      (room.gameState.phase === 'clue1' || room.gameState.phase === 'clue2'))) 
                     ? room.gameState.secretColor : null,
        secretColorRow: (room.gameState.phase === 'reveal' || 
                        (playerName && room.players[room.gameState.clueGiverIndex]?.name === playerName && 
                         (room.gameState.phase === 'clue1' || room.gameState.phase === 'clue2'))) 
                        ? room.gameState.secretColorRow : null,
        secretColorCol: (room.gameState.phase === 'reveal' || 
                        (playerName && room.players[room.gameState.clueGiverIndex]?.name === playerName && 
                         (room.gameState.phase === 'clue1' || room.gameState.phase === 'clue2'))) 
                        ? room.gameState.secretColorCol : null
      } : null
    };
    
    return res.status(200).json(response);
  }

  // POST: Execute actions
  if (req.method === 'POST') {
    const { action, playerName, clueWord, secretColor, row, col } = req.body;

    // Action: create-room
    if (action === 'create-room') {
      const existingRoom = await getRoom(roomId);
      
      if (existingRoom) {
        return res.status(400).json({ error: 'ROOM_EXISTS' });
      }
      
      if (!playerName || playerName.trim().length === 0) {
        return res.status(400).json({ error: 'INVALID_NAME' });
      }
      
      const room = await createRoom(roomId, playerName.trim());
      return res.status(200).json({ success: true, room });
    }

    // Action: join-room
    if (action === 'join-room') {
      if (!playerName || playerName.trim().length === 0) {
        return res.status(400).json({ error: 'INVALID_NAME' });
      }
      
      const result = await addPlayer(roomId, playerName.trim());
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    }

    // Action: start-game
    if (action === 'start-game') {
      const result = await startGame(roomId, playerName);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    }

    // Action: kick-player
    if (action === 'kick-player') {
      const { targetPlayerName } = req.body;
      
      if (!targetPlayerName) {
        return res.status(400).json({ error: 'INVALID_TARGET' });
      }
      
      const result = await kickPlayer(roomId, playerName, targetPlayerName);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    }

    // Action: submit-clue
    if (action === 'submit-clue') {
      if (!clueWord || clueWord.trim().length === 0) {
        return res.status(400).json({ error: 'INVALID_CLUE' });
      }
      
      const result = await submitClue(roomId, playerName, clueWord.trim());
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    }

    // Action: place-chip
    if (action === 'place-chip') {
      if (typeof row !== 'number' || typeof col !== 'number') {
        return res.status(400).json({ error: 'INVALID_POSITION' });
      }
      
      const result = await placeChip(roomId, playerName, row, col);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    }

    // Action: next-round
    if (action === 'next-round') {
      const result = await nextRound(roomId);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      return res.status(200).json(result);
    }

    // Unknown action
    return res.status(400).json({ error: 'UNKNOWN_ACTION' });
  }

  // Method not allowed
  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
}