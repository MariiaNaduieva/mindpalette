// In-memory store for game rooms
// Structure: { roomId: { ...roomData } }
export const rooms = {};

// Available chip colors for players
const CHIP_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

/**
 * Convert HSL to HEX color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string
 */
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const toHex = (val) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generate color grid programmatically using HSL color space
 * Horizontal axis (columns): Full hue cycle (0-360°)
 * Vertical axis (rows): Lightness from dark (top) to light (bottom)
 * Saturation: Constant high value
 */
function generateColorGrid() {
  const rows = 16;
  const cols = 30;
  const grid = [];
  
  // Saturation: constant high value (90-100%)
  const saturation = 95;
  
  // Lightness range: dark at top (20%) to light at bottom (85%)
  const minLightness = 20;
  const maxLightness = 85;
  
  for (let row = 0; row < rows; row++) {
    const rowColors = [];
    
    // Calculate lightness for this row (dark to light, top to bottom)
    const lightness = minLightness + (row / (rows - 1)) * (maxLightness - minLightness);
    
    for (let col = 0; col < cols; col++) {
      // Column 30 (index 29): Black to white gradient
      if (col === cols - 1) {
        const grayscaleLightness = (row / (rows - 1)) * 100; // 0% (black) to 100% (white)
        rowColors.push(hslToHex(0, 0, grayscaleLightness));
      } else {
        // Other columns: Color spectrum with lightness gradient
        // Calculate hue for this column (0-360° evenly distributed)
        // Full color wheel: red → orange → yellow → green → cyan → blue → purple → magenta → red
        const hue = (col / (cols - 1)) * 360;
        
        // Generate hex color from HSL
        const hexColor = hslToHex(hue, saturation, lightness);
        rowColors.push(hexColor);
      }
    }
    
    grid.push(rowColors);
  }
  
  return grid;
}

// Color grid (16x30) - Mathematically generated to match Hues and Cues
// Horizontal: Full hue spectrum (0-360°)
// Vertical: Lightness gradient (dark to light)
// Saturation: Constant high (95%)
export const COLOR_GRID = generateColorGrid();

/**
 * Create a new game room
 */
export function createRoom(roomId, creatorName) {
  const chipColor = CHIP_COLORS[0];
  
  rooms[roomId] = {
    roomId,
    creatorId: creatorName, // First player is creator
    status: 'lobby', // 'lobby', 'playing', 'finished'
    players: [{
      name: creatorName,
      chipColor,
      score: 0,
      chips: [], // [{row, col, points}]
      connected: true
    }],
    gameState: null,
    createdAt: Date.now(),
    lastActivity: Date.now()
  };
  
  return rooms[roomId];
}

/**
 * Get room by ID
 */
export function getRoom(roomId) {
  return rooms[roomId];
}

/**
 * Add player to room (only if game hasn't started)
 */
export function addPlayer(roomId, playerName) {
  const room = rooms[roomId];
  
  if (!room) {
    return { error: 'ROOM_NOT_FOUND' };
  }
  
  // Block late joins
  if (room.status !== 'lobby') {
    return { error: 'GAME_ALREADY_STARTED' };
  }
  
  // Check if name already exists
  if (room.players.some(p => p.name === playerName)) {
    return { error: 'NAME_TAKEN' };
  }
  
  // Max 8 players
  if (room.players.length >= 8) {
    return { error: 'ROOM_FULL' };
  }
  
  const chipColor = CHIP_COLORS[room.players.length % CHIP_COLORS.length];
  
  room.players.push({
    name: playerName,
    chipColor,
    score: 0,
    chips: [],
    connected: true
  });
  
  room.lastActivity = Date.now();
  
  return { success: true, room };
}

/**
 * Start the game (only creator can start)
 */
