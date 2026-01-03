/**
 * nextRound.js
 * Handles the transition logic for moving to the next round in the game.
 * 
 * Key features:
 * 1. Increment round number
 * 2. Reset temporary game data (answers, guesses, etc.)
 * 3. Assign next Clue Giver in round-robin pattern
 * 4. Prepare board state for the next round
 */

/**
 * Increments the round number
 * @param {Object} gameState - The current game state
 * @returns {Object} Updated game state with incremented round
 */
export function incrementRound(gameState) {
  return {
    ...gameState,
    round: (gameState.round || 0) + 1,
  };
}

/**
 * Resets temporary game data for the next round
 * @param {Object} gameState - The current game state
 * @returns {Object} Updated game state with reset temporary data
 */
export function resetTemporaryData(gameState) {
  const resetPlayers = gameState.players.map(player => ({
    ...player,
    answers: [],
    guesses: [],
    currentRoundScore: 0,
  }));

  return {
    ...gameState,
    players: resetPlayers,
    currentClue: null,
  };
}

/**
 * Assigns the next Clue Giver in round-robin pattern
 * @param {Object} gameState - The current game state
 * @returns {Object} Updated game state with new Clue Giver assigned
 */
export function assignNextClueGiver(gameState) {
  const players = gameState.players || [];
  
  if (players.length === 0) {
    return gameState;
  }

  // Find current clue giver index
  // If no clue giver is found (returns -1), the next index will be 0 (first player)
  const currentClueGiverIndex = players.findIndex(player => player.isClueGiver);
  
  // Calculate next clue giver index (round-robin)
  // When currentClueGiverIndex is -1 (no current clue giver), this defaults to 0
  const nextClueGiverIndex = (currentClueGiverIndex + 1) % players.length;

  // Update players with new clue giver
  const updatedPlayers = players.map((player, index) => ({
    ...player,
    isClueGiver: index === nextClueGiverIndex,
  }));

  return {
    ...gameState,
    players: updatedPlayers,
    clueGiverId: updatedPlayers[nextClueGiverIndex].id,
  };
}

/**
 * Prepares the board state for the next round
 * @param {Object} gameState - The current game state
 * @returns {Object} Updated game state with prepared board
 */
export function prepareBoardState(gameState) {
  return {
    ...gameState,
    boardState: {
      ...gameState.boardState,
      isReady: true,
      selectedCards: [],
      revealedCards: [],
      activeCard: null,
    },
    phase: 'clue-giving',
  };
}

/**
 * Main function to transition to the next round
 * Combines all the individual steps into one cohesive transition
 * @param {Object} gameState - The current game state
 * @returns {Object} Updated game state ready for the next round
 */
export function nextRound(gameState) {
  if (!gameState) {
    throw new Error('Game state is required');
  }

  // Step 1: Increment round number
  let updatedState = incrementRound(gameState);

  // Step 2: Reset temporary game data
  updatedState = resetTemporaryData(updatedState);

  // Step 3: Assign next Clue Giver in round-robin pattern
  updatedState = assignNextClueGiver(updatedState);

  // Step 4: Prepare board state for the next round
  updatedState = prepareBoardState(updatedState);

  return updatedState;
}

// Default export for convenience
export default nextRound;
