// Navigation et interactions principales
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeGameModal();
    initializeAnimations();
    
    // Vérifier si un utilisateur est connecté au chargement
    const savedUser = localStorage.getItem('robgame_current_user');
    if (savedUser) {
        currentUser = savedUser;
        updateUserInterface();
    }
    
    // Vérifier la maintenance globale du site (sauf pour ADMIN)
    checkGlobalMaintenance();
    
    loadLeaderboards();
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

// Variables globales pour l'authentification et admin
let currentUser = null;
let users = JSON.parse(localStorage.getItem('robgame_users')) || [];
let gameScores = JSON.parse(localStorage.getItem('robgame_scores')) || {
    snake: [],
    tetris: [],
    flappy: [],
    '2048': [],
    memory: [],
    pong: []
};
let isAdminLoggedIn = false;
let siteMaintenance = JSON.parse(localStorage.getItem('robgame_site_maintenance')) || false;
let customMaintenanceMessage = localStorage.getItem('robgame_maintenance_message') || 'Le site est actuellement en maintenance. Veuillez revenir plus tard.';

// Variables de maintenance des jeux
let gameMaintenanceStatus = JSON.parse(localStorage.getItem('robgame_maintenance')) || {
    snake: false,
    tetris: false,
    flappy: false,
    '2048': true,
    memory: false,
    pong: false
};


function openAuthModal(mode) {
    document.getElementById('authModal').style.display = 'block';
    switchAuthMode(mode);
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    clearAuthForms();
}

function switchAuthMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    
    if (mode === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authTitle.textContent = 'Connexion';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        authTitle.textContent = 'Inscription';
    }
}

function clearAuthForms() {
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
}

function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!username || !email || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }
    
    if (users[username]) {
        alert('Ce nom d\'utilisateur existe déjà');
        return;
    }
    
    // Créer le compte
    users[username] = {
        email: email,
        password: password, // En production, il faudrait hasher le mot de passe
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('robgame_users', JSON.stringify(users));
    
    alert('Compte créé avec succès !');
    switchAuthMode('login');
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    if (!users[username] || users[username].password !== password) {
        alert('Nom d\'utilisateur ou mot de passe incorrect');
        return;
    }
    
    // Connexion réussie
    currentUser = username;
    localStorage.setItem('robgame_current_user', username);
    updateUserInterface();
    closeAuthModal();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('robgame_current_user');
    updateUserInterface();
}

function updateUserInterface() {
    const userLoggedOut = document.getElementById('userLoggedOut');
    const userLoggedIn = document.getElementById('userLoggedIn');
    const currentUsername = document.getElementById('currentUsername');
    const adminAccess = document.getElementById('adminAccess');
    
    if (currentUser) {
        userLoggedOut.style.display = 'none';
        userLoggedIn.style.display = 'flex';
        currentUsername.textContent = currentUser;
        
        // Afficher le bouton admin si l'utilisateur est ADMIN
        if (currentUser === 'ADMIN') {
            adminAccess.style.display = 'flex';
        } else {
            adminAccess.style.display = 'none';
        }
    } else {
        userLoggedOut.style.display = 'flex';
        userLoggedIn.style.display = 'none';
        adminAccess.style.display = 'none';
    }
}

function saveScore(game, score) {
    if (!currentUser) {
        return; // Pas de sauvegarde si pas connecté
    }
    
    const scoreEntry = {
        username: currentUser,
        score: score,
        date: new Date().toISOString()
    };
    
    if (!gameScores[game]) {
        gameScores[game] = [];
    }
    
    gameScores[game].push(scoreEntry);
    gameScores[game].sort((a, b) => b.score - a.score); // Trier par score décroissant
    gameScores[game] = gameScores[game].slice(0, 10); // Garder seulement le top 10
    
    localStorage.setItem('robgame_scores', JSON.stringify(gameScores));
    loadLeaderboards();
}

