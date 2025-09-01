// Memory Game Implementation
let memoryGame = null;

class MemoryGame {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.gridSize = 4;
        this.cardSize = 60;
        this.gap = 10;
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.gameRunning = false;
        this.isPaused = false;
        
        this.symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
        this.cardColors = {
            back: '#6366f1',
            front: '#f8fafc',
            matched: '#10b981'
        };
        
        this.initCards();
        this.setupControls();
    }
    
    initCards() {
        this.cards = [];
        const symbols = [...this.symbols, ...this.symbols]; // Dupliquer pour les paires
        
        // Mélanger les symboles
        for (let i = symbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [symbols[i], symbols[j]] = [symbols[j], symbols[i]];
        }
        
        // Créer les cartes
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                this.cards.push({
                    x: j,
                    y: i,
                    symbol: symbols[i * this.gridSize + j],
                    isFlipped: false,
                    isMatched: false
                });
            }
        }
    }
    
    setupControls() {
        this.clickHandler = (e) => {
            if (!this.gameRunning || this.isPaused) return;
            this.handleClick(e);
        };
        
        this.touchHandler = (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.isPaused) return;
            this.handleClick(e.changedTouches[0]);
        };
        
        addGameEventListener(this.canvas, 'click', this.clickHandler);
        addGameEventListener(this.canvas, 'touchend', this.touchHandler);
    }
    
    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        const gridStartX = (this.canvas.width - (this.gridSize * this.cardSize + (this.gridSize - 1) * this.gap)) / 2;
        const gridStartY = (this.canvas.height - (this.gridSize * this.cardSize + (this.gridSize - 1) * this.gap)) / 2;
        
        const cardX = Math.floor((clickX - gridStartX) / (this.cardSize + this.gap));
        const cardY = Math.floor((clickY - gridStartY) / (this.cardSize + this.gap));
        
        if (cardX >= 0 && cardX < this.gridSize && cardY >= 0 && cardY < this.gridSize) {
            const cardIndex = cardY * this.gridSize + cardX;
            const card = this.cards[cardIndex];
            
            if (!card.isFlipped && !card.isMatched && this.flippedCards.length < 2) {
                this.flipCard(card);
            }
        }
    }
    
    flipCard(card) {
        card.isFlipped = true;
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
        
        this.draw();
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match trouvé
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;
            this.score += 100;
            updateScore(this.score);
            
            if (this.matchedPairs === this.symbols.length) {
                this.gameWon();
            }
        } else {
            // Pas de match
            card1.isFlipped = false;
            card2.isFlipped = false;
        }
        
        this.flippedCards = [];
        this.draw();
    }
    
    start() {
        this.gameRunning = true;
        this.draw();
        updateScore(this.score);
    }
    
    draw() {
        // Fond
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculer la position de départ pour centrer la grille
        const gridWidth = this.gridSize * this.cardSize + (this.gridSize - 1) * this.gap;
        const gridHeight = this.gridSize * this.cardSize + (this.gridSize - 1) * this.gap;
        const startX = (this.canvas.width - gridWidth) / 2;
        const startY = (this.canvas.height - gridHeight) / 2;
        
        // Dessiner les cartes
        for (const card of this.cards) {
            const x = startX + card.x * (this.cardSize + this.gap);
            const y = startY + card.y * (this.cardSize + this.gap);
            
            // Fond de la carte
            if (card.isMatched) {
                this.ctx.fillStyle = this.cardColors.matched;
            } else if (card.isFlipped) {
                this.ctx.fillStyle = this.cardColors.front;
            } else {
                this.ctx.fillStyle = this.cardColors.back;
            }
            
            this.ctx.fillRect(x, y, this.cardSize, this.cardSize);
            
            // Bordure
            this.ctx.strokeStyle = '#334155';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, this.cardSize, this.cardSize);
            
            // Contenu de la carte
            if (card.isFlipped || card.isMatched) {
                this.ctx.font = '24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#1e293b';
                this.ctx.fillText(card.symbol, x + this.cardSize / 2, y + this.cardSize / 2);
            } else {
                // Motif sur le dos de la carte
                this.ctx.fillStyle = '#4f46e5';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('?', x + this.cardSize / 2, y + this.cardSize / 2);
            }
        }
        
        // Informations de jeu
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '16px Poppins';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Mouvements: ${this.moves}`, 10, 30);
        this.ctx.fillText(`Paires: ${this.matchedPairs}/${this.symbols.length}`, 10, 50);
        
        // Instructions
        this.ctx.font = '12px Poppins';
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Cliquez sur les cartes pour les retourner', this.canvas.width / 2, this.canvas.height - 20);
    }
    
    gameWon() {
        this.gameRunning = false;
        
        this.ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 28px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Félicitations!', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        this.ctx.font = '18px Poppins';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`En ${this.moves} mouvements`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    gameOver() {
        this.gameRunning = false;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
    }
    
    restart() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.moves = 0;
        this.gameRunning = false;
        this.isPaused = false;
        this.initCards();
        updateScore(this.score);
        this.start();
    }
}

function initMemoryGame() {
    memoryGame = new MemoryGame(gameCanvas, gameContext);
    memoryGame.start();
    updateScore(0);
    return memoryGame;
}
