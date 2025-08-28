import * as THREE from 'three';
// Main entry point for Castaway Pirate game
import { GameLogic } from './gameLogic.js';
import { MenuManager } from './menu.js';

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gameLogic = new GameLogic();
    const menuManager = new MenuManager(gameLogic);
    
    // Start the application
    menuManager.initialize();
    gameLogic.startGameLoop();
});