// Panel Admin Avancé
function openAdminPanel() {
    if (currentUser !== 'ADMIN') {
        alert('Accès refusé. Seul le compte ADMIN peut accéder à ce panel.');
        return;
    }
    
    isAdminLoggedIn = true;
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminUserInfo').textContent = `Connecté en tant que: ${currentUser}`;
    updateAdminInterface();
    loadAdminStats();
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
    isAdminLoggedIn = false;
}

function switchAdminTab(tabName) {
    // Masquer tous les onglets
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Afficher l'onglet sélectionné
    document.getElementById(`admin-${tabName}`).classList.add('active');
    document.querySelector(`[onclick="switchAdminTab('${tabName}')"]`).classList.add('active');
    
    // Charger les données spécifiques à l'onglet
    if (tabName === 'users') {
        loadUsersList();
    } else if (tabName === 'stats') {
        loadAdminStats();
    }
}

function toggleSiteMaintenance() {
    siteMaintenance = !siteMaintenance;
    localStorage.setItem('robgame_site_maintenance', JSON.stringify(siteMaintenance));
    
    const button = document.getElementById('site-toggle');
    if (siteMaintenance) {
        button.textContent = 'Maintenance';
        button.className = 'status-btn maintenance';
        
        // Forcer la maintenance pour tous les utilisateurs non-admin
        if (currentUser !== 'ADMIN') {
            showGlobalMaintenance();
        }
        
        // Avertir l'admin que la maintenance est activée
        alert('🚨 Maintenance globale activée!\nTous les utilisateurs (sauf ADMIN) verront l\'écran de maintenance.');
    } else {
        button.textContent = 'Actif';
        button.className = 'status-btn active';
        hideGlobalMaintenance();
        
        alert('✅ Maintenance globale désactivée!\nLe site est maintenant accessible à tous.');
    }
}

function toggleGameMaintenance(game) {
    gameMaintenanceStatus[game] = !gameMaintenanceStatus[game];
    localStorage.setItem('robgame_maintenance', JSON.stringify(gameMaintenanceStatus));
    updateGameMaintenanceButtons();
}

