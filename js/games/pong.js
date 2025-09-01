// Pong Game Implementation
let pongGame = null;

class PongGame {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        
        this.paddle = {
            x: 10,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            speed: 5
        };
        
        this.aiPaddle = {
            x: this.canvas.width - 20,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            speed: 3
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            speedX: 4,
            speedY: 3,
            maxSpeed: 8
        };
        
        this.score = {
            player: 0,
            ai: 0
        };
        
        this.gameRunning = false;
        this.isPaused = false;
        this.gameStarted = false;
        
        this.setupControls();
    }
    
    start() {
        this.gameRunning = false;
        this.gameStarted = false;
        
        // Ajouter un clic handler pour démarrer
        this.clickStartHandler = (e) => {
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.gameRunning = true;
                this.gameLoop();
            }
        };
        
        addGameEventListener(this.canvas, 'click', this.clickStartHandler);
        this.showInstructions();
    }
    
    setupControls() {
        this.keys = {};
        
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            
            if ((e.key === ' ' || e.key === 'Enter') && !this.gameStarted) {
                e.preventDefault();
                this.gameStarted = true;
                this.gameRunning = true;
                this.gameLoop();
            }
        };
        
        this.keyUpHandler = (e) => {
            this.keys[e.key] = false;
        };
        
        addGameEventListener(document, 'keydown', this.keyDownHandler);
        addGameEventListener(document, 'keyup', this.keyUpHandler);
        
        // Contrôles tactiles
        let touchY = 0;
        
        this.touchStartHandler = (e) => {
            e.preventDefault();
            touchY = e.touches[0].clientY;
            
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.gameRunning = true;
                this.gameLoop();
            }
        };
        
        this.touchMoveHandler = (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.isPaused) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const newTouchY = e.touches[0].clientY - rect.top;
            
            this.paddle.y = newTouchY - this.paddle.height / 2;
            this.paddle.y = Math.max(0, Math.min(this.canvas.height - this.paddle.height, this.paddle.y));
        };
        
        addGameEventListener(this.canvas, 'touchstart', this.touchStartHandler);
        addGameEventListener(this.canvas, 'touchmove', this.touchMoveHandler);
    }
    
    start() {
        this.showInstructions();
    }
    
    showInstructions() {
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Pong Retro', this.canvas.width / 2, 80);
        
        this.ctx.font = '16px Poppins';
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillText('Utilisez les flèches ↑↓ ou W/S', this.canvas.width / 2, 120);
        this.ctx.fillText('Sur mobile: glissez pour bouger', this.canvas.width / 2, 140);
        this.ctx.fillText('Premier à 5 points gagne!', this.canvas.width / 2, 160);
        this.ctx.fillText('Cliquez ou appuyez sur ESPACE pour commencer', this.canvas.width / 2, 200);
        
        // Dessiner les éléments de jeu en aperçu
        this.drawGameElements();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.isPaused) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Contrôles du joueur
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.paddle.y -= this.paddle.speed;
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.paddle.y += this.paddle.speed;
        }
        
        // Limiter la raquette du joueur
        this.paddle.y = Math.max(0, Math.min(this.canvas.height - this.paddle.height, this.paddle.y));
        
        // IA simple
        const aiCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
        if (aiCenter < this.ball.y - 35) {
            this.aiPaddle.y += this.aiPaddle.speed;
        } else if (aiCenter > this.ball.y + 35) {
            this.aiPaddle.y -= this.aiPaddle.speed;
        }
        
        // Limiter la raquette IA
        this.aiPaddle.y = Math.max(0, Math.min(this.canvas.height - this.aiPaddle.height, this.aiPaddle.y));
        
        // Mouvement de la balle
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Rebond sur les murs haut/bas
        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvas.height) {
            this.ball.speedY = -this.ball.speedY;
        }
        
        // Collision avec la raquette du joueur
        if (this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width &&
            this.ball.y >= this.paddle.y &&
            this.ball.y <= this.paddle.y + this.paddle.height &&
            this.ball.speedX < 0) {
            
            this.ball.speedX = -this.ball.speedX;
            const hitPos = (this.ball.y - (this.paddle.y + this.paddle.height / 2)) / (this.paddle.height / 2);
            this.ball.speedY = hitPos * 5;
            
            // Augmenter légèrement la vitesse
            this.ball.speedX = Math.min(this.ball.maxSpeed, Math.abs(this.ball.speedX) * 1.05) * Math.sign(this.ball.speedX);
        }
        
        // Collision avec la raquette IA
        if (this.ball.x + this.ball.radius >= this.aiPaddle.x &&
            this.ball.y >= this.aiPaddle.y &&
            this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
            this.ball.speedX > 0) {
            
            this.ball.speedX = -this.ball.speedX;
            const hitPos = (this.ball.y - (this.aiPaddle.y + this.aiPaddle.height / 2)) / (this.aiPaddle.height / 2);
            this.ball.speedY = hitPos * 5;
            
            // Augmenter légèrement la vitesse
            this.ball.speedX = Math.max(-this.ball.maxSpeed, Math.abs(this.ball.speedX) * 1.05) * Math.sign(this.ball.speedX);
        }
        
        // Vérifier les points
        if (this.ball.x < 0) {
            this.score.ai++;
            this.resetBall();
            this.checkWin();
        } else if (this.ball.x > this.canvas.width) {
            this.score.player++;
            this.resetBall();
            this.checkWin();
        }
        
        updateScore(this.score.player);
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 4;
        this.ball.speedY = (Math.random() - 0.5) * 6;
    }
    
    checkWin() {
        if (this.score.player >= 5 || this.score.ai >= 5) {
            this.gameOver();
        }
    }
    
    draw() {
        // Fond
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGameElements();
        
        // Score
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 32px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.score.player}`, this.canvas.width / 4, 50);
        this.ctx.fillText(`${this.score.ai}`, 3 * this.canvas.width / 4, 50);
        
        // Ligne centrale
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawGameElements() {
        // Raquette du joueur
        this.ctx.fillStyle = '#6366f1';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Raquette IA
        this.ctx.fillStyle = '#ec4899';
        this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
        
        // Balle
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Effet brillant sur la balle
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 3, this.ball.y - 3, 3, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    gameOver() {
        this.gameRunning = false;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const winner = this.score.player >= 5 ? 'Vous avez gagné!' : 'IA a gagné!';
        const winColor = this.score.player >= 5 ? '#10b981' : '#ef4444';
        
        this.ctx.fillStyle = winColor;
        this.ctx.font = 'bold 28px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(winner, this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '18px Poppins';
        this.ctx.fillText(`Score Final: ${this.score.player} - ${this.score.ai}`, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused && this.gameRunning) {
            this.gameLoop();
        }
    }
    
    restart() {
        this.paddle.y = this.canvas.height / 2 - 40;
        this.aiPaddle.y = this.canvas.height / 2 - 40;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = 4;
        this.ball.speedY = 3;
        this.score.player = 0;
        this.score.ai = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.gameStarted = false;
        updateScore(this.score.player);
        this.start();
    }
}

function initPongGame() {
    pongGame = new PongGame(gameCanvas, gameContext);
    pongGame.start();
    updateScore(0);
    return pongGame;
}