export function startGame(roomId, playerName) {
  const room = rooms[roomId];
  
  if (!room) {
    return { error: 'ROOM_NOT_FOUND' };
  }
  
  if (room.creatorId !== playerName) {
    return { error: 'NOT_CREATOR' };
  }
  
  if (room.players.length < 2) {
    return { error: 'NOT_ENOUGH_PLAYERS' };
  }
  
  if (room.status !== 'lobby') {
    return { error: 'GAME_ALREADY_STARTED' };
  }
  
  // Initialize game state
  room.status = 'playing';
  
  // Pick random secret color for first round
  const randomRow = Math.floor(Math.random() * COLOR_GRID.length);
  const randomCol = Math.floor(Math.random() * COLOR_GRID[0].length);
  const randomColor = COLOR_GRID[randomRow][randomCol];
  
  room.gameState = {
    round: 1,
    maxRounds: room.players.length, // One round per player
    phase: 'clue1', // 'clue1', 'placing1', 'clue2', 'placing2', 'reveal'
    clueGiverIndex: 0, // Rotates each round
    currentTurnIndex: 0, // For placing chips
    clue1: null,
    clue2: null,
    secretColor: randomColor, // Random color for clue giver
    secretColorRow: randomRow,
    secretColorCol: randomCol,
    chipsPlaced: 0 // Track chips placed in current phase
  };
  
  // Reset player chips for new game
  room.players.forEach(p => {
    p.chips = [];
    p.score = 0;
  });
  
  room.lastActivity = Date.now();
  
  return { success: true, room };
}

/**
 * Kick player from room (only creator can kick, only in lobby)
 */
export function kickPlayer(roomId, playerName, targetPlayerName) {
  const room = rooms[roomId];
  
  if (!room) {
    return { error: 'ROOM_NOT_FOUND' };
  }
  
  if (room.creatorId !== playerName) {
    return { error: 'NOT_CREATOR' };
  }
  
  if (room.status !== 'lobby') {
    return { error: 'GAME_ALREADY_STARTED' };
  }
  
  if (targetPlayerName === room.creatorId) {
    return { error: 'CANNOT_KICK_CREATOR' };
  }
  
  const playerIndex = room.players.findIndex(p => p.name === targetPlayerName);
  
  if (playerIndex === -1) {
    return { error: 'PLAYER_NOT_FOUND' };
  }
  
  room.players.splice(playerIndex, 1);
  room.lastActivity = Date.now();
  
  return { success: true, room };
}

/**
 * Submit clue word (clue giver only)
 */
export function submitClue(roomId, playerName, clueWord) {
  const room = rooms[roomId];
  
  if (!room || room.status !== 'playing') {
    return { error: 'INVALID_STATE' };
  }
  
  const { gameState, players } = room;
  const clueGiver = players[gameState.clueGiverIndex];
  
  if (clueGiver.name !== playerName) {
    return { error: 'NOT_CLUE_GIVER' };
  }
  
  if (gameState.phase === 'clue1') {
    gameState.clue1 = clueWord;
    // Secret color already set, just move to placing phase
    gameState.phase = 'placing1';
    gameState.currentTurnIndex = (gameState.clueGiverIndex + 1) % players.length;
    gameState.chipsPlaced = 0;
  } else if (gameState.phase === 'clue2') {
    gameState.clue2 = clueWord;
    gameState.phase = 'placing2';
    gameState.currentTurnIndex = (gameState.clueGiverIndex + 1) % players.length;
    gameState.chipsPlaced = 0;
  } else {
    return { error: 'WRONG_PHASE' };
  }
  
  room.lastActivity = Date.now();
  
  return { success: true, room };
}

/**
 * Place chip on grid (non-clue-giver players)
 */
