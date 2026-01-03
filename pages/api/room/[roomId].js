// Update:
// Implements the 'place-chip' action with necessary server-side validations.

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { roomId } = req.query;
    const { playerId, chipPosition } = req.body;

    if (!playerId || !Array.isArray(chipPosition) || chipPosition.length !== 2) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        // Fetch room data from database
        const roomData = await getRoomData(roomId);

        if (!roomData) {
            return res.status(404).json({ message: "Room not found" });
        }

        const { gamePhase, currentPlayerIndex, players, grid } = roomData;

        // Validate game phase
        if (gamePhase !== "PLAYING") {
            return res.status(400).json({ message: "Invalid game phase" });
        }

        // Validate turn order
        if (players[currentPlayerIndex].id !== playerId) {
            return res.status(400).json({ message: "Not your turn" });
        }

        const [x, y] = chipPosition;
        if (grid[x][y] !== null) {
            return res.status(400).json({ message: "Position already taken" });
        }

        // Place the chip
        grid[x][y] = playerId;

        // Update the turn state
        roomData.currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

        // Save the updated room data
        await saveRoomData(roomId, roomData);

        return res.status(200).json({ message: "Chip placed successfully", grid });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

async function getRoomData(roomId) {
    // Mocked database fetching function
    // Replace with actual implementation
}

async function saveRoomData(roomId, roomData) {
    // Mocked database updating function
    // Replace with actual implementation
}