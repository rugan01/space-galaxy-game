// Space Galaxy Adventure Game with Enhanced Settings
class SpaceGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.setupTouchControls();
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, instructions, settings, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.multiplier = 1;
        
        // Safe localStorage access
        try {
            this.highScore = parseInt(localStorage.getItem('spaceGameHighScore')) || 0;
        } catch (e) {
            this.highScore = 0;
        }
        
        // Game settings with defaults
        this.gameSettings = {
            difficulty: 'normal',
            brightness: 100,
            theme: 'classic',
            soundEnabled: true
        };
        
        // Load saved settings
        this.loadSettings();
        
        // Difficulty configurations
        this.difficultyConfig = {
            easy: {
                asteroidSpeedMultiplier: 0.6,
                missileSpeedMultiplier: 1.2,
                asteroidSpawnMultiplier: 0.7,
                powerUpSpawnMultiplier: 1.5,
                label: "EASY"
            },
            normal: {
                asteroidSpeedMultiplier: 1.0,
                missileSpeedMultiplier: 1.0,
                asteroidSpawnMultiplier: 1.0,
                powerUpSpawnMultiplier: 1.0,
                label: "NORMAL"
            },
            hard: {
                asteroidSpeedMultiplier: 1.3,
                missileSpeedMultiplier: 0.9,
                asteroidSpawnMultiplier: 1.4,
                powerUpSpawnMultiplier: 0.6,
                label: "HARD"
            }
        };
        
        // Theme configurations
        this.themes = {
            classic: {
                name: "Classic Space",
                background: "#000011",
                backgroundGradient: ["#000011", "#001122", "#000033"],
                stars: "#FFFFFF",
                rocket: "#4A90E2",
                missiles: "#FFD700",
                asteroids: ["#8B4513", "#A0522D", "#CD853F"],
                powerUps: ["#FF69B4", "#00CED1", "#FFD700", "#FFFF00"],
                ui: "#4A90E2",
                text: "#FFFFFF",
                particles: ["#FF4500", "#FFD700", "#FF69B4", "#00CED1"]
            },
            nebula: {
                name: "Light Nebula",
                background: "#2D1B69",
                backgroundGradient: ["#2D1B69", "#3B2777", "#4A3485"],
                stars: "#F0E6FF",
                rocket: "#7C3AED",
                missiles: "#FBBF24",
                asteroids: ["#9CA3AF", "#6B7280", "#4B5563"],
                powerUps: ["#F472B6", "#06B6D4", "#FBBF24", "#A78BFA"],
                ui: "#7C3AED",
                text: "#F3E8FF",
                particles: ["#F59E0B", "#FBBF24", "#F472B6", "#06B6D4"]
            },
            dawn: {
                name: "Cosmic Dawn",
                background: "#451A03",
                backgroundGradient: ["#451A03", "#7C2D12", "#DC2626"],
                stars: "#FEF3C7",
                rocket: "#F59E0B",
                missiles: "#FBBF24",
                asteroids: ["#92400E", "#B45309", "#D97706"],
                powerUps: ["#F97316", "#06B6D4", "#FBBF24", "#F59E0B"],
                ui: "#F59E0B",
                text: "#FEF3C7",
                particles: ["#DC2626", "#F59E0B", "#F97316", "#FBBF24"]
            },
            neon: {
                name: "Neon Galaxy",
                background: "#0F0F0F",
                backgroundGradient: ["#0F0F0F", "#1A0033", "#330066"],
                stars: "#00FFFF",
                rocket: "#00FF00",
                missiles: "#FFFF00",
                asteroids: ["#FF00FF", "#00FFFF", "#FF4500"],
                powerUps: ["#FF1493", "#00FFFF", "#FFFF00", "#00FF00"],
                ui: "#00FF00",
                text: "#00FFFF",
                particles: ["#FF00FF", "#00FFFF", "#FFFF00", "#FF1493"]
            }
        };
        
        // Game objects
        this.rocket = null;
        this.missiles = [];
        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];
        this.stars = [];
        
        // Game mechanics
        this.difficulty = 1;
        this.lastDifficultyIncrease = 0;
        this.asteroidSpawnRate = 0.02;
        this.powerUpSpawnRate = 0.005;
        this.lastShot = 0;
        this.firingRates = {
            normal: 300,
            rapid: 100
        };
        
        // Enhanced firing system
        this.isFiring = false;
        this.isMouseDown = false;
        this.rapidFireIndicator = null;
        
        // Active power-ups
        this.activePowerUps = {
            shield: { active: false, duration: 0 },
            rapidFire: { active: false, duration: 0 },
            scoreMultiplier: { active: false, duration: 0, multiplier: 2 }
        };
        
        // Input handling
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        
        // Animation
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        console.log('Initializing enhanced Space Galaxy Adventure...');
        this.applySettings();
        this.createStarField();
        this.setupEventListeners();
        this.updateUI();
        
        // Ensure we start on the start screen
        this.showScreen('start');
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('spaceGameSettings');
            if (saved) {
                this.gameSettings = { ...this.gameSettings, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Could not load settings from localStorage');
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('spaceGameSettings', JSON.stringify(this.gameSettings));
        } catch (e) {
            console.warn('Could not save settings to localStorage');
        }
    }
    
    applySettings() {
        // Apply brightness
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.setProperty('--game-brightness', this.gameSettings.brightness / 100);
            
            // Apply theme class
            gameContainer.className = `game-container theme-${this.gameSettings.theme}`;
        }
        
        // Update settings UI
        this.updateSettingsUI();
    }
    
    updateSettingsUI() {
        // Update difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.gameSettings.difficulty);
        });
        
        // Update theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.gameSettings.theme);
        });
        
        // Update brightness slider
        const brightnessSlider = document.getElementById('brightness-slider');
        const brightnessValue = document.getElementById('brightness-value');
        if (brightnessSlider && brightnessValue) {
            brightnessSlider.value = this.gameSettings.brightness;
            brightnessValue.textContent = this.gameSettings.brightness + '%';
        }
        
        // Update difficulty indicator in game
        const difficultyElement = document.getElementById('current-difficulty');
        if (difficultyElement) {
            difficultyElement.textContent = this.difficultyConfig[this.gameSettings.difficulty].label;
        }
    }
    
    setupEventListeners() {
        console.log('Setting up enhanced event listeners...');
        
        // Enhanced keyboard events for continuous firing
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (this.gameState === 'playing') {
                if (e.code === 'Space') {
                    e.preventDefault();
                    if (!this.isFiring) {
                        this.startContinuousFiring();
                    }
                }
                if (e.code === 'KeyP' || e.code === 'Escape') {
                    this.togglePause();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'Space') {
                this.stopContinuousFiring();
            }
        });
        
        // Enhanced mouse events for continuous firing
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mousePos.x = e.clientX - rect.left;
                this.mousePos.y = e.clientY - rect.top;
            });
            
            this.canvas.addEventListener('mousedown', (e) => {
                if (this.gameState === 'playing') {
                    e.preventDefault();
                    this.isMouseDown = true;
                    this.startContinuousFiring();
                }
            });
            
            this.canvas.addEventListener('mouseup', (e) => {
                if (this.gameState === 'playing') {
                    e.preventDefault();
                    this.isMouseDown = false;
                    this.stopContinuousFiring();
                }
            });
            
            this.canvas.addEventListener('mouseleave', (e) => {
                this.isMouseDown = false;
                this.stopContinuousFiring();
            });
        }
        
        // Wait for DOM to be fully loaded before setting up button listeners
        setTimeout(() => {
            this.setupButtonListeners();
            this.setupSettingsControls();
        }, 100);
    }
    
    setupButtonListeners() {
        // Main menu buttons
        this.addClickListener('play-btn', () => {
            console.log('Play button clicked');
            this.startGame();
        });
        
        this.addClickListener('settings-btn', () => {
            console.log('Settings button clicked');
            this.showScreen('settings');
        });
        
        this.addClickListener('instructions-btn', () => {
            console.log('Instructions button clicked');
            this.showScreen('instructions');
        });
        
        // Instructions screen buttons
        this.addClickListener('start-game-btn', () => {
            console.log('Start game button clicked');
            this.startGame();
        });
        
        this.addClickListener('back-to-menu-btn', () => {
            console.log('Back to menu button clicked');
            this.showScreen('start');
        });
        
        this.addClickListener('back-to-menu-settings-btn', () => {
            console.log('Back to menu from settings button clicked');
            this.showScreen('start');
        });
        
        // Game control buttons
        this.addClickListener('pause-btn', () => {
            console.log('Pause button clicked');
            this.togglePause();
        });
        
        this.addClickListener('settings-gear-btn', () => {
            console.log('Settings gear button clicked');
            this.togglePause();
        });
        
        this.addClickListener('resume-btn', () => {
            console.log('Resume button clicked');
            this.togglePause();
        });
        
        this.addClickListener('pause-settings-btn', () => {
            console.log('Pause settings button clicked');
            this.showScreen('settings');
        });
        
        this.addClickListener('restart-btn', () => {
            console.log('Restart button clicked');
            this.startGame();
        });
        
        this.addClickListener('main-menu-btn', () => {
            console.log('Main menu button clicked');
            this.showScreen('start');
        });
        
        this.addClickListener('try-again-btn', () => {
            console.log('Try again button clicked');
            this.startGame();
        });
        
        this.addClickListener('menu-btn', () => {
            console.log('Menu button clicked');
            this.showScreen('start');
        });
        
        console.log('Button listeners setup complete');
    }
    
    addClickListener(id, callback) {
        const element = document.getElementById(id);
        if (element) {
            // Remove any existing listeners
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // Add click event
            newElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Button ${id} clicked`);
                callback();
            });
            
            // Add touch event for mobile
            newElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Button ${id} touched`);
                callback();
            });
            
            console.log(`Event listener added for ${id}`);
        } else {
            console.warn(`Element ${id} not found`);
        }
    }
    
    setupSettingsControls() {
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Difficulty button clicked:', newBtn.dataset.difficulty);
                this.gameSettings.difficulty = newBtn.dataset.difficulty;
                this.saveSettings();
                this.updateSettingsUI();
            });
        });
        
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Theme button clicked:', newBtn.dataset.theme);
                this.gameSettings.theme = newBtn.dataset.theme;
                this.saveSettings();
                this.applySettings();
            });
        });
        
        // Brightness slider
        const brightnessSlider = document.getElementById('brightness-slider');
        const brightnessValue = document.getElementById('brightness-value');
        if (brightnessSlider && brightnessValue) {
            const newSlider = brightnessSlider.cloneNode(true);
            brightnessSlider.parentNode.replaceChild(newSlider, brightnessSlider);
            
            newSlider.addEventListener('input', (e) => {
                this.gameSettings.brightness = parseInt(e.target.value);
                const valueElement = document.getElementById('brightness-value');
                if (valueElement) {
                    valueElement.textContent = this.gameSettings.brightness + '%';
                }
                this.saveSettings();
                this.applySettings();
            });
        }
        
        // Reset settings button
        this.addClickListener('reset-settings-btn', () => {
            console.log('Reset settings button clicked');
            this.gameSettings = {
                difficulty: 'normal',
                brightness: 100,
                theme: 'classic',
                soundEnabled: true
            };
            this.saveSettings();
            this.applySettings();
        });
        
        console.log('Settings controls setup complete');
    }
    
    startContinuousFiring() {
        if (this.isFiring) return;
        this.isFiring = true;
        this.showRapidFireIndicator();
        this.continuousFireLoop();
    }
    
    stopContinuousFiring() {
        this.isFiring = false;
        this.hideRapidFireIndicator();
    }
    
    continuousFireLoop() {
        if (!this.isFiring || this.gameState !== 'playing') return;
        
        this.shoot();
        
        // Schedule next shot
        const fireRate = this.activePowerUps.rapidFire.active ? 
            this.firingRates.rapid : this.firingRates.rapid * 1.5;
        
        setTimeout(() => {
            if (this.isFiring) {
                this.continuousFireLoop();
            }
        }, fireRate);
    }
    
    showRapidFireIndicator() {
        if (this.rapidFireIndicator) return;
        
        this.rapidFireIndicator = document.createElement('div');
        this.rapidFireIndicator.className = 'rapid-fire-indicator';
        this.rapidFireIndicator.textContent = '⚡ RAPID FIRE ⚡';
        
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.appendChild(this.rapidFireIndicator);
        }
    }
    
    hideRapidFireIndicator() {
        if (this.rapidFireIndicator && this.rapidFireIndicator.parentNode) {
            this.rapidFireIndicator.parentNode.removeChild(this.rapidFireIndicator);
            this.rapidFireIndicator = null;
        }
    }
    
    showScreen(screen) {
        console.log(`Showing screen: ${screen}`);
        
        // Hide all screens first
        const screens = ['start-screen', 'instructions-screen', 'settings-screen', 'game-screen', 'pause-screen', 'game-over-screen'];
        screens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                element.classList.add('hidden');
                element.style.display = 'none';
            }
        });
        
        // Show the requested screen
        const targetScreen = document.getElementById(screen + '-screen');
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.style.display = 'flex';
            console.log(`Screen ${screen} is now visible`);
        } else {
            console.error(`Screen ${screen}-screen not found`);
        }
        
        // Update game state
        if (screen === 'game') {
            this.gameState = 'playing';
        } else {
            this.gameState = screen;
        }
        
        // Stop game loop if not playing
        if (this.gameState !== 'playing') {
            this.stopGameLoop();
        }
        
        // Update settings UI when showing settings
        if (screen === 'settings') {
            this.updateSettingsUI();
        }
    }
    
    startGame() {
        console.log('Starting new game...');
        
        // Stop any existing game loop
        this.stopGameLoop();
        this.stopContinuousFiring();
        
        // Reset all game state
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.multiplier = 1;
        this.difficulty = 1;
        this.lastDifficultyIncrease = performance.now();
        this.lastShot = 0;
        
        // Apply difficulty settings
        const config = this.difficultyConfig[this.gameSettings.difficulty];
        this.asteroidSpawnRate = 0.02 * config.asteroidSpawnMultiplier;
        this.powerUpSpawnRate = 0.005 * config.powerUpSpawnMultiplier;
        
        // Clear all game objects
        this.missiles = [];
        this.asteroids = [];
        this.powerUps = [];
        this.particles = [];
        
        // Reset power-ups
        this.activePowerUps = {
            shield: { active: false, duration: 0 },
            rapidFire: { active: false, duration: 0 },
            scoreMultiplier: { active: false, duration: 0, multiplier: 2 }
        };
        
        // Create new rocket
        this.rocket = new Rocket(this.canvas.width / 2, this.canvas.height - 100, this.getCurrentTheme());
        
        // Update UI and show game screen
        this.updateUI();
        this.showScreen('game');
        
        // Start the game loop
        this.startGameLoop();
        this.playSound('start');
        
        console.log('Game started successfully');
    }
    
    getCurrentTheme() {
        return this.themes[this.gameSettings.theme];
    }
    
    startGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        const gameLoop = (currentTime) => {
            if (this.gameState === 'playing') {
                const deltaTime = currentTime - this.lastTime;
                this.update(deltaTime);
                this.render();
                this.lastTime = currentTime;
                this.animationId = requestAnimationFrame(gameLoop);
            }
        };
        
        this.lastTime = performance.now();
        this.animationId = requestAnimationFrame(gameLoop);
        console.log('Game loop started');
    }
    
    stopGameLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('Game loop stopped');
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopContinuousFiring();
            this.showScreen('pause');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('game');
            this.startGameLoop();
        }
    }
    
    update(deltaTime) {
        // Ensure reasonable deltaTime
        deltaTime = Math.min(deltaTime, 50);
        const dtMultiplier = deltaTime / 16.67; // Normalize to 60fps
        
        // Get current difficulty config
        const diffConfig = this.difficultyConfig[this.gameSettings.difficulty];
        
        // Update difficulty over time
        if (performance.now() - this.lastDifficultyIncrease > 30000) {
            this.difficulty += 0.2;
            this.asteroidSpawnRate = Math.min(this.asteroidSpawnRate + 0.002, 0.1);
            this.lastDifficultyIncrease = performance.now();
            console.log('Difficulty increased to', this.difficulty);
        }
        
        // Update rocket
        if (this.rocket) {
            this.rocket.update(this.keys, deltaTime);
        }
        
        // Update missiles with difficulty speed
        this.missiles = this.missiles.filter(missile => {
            missile.update(deltaTime, diffConfig.missileSpeedMultiplier);
            return missile.y > -missile.height;
        });
        
        // Update asteroids with difficulty speed
        this.asteroids = this.asteroids.filter(asteroid => {
            asteroid.update(deltaTime, this.difficulty * diffConfig.asteroidSpeedMultiplier);
            return asteroid.y < this.canvas.height + asteroid.radius * 2;
        });
        
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.update(deltaTime);
            return powerUp.y < this.canvas.height + powerUp.size * 2;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // Update stars
        this.stars.forEach(star => star.update(deltaTime));
        
        // Spawn asteroids with difficulty-adjusted rate
        if (Math.random() < this.asteroidSpawnRate * dtMultiplier) {
            this.spawnAsteroid();
        }
        
        // Spawn power-ups with difficulty-adjusted rate
        const powerUpRate = this.powerUpSpawnRate * diffConfig.powerUpSpawnMultiplier;
        if (Math.random() < powerUpRate * dtMultiplier) {
            this.spawnPowerUp();
        }
        
        // Check collisions
        this.checkCollisions();
        
        // Update active power-ups
        this.updatePowerUps(deltaTime);
        
        // Update UI
        this.updateUI();
    }
    
    render() {
        const theme = this.getCurrentTheme();
        
        // Clear canvas with themed gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        theme.backgroundGradient.forEach((color, index) => {
            gradient.addColorStop(index / (theme.backgroundGradient.length - 1), color);
        });
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars with themed color
        this.stars.forEach(star => star.draw(this.ctx, theme.stars));
        
        // Draw rocket
        if (this.rocket) {
            this.rocket.draw(this.ctx, theme);
            
            // Draw shield effect
            if (this.activePowerUps.shield.active) {
                this.drawShieldEffect(theme);
            }
        }
        
        // Draw missiles with themed color
        this.missiles.forEach(missile => missile.draw(this.ctx, theme.missiles));
        
        // Draw asteroids with themed colors
        this.asteroids.forEach(asteroid => asteroid.draw(this.ctx, theme.asteroids));
        
        // Draw power-ups with themed colors
        this.powerUps.forEach(powerUp => powerUp.draw(this.ctx, theme.powerUps));
        
        // Draw particles with themed colors
        this.particles.forEach(particle => particle.draw(this.ctx));
    }
    
    shoot() {
        if (!this.rocket) return;
        
        const rapidFire = this.activePowerUps.rapidFire.active;
        const fireRate = rapidFire ? this.firingRates.rapid : this.firingRates.normal;
        const currentTime = performance.now();
        
        if (currentTime - this.lastShot > fireRate) {
            const diffConfig = this.difficultyConfig[this.gameSettings.difficulty];
            const missile = new Missile(this.rocket.x, this.rocket.y - 30, diffConfig.missileSpeedMultiplier);
            this.missiles.push(missile);
            this.lastShot = currentTime;
            this.playSound('shoot');
            
            // Add muzzle flash particles
            const theme = this.getCurrentTheme();
            this.createParticles(this.rocket.x, this.rocket.y - 20, 3, theme.particles[1]);
        }
    }
    
    spawnAsteroid() {
        const types = ['small', 'medium', 'large'];
        const weights = [0.5, 0.3, 0.2]; // More small asteroids
        let random = Math.random();
        let type = 'small';
        
        for (let i = 0; i < weights.length; i++) {
            if (random < weights[i]) {
                type = types[i];
                break;
            }
            random -= weights[i];
        }
        
        const x = Math.random() * (this.canvas.width - 100) + 50;
        const asteroid = new Asteroid(x, -50, type);
        this.asteroids.push(asteroid);
    }
    
    spawnPowerUp() {
        const types = ['health', 'shield', 'star', 'lightning'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.canvas.width - 60) + 30;
        const powerUp = new PowerUp(x, -30, type);
        this.powerUps.push(powerUp);
    }
    
    checkCollisions() {
        // Missile vs Asteroids
        for (let i = this.missiles.length - 1; i >= 0; i--) {
            const missile = this.missiles[i];
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                if (this.checkCircleCollision(missile, asteroid)) {
                    // Remove missile and asteroid
                    this.missiles.splice(i, 1);
                    this.asteroids.splice(j, 1);
                    
                    // Add score
                    const baseScore = asteroid.points;
                    const finalScore = baseScore * this.multiplier;
                    this.score += finalScore;
                    
                    // Create explosion
                    this.createExplosion(asteroid.x, asteroid.y, asteroid.radius);
                    this.playSound('explosion');
                    
                    // Split large asteroids
                    if (asteroid.type === 'large') {
                        this.splitAsteroid(asteroid, 'medium', 2);
                    } else if (asteroid.type === 'medium') {
                        this.splitAsteroid(asteroid, 'small', 2);
                    }
                    
                    break;
                }
            }
        }
        
        // Rocket vs Asteroids (only if shield not active)
        if (this.rocket && !this.activePowerUps.shield.active) {
            for (let i = this.asteroids.length - 1; i >= 0; i--) {
                const asteroid = this.asteroids[i];
                if (this.checkCircleCollision(this.rocket, asteroid)) {
                    this.takeDamage();
                    this.asteroids.splice(i, 1);
                    this.createExplosion(asteroid.x, asteroid.y, asteroid.radius);
                    break;
                }
            }
        }
        
        // Rocket vs Power-ups
        if (this.rocket) {
            for (let i = this.powerUps.length - 1; i >= 0; i--) {
                const powerUp = this.powerUps[i];
                if (this.checkCircleCollision(this.rocket, powerUp)) {
                    this.collectPowerUp(powerUp);
                    this.powerUps.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    checkCircleCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius1 = obj1.radius || obj1.width/3 || obj1.size/2 || 10;
        const radius2 = obj2.radius || obj2.width/3 || obj2.size/2 || 10;
        return distance < radius1 + radius2;
    }
    
    splitAsteroid(asteroid, newType, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const distance = 25 + Math.random() * 15;
            const x = asteroid.x + Math.cos(angle) * distance;
            const y = asteroid.y + Math.sin(angle) * distance;
            const newAsteroid = new Asteroid(x, y, newType);
            newAsteroid.vx = Math.cos(angle) * (1 + Math.random());
            newAsteroid.vy = Math.sin(angle) * (1 + Math.random()) + 1;
            this.asteroids.push(newAsteroid);
        }
    }
    
    takeDamage() {
        this.lives--;
        this.createScreenShake();
        this.showDamageIndicator();
        this.playSound('damage');
        
        console.log(`Lives remaining: ${this.lives}`);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    collectPowerUp(powerUp) {
        this.playSound('powerUp');
        const theme = this.getCurrentTheme();
        this.createParticles(powerUp.x, powerUp.y, 8, theme.particles[0]);
        
        switch (powerUp.type) {
            case 'health':
                if (this.lives < 5) {
                    this.lives++;
                    console.log('Extra life collected!');
                }
                break;
            case 'shield':
                this.activePowerUps.shield = { active: true, duration: 8000 };
                console.log('Shield activated!');
                break;
            case 'star':
                this.activePowerUps.scoreMultiplier = { active: true, duration: 15000, multiplier: 2 };
                this.multiplier = 2;
                console.log('Score multiplier activated!');
                break;
            case 'lightning':
                this.activePowerUps.rapidFire = { active: true, duration: 10000 };
                console.log('Rapid fire activated!');
                break;
        }
    }
    
    updatePowerUps(deltaTime) {
        Object.keys(this.activePowerUps).forEach(key => {
            const powerUp = this.activePowerUps[key];
            if (powerUp.active) {
                powerUp.duration -= deltaTime;
                if (powerUp.duration <= 0) {
                    powerUp.active = false;
                    if (key === 'scoreMultiplier') {
                        this.multiplier = 1;
                    }
                    console.log(`${key} power-up expired`);
                }
            }
        });
    }
    
    createExplosion(x, y, size) {
        const particleCount = Math.floor(size / 3) + 8;
        const theme = this.getCurrentTheme();
        theme.particles.forEach(color => {
            this.createParticles(x, y, particleCount / theme.particles.length, color);
        });
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const particle = new Particle(x, y, color);
            this.particles.push(particle);
        }
    }
    
    createScreenShake() {
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.add('screen-shake');
            setTimeout(() => {
                gameScreen.classList.remove('screen-shake');
            }, 500);
        }
    }
    
    showDamageIndicator() {
        if (!this.rocket) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'damage-indicator';
        indicator.textContent = 'OUCH!';
        indicator.style.position = 'absolute';
        indicator.style.left = (this.rocket.x + this.canvas.offsetLeft) + 'px';
        indicator.style.top = (this.rocket.y + this.canvas.offsetTop - 50) + 'px';
        indicator.style.color = '#FF4444';
        indicator.style.fontWeight = 'bold';
        indicator.style.fontSize = '24px';
        indicator.style.pointerEvents = 'none';
        indicator.style.zIndex = '1000';
        indicator.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator && indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 1000);
    }
    
    drawShieldEffect(theme) {
        const time = performance.now() * 0.005;
        this.ctx.save();
        this.ctx.globalAlpha = 0.4 + Math.sin(time) * 0.2;
        this.ctx.strokeStyle = theme.powerUps[1]; // Shield color from theme
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineDashOffset = -time * 10;
        this.ctx.beginPath();
        this.ctx.arc(this.rocket.x, this.rocket.y, 45, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = theme.powerUps[1];
        this.ctx.fill();
        this.ctx.restore();
    }
    
    createStarField() {
        this.stars = [];
        for (let i = 0; i < 80; i++) {
            this.stars.push(new Star(
                Math.random() * this.canvas.width,
                Math.random() * this.canvas.height
            ));
        }
    }
    
    updateUI() {
        // Update score
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toLocaleString();
        }
        
        // Update multiplier
        const multiplierElement = document.getElementById('multiplier');
        if (multiplierElement) {
            multiplierElement.textContent = this.multiplier;
        }
        
        // Update difficulty indicator
        const difficultyElement = document.getElementById('current-difficulty');
        if (difficultyElement) {
            difficultyElement.textContent = this.difficultyConfig[this.gameSettings.difficulty].label;
        }
        
        // Update lives
        const livesContainer = document.getElementById('lives-container');
        if (livesContainer) {
            livesContainer.innerHTML = '';
            for (let i = 0; i < Math.max(this.lives, 0); i++) {
                const heart = document.createElement('div');
                heart.className = 'heart';
                heart.textContent = '❤️';
                livesContainer.appendChild(heart);
            }
        }
        
        // Update active power-ups
        const powerUpsContainer = document.getElementById('active-powerups');
        if (powerUpsContainer) {
            powerUpsContainer.innerHTML = '';
            
            Object.keys(this.activePowerUps).forEach(key => {
                const powerUp = this.activePowerUps[key];
                if (powerUp.active) {
                    const icon = document.createElement('div');
                    icon.className = `powerup-icon powerup-${key}`;
                    icon.textContent = this.getPowerUpIcon(key);
                    powerUpsContainer.appendChild(icon);
                }
            });
        }
    }
    
    getPowerUpIcon(type) {
        const icons = {
            shield: '🛡️',
            rapidFire: '⚡',
            scoreMultiplier: '⭐'
        };
        return icons[type] || '?';
    }
    
    gameOver() {
        console.log('Game Over! Final score:', this.score);
        this.gameState = 'gameOver';
        this.stopGameLoop();
        this.stopContinuousFiring();
        
        // Check for high score
        let isNewHighScore = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            try {
                localStorage.setItem('spaceGameHighScore', this.highScore.toString());
            } catch (e) {
                console.warn('Could not save high score to localStorage');
            }
            isNewHighScore = true;
        }
        
        // Update game over screen elements
        setTimeout(() => {
            const finalScoreElement = document.getElementById('final-score');
            if (finalScoreElement) {
                finalScoreElement.textContent = this.score.toLocaleString();
            }
            
            const highScoreElement = document.getElementById('high-score');
            if (highScoreElement) {
                highScoreElement.textContent = this.highScore.toLocaleString();
            }
            
            const highScoreMessage = document.getElementById('high-score-message');
            if (highScoreMessage) {
                if (isNewHighScore) {
                    highScoreMessage.classList.remove('hidden');
                } else {
                    highScoreMessage.classList.add('hidden');
                }
            }
            
            this.showScreen('game-over');
            this.playSound('gameOver');
        }, 500);
    }
    
    playSound(type) {
        // Sound placeholder - in a real game, you'd play actual sounds
        console.log(`Playing sound: ${type}`);
    }
}

