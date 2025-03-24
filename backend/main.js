const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const games = {};

// Generate a random game ID
function generateGameId() {
    return Math.random().toString(36).substring(2, 15);
}

// Initialize a new game
function initializeGame(difficulty = 'hard', aiFirst = false) {
    return {
        board: Array(3).fill().map(() => Array(3).fill(' ')),
        gameOver: false,
        winner: null,
        winningCells: [],
        currentTurn: aiFirst ? 'AI' : 'Player',
        difficulty: difficulty.toLowerCase(),
        scores: Array(3).fill().map(() => Array(3).fill(null))
    };
}

function checkWinner(board) {
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][0] !== ' ') {
            return { winner: board[i][0], cells: [[i, 0], [i, 1], [i, 2]] };
        }
    }

    for (let i = 0; i < 3; i++) {
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[0][i] !== ' ') {
            return { winner: board[0][i], cells: [[0, i], [1, i], [2, i]] };
        }
    }

    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[0][0] !== ' ') {
        return { winner: board[0][0], cells: [[0, 0], [1, 1], [2, 2]] };
    }

    if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[0][2] !== ' ') {
        return { winner: board[0][2], cells: [[0, 2], [1, 1], [2, 0]] };
    }

    return { winner: null, cells: [] };
}

function isMovesLeft(board) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === ' ') {
                return true;
            }
        }
    }
    return false;
}

function evaluate(board) {
    const { winner } = checkWinner(board);
    if (winner === 'X') {
        return 10;
    } else if (winner === 'O') {
        return -10;
    }
    return 0;
}

function minimax(board, depth, maxDepth, isMaximizing, alpha, beta) {
    const score = evaluate(board);

    if (score === 10) {
        return score - depth; 
    }
    if (score === -10) {
        return score + depth; 
    }
    if (!isMovesLeft(board) || depth === maxDepth) {
        return 0;
    }

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === ' ') {
                    board[i][j] = 'X';
                    best = Math.max(best, minimax(board, depth + 1, maxDepth, false, alpha, beta));
                    board[i][j] = ' ';
                    alpha = Math.max(alpha, best);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === ' ') {
                    board[i][j] = 'O';
                    best = Math.min(best, minimax(board, depth + 1, maxDepth, true, alpha, beta));
                    board[i][j] = ' ';
                    beta = Math.min(beta, best);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
        return best;
    }
}

// Find the best move
function findBestMove(board, difficulty) {
    // Set max depth based on difficulty
    let maxDepth;
    switch (difficulty) {
        case 'easy':
            maxDepth = 1;
            break;
        case 'medium':
            maxDepth = 3;
            break;
        case 'hard':
        default:
            maxDepth = 9;
            break;
    }

    let bestVal = -Infinity;
    let bestMove = { row: -1, col: -1 };
    const scores = Array(3).fill().map(() => Array(3).fill(null));

    // Get all available moves
    const moves = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === ' ') {
                moves.push({ row: i, col: j });
            }
        }
    }

    // For Easy difficulty, sometimes make a random move
    if (difficulty === 'easy' && Math.random() < 0.4) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return { move: randomMove, scores };
    }

    // For Medium difficulty, sometimes make a suboptimal move
    const makeSuboptimal = difficulty === 'medium' && Math.random() < 0.3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === ' ') {
                board[i][j] = 'X';
                const moveVal = minimax(board, 0, maxDepth, false, -Infinity, Infinity);
                board[i][j] = ' ';

                scores[i][j] = moveVal;

                if (moveVal > bestVal) {
                    bestVal = moveVal;
                    bestMove = { row: i, col: j };
                }
            }
        }
    }

    // For Medium difficulty, sometimes choose a suboptimal move
    if (makeSuboptimal && moves.length > 1) {
        const suboptimalMoves = moves.filter(
            move => move.row !== bestMove.row || move.col !== bestMove.col
        );
        if (suboptimalMoves.length > 0) {
            const randomMove = suboptimalMoves[Math.floor(Math.random() * suboptimalMoves.length)];
            return { move: randomMove, scores };
        }
    }

    return { move: bestMove, scores };
}

app.post('/api/games', (req, res) => {
    const { difficulty = 'hard', aiFirst = false } = req.body;
    const gameId = generateGameId();
    const game = initializeGame(difficulty, aiFirst);
    games[gameId] = game;

    if (game.currentTurn === 'AI') {
        const { move, scores } = findBestMove(game.board, game.difficulty);
        game.board[move.row][move.col] = 'X';
        game.currentTurn = 'Player';
        game.scores = scores;

        const result = checkWinner(game.board);
        if (result.winner) {
            game.gameOver = true;
            game.winner = result.winner === 'X' ? 'AI' : 'Player';
            game.winningCells = result.cells;
        } else if (!isMovesLeft(game.board)) {
            game.gameOver = true;
            game.winner = 'Draw';
        }
    }

    res.json({ gameId, game });
});

app.get('/api/games/:gameId', (req, res) => {
    const { gameId } = req.params;
    const game = games[gameId];

    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });
});

app.post('/api/games/:gameId/move', (req, res) => {
    const { gameId } = req.params;
    const { row, col } = req.body;
    const game = games[gameId];

    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }

    if (game.gameOver) {
        return res.status(400).json({ error: 'Game is already over' });
    }

    if (game.currentTurn !== 'Player') {
        return res.status(400).json({ error: 'Not player\'s turn' });
    }

    if (row < 0 || row > 2 || col < 0 || col > 2 || game.board[row][col] !== ' ') {
        return res.status(400).json({ error: 'Invalid move' });
    }

    game.board[row][col] = 'O';
    game.currentTurn = 'AI';

    let result = checkWinner(game.board);
    if (result.winner) {
        game.gameOver = true;
        game.winner = result.winner === 'X' ? 'AI' : 'Player';
        game.winningCells = result.cells;
        return res.json({ game });
    }

    if (!isMovesLeft(game.board)) {
        game.gameOver = true;
        game.winner = 'Draw';
        return res.json({ game });
    }

    const { move, scores } = findBestMove(game.board, game.difficulty);
    game.board[move.row][move.col] = 'X';
    game.currentTurn = 'Player';
    game.scores = scores;

    result = checkWinner(game.board);
    if (result.winner) {
        game.gameOver = true;
        game.winner = result.winner === 'X' ? 'AI' : 'Player';
        game.winningCells = result.cells;
    } else if (!isMovesLeft(game.board)) {
        game.gameOver = true;
        game.winner = 'Draw';
    }

    res.json({ game });
});

app.post('/api/games/:gameId/reset', (req, res) => {
    const { gameId } = req.params;
    const { difficulty, aiFirst } = req.body;
    
    if (!games[gameId]) {
        return res.status(404).json({ error: 'Game not found' });
    }

    const game = initializeGame(
        difficulty || games[gameId].difficulty,
        aiFirst !== undefined ? aiFirst : games[gameId].currentTurn === 'AI'
    );
    games[gameId] = game;

    if (game.currentTurn === 'AI') {
        const { move, scores } = findBestMove(game.board, game.difficulty);
        game.board[move.row][move.col] = 'X';
        game.currentTurn = 'Player';
        game.scores = scores;

        // Check if AI won on first move (shouldn't happen, but just in case)
        const result = checkWinner(game.board);
        if (result.winner) {
            game.gameOver = true;
            game.winner = result.winner === 'X' ? 'AI' : 'Player';
            game.winningCells = result.cells;
        } else if (!isMovesLeft(game.board)) {
            game.gameOver = true;
            game.winner = 'Draw';
        }
    }

    res.json({ game });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;