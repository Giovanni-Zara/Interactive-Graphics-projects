import * as THREE from 'three';
// Menu Manager - Handles all menu interactions and UI
export class MenuManager {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.shadowsEnabled = true;
    }

    initialize() {
        console.log('DOM loaded');
        this.setupEventListeners();
        this.showMainMenu();
        this.loadingMessages = [
            "Preparing the seas...",
            "Loading your crew...",
            "Charting the course...",
            "Raising the anchor...",
            "Unfurling the sails...",
            "Loading treasures...",
            "Almost ready to sail..."
        ];
    }

    setupEventListeners() {
        // Play button
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.addEventListener('click', () => this.startGame());
            console.log('Play button event listener added');
        } else {
            console.error('Play button not found!');
        }

        // Shadow toggle
        const shadowToggle = document.getElementById('shadowToggle');
        if (shadowToggle) {
            shadowToggle.addEventListener('change', (event) => {
                this.shadowsEnabled = event.target.checked;
                this.gameLogic.updateShadowSettings(this.shadowsEnabled);
            });
        }

        // Expose functions globally for HTML onclick handlers
        window.startGame = () => this.startGame();
        window.restartGame = () => this.restartGame();
        window.returnToMenu = () => this.returnToMenu();
    }

    async startGame() {
        console.log('Starting game...');

        document.getElementById('mainMenu').style.display = 'none';
        this.showLoadingScreen();

        try {
            await this.gameLogic.startGame(this.shadowsEnabled, (progress, message) => {
                this.updateLoadingProgress(progress, message);
            });

            //now hide it and show game
            this.hideLoadingScreen();
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.style.display = 'block';
            gameContainer.classList.add('active');

        } catch (error) {
            console.error('Error starting game:', error);
            this.hideLoadingScreen();
            this.showMainMenu();
        }
        /*
        document.getElementById('mainMenu').style.display = 'none';
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.style.display = 'block';
        gameContainer.classList.add('active');
        
        this.gameLogic.startGame(this.shadowsEnabled);
        */
    }

    showLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'block';
        this.updateLoadingProgress(0, "Loading...");
    }

    hideLoadingScreen() {
        document.getElementById('loadingScreen').style.display = 'none';
    }

    updateLoadingProgress(percentage, message) {
        const progressBar = document.getElementById('progressFill');
        const loadingText = document.getElementById('loadingText');
        const loadingPercentage = document.getElementById('loadingPercentage');

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (loadingText && message) {
            loadingText.textContent = message;
        }
        if (loadingPercentage) {
            loadingPercentage.textContent = `${Math.round(percentage)}%`;
        }
    }

    restartGame() {
        this.gameLogic.restartGame();
    }

    returnToMenu() {
        this.gameLogic.setGameState('menu');
        this.showMainMenu();
        this.hideGameScreens();
    }

    showMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        const gameContainer = document.getElementById('gameContainer');
        
        if (mainMenu) {
            mainMenu.style.display = 'flex';
        }
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
    }

    hideGameScreens() {
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('winScreen').style.display = 'none';
    }

    showGameOverScreen() {
        document.getElementById('gameOverScreen').style.display = 'block';
    }

    showWinScreen() {
        document.getElementById('winScreen').style.display = 'block';
    }
}