// Enhanced Game object classes
class Rocket {
    constructor(x, y, theme) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 70;
        this.radius = 20;
        this.speed = 6;
        this.vx = 0;
        this.vy = 0;
        this.thrust = false;
        this.theme = theme;
    }
    
    update(keys, deltaTime) {
        // Reset movement
        this.vx = 0;
        this.vy = 0;
        this.thrust = false;
        
        // Check input
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.vx = -this.speed;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.vx = this.speed;
        }
        if (keys['ArrowUp'] || keys['KeyW']) {
            this.vy = -this.speed;
            this.thrust = true;
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            this.vy = this.speed;
        }
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;
        
        // Keep within bounds with some padding
        const padding = this.width / 2;
        this.x = Math.max(padding, Math.min(800 - padding, this.x));
        this.y = Math.max(padding, Math.min(600 - padding, this.y));
    }
    
    draw(ctx, theme) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw thrust flame first (behind rocket)
        if (this.thrust) {
            ctx.fillStyle = theme.particles[0];
            ctx.beginPath();
            ctx.moveTo(-12, this.height/2);
            ctx.lineTo(0, this.height/2 + 25);
            ctx.lineTo(12, this.height/2);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = theme.particles[1];
            ctx.beginPath();
            ctx.moveTo(-6, this.height/2);
            ctx.lineTo(0, this.height/2 + 15);
            ctx.lineTo(6, this.height/2);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw rocket body with theme color
        ctx.fillStyle = theme.rocket;
        ctx.strokeStyle = theme.ui;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2);
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.lineTo(-this.width/4, this.height/3);
        ctx.lineTo(this.width/4, this.height/3);
        ctx.lineTo(this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw rocket nose cone
        ctx.fillStyle = theme.missiles;
        ctx.strokeStyle = theme.particles[1];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -this.height/4, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw rocket fins
        ctx.fillStyle = theme.ui;
        ctx.fillRect(-this.width/2 - 5, this.height/4, 8, 15);
        ctx.fillRect(this.width/2 - 3, this.height/4, 8, 15);
        
        ctx.restore();
    }
}

