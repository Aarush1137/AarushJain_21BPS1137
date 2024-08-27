// WebSocket connection
const ws = new WebSocket('ws://localhost:8081');

// DOM elements
const gameBoard = document.getElementById('game-board');
const playerAMoveInput = document.getElementById('player-a-move');
const playerBMoveInput = document.getElementById('player-b-move');
const playerASubmitButton = document.getElementById('player-a-submit');
const playerBSubmitButton = document.getElementById('player-b-submit');
const playerAControls = document.getElementById('player-a-controls');
const playerBControls = document.getElementById('player-b-controls');
const gameStatus = document.getElementById('game-status'); // New element to display game status
const winner = document.getElementById('winner'); // New element to display game status
let historyDiv = document.getElementById('move-history');
var moves = [];
// Timer variables
let timerInterval;
let timerElement = document.getElementById('timer');
let timeLeft = 300; // 5 minutes in seconds
// Initialize the game board
const initializeBoard = (state) => {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {   
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            if (state.grid[i][j]) {
                cell.textContent = state.grid[i][j];
                // Add player-specific class for text color
                const player = state.grid[i][j].split('-')[0];
                cell.classList.add(player === 'A' ? 'player-a' : 'player-b');
            }
            gameBoard.appendChild(cell);
        }
    }
    updateGameStatus(state); // Update the status after initializing the board
};

// Function to start the timer
const startTimer = () => {
    clearInterval(timerInterval);
    timeLeft = 300; // Reset to 5 minutes
    timerElement.textContent = formatTime(timeLeft);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! The game will reset.');
            ws.send(JSON.stringify({ type: 'endGame' }));
        }
    }, 1000);
};


// Function to format time in mm:ss
const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

// Function to stop the timer
const stopTimer = () => {
    clearInterval(timerInterval);
};

// Call startTimer when the page loads
window.addEventListener('load', startTimer);


// Update the game status display
const updateGameStatus = (state) => {
    let statusText = `Current Turn: Player ${state.turn}`;
    if (state.winner) {
        statusText = `Game Over! Player ${state.winner} wins!`;
    }
    gameStatus.textContent = statusText;
};

// Toggle the controls for the current player
const togglePlayerControls = (currentTurn) => {
    if (currentTurn === 'A') {
        playerAControls.style.display = 'block';
        playerBControls.style.display = 'none';
    } else {
        playerAControls.style.display = 'none';
        playerBControls.style.display = 'block';
    }
};

// Display error messages to the user
const displayError = (message) => {
    gameStatus.textContent = `Error: ${message}`;
};

// Display the winner
const displayWinner = (winner) => {
    console.log("dgcgshcj");
    winner.style.display="block";
    winner.innerHTML=`Game Over! Player ${winner} wins!`;
    gameStatus.textContent = `Game Over! Player ${winner} wins!`;
};

// Handle incoming messages from the server
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type == 'reset') {
        console.log("winnrr");
        displayWinner(message.winner);
        console.log("timeout");
        setTimeout(() => {
            ws.send(JSON.stringify({ type: 'restart' }));
        }, 1); // 10 seconds delay before restarting
        stopTimer();
    }
    if (message.type === 'clearMoveHistory') {
        historyDiv.innerHTML = "";
        localStorage.removeItem('moveHistory'); // Remove move history from local storage
    } else if (message.type === 'state') {
        initializeBoard(message.state);
        togglePlayerControls(message.state.turn);
    } else if (message.type === 'error') {
        displayError(message.message);
    }
    else if (message.type === 'resetTimer') {
        startTimer(); // Start the timer when the game resets
    }
};

// Send the move command to the server
const sendMove = (command) => {
    const player = document.getElementById('player-a-controls').style.display === 'block' ? 'A' : 'B';
    const [character, direction] = command.split(':');
    ws.send(JSON.stringify({ type: 'move', player, character, direction }));
};

