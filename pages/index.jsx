import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';

/**
 * Home Page: Create or Join Room
 */
export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Create a new room
   */
  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    // Generate random room ID
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const response = await fetch(`/api/room/${newRoomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-room',
          playerName: name.trim()
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(getErrorMessage(data.error));
        setLoading(false);
        return;
      }

      // Store player name in sessionStorage
      sessionStorage.setItem('playerName', name.trim());
      
      // Navigate to room
      router.push(`/room/${newRoomId}`);
    } catch (err) {
      setError('Failed to create room. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Join an existing room
   */
  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter room ID');
      return;
    }

    // Navigate directly to room, user will enter name there
    router.push(`/room/${roomId.trim().toUpperCase()}`);
  };

  /**
   * Convert error codes to user-friendly messages
   */
  const getErrorMessage = (errorCode) => {
    const messages = {
      'ROOM_NOT_FOUND': 'Room not found. Please check the room ID.',
      'GAME_ALREADY_STARTED': 'The game has already started. You cannot join now.',
      'NAME_TAKEN': 'This name is already taken in the room.',
      'ROOM_FULL': 'The room is full (max 8 players).',
      'INVALID_NAME': 'Please enter a valid name.',
      'ROOM_EXISTS': 'Room already exists.'
    };
    return messages[errorCode] || 'An error occurred. Please try again.';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 3
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 5 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PaletteIcon sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
              <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
                MindPalette
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Guess the secret color using word clues!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                Play with 2-8 players
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                fullWidth
                inputProps={{ maxLength: 20 }}
                variant="outlined"
              />

              <Button
                onClick={handleCreateRoom}
                disabled={loading}
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)'
                  }
                }}
              >
                {loading ? 'Creating...' : 'Create New Room'}
              </Button>

              <Divider>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <TextField
                label="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                disabled={loading}
                fullWidth
                inputProps={{ maxLength: 6 }}
                variant="outlined"
              />

              <Button
                onClick={handleJoinRoom}
                disabled={loading}
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                {loading ? 'Joining...' : 'Join Room'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}