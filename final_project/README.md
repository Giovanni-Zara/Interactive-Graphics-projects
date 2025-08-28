# Seashore Platformer Game

A 3D platformer game built with Three.js where the player must navigate from a beach to a boat by jumping across rocks while avoiding obstacles.

## Game Features

### 🎮 Gameplay
- **Goal**: Navigate from the beach to the boat at the end
- **Controls**: 
  - WASD or Arrow Keys: Move the player
  - Space: Jump
  - R: Reset camera view
- **Lives**: Start with 3 lives
- **Win Condition**: Reach the boat
- **Lose Conditions**: Fall in water or hit obstacles

### 🌊 Environment
- **Sea**: Large blue water plane with transparency
- **Beach**: Sandy starting platform
- **Rocks**: Cylindrical platforms of varying sizes leading to the boat
- **Boat**: 3D boat model as the goal
- **Lighting**: Ambient light + directional sunlight with shadows
- **Fog**: Atmospheric fog for depth

### 🚧 Obstacles
- **Floating Logs**: Move back and forth horizontally
- **Crabs**: Move across rock platforms
- **Water**: Instant death if player falls in

### 🎯 Game Mechanics
- **Physics**: Gravity system with jumping
- **Collision Detection**: Platform landing and obstacle avoidance
- **Camera**: Smooth following camera that tracks the player
- **Lives System**: Respawn at beach when hit, game over at 0 lives
- **UI**: Lives counter, instructions, game over/win screens

## How to Play

1. Open `index.html` in a web browser
2. Use WASD or arrow keys to move your character (red cube)
3. Press Space to jump between rocks
4. Avoid the moving obstacles (brown logs and orange crabs)
5. Don't fall in the water!
6. Reach the boat to win

## Technical Implementation

### Core Technologies
- **Three.js**: 3D graphics library
- **WebGL**: Hardware-accelerated rendering
- **HTML5/CSS3**: UI and styling

### Game Architecture
- **Scene Management**: Three.js scene with proper lighting and shadows
- **Physics**: Custom gravity and collision system
- **Input Handling**: Keyboard event listeners
- **Game States**: Playing, Game Over, Won states
- **Animation Loop**: RequestAnimationFrame for smooth gameplay

### Key Components
- `init()`: Game initialization
- `gameLoop()`: Main game loop
- `updatePlayer()`: Player physics and movement
- `updateObstacles()`: Obstacle animation
- `updateCamera()`: Smooth camera following
- `checkCollisions()`: Platform and obstacle collision detection

## Future Enhancements

- Add sound effects and background music
- Implement particle effects for water splashes
- Add more obstacle types (seagulls, waves)
- Create multiple levels with increasing difficulty
- Add collectible items (shells, treasures)
- Implement better 3D models for player and obstacles
- Add water animation and wave effects
- Include power-ups (extra lives, temporary invincibility)

## File Structure
```
final_project/
├── index.html          # Main HTML file with UI
├── game.js            # Core game logic and Three.js implementation
└── README.md          # This documentation
```

Enjoy your seashore adventure! 🏖️⛵
