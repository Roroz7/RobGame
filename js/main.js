// Navigation et interactions principales
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeGameModal();
    initializeAnimations();
});

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    // Navigation smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
    
    // Navigation mobile toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Scroll spy pour navigation active
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Modal de jeu
let currentGame = null;
let gameCanvas = null;
let gameContext = null;
let gameInstance = null;
let gameEventListeners = [];

function initializeGameModal() {
    gameCanvas = document.getElementById('gameCanvas');
    gameContext = gameCanvas.getContext('2d');
    
    // Boutons de contrôle
    document.getElementById('pauseButton').addEventListener('click', pauseGame);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    
    // Fermeture modal avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('gameModal').style.display === 'block') {
            closeGame();
        }
    });
    
    // Fermeture modal en cliquant à l'extérieur
    document.getElementById('gameModal').addEventListener('click', (e) => {
        if (e.target.id === 'gameModal') {
            closeGame();
        }
    });
}

// Fonction pour nettoyer tous les event listeners
function removeAllGameEventListeners() {
    gameEventListeners.forEach(listener => {
        try {
            listener.element.removeEventListener(listener.type, listener.handler);
        } catch (e) {
            console.warn('Erreur lors de la suppression d\'un event listener:', e);
        }
    });
    gameEventListeners = [];
}

// Fonction pour ajouter un event listener avec tracking
function addGameEventListener(element, type, handler) {
    element.addEventListener(type, handler);
    gameEventListeners.push({ element, type, handler });
}

// Gestion des jeux
function startGame(gameName) {
    // Nettoyer complètement avant de commencer
    if (currentGame) {
        stopCurrentGame();
        removeAllGameEventListeners();
    }
    
    const modal = document.getElementById('gameModal');
    const gameTitle = document.getElementById('gameTitle');
    
    // Configuration du canvas
    gameCanvas.width = 600;
    gameCanvas.height = 400;
    
    // Titres des jeux
    const gameTitles = {
        'snake': 'Snake Classic',
        'tetris': 'Tetris Pro',
        'flappy': 'Flappy Bird',
        '2048': '2048 Challenge',
        'memory': 'Memory Master',
        'pong': 'Pong Retro'
    };
    
    gameTitle.textContent = gameTitles[gameName] || 'Jeu';
    currentGame = gameName;
    
    // Afficher le modal
    modal.style.display = 'block';
    
    // Attendre un peu pour s'assurer que le nettoyage est terminé
    setTimeout(() => {
        // Démarrer le jeu spécifique
        switch(gameName) {
            case 'snake':
                if (gameMaintenanceStatus['snake']) {
                    showMaintenance('Snake Classic');
                } else {
                    gameInstance = initSnakeGame();
                }
                break;
            case 'tetris':
                if (gameMaintenanceStatus['tetris']) {
                    showMaintenance('Tetris Pro');
                } else {
                    gameInstance = initTetrisGame();
                }
                break;
            case 'flappy':
                if (gameMaintenanceStatus['flappy']) {
                    showMaintenance('Flappy Bird');
                } else {
                    gameInstance = initFlappyGame();
                }
                break;
            case '2048':
                if (gameMaintenanceStatus['2048']) {
                    showMaintenance('2048 Challenge');
                } else {
                    gameInstance = init2048Game();
                }
                break;
            case 'memory':
                if (gameMaintenanceStatus['memory']) {
                    showMaintenance('Memory Master');
                } else {
                    gameInstance = initMemoryGame();
                }
                break;
            case 'pong':
                if (gameMaintenanceStatus['pong']) {
                    showMaintenance('Pong Retro');
                } else {
                    gameInstance = initPongGame();
                }
                break;
            default:
                showComingSoon();
        }
    }, 100);
}

function closeGame() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
    
    // Arrêter le jeu actuel
    if (currentGame) {
        stopCurrentGame();
        currentGame = null;
    }
    
    // Nettoyer tous les event listeners
    removeAllGameEventListeners();
    
    // Réinitialiser l'instance de jeu
    gameInstance = null;
}

function pauseGame() {
    if (gameInstance && gameInstance.togglePause) {
        gameInstance.togglePause();
    }
}

function restartGame() {
    if (currentGame) {
        stopCurrentGame();
        removeAllGameEventListeners();
        startGame(currentGame);
    }
}

