// Chess Game Logic
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.turn = 'white'; // white starts
        this.selectedSquare = null;
        this.moveHistory = [];
        this.canCapture = false;
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = 'P'; // Black pawns
            board[6][i] = 'p'; // White pawns
        }
        
        // Set up other pieces
        const backRow = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = backRow[i]; // Black pieces
            board[7][i] = backRow[i].toLowerCase(); // White pieces
        }
        
        return board;
    }

    getPieceSymbol(piece) {
        const symbols = {
            'K': '♚', 'k': '♔',
            'Q': '♛', 'q': '♕',
            'R': '♜', 'r': '♖',
            'B': '♝', 'b': '♗',
            'N': '♞', 'n': '♘',
            'P': '♟', 'p': '♙'
        };
        return symbols[piece] || '';
    }

    isWhitePiece(piece) {
        return piece && piece === piece.toLowerCase();
    }

    isBlackPiece(piece) {
        return piece && piece === piece.toUpperCase();
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];
        const type = piece.toUpperCase();
        const isWhite = this.isWhitePiece(piece);

        switch (type) {
            case 'P': // Pawn
                const direction = isWhite ? -1 : 1;
                const startRow = isWhite ? 6 : 1;
                
                // Move forward one
                const oneForward = row + direction;
                if (oneForward >= 0 && oneForward < 8 && !this.board[oneForward][col]) {
                    moves.push([oneForward, col]);
                    
                    // Move forward two from start
                    if (row === startRow) {
                        const twoForward = row + 2 * direction;
                        if (!this.board[twoForward][col]) {
                            moves.push([twoForward, col]);
                        }
                    }
                }
                
                // Capture diagonally
                for (let c of [col - 1, col + 1]) {
                    if (oneForward >= 0 && oneForward < 8 && c >= 0 && c < 8) {
                        const target = this.board[oneForward][c];
                        if (target && ((isWhite && this.isBlackPiece(target)) || (!isWhite && this.isWhitePiece(target)))) {
                            moves.push([oneForward, c]);
                        }
                    }
                }
                break;

            case 'N': // Knight
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                for (let [dr, dc] of knightMoves) {
                    const nr = row + dr;
                    const nc = col + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                        const target = this.board[nr][nc];
                        if (!target || ((isWhite && this.isBlackPiece(target)) || (!isWhite && this.isWhitePiece(target)))) {
                            moves.push([nr, nc]);
                        }
                    }
                }
                break;

            case 'B': // Bishop
                this.addDiagonalMoves(row, col, moves, isWhite);
                break;

            case 'R': // Rook
                this.addStraightMoves(row, col, moves, isWhite);
                break;

            case 'Q': // Queen
                this.addDiagonalMoves(row, col, moves, isWhite);
                this.addStraightMoves(row, col, moves, isWhite);
                break;

            case 'K': // King
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
                            const target = this.board[nr][nc];
                            if (!target || ((isWhite && this.isBlackPiece(target)) || (!isWhite && this.isWhitePiece(target)))) {
                                moves.push([nr, nc]);
                            }
                        }
                    }
                }
                break;
        }

        return moves;
    }

    addDiagonalMoves(row, col, moves, isWhite) {
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (let [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const nr = row + i * dr;
                const nc = col + i * dc;
                if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                const target = this.board[nr][nc];
                if (!target) {
                    moves.push([nr, nc]);
                } else {
                    if ((isWhite && this.isBlackPiece(target)) || (!isWhite && this.isWhitePiece(target))) {
                        moves.push([nr, nc]);
                    }
                    break;
                }
            }
        }
    }

    addStraightMoves(row, col, moves, isWhite) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (let [dr, dc] of directions) {
            for (let i = 1; i < 8; i++) {
                const nr = row + i * dr;
                const nc = col + i * dc;
                if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
                const target = this.board[nr][nc];
                if (!target) {
                    moves.push([nr, nc]);
                } else {
                    if ((isWhite && this.isBlackPiece(target)) || (!isWhite && this.isWhitePiece(target))) {
                        moves.push([nr, nc]);
                    }
                    break;
                }
            }
        }
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        const validMoves = this.getValidMoves(fromRow, fromCol);
        const isValidMove = validMoves.some(move => move[0] === toRow && move[1] === toCol);

        if (!isValidMove) return false;

        // Make the move
        const capturedPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Record move
        const moveNotation = `${String.fromCharCode(65 + fromCol)}${8 - fromRow}→${String.fromCharCode(65 + toCol)}${8 - toRow}`;
        this.moveHistory.push(moveNotation);

        // Switch turn
        this.turn = this.turn === 'white' ? 'black' : 'white';
        return true;
    }

    reset() {
        this.board = this.initializeBoard();
        this.turn = 'white';
        this.selectedSquare = null;
        this.moveHistory = [];
    }

    undo() {
        if (this.moveHistory.length === 0) return false;
        // This is a simplified undo - full implementation would need move log
        this.moveHistory.pop();
        this.turn = this.turn === 'white' ? 'black' : 'white';
        return true;
    }
}

