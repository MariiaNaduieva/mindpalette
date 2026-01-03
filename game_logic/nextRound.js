// This script implements the next-round feature for the game
function nextRound(gameState) {
    // Increment the round number
    gameState.round += 1;

    // Reset player states for the new round
    gameState.players.forEach(player => {
        player.score = 0;
        player.hasPlayed = false;
    });

    // Return the updated game state
    return gameState;
}

module.exports = nextRound;