function stopCurrentGame() {
    // Arrêter l'instance de jeu actuelle
    if (gameInstance && gameInstance.gameRunning) {
        gameInstance.gameRunning = false;
        gameInstance.isPaused = false;
    }
    
    // Arrêter tous les intervals et timeouts
    for (let i = 1; i < 99999; i++) {
        window.clearInterval(i);
        window.clearTimeout(i);
    }
    
    // Nettoyer le canvas
    if (gameContext) {
        gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    }
    
    // Réinitialiser les variables globales de jeu
    if (typeof snakeGame !== 'undefined') snakeGame = null;
    if (typeof tetrisGame !== 'undefined') tetrisGame = null;
    if (typeof flappyGame !== 'undefined') flappyGame = null;
    if (typeof game2048 !== 'undefined') game2048 = null;
    if (typeof memoryGame !== 'undefined') memoryGame = null;
    if (typeof pongGame !== 'undefined') pongGame = null;
}

function updateScore(score) {
    document.getElementById('scoreValue').textContent = score;
}

function showComingSoon() {
    gameContext.fillStyle = '#1e293b';
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    gameContext.fillStyle = '#f8fafc';
    gameContext.font = 'bold 24px Poppins';
    gameContext.textAlign = 'center';
    gameContext.fillText('Bientôt disponible!', gameCanvas.width / 2, gameCanvas.height / 2 - 20);
    
    gameContext.font = '16px Poppins';
    gameContext.fillStyle = '#cbd5e1';
    gameContext.fillText('Ce jeu sera ajouté prochainement', gameCanvas.width / 2, gameCanvas.height / 2 + 20);
}

function showMaintenance(gameName) {
    gameContext.fillStyle = '#1e293b';
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    gameContext.fillStyle = '#f59e0b';
    gameContext.font = 'bold 24px Poppins';
    gameContext.textAlign = 'center';
    gameContext.fillText('🔧 Maintenance', gameCanvas.width / 2, gameCanvas.height / 2 - 40);
    
    gameContext.fillStyle = '#f8fafc';
    gameContext.font = '18px Poppins';
    gameContext.fillText(gameName, gameCanvas.width / 2, gameCanvas.height / 2 - 10);
    
    gameContext.font = '16px Poppins';
    gameContext.fillStyle = '#cbd5e1';
    gameContext.fillText('Ce jeu est temporairement indisponible', gameCanvas.width / 2, gameCanvas.height / 2 + 20);
    gameContext.fillText('Nous travaillons sur des améliorations', gameCanvas.width / 2, gameCanvas.height / 2 + 45);
}

// Panel Admin
const adminCredentials = {
    id: 'admin',
    password: 'robgame2024'
};

let gameMaintenanceStatus = {
    'snake': false,
    'tetris': false,
    'flappy': false,
    '2048': true,
    'memory': false,
    'pong': false
};

function openAdmin() {
    document.getElementById('adminPanel').style.display = 'block';
}

function closeAdmin() {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    document.getElementById('adminId').value = '';
    document.getElementById('adminPassword').value = '';
}

function adminLogin() {
    const id = document.getElementById('adminId').value;
    const password = document.getElementById('adminPassword').value;
    
    if (id === adminCredentials.id && password === adminCredentials.password) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        updateAdminDashboard();
    } else {
        alert('Identifiants incorrects');
    }
}

function adminLogout() {
    closeAdmin();
}

function updateAdminDashboard() {
    Object.keys(gameMaintenanceStatus).forEach(game => {
        const button = document.getElementById(`${game}-toggle`);
        if (gameMaintenanceStatus[game]) {
            button.textContent = 'Maintenance';
            button.className = 'status-btn maintenance';
        } else {
            button.textContent = 'Actif';
            button.className = 'status-btn active';
        }
    });
}

function toggleMaintenance(gameName) {
    gameMaintenanceStatus[gameName] = !gameMaintenanceStatus[gameName];
    updateAdminDashboard();
    
    // Notification
    const status = gameMaintenanceStatus[gameName] ? 'maintenance' : 'actif';
    alert(`${gameName} est maintenant en ${status}`);
}

// Animations au scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = '0.1s';
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);
    
    // Observer les éléments à animer
    document.querySelectorAll('.game-card, .hero h1, .hero p').forEach(el => {
        observer.observe(el);
    });
}

// Initialiser les animations au chargement
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Utilitaires
function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getRandomColor() {
    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Gestion des erreurs
window.addEventListener('error', (e) => {
    console.error('Erreur dans le jeu:', e.error);
});

// Performance monitoring
let lastFrameTime = 0;
function monitorPerformance(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    if (deltaTime > 50) { // Plus de 50ms entre frames
        console.warn('Performance dégradée détectée');
    }
}
