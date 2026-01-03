import { rooms } from '../../../utils/rooms';

export default function handler(req, res) {
  const { roomId } = req.query;

  if (req.method === 'GET') {
    res.status(200).json(rooms[roomId] || { error: 'Room not found' });
  } else if (req.method === 'POST') {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [], state: 'lobby' };
    }
    res.status(200).json(rooms[roomId]);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}