function updateGameMaintenanceButtons() {
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

function updateAdminInterface() {
    // Mettre à jour les boutons de maintenance
    const siteButton = document.getElementById('site-toggle');
    if (siteMaintenance) {
        siteButton.textContent = 'Maintenance';
        siteButton.className = 'status-btn maintenance';
    } else {
        siteButton.textContent = 'Actif';
        siteButton.className = 'status-btn active';
    }
    
    updateGameMaintenanceButtons();
    
    // Charger le message de maintenance personnalisé
    document.getElementById('maintenanceMessage').value = customMaintenanceMessage;
}

function checkGlobalMaintenance() {
    // Recharger le statut de maintenance depuis localStorage
    siteMaintenance = JSON.parse(localStorage.getItem('robgame_site_maintenance')) || false;
    
    if (siteMaintenance && currentUser !== 'ADMIN') {
        showGlobalMaintenance();
        return true;
    }
    return false;
}

function showGlobalMaintenance() {
    const modal = document.getElementById('maintenanceModal');
    const text = document.getElementById('maintenanceText');
    text.textContent = customMaintenanceMessage;
    modal.style.display = 'flex';
    
    // Masquer tout le contenu du site
    document.querySelector('main').style.display = 'none';
    document.querySelector('nav').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
}

function hideGlobalMaintenance() {
    document.getElementById('maintenanceModal').style.display = 'none';
    
    // Réafficher le contenu du site
    document.querySelector('main').style.display = 'block';
    document.querySelector('nav').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
}

function loadUsersList() {
    const usersList = document.getElementById('usersList');
    const totalUsersSpan = document.getElementById('totalUsers');
    const activeUsersSpan = document.getElementById('activeUsers');
    
    totalUsersSpan.textContent = users.length;
    activeUsersSpan.textContent = currentUser ? 1 : 0;
    
    usersList.innerHTML = '';
    users.forEach((user, index) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-info-basic">
                <span class="user-name">${user.username}</span>
                <span class="user-email">${user.email}</span>
                <span class="user-status ${user.username === currentUser ? 'online' : 'offline'}">
                    ${user.username === currentUser ? '🟢 En ligne' : '🔴 Hors ligne'}
                </span>
            </div>
            <div class="user-actions">
                <button onclick="resetUserPassword('${user.username}')" class="reset-btn">🔄 Reset MDP</button>
                <button onclick="showUserFullDetails(${index})" class="details-btn">👁️ Détails</button>
                <button onclick="deleteUser('${user.username}')" class="delete-btn">🗑️ Supprimer</button>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

function loadAdminStats() {
    let totalGames = 0;
    let totalScore = 0;
    let gameCount = {};
    
    Object.keys(gameScores).forEach(game => {
        const scores = gameScores[game];
        totalGames += scores.length;
        gameCount[game] = scores.length;
        scores.forEach(score => {
            totalScore += score.score;
        });
    });
    
    const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
    const popularGame = Object.keys(gameCount).reduce((a, b) => gameCount[a] > gameCount[b] ? a : b, 'snake');
    
    document.getElementById('totalGames').textContent = totalGames;
    document.getElementById('avgScore').textContent = avgScore;
    document.getElementById('popularGame').textContent = popularGame.charAt(0).toUpperCase() + popularGame.slice(1);
    document.getElementById('totalTime').textContent = Math.round(totalGames * 2.5) + 'min';
}

function updateMaintenanceMessage() {
    const newMessage = document.getElementById('maintenanceMessage').value;
    if (newMessage.trim()) {
        customMaintenanceMessage = newMessage.trim();
        localStorage.setItem('robgame_maintenance_message', customMaintenanceMessage);
        alert('Message de maintenance mis à jour!');
        
        // Mettre à jour le modal si la maintenance est active
        if (siteMaintenance) {
            document.getElementById('maintenanceText').textContent = customMaintenanceMessage;
        }
    }
}

function resetAllData() {
    if (confirm('⚠️ ATTENTION: Cette action supprimera TOUTES les données (utilisateurs, scores, paramètres). Êtes-vous sûr?')) {
        if (confirm('Cette action est IRRÉVERSIBLE. Confirmez-vous la suppression de toutes les données?')) {
            localStorage.removeItem('robgame_users');
            localStorage.removeItem('robgame_scores');
            localStorage.removeItem('robgame_current_user');
            localStorage.removeItem('robgame_maintenance');
            localStorage.removeItem('robgame_site_maintenance');
            localStorage.removeItem('robgame_maintenance_message');
            
            alert('Toutes les données ont été supprimées. La page va se recharger.');
            location.reload();
        }
    }
}

function adminLogout() {
    closeAdminPanel();
    alert('Déconnexion admin effectuée.');
}

// Fonctions pour l'accès admin pendant maintenance
function showAdminLogin() {
    document.getElementById('adminMaintenanceModal').style.display = 'block';
}

function closeAdminMaintenanceModal() {
    document.getElementById('adminMaintenanceModal').style.display = 'none';
    document.getElementById('adminMaintenanceUsername').value = '';
    document.getElementById('adminMaintenancePassword').value = '';
}

function adminMaintenanceLogin() {
    const username = document.getElementById('adminMaintenanceUsername').value;
    const password = document.getElementById('adminMaintenancePassword').value;
    
    // Vérifier si c'est un utilisateur valide avec le bon mot de passe
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user && username === 'ADMIN') {
        currentUser = username;
        localStorage.setItem('robgame_current_user', currentUser);
        closeAdminMaintenanceModal();
        hideGlobalMaintenance();
        updateUserInterface();
        alert('Accès administrateur accordé!');
        location.reload(); // Recharger pour appliquer les changements
    } else {
        alert('Accès refusé. Seul le compte ADMIN peut accéder au site pendant la maintenance.');
    }
}

// Fonctions de gestion des utilisateurs
function showUserFullDetails(userIndex) {
    const user = users[userIndex];
    const details = `
📋 DÉTAILS COMPLETS DE L'UTILISATEUR

👤 Nom d'utilisateur: ${user.username}
📧 Email: ${user.email}
🔐 Mot de passe: ${user.password}
📅 Date d'inscription: ${user.registrationDate || 'Non disponible'}
🎮 Statut: ${user.username === currentUser ? 'En ligne' : 'Hors ligne'}
    `;
    alert(details);
}

function resetUserPassword(username) {
    if (confirm(`Voulez-vous réinitialiser le mot de passe de ${username}?`)) {
        const newPassword = prompt('Nouveau mot de passe:', 'password123');
        if (newPassword && newPassword.trim()) {
            const userIndex = users.findIndex(u => u.username === username);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword.trim();
                localStorage.setItem('robgame_users', JSON.stringify(users));
                alert(`Mot de passe de ${username} réinitialisé avec succès!\nNouveau mot de passe: ${newPassword.trim()}`);
                loadUsersList();
            }
        }
    }
}

function deleteUser(username) {
    if (username === 'ADMIN') {
        alert('Impossible de supprimer le compte ADMIN!');
        return;
    }
    
    if (confirm(`⚠️ ATTENTION: Supprimer définitivement l'utilisateur ${username}?\nCette action est irréversible!`)) {
        users = users.filter(u => u.username !== username);
        localStorage.setItem('robgame_users', JSON.stringify(users));
        
        // Supprimer aussi les scores de cet utilisateur
        Object.keys(gameScores).forEach(game => {
            gameScores[game] = gameScores[game].filter(score => score.username !== username);
        });
        localStorage.setItem('robgame_scores', JSON.stringify(gameScores));
        
        alert(`Utilisateur ${username} supprimé avec succès!`);
        loadUsersList();
        loadLeaderboards();
    }
}

function exportUsersData() {
    const data = {
        users: users,
        exportDate: new Date().toISOString(),
        totalUsers: users.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `robgame_users_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('Données des utilisateurs exportées avec succès!');
}

function showUserDetails() {
    let details = '📊 DONNÉES COMPLÈTES DES UTILISATEURS\n\n';
    
    users.forEach((user, index) => {
        details += `${index + 1}. 👤 ${user.username}\n`;
        details += `   📧 Email: ${user.email}\n`;
        details += `   🔐 Mot de passe: ${user.password}\n`;
        details += `   📅 Inscription: ${user.registrationDate || 'N/A'}\n`;
        details += `   🎮 Statut: ${user.username === currentUser ? 'En ligne' : 'Hors ligne'}\n\n`;
    });
    
    if (users.length === 0) {
        details += 'Aucun utilisateur inscrit.';
    }
    
    alert(details);
}

// Fonctions pour les classements
function loadLeaderboards() {
    const games = ['snake', 'tetris', 'flappy', '2048', 'memory', 'pong'];
    
    games.forEach(game => {
        const leaderboardDiv = document.getElementById(`leaderboard-${game}`);
        if (leaderboardDiv) {
            const scores = gameScores[game] || [];
            
            if (scores.length === 0) {
                leaderboardDiv.innerHTML = '<div class="no-scores">Aucun score enregistré pour ce jeu</div>';
            } else {
                let html = '<div class="leaderboard-header"><span>Rang</span><span>Joueur</span><span>Score</span></div>';
                scores.forEach((score, index) => {
                    html += `
                        <div class="leaderboard-row">
                            <span class="rank">#${index + 1}</span>
                            <span class="player">${score.username}</span>
                            <span class="score">${score.score}</span>
                        </div>
                    `;
                });
                leaderboardDiv.innerHTML = html;
            }
        }
    });
}

function showLeaderboard(game) {
    // Masquer tous les tableaux
    document.querySelectorAll('.leaderboard-table').forEach(table => {
        table.classList.remove('active');
    });
    
    // Masquer tous les boutons actifs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afficher le tableau sélectionné
    const selectedTable = document.getElementById(`leaderboard-${game}`);
    if (selectedTable) {
        selectedTable.classList.add('active');
    }
    
    // Activer le bouton sélectionné
    event.target.classList.add('active');
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
