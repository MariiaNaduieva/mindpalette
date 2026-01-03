// Import necessary modules and libraries
import { validateGamePhase, checkClueGiverPermission, updateGameState } from "../../../utils/game";
import { getRoomById } from "../../../services/roomService";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { roomId } = req.query;
    const { userId, clue } = req.body;

    try {
        // Validate that the room exists
        const room = await getRoomById(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Validate the game phase
        if (!validateGamePhase(room.state, 'clue_submission')) {
            return res.status(400).json({ error: 'Invalid game phase for clue submission' });
        }

        // Check Clue Giver permissions
        if (!checkClueGiverPermission(room.state, userId)) {
            return res.status(403).json({ error: 'Permission denied. Only the designated Clue Giver can submit a clue.' });
        }

        // Update the game state with the submitted clue
        const updatedRoom = await updateGameState(roomId, {
            ...room.state,
            clues: [...room.state.clues, { clue, giver: userId }],
            phase: 'guessing', // Transition to the next phase
        });

        return res.status(200).json({ message: 'Clue submitted successfully', room: updatedRoom });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}