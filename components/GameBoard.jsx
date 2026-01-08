import { useState } from 'react';
import { COLOR_GRID } from '../utils/rooms';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Paper,
  Chip,
  Stack,
  Alert,
  Avatar
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';

/**
 * GameBoard Component
 * Main game interface with color grid, clues, and chip placement
 */
export default function GameBoard({ room, playerName, onAction }) {
  const [clueInput, setClueInput] = useState('');

  const { gameState, players } = room;
  const clueGiver = players[gameState.clueGiverIndex];
  const isClueGiver = clueGiver.name === playerName;
  const currentTurnPlayer = players[gameState.currentTurnIndex];
  const isMyTurn = currentTurnPlayer && currentTurnPlayer.name === playerName;

  // Column labels 1-30 (numbers horizontally)
  const columnLabels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  // Row labels A-P (letters vertically)
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];

  const handleSubmitClue = () => {
    if (!clueInput.trim()) {
      alert('Please enter a clue word');
      return;
    }
    onAction('submit-clue', { clueWord: clueInput });
    setClueInput('');
  };

  const handlePlaceChip = (row, col) => {
    if (!isMyTurn) return;
    if (gameState.phase !== 'placing1' && gameState.phase !== 'placing2') return;
    onAction('place-chip', { row, col });
  };

  const handleNextRound = () => {
    onAction('next-round', {});
  };

  const getChipsOnCell = (row, col) => {
    const chips = [];
    players.forEach(player => {
      player.chips.forEach(chip => {
        if (chip.row === row && chip.col === col && chip.round === gameState.round) {
          chips.push({ ...chip, chipColor: player.chipColor });
        }
      });
    });
    return chips;
  };

  // Get coordinate label (e.g., "C5")
  const getCoordinateLabel = (row, col) => {
    return `${rowLabels[row]}${columnLabels[col]}`;
  };

  // Get secret color coordinate
  const getSecretColorCoordinate = () => {
    if (!gameState.secretColor) return '';
    if (gameState.secretColorRow !== undefined && gameState.secretColorCol !== undefined) {
      return `${rowLabels[gameState.secretColorRow]}${columnLabels[gameState.secretColorCol]}`;
    }
    return '';
  };

  const renderPhaseUI = () => {
    if (gameState.phase === 'clue1') {
      if (isClueGiver) {
        const secretCoordinate = gameState.secretColorRow !== undefined && gameState.secretColorCol !== undefined
          ? `${rowLabels[gameState.secretColorRow]}${columnLabels[gameState.secretColorCol]}`
          : '';
        
        return (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>You are the Clue Giver! 🎯</Typography>
            {gameState.secretColor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: gameState.secretColor,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    boxShadow: 2
                  }}
                />
                <Typography variant="h6" color="primary">
                  Secret Color: {secretCoordinate}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" gutterBottom>Enter your first clue word to help others find this color.</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField value={clueInput} onChange={(e) => setClueInput(e.target.value)} placeholder="Enter clue word..." inputProps={{ maxLength: 30 }} size="small" fullWidth />
              <Button onClick={handleSubmitClue} variant="contained" disabled={!clueInput.trim()}>Submit Clue 1</Button>
            </Stack>
          </Alert>
        );
      } else {
        return <Alert severity="warning" sx={{ mb: 3 }}><Typography>Waiting for <strong>{clueGiver.name}</strong> to submit the first clue...</Typography></Alert>;
      }
    }

    if (gameState.phase === 'placing1') {
      return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f0f9ff' }}>
          <Typography variant="h6" gutterBottom><strong>Clue 1:</strong> {gameState.clue1}</Typography>
          {isMyTurn ? <Alert severity="success" icon={false}>🔵 Your turn! Click a color to place your chip.</Alert> : <Alert severity="info" icon={false}>Waiting for <strong>{currentTurnPlayer.name}</strong> to place a chip...</Alert>}
        </Paper>
      );
    }

    if (gameState.phase === 'clue2') {
      if (isClueGiver) {
        const secretCoordinate = gameState.secretColorRow !== undefined && gameState.secretColorCol !== undefined
          ? `${rowLabels[gameState.secretColorRow]}${columnLabels[gameState.secretColorCol]}`
          : '';
        
        return (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Submit your second clue! 🎯</Typography>
            {gameState.secretColor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 2 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: gameState.secretColor,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1,
                    boxShadow: 2
                  }}
                />
                <Typography variant="h6" color="primary">
                  Secret Color: {secretCoordinate}
                </Typography>
              </Box>
            )}
            <Typography variant="body2" gutterBottom><strong>Clue 1:</strong> {gameState.clue1}</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField value={clueInput} onChange={(e) => setClueInput(e.target.value)} placeholder="Enter second clue word..." inputProps={{ maxLength: 30 }} size="small" fullWidth />
              <Button onClick={handleSubmitClue} variant="contained" disabled={!clueInput.trim()}>Submit Clue 2</Button>
            </Stack>
          </Alert>
        );
      } else {
        return <Alert severity="warning" sx={{ mb: 3 }}><Typography variant="body2" gutterBottom><strong>Clue 1:</strong> {gameState.clue1}</Typography><Typography>Waiting for <strong>{clueGiver.name}</strong> to submit the second clue...</Typography></Alert>;
      }
    }

    if (gameState.phase === 'placing2') {
      return (
        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f0f9ff' }}>
          <Typography variant="h6" gutterBottom><strong>Clue 1:</strong> {gameState.clue1} | <strong>Clue 2:</strong> {gameState.clue2}</Typography>
          {isMyTurn ? <Alert severity="success" icon={false}>🔵 Your turn! Click a color to place your second chip.</Alert> : <Alert severity="info" icon={false}>Waiting for <strong>{currentTurnPlayer.name}</strong> to place a chip...</Alert>}
        </Paper>
      );
    }

    if (gameState.phase === 'reveal') {
      return (
        <Paper elevation={3} sx={{ p: 4, mb: 3, bgcolor: '#f0fdf4', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>🎊 Round {gameState.round} Complete!</Typography>
          <Typography variant="body1" gutterBottom><strong>Clues:</strong> {gameState.clue1}, {gameState.clue2}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, my: 3 }}>
            <Typography variant="h6"><strong>Secret Color ({getSecretColorCoordinate()}):</strong></Typography>
            <Box sx={{ width: 80, height: 80, borderRadius: 2, background: gameState.secretColor, border: '4px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
          </Box>
          {gameState.round < gameState.maxRounds ? (
            <Button onClick={handleNextRound} variant="contained" endIcon={<NavigateNextIcon />} size="large" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)' } }}>Next Round</Button>
          ) : (
            <Box>
              <Typography variant="h4" gutterBottom>🎉 Game Over!</Typography>
              <Typography variant="h6" gutterBottom>Final Scores:</Typography>
              <Stack spacing={1} sx={{ mt: 2, mb: 3 }}>
                {players.map((player, idx) => (
                  <Typography key={idx} variant="body1">
                    <strong>{player.name}:</strong> {player.score} points
                  </Typography>
                ))}
              </Stack>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button 
                  variant="outlined" 
                  startIcon={<HomeIcon />}
                  onClick={() => window.location.href = '/'}
                  size="large"
                >
                  Main Menu
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<GroupIcon />}
                  onClick={() => window.location.href = `/room/${room.roomId}`}
                  size="large"
                >
                  Back to Lobby
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Card elevation={3} sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Chip label={`Round ${gameState.round} / ${gameState.maxRounds}`} color="primary" size="large" sx={{ fontSize: '1.2rem', fontWeight: 'bold' }} />
          </Box>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            {players.map((player, idx) => (
              <Chip key={idx} avatar={<Avatar sx={{ bgcolor: player.chipColor, width: 24, height: 24 }}> </Avatar>} label={`${player.name}: ${player.score}`} variant="outlined" sx={{ fontWeight: 600, fontSize: '1rem' }} />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Two column layout */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* Left column: Phase UI */}
        <Box sx={{ minWidth: '300px', maxWidth: '400px', flex: '0 0 auto' }}>
          {renderPhaseUI()}
        </Box>

        {/* Right column: Color Grid */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ display: 'inline-block' }}>
              {/* Column labels (1-30) */}
              <Box sx={{ display: 'flex', ml: '30px', position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10, pb: 0.5 }}>
                {columnLabels.map((label, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 24,
                      minWidth: 24,
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '9px',
                      color: '#555',
                      lineHeight: '1'
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>

              {/* Grid with row labels */}
              <Box sx={{ display: 'flex' }}>
                {/* Row labels (A-P) */}
                <Box sx={{ position: 'sticky', left: 0, bgcolor: 'white', zIndex: 9 }}>
                  {rowLabels.map((label, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        height: 24,
                        minHeight: 24,
                        width: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '10px',
                        color: '#555'
                      }}
                    >
                      {label}
                    </Box>
                  ))}
                </Box>

            {/* Color Grid */}
            <Paper
              elevation={5}
              sx={{
                display: 'inline-block',
                border: '3px solid #333',
                borderRadius: 2,
                overflow: 'visible'
              }}
            >
              {COLOR_GRID.map((row, rowIndex) => (
                <Box key={rowIndex} sx={{ display: 'flex' }}>
                  {row.map((color, colIndex) => {
                    const chips = getChipsOnCell(rowIndex, colIndex);
                    const isSecret = gameState.phase === 'reveal' && color === gameState.secretColor;
                    const hasChip = chips.length > 0;
                    const canClick = (isMyTurn && (gameState.phase === 'placing1' || gameState.phase === 'placing2') && !hasChip);

                    return (
                      <Box
                        key={colIndex}
                        sx={{
                          width: 24,
                          height: 24,
                          minWidth: 24,
                          minHeight: 24,
                          maxWidth: 24,
                          maxHeight: 24,
                          position: 'relative',
                          background: color,
                          cursor: canClick ? 'pointer' : 'default',
                          border: isSecret ? '3px solid gold' : '0.5px solid #ccc',
                          boxSizing: 'border-box',
                          flexShrink: 0,
                          transition: 'box-shadow 0.2s, border 0.2s',
                          '&:hover': canClick ? { 
                            border: '2px solid #000',
                            boxShadow: '0 0 0 3px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.5)',
                            zIndex: 50
                          } : {}
                        }}
                        onClick={() => {
                          if (isMyTurn && (gameState.phase === 'placing1' || gameState.phase === 'placing2')) {
                            handlePlaceChip(rowIndex, colIndex);
                          }
                        }}
                      >
                        {chips.map((chip, chipIdx) => (
                          <Box key={chipIdx} sx={{ position: 'absolute', width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #000', background: chip.chipColor, left: `${2 + chipIdx * 3}px`, top: `${2 + chipIdx * 3}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 'bold', color: 'white', textShadow: '0 0 2px black', zIndex: chipIdx + 1, pointerEvents: 'none' }}>
                            {gameState.phase === 'reveal' && chip.points > 0 && `+${chip.points}`}
                          </Box>
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Paper>
          </Box>
        </Box>
      </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