export function placeChip(roomId, playerName, row, col) {
  const room = rooms[roomId];
  
  if (!room || room.status !== 'playing') {
    return { error: 'INVALID_STATE' };
  }
  
  const { gameState, players } = room;
  
  if (gameState.phase !== 'placing1' && gameState.phase !== 'placing2') {
    return { error: 'NOT_PLACING_PHASE' };
  }
  
  const currentPlayer = players[gameState.currentTurnIndex];
  
  if (currentPlayer.name !== playerName) {
    return { error: 'NOT_YOUR_TURN' };
  }
  
  // Clue giver doesn't place chips
  if (gameState.currentTurnIndex === gameState.clueGiverIndex) {
    return { error: 'CLUE_GIVER_CANNOT_PLACE' };
  }
  
  // Validate grid position (16 rows, 30 columns)
  if (row < 0 || row >= 16 || col < 0 || col >= 30) {
    return { error: 'INVALID_POSITION' };
  }
  
  // Add chip
  currentPlayer.chips.push({ row, col, points: 0, round: gameState.round });
  gameState.chipsPlaced++;
  
  // Move to next player (skip clue giver)
  let nextIndex = (gameState.currentTurnIndex + 1) % players.length;
  while (nextIndex === gameState.clueGiverIndex) {
    nextIndex = (nextIndex + 1) % players.length;
  }
  
  const chipsNeeded = players.length - 1; // All except clue giver
  
  if (gameState.chipsPlaced >= chipsNeeded) {
    // All players placed chip in this phase
    if (gameState.phase === 'placing1') {
      gameState.phase = 'clue2';
    } else if (gameState.phase === 'placing2') {
      gameState.phase = 'reveal';
      calculatePoints(room);
    }
  } else {
    gameState.currentTurnIndex = nextIndex;
  }
  
  room.lastActivity = Date.now();
  
  return { success: true, room };
}

/**
 * Calculate points based on chip distance from secret color
 */
function calculatePoints(room) {
  const { gameState, players } = room;
  const secretColor = gameState.secretColor;
  
  // Find secret color position
  let secretRow = -1, secretCol = -1;
  for (let r = 0; r < COLOR_GRID.length; r++) {
    for (let c = 0; c < COLOR_GRID[r].length; c++) {
      if (COLOR_GRID[r][c] === secretColor) {
        secretRow = r;
        secretCol = c;
        break;
      }
    }
    if (secretRow !== -1) break;
  }
  
  // Calculate points for each player's chips
  players.forEach((player, idx) => {
    if (idx === gameState.clueGiverIndex) return; // Skip clue giver
    
    player.chips.forEach(chip => {
      if (chip.round !== gameState.round) return; // Only current round chips
      
      const distance = Math.abs(chip.row - secretRow) + Math.abs(chip.col - secretCol);
      
      if (distance === 0) {
        chip.points = 3; // Exact match
      } else if (distance === 1) {
        chip.points = 2; // Adjacent
      } else if (distance === 2) {
        chip.points = 1; // Distance of 2
      } else {
        chip.points = 0;
      }
      
      player.score += chip.points;
    });
  });
}

/**
 * Move to next round
 */
export function nextRound(roomId) {
  const room = rooms[roomId];
  
  if (!room || room.status !== 'playing') {
    return { error: 'INVALID_STATE' };
  }
  
  const { gameState } = room;
  
  if (gameState.phase !== 'reveal') {
    return { error: 'ROUND_NOT_FINISHED' };
  }
  
  gameState.round++;
  
  if (gameState.round > gameState.maxRounds) {
    // Game finished
    room.status = 'finished';
    return { success: true, room, gameFinished: true };
  }
  
  // Pick random secret color for new round
  const randomRow = Math.floor(Math.random() * COLOR_GRID.length);
  const randomCol = Math.floor(Math.random() * COLOR_GRID[0].length);
  const randomColor = COLOR_GRID[randomRow][randomCol];
  
  // Reset for next round
  gameState.phase = 'clue1';
  gameState.clueGiverIndex = (gameState.clueGiverIndex + 1) % room.players.length;
  gameState.clue1 = null;
  gameState.clue2 = null;
  gameState.secretColor = randomColor;
  gameState.secretColorRow = randomRow;
  gameState.secretColorCol = randomCol;
  gameState.chipsPlaced = 0;
  
  room.lastActivity = Date.now();
  
  return { success: true, room };
}

/**
 * Clean up old rooms (call periodically)
 */
export function cleanupOldRooms() {
  const now = Date.now();
  const timeout = 2 * 60 * 60 * 1000; // 2 hours
  
  Object.keys(rooms).forEach(roomId => {
    if (now - rooms[roomId].lastActivity > timeout) {
      delete rooms[roomId];
    }
  });
}