let game = new ChessGame();
let validMovesCache = [];

function initChessBoard() {
    const boardElement = document.getElementById('chessBoard');
    if (!boardElement || boardElement.children.length > 0) return;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const isLight = (row + col) % 2 === 0;
            square.className = `square ${isLight ? 'light' : 'dark'}`;
            square.id = `square-${row}-${col}`;
            square.onclick = () => handleSquareClick(row, col);

            const piece = game.board[row][col];
            if (piece) {
                square.textContent = game.getPieceSymbol(piece);
            }

            boardElement.appendChild(square);
        }
    }

    updateTurnIndicator();
    updateMoveHistory();
}

function handleSquareClick(row, col) {
    playBeep();
    const piece = game.board[row][col];
    const isWhiteTurn = game.turn === 'white';
    const isWhitePiece = game.isWhitePiece(piece);

    // First click - select piece
    if (!game.selectedSquare) {
        if (piece && ((isWhiteTurn && isWhitePiece) || (!isWhiteTurn && !isWhitePiece))) {
            game.selectedSquare = [row, col];
            highlightSquare(row, col, true);
            validMovesCache = game.getValidMoves(row, col);
            highlightValidMoves(validMovesCache);
        }
        return;
    }

    // Second click - move piece
    const [fromRow, fromCol] = game.selectedSquare;

    // If clicking the same square, deselect
    if (fromRow === row && fromCol === col) {
        clearHighlights();
        game.selectedSquare = null;
        validMovesCache = [];
        return;
    }

    // If clicking another piece of the same color, select it instead
    if (piece && ((isWhiteTurn && isWhitePiece) || (!isWhiteTurn && !isWhitePiece))) {
        clearHighlights();
        game.selectedSquare = [row, col];
        highlightSquare(row, col, true);
        validMovesCache = game.getValidMoves(row, col);
        highlightValidMoves(validMovesCache);
        return;
    }

    // Attempt to move
    if (game.movePiece(fromRow, fromCol, row, col)) {
        updateBoard();
        clearHighlights();
        game.selectedSquare = null;
        validMovesCache = [];
        updateTurnIndicator();
        updateMoveHistory();
    }
}

function highlightSquare(row, col, selected) {
    const square = document.getElementById(`square-${row}-${col}`);
    if (square) {
        if (selected) {
            square.classList.add('selected');
        } else {
            square.classList.remove('selected');
        }
    }
}

function highlightValidMoves(moves) {
    for (let [row, col] of moves) {
        const square = document.getElementById(`square-${row}-${col}`);
        if (square) {
            square.classList.add('available');
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'available');
    });
}

function updateBoard() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.getElementById(`square-${row}-${col}`);
            const piece = game.board[row][col];
            square.textContent = piece ? game.getPieceSymbol(piece) : '';
        }
    }
}

function updateTurnIndicator() {
    const whiteTurnIndicator = document.getElementById('whiteTurnIndicator');
    const blackTurnIndicator = document.getElementById('blackTurnIndicator');

    if (game.turn === 'white') {
        whiteTurnIndicator.classList.add('active');
        blackTurnIndicator.classList.remove('active');
    } else {
        blackTurnIndicator.classList.add('active');
        whiteTurnIndicator.classList.remove('active');
    }
}

function updateMoveHistory() {
    const historyList = document.getElementById('moveHistoryList');
    historyList.innerHTML = '';

    game.moveHistory.forEach((move, index) => {
        const moveItem = document.createElement('div');
        moveItem.className = 'move-item';
        moveItem.textContent = `${Math.floor(index / 2) + 1}. ${move}`;
        historyList.appendChild(moveItem);
    });

    // Scroll to bottom
    historyList.scrollTop = historyList.scrollHeight;
}

function resetChessGame() {
    playBeep();
    game.reset();
    clearHighlights();
    
    // Clear and reinitialize board
    const boardElement = document.getElementById('chessBoard');
    boardElement.innerHTML = '';
    initChessBoard();
}

function undoChessMove() {
    if (game.moveHistory.length === 0) return;
    
    playBeep();
    
    // Simple undo: remove last two moves (one per player)
    if (game.moveHistory.length > 0) {
        game.moveHistory.pop();
        
        // Reinitialize board
        game.reset();
        clearHighlights();
        
        const boardElement = document.getElementById('chessBoard');
        boardElement.innerHTML = '';
        initChessBoard();
    }
}
