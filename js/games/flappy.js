// Flappy Bird Game Implementation
let flappyGame = null;

class FlappyGame {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            width: 20,
            height: 20,
            velocity: 0,
            gravity: 0.25,
            jumpPower: -4
        };
        
        this.pipes = [];
        this.pipeWidth = 50;
        this.pipeGap = 120;
        this.pipeSpeed = 2;
        
        this.score = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.gameStarted = false;
        
        this.setupControls();
    }
    
    setupControls() {
        // Contrôles clavier
        this.keyHandler = (e) => {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                if (!this.gameStarted) {
                    this.gameStarted = true;
                    this.gameRunning = true;
                    this.gameLoop();
                } else if (this.gameRunning && !this.isPaused) {
                    this.jump();
                }
            }
        };
        
        this.touchHandler = (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.gameRunning = true;
                this.gameLoop();
            } else if (this.gameRunning && !this.isPaused) {
                this.jump();
            }
        };
        
        this.clickHandler = (e) => {
            e.preventDefault();
            if (!this.gameStarted) {
                this.gameStarted = true;
                this.gameRunning = true;
                this.gameLoop();
            } else if (this.gameRunning && !this.isPaused) {
                this.jump();
            }
        };
        
        addGameEventListener(document, 'keydown', this.keyHandler);
        addGameEventListener(this.canvas, 'touchstart', this.touchHandler);
        addGameEventListener(this.canvas, 'click', this.clickHandler);
    }
    
    actualStart() {
        this.gameRunning = true;
        this.gameLoop();
    }
    
    jump() {
        this.bird.velocity = this.bird.jumpPower;
    }
    
    start() {
        this.showInstructions();
    }
    
    showInstructions() {
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Flappy Bird', this.canvas.width / 2, 80);
        
        this.ctx.font = '16px Poppins';
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillText('Cliquez ou appuyez sur ESPACE pour voler', this.canvas.width / 2, 120);
        this.ctx.fillText('Évitez les tuyaux !', this.canvas.width / 2, 140);
        this.ctx.fillText('Cliquez pour commencer', this.canvas.width / 2, 180);
        
        // Dessiner l'oiseau de démonstration
        this.drawBird();
    }
    
    gameLoop() {
        if (!this.gameRunning || this.isPaused) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Mettre à jour l'oiseau
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Vérifier les collisions avec le sol et le plafond
        if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
            this.gameOver();
            return;
        }
        
        // Générer des tuyaux
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            this.addPipe();
        }
        
        // Mettre à jour les tuyaux
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Supprimer les tuyaux hors écran
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                continue;
            }
            
            // Vérifier les collisions
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }
            
            // Augmenter le score
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                updateScore(this.score);
            }
        }
    }
    
    addPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Vérifier si l'oiseau est dans la zone horizontale du tuyau
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Vérifier les collisions avec le tuyau du haut ou du bas
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    draw() {
        // Ciel dégradé
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les tuyaux
        this.ctx.fillStyle = '#228B22';
        for (const pipe of this.pipes) {
            // Tuyau du haut
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // Tuyau du bas
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
            
            // Bordures des tuyaux
            this.ctx.strokeStyle = '#006400';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.strokeRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
        }
        
        // Dessiner l'oiseau
        this.drawBird();
        
        // Afficher le score
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 24px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(this.score.toString(), this.canvas.width / 2, 40);
        this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 40);
    }
    
    drawBird() {
        const centerX = this.bird.x + this.bird.width / 2;
        const centerY = this.bird.y + this.bird.height / 2;
        
        // Corps de l'oiseau
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.bird.width / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Aile
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - 5, centerY, 8, 5, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Œil
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(centerX + 3, centerY - 3, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Bec
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 8, centerY);
        this.ctx.lineTo(centerX + 15, centerY - 2);
        this.ctx.lineTo(centerX + 15, centerY + 2);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Sauvegarder le score si l'utilisateur est connecté
        if (typeof saveScore === 'function') {
            saveScore('flappy', this.score);
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
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            width: 20,
            height: 20,
            velocity: 0,
            gravity: 0.25,
            jumpPower: -4
        };
        
        this.pipes = [];
        this.score = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.gameStarted = false;
        updateScore(this.score);
        this.start();
    }
}

function initFlappyGame() {
    flappyGame = new FlappyGame(gameCanvas, gameContext);
    flappyGame.start();
    updateScore(0);
    return flappyGame;
}
