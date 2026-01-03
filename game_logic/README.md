# Next Round Functionality

## Overview

The `nextRound.js` module provides functionality for transitioning between game rounds in the MindPalette game. It handles all the necessary state updates to ensure smooth round transitions.

## Features

1. **Round Increment** - Advances the game to the next round
2. **Temporary Data Reset** - Clears round-specific data (answers, guesses, scores)
3. **Clue Giver Assignment** - Rotates the clue giver role in a round-robin pattern
4. **Board State Preparation** - Resets and prepares the game board for the next round

## Usage

### Basic Usage

```javascript
import { nextRound } from './game_logic/nextRound.js';

// Example game state
const currentGameState = {
  round: 1,
  players: [
    { id: '1', name: 'Player 1', isClueGiver: true, answers: [], guesses: [], score: 10 },
    { id: '2', name: 'Player 2', isClueGiver: false, answers: [], guesses: [], score: 20 },
  ],
  boardState: {
    selectedCards: [],
    revealedCards: [],
    isReady: false,
  },
  maxRounds: 5,
};

// Transition to the next round
const nextGameState = nextRound(currentGameState);

console.log(nextGameState.round); // 2
console.log(nextGameState.players[0].isClueGiver); // false
console.log(nextGameState.players[1].isClueGiver); // true
```

### Individual Functions

You can also use individual functions for specific operations:

```javascript
import { 
  incrementRound, 
  resetTemporaryData, 
  assignNextClueGiver, 
  prepareBoardState 
} from './game_logic/nextRound.js';

// Increment round only
const stateWithIncrementedRound = incrementRound(gameState);

// Reset temporary data only
const stateWithResetData = resetTemporaryData(gameState);

// Assign next clue giver only
const stateWithNewClueGiver = assignNextClueGiver(gameState);

// Prepare board state only
const stateWithPreparedBoard = prepareBoardState(gameState);
```

## Game State Structure

The module expects a game state object with the following structure:

```javascript
{
  round: number,
  players: [
    {
      id: string,
      name: string,
      isClueGiver: boolean,
      answers: array,
      guesses: array,
      currentRoundScore: number,
      score: number
    }
  ],
  currentClue: string | null,
  boardState: {
    selectedCards: array,
    revealedCards: array,
    activeCard: any,
    isReady: boolean
  },
  phase: string,
  maxRounds: number
}
```

## Implementation Details

### Round-Robin Clue Giver Assignment

The clue giver role rotates through all players in order. When the last player has been the clue giver, it wraps back to the first player.

### Data Reset

The following data is reset between rounds:
- Player answers
- Player guesses
- Current round scores
- Current clue
- Selected and revealed cards
- Active card

### Board Preparation

After resetting, the board is prepared for the next round:
- Sets `isReady` to `true`
- Clears selected and revealed cards
- Sets phase to `'clue-giving'`

## Testing

The implementation has been tested with various scenarios including:
- Basic round increment
- Temporary data reset
- Clue giver assignment and rotation
- Round-robin wrap-around
- Complete round transition

## Integration

To integrate this into your existing game flow:

```javascript
// In your game API or controller
if (action === 'end-round') {
  const updatedGameState = nextRound(currentGameState);
  
  // Save or broadcast the updated state
  saveGameState(updatedGameState);
  broadcastToPlayers(updatedGameState);
}
```
