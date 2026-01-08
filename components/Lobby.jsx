import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

/**
 * Lobby Component
 * Shows waiting room with player list and invite link
 * Only creator can start the game
 */
export default function Lobby({ room, playerName, onStartGame, onKickPlayer }) {
  const isCreator = room.creatorId === playerName;
  const inviteLink = typeof window !== 'undefined' ? window.location.href : '';
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              🎨 MindPalette Lobby
            </Typography>
            <Chip
              label={`Room ID: ${room.roomId}`}
              color="primary"
              size="large"
              sx={{ fontSize: '1.1rem', fontWeight: 'bold', px: 2 }}
            />
          </Box>

          <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Invite your friends:
            </Typography>
            <TextField
              value={inviteLink}
              fullWidth
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={copyInviteLink} edge="end">
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Paper>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Players ({room.players.length}/8)
            </Typography>
            <List>
              {room.players.map((player, index) => (
                <ListItem
                  key={index}
                  sx={{
                    border: '2px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: 'white'
                  }}
                  secondaryAction={
                    isCreator && player.name !== room.creatorId ? (
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => onKickPlayer(player.name)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : null
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: player.chipColor,
                        border: '2px solid #333'
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="600">
                          {player.name}
                        </Typography>
                        {player.name === room.creatorId && (
                          <EmojiEventsIcon sx={{ color: '#FFD700' }} />
                        )}
                      </Box>
                    }
                    secondary={player.name === room.creatorId ? 'Room Creator' : 'Player'}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            {isCreator ? (
              <Stack spacing={2}>
                <Button
                  onClick={onStartGame}
                  disabled={room.players.length < 2}
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)'
                    }
                  }}
                >
                  Start Game
                </Button>
                {room.players.length < 2 && (
                  <Alert severity="info">
                    Need at least 2 players to start (you can play with just 2!)
                  </Alert>
                )}
              </Stack>
            ) : (
              <Alert severity="info" icon={false}>
                <Typography variant="body1">
                  Waiting for <strong>{room.creatorId}</strong> to start the game...
                </Typography>
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          Invite link copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
}