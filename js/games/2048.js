// 2048 Game Implementation
let game2048 = null;

class Game2048 {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.size = 4;
        this.tileSize = 80;
        this.gap = 10;
        this.board = [];
        this.score = 0;
        this.gameRunning = false;
        this.isPaused = false;
        
        this.colors = {
            0: '#cdc1b4',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        
        this.textColors = {
            2: '#776e65',
            4: '#776e65',
            8: '#f9f6f2',
            16: '#f9f6f2',
            32: '#f9f6f2',
            64: '#f9f6f2',
            128: '#f9f6f2',
            256: '#f9f6f2',
            512: '#f9f6f2',
            1024: '#f9f6f2',
            2048: '#f9f6f2'
        };
        
        this.initBoard();
        this.setupControls();
    }
    
    initBoard() {
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.addRandomTile();
        this.addRandomTile();
        this.score = 0;
    }
    
    setupControls() {
        this.keyHandler = (e) => {
            if (!this.gameRunning || this.isPaused) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    moved = this.move('right');
                    break;
            }
            
            if (moved) {
                this.addRandomTile();
                updateScore(this.score);
                if (this.isGameOver()) {
                    this.gameOver();
                }
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
            
            let moved = false;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) {
                    moved = this.move('right');
                } else if (deltaX < -30) {
                    moved = this.move('left');
                }
            } else {
                if (deltaY > 30) {
                    moved = this.move('down');
                } else if (deltaY < -30) {
                    moved = this.move('up');
                }
            }
            
            if (moved) {
                this.addRandomTile();
                updateScore(this.score);
                if (this.isGameOver()) {
                    this.gameOver();
                }
            }
        };
        
        addGameEventListener(this.canvas, 'touchstart', this.touchStartHandler);
        addGameEventListener(this.canvas, 'touchend', this.touchEndHandler);
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({x: j, y: i});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.y][randomCell.x] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    move(direction) {
        const previousBoard = this.board.map(row => [...row]);
        
        switch(direction) {
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
        }
        
        return !this.boardsEqual(previousBoard, this.board);
    }
    
    moveLeft() {
        for (let i = 0; i < this.size; i++) {
            let row = this.board[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row[j + 1] = 0;
                }
            }
            row = row.filter(val => val !== 0);
            while (row.length < this.size) {
                row.push(0);
            }
            this.board[i] = row;
        }
    }
    
    moveRight() {
        for (let i = 0; i < this.size; i++) {
            let row = this.board[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row[j - 1] = 0;
                }
            }
            row = row.filter(val => val !== 0);
            while (row.length < this.size) {
                row.unshift(0);
            }
            this.board[i] = row;
        }
    }
    
    moveUp() {
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column[i + 1] = 0;
                }
            }
            
            column = column.filter(val => val !== 0);
            while (column.length < this.size) {
                column.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                this.board[i][j] = column[i];
            }
        }
    }
    
    moveDown() {
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column[i - 1] = 0;
                }
            }
            
            column = column.filter(val => val !== 0);
            while (column.length < this.size) {
                column.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                this.board[i][j] = column[i];
            }
        }
    }
    
    boardsEqual(board1, board2) {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (board1[i][j] !== board2[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    isGameOver() {
        // Vérifier s'il y a des cases vides
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Vérifier s'il y a des mouvements possibles
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.board[i][j];
                if ((j < this.size - 1 && current === this.board[i][j + 1]) ||
                    (i < this.size - 1 && current === this.board[i + 1][j])) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    start() {
        this.gameRunning = true;
        updateScore(this.score);
        this.draw();
    }
    
    draw() {
        // Fond
        this.ctx.fillStyle = '#bbada0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculer la position de départ pour centrer la grille
        const gridWidth = this.size * this.tileSize + (this.size - 1) * this.gap;
        const gridHeight = this.size * this.tileSize + (this.size - 1) * this.gap;
        const startX = (this.canvas.width - gridWidth) / 2;
        const startY = (this.canvas.height - gridHeight) / 2;
        
        // Dessiner les cases
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const x = startX + j * (this.tileSize + this.gap);
                const y = startY + i * (this.tileSize + this.gap);
                const value = this.board[i][j];
                
                // Fond de la case
                this.ctx.fillStyle = this.colors[value] || '#3c3a32';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // Texte
                if (value !== 0) {
                    this.ctx.fillStyle = this.textColors[value] || '#f9f6f2';
                    this.ctx.font = value < 100 ? 'bold 24px Poppins' : 
                                   value < 1000 ? 'bold 20px Poppins' : 'bold 16px Poppins';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(value.toString(), x + this.tileSize / 2, y + this.tileSize / 2);
                }
            }
        }
        
        // Instructions
        this.ctx.fillStyle = '#776e65';
        this.ctx.font = '14px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Utilisez les flèches ou WASD', this.canvas.width / 2, 30);
        this.ctx.fillText('Combinez les tuiles pour atteindre 2048!', this.canvas.width / 2, 50);
    }
    
    gameOver() {
        this.gameRunning = false;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 28px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '18px Poppins';
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillText(`Score Final: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    
    restart() {
        this.score = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.initBoard();
        updateScore(this.score);
        this.start();
    }
}

function init2048Game() {
    game2048 = new Game2048(gameCanvas, gameContext);
    updateScore(0);
    game2048.start();
    return game2048;
}
