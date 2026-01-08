import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Lobby from '../../components/Lobby';
import GameBoard from '../../components/GameBoard';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * Room Page
 * Handles lobby and game phases with polling
 */
export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;
  
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const [nameError, setNameError] = useState('');

  /**
   * Initialize: Load player name from session
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem('playerName');
      if (storedName) {
        setPlayerName(storedName);
      } else if (roomId) {
        // No stored name - show dialog
        setNameDialogOpen(true);
        setLoading(false);
      }
    }
  }, [roomId]);

  /**
   * Polling: Fetch room state every 1 second
   */
  useEffect(() => {
    if (!roomId || !playerName) return;

    let isMounted = true;
    let pollInterval;

    const fetchRoomState = async () => {
      try {
        const response = await fetch(`/api/room/${roomId}?playerName=${encodeURIComponent(playerName)}`);
        const data = await response.json();

        if (!isMounted) return;

        if (data.error === 'ROOM_NOT_FOUND') {
          setError('Room not found');
          setLoading(false);
          return;
        }

        // Check if player is in the room
        const isInRoom = data.players.some(p => p.name === playerName);
        
        if (!isInRoom && data.status !== 'lobby') {
          // Player not in room and game started - block access
          setBlocked(true);
          setLoading(false);
          return;
        }

        if (!isInRoom && data.status === 'lobby') {
          // Player was kicked from lobby - redirect to home
          sessionStorage.removeItem('playerName');
          router.push('/');
          return;
        }

        setRoom(data);
        setLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Polling error:', err);
        }
      }
    };

    // Initial fetch
    fetchRoomState();

    // Start polling every 1 second
    pollInterval = setInterval(fetchRoomState, 1000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [roomId, playerName]);

  /**
   * Handle name submission and join room
   */
  const handleNameSubmit = async () => {
    if (!tempName.trim()) {
      setNameError('Please enter your name');
      return;
    }

    setLoading(true);
    setNameError('');

    try {
      const response = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join-room',
          playerName: tempName.trim()
        })
      });

      const data = await response.json();

      if (data.error) {
        setNameError(getErrorMessage(data.error));
        setLoading(false);
        return;
      }

      // Store player name in sessionStorage
      sessionStorage.setItem('playerName', tempName.trim());
      setPlayerName(tempName.trim());
      setNameDialogOpen(false);
      setLoading(false);
    } catch (err) {
      setNameError('Failed to join room. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Handle start game action
   */
  const handleStartGame = async () => {
    try {
      const response = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-game',
          playerName
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(getErrorMessage(data.error));
        return;
      }

      // Room state will update via polling
    } catch (err) {
      alert('Failed to start game');
    }
  };

  /**
   * Handle kick player action
   */
  const handleKickPlayer = async (targetPlayerName) => {
    try {
      const response = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'kick-player',
          playerName,
          targetPlayerName
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(getErrorMessage(data.error));
        return;
      }

      // Room state will update via polling
    } catch (err) {
      alert('Failed to kick player');
    }
  };

  /**
   * Handle game actions (submit clue, place chip, next round)
   */
  const handleGameAction = async (action, payload) => {
    try {
      const response = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerName,
          ...payload
        })
      });

      const data = await response.json();

      if (data.error) {
        alert(getErrorMessage(data.error));
        return;
      }

      // Room state will update via polling
    } catch (err) {
      alert('Action failed');
    }
  };

  /**
   * Convert error codes to user-friendly messages
   */
  const getErrorMessage = (errorCode) => {
    const messages = {
      'ROOM_NOT_FOUND': 'Room not found',
      'NOT_CREATOR': 'Only the room creator can start the game',
      'NOT_ENOUGH_PLAYERS': 'Need at least 2 players to start',
      'GAME_ALREADY_STARTED': 'Game has already started',
      'NOT_CLUE_GIVER': 'Only the clue giver can submit clues',
      'NOT_YOUR_TURN': 'It is not your turn',
      'WRONG_PHASE': 'Invalid action for current game phase',
      'INVALID_POSITION': 'Invalid grid position',
      'CLUE_GIVER_CANNOT_PLACE': 'Clue giver cannot place chips',
      'ROUND_NOT_FINISHED': 'Round is not finished yet'
    };
    return messages[errorCode] || 'An error occurred';
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>Loading room...</Typography>
        </Box>
      </Box>
    );
  }

  // Blocked state (game already started)
  if (blocked) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
        <Container maxWidth="sm">
          <Card elevation={10} sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 80, color: '#ff9800', mb: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Too Late!</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                The MindPalette game has already started.
                <br />
                You can join the next game.
              </Typography>
              <Button
                onClick={() => router.push('/')}
                variant="contained"
                startIcon={<HomeIcon />}
                size="large"
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 1.5 }}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 3 }}>
        <Container maxWidth="sm">
          <Card elevation={10} sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: 5, textAlign: 'center' }}>
              <ErrorOutlineIcon sx={{ fontSize: 80, color: '#f44336', mb: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>Error</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
              <Button
                onClick={() => router.push('/')}
                variant="contained"
                startIcon={<HomeIcon />}
                size="large"
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 1.5 }}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Render lobby or game based on room status
  return (
    <>
      {/* Name Dialog - Cannot be closed */}
      <Dialog 
        open={nameDialogOpen} 
        disableEscapeKeyDown
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="h5" fontWeight="bold">
            Enter Your Name
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            Choose a unique name to join the room
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Your Name"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
            placeholder="Enter your name"
            inputProps={{ maxLength: 20 }}
            error={!!nameError}
            helperText={nameError}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button
            onClick={handleNameSubmit}
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !tempName.trim()}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              py: 1.5
            }}
          >
            {loading ? 'Joining...' : 'Join Room'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 3 }}>
        {!room ? (
          // Show loading or wait for name input
          nameDialogOpen ? null : (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Loading room...</Typography>
              </Box>
            </Box>
          )
        ) : room.status === 'lobby' ? (
          <Lobby
            room={room}
            playerName={playerName}
            onStartGame={handleStartGame}
            onKickPlayer={handleKickPlayer}
          />
        ) : room.status === 'playing' ? (
          <GameBoard
            room={room}
            playerName={playerName}
            onAction={handleGameAction}
          />
        ) : room.status === 'finished' ? (
          <Container maxWidth="md">
            <Card elevation={10} sx={{ borderRadius: 4, textAlign: 'center' }}>
              <CardContent sx={{ p: 5 }}>
                <Typography variant="h3" component="h1" gutterBottom>🎉 Game Finished!</Typography>
                <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>Final Scores:</Typography>
                <Box sx={{ mb: 4 }}>
                  {room.players
                    .sort((a, b) => b.score - a.score)
                    .map((player, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, mb: 1, bgcolor: idx === 0 ? '#fff9e6' : '#f5f5f5', borderRadius: 2, border: idx === 0 ? '2px solid #FFD700' : '1px solid #ddd' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#667eea', width: 40 }}>#{idx + 1}</Typography>
                          <Box sx={{ width: 40, height: 40, borderRadius: '50%', background: player.chipColor, border: '3px solid #333' }} />
                          <Typography variant="h6" fontWeight="600">{player.name}</Typography>
                        </Box>
                        <Typography variant="h5" fontWeight="bold" color="primary">{player.score} pts</Typography>
                      </Box>
                    ))}
                </Box>
                <Button
                  onClick={() => router.push('/')}
                  variant="contained"
                  startIcon={<HomeIcon />}
                  size="large"
                  sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', py: 1.5, px: 4, fontSize: '1.1rem' }}
                >
                  Back to Home
                </Button>
              </CardContent>
            </Card>
          </Container>
        ) : null}
      </Box>
    </>
  );
}