class Missile {
    constructor(x, y, speedMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.width = 6;
        this.height = 20;
        this.radius = 3;
        this.speed = 12 * speedMultiplier;
    }
    
    update(deltaTime, speedMultiplier = 1) {
        this.y -= this.speed * speedMultiplier;
    }
    
    draw(ctx, color) {
        ctx.save();
        
        // Add glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        
        // Bright center
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x - this.width/4, this.y - this.height/2, this.width/2, this.height);
        
        ctx.restore();
    }
    setupTouchControls() {
    let isDragging = false;
    
    this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDragging = true;
        if (this.gameState === 'playing') {
            this.shoot(); // Fire on touch
        }
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDragging || this.gameState !== 'playing' || !this.rocket) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const touchX = ((touch.clientX - rect.left) / rect.width) * this.canvas.width;
        const touchY = ((touch.clientY - rect.top) / rect.height) * this.canvas.height;
        
        // Move rocket to finger position
        this.rocket.x = Math.max(30, Math.min(this.canvas.width - 30, touchX));
        this.rocket.y = Math.max(30, Math.min(this.canvas.height - 30, touchY));
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDragging = false;
    }, { passive: false });
}
}

class Asteroid {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        const configs = {
            small: { radius: 18, points: 10 },
            medium: { radius: 28, points: 25 },
            large: { radius: 40, points: 50 }
        };
        
