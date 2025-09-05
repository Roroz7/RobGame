// Snake Game Implementation
let snakeGame = null;

class SnakeGame {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = {x: 15, y: 15}; // Initialiser avec des valeurs par défaut
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isPaused = false;
        this.gameRunning = false;
        
        this.generateFood();
        this.setupControls();
    }
    
    generateFood() {
        let attempts = 0;
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            attempts++;
        } while (this.isFoodOnSnake() && attempts < 100);
        
        // Debug: forcer une position si nécessaire
        if (attempts >= 100) {
            this.food = {x: 5, y: 5};
        }
    }
    
    isFoodOnSnake() {
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                return true;
            }
        }
        return false;
    }
    
    setupControls() {
        // Contrôles clavier
        this.keyHandler = (e) => {
            if (!this.gameRunning || this.isPaused) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = -1;
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.dy === 0) {
                        this.dx = 0;
                        this.dy = 1;
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.dx === 0) {
                        this.dx = -1;
                        this.dy = 0;
                    }
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.dx === 0) {
                        this.dx = 1;
                        this.dy = 0;
                    }
                    break;
            }
        };
        
        addGameEventListener(document, 'keydown', this.keyHandler);
        
        // Contrôles tactiles pour mobile
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
                // Mouvement horizontal
                if (deltaX > 30 && this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                } else if (deltaX < -30 && this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
            } else {
                // Mouvement vertical
                if (deltaY > 30 && this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                } else if (deltaY < -30 && this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
            }
        };
        
        addGameEventListener(this.canvas, 'touchstart', this.touchStartHandler);
        addGameEventListener(this.canvas, 'touchend', this.touchEndHandler);
    }
    
    start() {
        this.gameRunning = true;
        this.showInstructions();
    }
    
    showInstructions() {
        this.ctx.fillStyle = '#334155';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '20px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Snake Classic', this.canvas.width / 2, 60);
        
        this.ctx.font = '14px Poppins';
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillText('Utilisez les flèches ou WASD pour bouger', this.canvas.width / 2, 100);
        this.ctx.fillText('Sur mobile: glissez dans la direction souhaitée', this.canvas.width / 2, 120);
        this.ctx.fillText('Cliquez pour commencer', this.canvas.width / 2, 160);
        
        // Attendre un clic pour démarrer
        this.startClickHandler = (e) => {
            this.actualStart();
        };
        
        addGameEventListener(this.canvas, 'click', this.startClickHandler);
    }
    
    actualStart() {
        // Supprimer les handlers de démarrage
        removeAllGameEventListeners();
        
        // Remettre les contrôles de jeu
        addGameEventListener(document, 'keydown', this.keyHandler);
        addGameEventListener(this.canvas, 'touchstart', this.touchStartHandler);
        addGameEventListener(this.canvas, 'touchend', this.touchEndHandler);
        
        this.dx = 1;
        this.dy = 0;
        this.gameRunning = true;
        this.generateFood(); // S'assurer que la nourriture est générée
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.isPaused) return;
        
        setTimeout(() => {
            this.update();
            this.draw();
            this.gameLoop();
        }, 150);
    }
    
    update() {
        // Déplacer la tête du serpent
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Vérifier les collisions avec les murs
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Vérifier les collisions avec le corps
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Vérifier si le serpent mange la nourriture
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            updateScore(this.score);
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Effacer le canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la grille
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Dessiner le serpent
        this.ctx.fillStyle = '#6366f1';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Tête du serpent
                this.ctx.fillStyle = '#4f46e5';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Yeux
                this.ctx.fillStyle = '#f8fafc';
                this.ctx.fillRect(x + 5, y + 5, 3, 3);
                this.ctx.fillRect(x + 12, y + 5, 3, 3);
            } else {
                // Corps du serpent
                const alpha = 1 - (i * 0.1);
                this.ctx.fillStyle = `rgba(99, 102, 241, ${Math.max(alpha, 0.3)})`;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        }
        
        // Dessiner la nourriture
        if (this.food && this.food.x !== undefined && this.food.y !== undefined) {
            const foodX = this.food.x * this.gridSize;
            const foodY = this.food.y * this.gridSize;
            
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(foodX + this.gridSize/2, foodY + this.gridSize/2, this.gridSize/2 - 2, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Effet brillant sur la nourriture
            this.ctx.fillStyle = '#fca5a5';
            this.ctx.beginPath();
            this.ctx.arc(foodX + this.gridSize/2 - 3, foodY + this.gridSize/2 - 3, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Sauvegarder le score si l'utilisateur est connecté
        if (typeof saveScore === 'function') {
            saveScore('snake', this.score);
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
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isPaused = false;
        this.gameRunning = false;
        updateScore(this.score);
        this.generateFood();
        this.start();
    }
}

function initSnakeGame() {
    snakeGame = new SnakeGame(gameCanvas, gameContext);
    snakeGame.start();
    updateScore(0);
    return snakeGame;
}