// Event listeners for submitting moves
playerASubmitButton.addEventListener('click', () => {
    let command = playerAMoveInput.value.trim();
    if (command) {
        command = command.toUpperCase(); // Convert the command to uppercase
        sendMove(command);

        // Add the move to the move history
        const moveParagraph = document.createElement('p');
        moveParagraph.textContent = `A-${command}`;
        historyDiv.appendChild(moveParagraph);

        playerAMoveInput.value = '';
        saveMoveHistory(); // Save move history to local storage
    }
});

playerBSubmitButton.addEventListener('click', () => {
    let command = playerBMoveInput.value.trim();
    if (command) {
        command = command.toUpperCase(); // Convert the command to uppercase
        sendMove(command);

        // Add the move to the move history
        const moveParagraph = document.createElement('p');
        moveParagraph.textContent = `B-${command}`;
        historyDiv.appendChild(moveParagraph);

        playerBMoveInput.value = '';
        saveMoveHistory(); // Save move history to local storage
    }
});

// Event listener for pressing Enter key in Player A input
playerAMoveInput.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) { // 13 is the key code for Enter
        playerASubmitButton.click();
    }
});

// Event listener for pressing Enter key in Player B input
playerBMoveInput.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) { // 13 is the key code for Enter
        playerBSubmitButton.click();
    }
});

// Event listener for End Game button
const endGameButton = document.getElementById('end-game');
endGameButton.addEventListener('click', () => {
    console.log("End Game clicked");
    moves.length = 0;
    historyDiv.innerHTML = "";
    localStorage.removeItem('moveHistory'); // Remove move history from local storage
    ws.send(JSON.stringify({ type: 'endGame' }));
    startTimer();
});


// Function to reset the game state
function resetGameState() {
    moves.length=0;
    gamestate = {
        grid:  [
            ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
        ],
        turn: 'A',
        winner: null,
        moves: []
    };
    startTimer();
}

// Call this function when a new game starts
resetGameState();

// Function to check for a tie
function checkForTie() {
    const playerAPieces = gamestate.grid.flat().filter(cell => cell && cell.startsWith('A')).length;
    const playerBPieces = gamestate.grid.flat().filter(cell => cell && cell.startsWith('B')).length;

    if (playerAPieces === playerBPieces) {
        gamestate.winner = 'Tie';
        return true;
    }
    return false;
}

// Modify the existing checkForWinner function to include the tie check
function checkForWinner() {
    const playerAHasCharacters = gamestate.grid.flat().some(cell => cell && cell.startsWith('A'));
    const playerBHasCharacters = gamestate.grid.flat().some(cell => cell && cell.startsWith('B'));
    
    if (!playerAHasCharacters) {
        gamestate.winner = 'B';
        moves.length=0;
    } else if (!playerBHasCharacters) {
        gamestate.winner = 'A';
        moves.length=0;
    } else if (checkForTie()) {
        console.log('The game is a tie!');
    }
}

// Call checkForWinner after each move

// Function to save move history to local storage
const saveMoveHistory = () => {
    historyDiv.querySelectorAll('p').forEach(p => moves.push(p.textContent));
    localStorage.setItem('moveHistory', JSON.stringify(moves));
};

// Function to load move history from local storage
const loadMoveHistory = () => {
    const historyDiv = document.getElementById('move-history');
    const moves = JSON.parse(localStorage.getItem('moveHistory')) || [];
    if (moves.length === 0) return; // Do not load if move history is empty
    moves.forEach(move => {
        const moveParagraph = document.createElement('p');
        moveParagraph.textContent = move;
        historyDiv.appendChild(moveParagraph); // Append the move
    });
};

// Call loadMoveHistory when the page loads
window.addEventListener('load', loadMoveHistory);


// Convert direction codes to descriptive text
const getMoveDescription = (direction) => {
    switch (direction) {
        case 'FW': return ' :FW';
        case 'B': return ' :B';
        case 'L': return ' :L';
        case 'R': return ' :R';
        case 'FL': return ' :FL';
        case 'FR': return ' :FR';
        case 'BL': return ' :BL';
        case 'BR': return ' :BR';
        default: return 'unknown direction';
    }
};
