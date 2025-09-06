// Tetris Game Implementation
let tetrisGame = null;

class TetrisGame {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.blockSize = 20;
        this.cols = 12;
        this.rows = 20;
        
        this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.isPaused = false;
        this.gameRunning = false;
        
        this.colors = [
            '#000000', // 0 - vide
            '#ff0000', // 1 - I
            '#00ff00', // 2 - O
            '#0000ff', // 3 - T
            '#ffff00', // 4 - S
            '#ff00ff', // 5 - Z
            '#00ffff', // 6 - J
            '#ffa500'  // 7 - L
        ];
        
        this.pieces = {
            'I': [
                [1,1,1,1]
            ],
            'O': [
                [2,2],
                [2,2]
            ],
            'T': [
                [0,3,0],
                [3,3,3]
            ],
            'S': [
                [0,4,4],
                [4,4,0]
            ],
            'Z': [
                [5,5,0],
                [0,5,5]
            ],
            'J': [
                [6,0,0],
                [6,6,6]
            ],
            'L': [
                [0,0,7],
                [7,7,7]
            ]
        };
        
        this.setupControls();
    }
    
    setupControls() {
        // Contrôles clavier
        this.keyHandler = (e) => {
            if (!this.gameRunning || this.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    this.rotatePiece();
                    break;
            }
        };
        
        addGameEventListener(document, 'keydown', this.keyHandler);
        
        // Contrôles tactiles
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.touchStartHandler = (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };
        
        this.touchEndHandler = (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.isPaused) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) {
                    this.movePiece(1, 0);
                } else if (deltaX < -30) {
                    this.movePiece(-1, 0);
                }
            } else {
                if (deltaY > 30) {
                    this.movePiece(0, 1);
                } else if (deltaY < -30) {
                    this.rotatePiece();
                }
            }
        };
        
        addGameEventListener(this.canvas, 'touchstart', this.touchStartHandler);
        addGameEventListener(this.canvas, 'touchend', this.touchEndHandler);
    }
    
    createPiece() {
        const pieces = Object.keys(this.pieces);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return {
            shape: this.pieces[randomPiece],
            x: Math.floor(this.cols / 2) - 1,
            y: -1
        };
    }
    
    start() {
        this.gameRunning = true;
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.isPaused) return;
        
        const now = Date.now();
        if (now - this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = now;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidPosition(this.currentPiece.shape, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
        } else if (dy > 0) {
            // La pièce ne peut plus descendre
            this.placePiece();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
        }
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    isValidPosition(shape, x, y) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] !== 0) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }
                    
                    if (newY >= 0 && this.board[newY][newX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col] !== 0) {
                    const x = this.currentPiece.x + col;
                    const y = this.currentPiece.y + row;
                    
                    if (y < 0) {
                        this.gameOver();
                        return;
                    }
                    
                    if (y >= 0 && y < this.rows && x >= 0 && x < this.cols) {
                        this.board[y][x] = this.currentPiece.shape[row][col];
                    }
                }
            }
        }
        
        this.clearLines();
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.createPiece();
        
        // Vérifier si la nouvelle pièce peut être placée
        if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                linesCleared++;
                row++; // Vérifier à nouveau cette ligne
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 50);
            updateScore(this.score);
        }
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner le plateau
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const value = this.board[row][col];
                if (value !== 0) {
                    const x = col * this.blockSize;
                    const y = row * this.blockSize;
                    
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
                    
                    this.ctx.strokeStyle = '#1e293b';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
                }
            }
        }
        
        // Dessiner la pièce actuelle
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    const value = this.currentPiece.shape[row][col];
                    if (value !== 0) {
                        const x = (this.currentPiece.x + col) * this.blockSize;
                        const y = (this.currentPiece.y + row) * this.blockSize;
                        
                        this.ctx.fillStyle = this.colors[value];
                        this.ctx.fillRect(x, y, this.blockSize, this.blockSize);
                        
                        this.ctx.strokeStyle = '#1e293b';
                        this.ctx.lineWidth = 1;
                        this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
                    }
                }
            }
        }
        
        // Dessiner les informations
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '14px Poppins';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Niveau: ${this.level}`, 10, this.canvas.height - 40);
        this.ctx.fillText(`Lignes: ${this.lines}`, 10, this.canvas.height - 20);
        
        // Grille
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.blockSize, 0);
            this.ctx.lineTo(i * this.blockSize, this.rows * this.blockSize);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.blockSize);
            this.ctx.lineTo(this.cols * this.blockSize, i * this.blockSize);
            this.ctx.stroke();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Sauvegarder le score si l'utilisateur est connecté
        if (typeof saveScore === 'function') {
            saveScore('tetris', this.score);
        }
        
        // Overlay de game over
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '18px Poppins';
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Cliquez pour recommencer', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        // Ajouter un handler pour recommencer
        this.restartHandler = () => {
            this.restart();
        };
        
        addGameEventListener(this.canvas, 'click', this.restartHandler);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused && this.gameRunning) {
            this.gameLoop();
        }
    }
    
    restart() {
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.isPaused = false;
        this.gameRunning = false;
        updateScore(this.score);
        this.start();
    }
}

function initTetrisGame() {
    tetrisGame = new TetrisGame(gameCanvas, gameContext);
    tetrisGame.start();
    updateScore(0);
    return tetrisGame;
}