        const config = configs[type];
        this.radius = config.radius;
        this.points = config.points;
        
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = Math.random() * 2 + 1.5;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        
        // Create random shape points for more interesting asteroids
        this.shapePoints = [];
        for (let i = 0; i < 10; i++) {
            this.shapePoints.push(0.7 + Math.random() * 0.6);
        }
    }
    
    update(deltaTime, difficulty) {
        this.x += this.vx;
        this.y += this.vy * Math.min(difficulty, 3);
        this.rotation += this.rotationSpeed;
        
        // Wrap around horizontally
        if (this.x < -this.radius) this.x = 800 + this.radius;
        if (this.x > 800 + this.radius) this.x = -this.radius;
    }
    
    draw(ctx, colors) {
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color = colors[colorIndex];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = color;
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        
        // Draw irregular asteroid shape
        ctx.beginPath();
        for (let i = 0; i < this.shapePoints.length; i++) {
            const angle = (Math.PI * 2 / this.shapePoints.length) * i;
            const r = this.radius * this.shapePoints[i];
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add some surface details
        ctx.fillStyle = '#654321';
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * this.radius * 0.5;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = 25;
        this.radius = 20;
        this.speed = 3;
        this.pulse = Math.random() * Math.PI * 2;
        this.rotation = 0;
        
        const configs = {
            health: { icon: '❤️' },
            shield: { icon: '🛡️' },
            star: { icon: '⭐' },
            lightning: { icon: '⚡' }
        };
        
        const config = configs[type];
        this.icon = config.icon;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.pulse += 0.08;
        this.rotation += 0.02;
    }
    
    draw(ctx, colors) {
        const typeIndex = this.type === 'health' ? 0 : this.type === 'shield' ? 1 : this.type === 'star' ? 2 : 3;
        const color = colors[typeIndex];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const scale = 1 + Math.sin(this.pulse) * 0.3;
        ctx.scale(scale, scale);
        
        // Draw outer glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;
        
        // Draw power-up circle background
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner circle
        ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw icon
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.type === 'star' || this.type === 'lightning' ? '#000' : '#FFF';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, 0, 0);
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.decay = Math.random() * 0.015 + 0.01;
        this.size = Math.random() * 4 + 2;
        this.color = color;
        this.gravity = 0.1;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life -= this.decay;
        this.vx *= 0.99;
        this.vy *= 0.99;
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2.5 + 0.5;
        this.speed = Math.random() * 2 + 0.5;
        this.twinkle = Math.random() * Math.PI * 2;
        this.brightness = Math.random() * 0.8 + 0.3;
        this.twinkleSpeed = Math.random() * 0.05 + 0.02;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.twinkle += this.twinkleSpeed;
        
        if (this.y > 600 + this.size) {
            this.y = -this.size;
            this.x = Math.random() * 800;
        }
    }
    
    draw(ctx, color = '#FFFFFF') {
        ctx.save();
        const alpha = this.brightness * (0.4 + Math.sin(this.twinkle) * 0.4);
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = this.size;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize the enhanced game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Enhanced Space Galaxy Adventure game...');
    try {
        const game = new SpaceGame();
        // Make game accessible globally for debugging
        window.game = game;
        console.log('Enhanced game initialized successfully');
    } catch (error) {
        console.error('Failed to initialize enhanced game:', error);
    }
});
