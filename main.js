// Global vars to keep track of game state & scores
let movesX = []; // X's moves
let movesO = []; // O's moves
let xScore = 0; // X's score
let oScore = 0; // O's score
let againstAi = false

// Reset the whole game
function resetGame() {
    // Reset board and game state
    newGame();

    // Clear scores
    xScore = 0; // Zero X's score
    oScore = 0; // Zero O's score
    updateScores(); // Update scores on display
}

// Resets Game state but without adjusting scores
function newGame() {
    movesX = []; // Reset X's moves
    movesO = []; // Reset O's moves
    swapPlayerTurn('X'); // X starts first
    clearBoard(); // Clear the board
}

function whoseTurn() {
    return document.getElementsByClassName('display_player').item(0).innerHTML
}

function clearBoard() {
    const squares = document.getElementsByClassName('xo')
    for (let i = 0; i < 9; i++) {
        squares.item(i).innerHTML = ""
    }
}

// Pick a square & switch turns
async function pickSquare(tileIndex) {
    // Check if the square is taken
    if (movesX.includes(tileIndex) || movesO.includes(tileIndex)) {
        alert("Square taken!"); // Alert if taken
        return;
    }

    const currentPlayer = whoseTurn(); // Get current player
    document.getElementsByClassName("xo").item(tileIndex).innerHTML = currentPlayer; // Fill square

    // Update moves array for current player
    if (currentPlayer === 'X') {
        movesX.push(tileIndex); // Record X's move
    } else {
        movesO.push(tileIndex); // Record O's move
    }

    // Check for win or tie
    if (checkWin(currentPlayer)) {
        // this is to force the update to the html before alerting the users
        // This translates to "wait(50)" or in english "wait 50ms and then proceed with the code execution"
        // This is really messy though lol, resolves as promise to not freeze the webpage haha
        await new Promise(resolve => setTimeout(resolve, 50));

        alert(currentPlayer + " wins!"); // Alert winner
        if (currentPlayer === 'X') {
            xScore++
        } else {
            oScore++
        }
        updateScores(); // Update scores on display
        newGame(); // Start new game
    } else if (movesX.length + movesO.length === 9) {
        alert("It's a tie!"); // Alert tie
        newGame(); // Start new game
    } else {
        swapPlayerTurn(); // Switch player
    }

    if (whoseTurn() === 'O' && againstAi) {
        doAITurn()
    }
}

function swapPlayerTurn(forceToThisPlayer = null) {
    let newTurn = forceToThisPlayer
    if (!newTurn) {
        newTurn = document.getElementsByClassName('display_player').item(0).innerHTML
        newTurn = newTurn === 'X' ? 'O' : 'X'
    }
    document.getElementsByClassName('display_player').item(0).innerHTML = newTurn
}

// Check if the current player wins
function checkWin(player, board = null) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    let moves = [];
    if (board === null) {
        moves = player === 'X' ? movesX : movesO; // Get current player's moves
    } else {
        for (let i = 0; i < 9; i++) {
            if (board[i] === player) {
                moves.push(i)
            }
        }
    }


    for (let pattern of winPatterns) {
        if (pattern.every(index => moves.includes(index))) {
            return true; // Check win pattern
        }
    }

    return false; // No win pattern found
}

// Update scores displayed on the page
function updateScores() {
    document.getElementById("x_score").innerHTML = xScore; // Update X's score display
    document.getElementById("o_score").innerHTML = oScore; // Update O's score display
}

// Function to handle game flow
function gameFlow() {

    // Attach event listener to the New Game button
    document.querySelector(".new_game").addEventListener("click", newGame); // New game when clicked

    // Attach event listener to the Reset button
    document.querySelector("#ai_opponent").addEventListener("click", resetGame); // Reset game when clicked
    document.querySelector("#human_opponent").addEventListener("click", resetGame); // Reset game when clicked
}

// Call gameFlow function when DOM content is loaded
document.addEventListener("DOMContentLoaded", gameFlow);


class GameState {

    xMaxScore = -10;
    yMaxScore = -10;
    isXTurn = false;
    currentGame = []

    constructor(whoseTurn, currentGame) {
        this.isXTurn = whoseTurn === 'X';
        this.currentGame = currentGame;
    }
}

function getCurrentGameState() {

    let gameArray = []
    for (let box of document.getElementsByClassName("xo")) {
        gameArray.push(box.innerHTML)
    }

    return new GameState(whoseTurn(), gameArray)
}

function isFull(board) {
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            return false
        }
    }
    return true
}

function doAITurn() {
    const currentGame = getCurrentGameState();
    const moveToMake = minMax('O', currentGame);
    pickSquare(moveToMake[0]);
}

/**
 *
 * @param currentPlayerTurn {String}
 * @param currentGameState {GameState}
 */
function minMax(currentPlayerTurn, currentGameState) {

    if (checkWin(currentPlayerTurn, currentGameState.currentGame)) {
        let returnedGame = new GameState(currentPlayerTurn, []);
        if (currentPlayerTurn === 'X') {
            returnedGame.xMaxScore = 1
            returnedGame.yMaxScore = -1
        } else {
            returnedGame.yMaxScore = 1
            returnedGame.xMaxScore = -1
        }
        return [-1, returnedGame];
    } else if (checkWin(currentPlayerTurn === 'X' ? 'O' : 'X', currentGameState.currentGame)) {
        let returnedGame = new GameState(currentPlayerTurn, []);
        if (currentPlayerTurn === 'O') {
            returnedGame.yMaxScore = -1
            returnedGame.xMaxScore = 1
        } else {
            returnedGame.xMaxScore = -1
            returnedGame.yMaxScore = 1
        }
        return [-1, returnedGame];
    } else if (isFull(currentGameState.currentGame)) {
        let returnedGame = new GameState(currentPlayerTurn, []);
        returnedGame.yMaxScore = 0;
        returnedGame.xMaxScore = 0;
        return [-1, returnedGame];
    }

    const possibilities = []
    for (let i = 0; i < 9; i++) {
        if (currentGameState.currentGame[i].length === 0) {
            const newGameState = [...currentGameState.currentGame]
            newGameState[i] = currentGameState.isXTurn ? 'X' : 'O'
            possibilities.push([i, minMax(currentGameState.isXTurn ? 'O' : 'X', new GameState(currentGameState.isXTurn ? 'O' : 'X', newGameState))[1]]);
        }
    }

    let best = [-1, new GameState(whoseTurn(), getCurrentGameState().currentGame)];
    best[1].yMaxScore = -10;
    best[1].xMaxScore = -10;
    for (let possibility of possibilities) {
        if (currentGameState.isXTurn) {
            if (possibility[1].xMaxScore > best[1].xMaxScore) {
                best = possibility
            }
        } else {
            if (possibility[1].yMaxScore > best[1].yMaxScore) {
                best = possibility
            }
        }
    }

    return best
}
