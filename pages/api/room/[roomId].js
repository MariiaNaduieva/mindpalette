// Add your existing imports here
const calculateScore = (players) => {
    return players.map(player => {
        const score = player.answers.reduce((acc, answer) => acc + answer.points, 0);
        return { ...player, score };
    });
};

const isEndOfGame = (round, maxRounds) => round >= maxRounds;

const transitionToNextRound = (gameState) => {
    gameState.round += 1;
    gameState.players.forEach(player => {
        player.answers = []; // Reset answers for next round
    });
    return gameState;
};

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { action, gameState } = req.body;

        if (action === 'end-round') {
            try {
                // Calculate scores for the current round
                const updatedPlayers = calculateScore(gameState.players);
                gameState.players = updatedPlayers;

                // Check if the game should end
                if (isEndOfGame(gameState.round, gameState.maxRounds)) {
                    return res.status(200).json({
                        message: 'Game Over',
                        gameState,
                    });
                }

                // Transition to the next round
                const updatedGameState = transitionToNextRound(gameState);

                return res.status(200).json({
                    message: 'Round ended, next round started',
                    gameState: updatedGameState,
                });
            } catch (error) {
                return res.status(500).json({
                    message: 'Error processing end-round action',
                    error: error.message,
                });
            }
        } else {
            return res.status(400).json({
                message: 'Invalid action',
            });
        }
    } else {
        return res.status(405).json({
            message: 'Method Not Allowed',
        });
    }
}