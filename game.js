// Squart - Three.js CRT Neon Game
class CRTNeonGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.gridGroup = null;
        this.gridSize = 5;
        this.cellSize = 1;
        this.cellSpacing = 0.1;
        this.cells = []; // Array to store cell objects
        this.inactiveCells = []; // Array to store inactive cell positions
        this.boardShape = 'square'; // Current board shape
        this.validPositions = []; // Valid positions for current shape
        
        // Game state
        this.gameState = 'setup'; // 'setup', 'playing', 'gameOver'
        this.currentPlayer = 'blue'; // 'blue' or 'red'
        this.blueScore = 0;
        this.redScore = 0;
        this.gameBoard = []; // 2D array representing the game board
        this.availableMoves = []; // Available moves for current player
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Kreiraj scenu
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Kreiraj kameru
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 10);

        // Kreiraj renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);

        // Dodaj kontrole
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false; // Disable panning
        this.controls.enableZoom = true; // Keep zoom
        
        // Store initial camera position for north orientation
        this.northPosition = null;
        this.isRotating = false;
        
        // Add mouse event listeners for auto-return
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isRotating = true;
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', (event) => {
            if (event.button === 0) { // Left mouse button
                this.isRotating = false;
                this.returnToNorth();
            }
        });
        


        // Dodaj osvetljenje
        this.setupLighting();

        // Kreiraj početnu tablu
        this.createGrid(this.gridSize);
    }

    setupLighting() {
        // Ambient osvetljenje
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Direkciono osvetljenje
        const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Neon osvetljenje
        const neonLight1 = new THREE.PointLight(0x00ff00, 1, 20);
        neonLight1.position.set(5, 5, 5);
        this.scene.add(neonLight1);

        const neonLight2 = new THREE.PointLight(0x00ffff, 0.5, 15);
        neonLight2.position.set(-5, 3, -5);
        this.scene.add(neonLight2);
    }

    createGrid(size) {
        // Remove existing board
        if (this.gridGroup) {
            this.scene.remove(this.gridGroup);
        }

        this.gridGroup = new THREE.Group();
        this.gridSize = size;
        this.cells = [];
        this.inactiveCells = [];
        this.boardShape = document.getElementById('shapeSelect').value;

        // Generate valid positions for the selected shape
        this.generateValidPositions();

        // Generate inactive cells (17-19% of valid cells)
        this.generateInactiveCells();

        // Prilagodi veličinu ćelija na osnovu veličine table
        if (size <= 8) {
            this.cellSize = 1.2;
        } else if (size <= 12) {
            this.cellSize = 0.8;
        } else {
            this.cellSize = 0.6;
        }

        const totalSize = size * (this.cellSize + this.cellSpacing) - this.cellSpacing;
        const startX = -totalSize / 2;
        const startZ = -totalSize / 2;

        // Create materials for cells
        const activeCellMaterial = new THREE.MeshPhongMaterial({
            color: 0x001100,
            transparent: true,
            opacity: 0.9,
            shininess: 100
        });

        const inactiveCellMaterial = new THREE.MeshPhongMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.7,
            shininess: 50
        });

        const activeBorderMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 1.0,
            shininess: 200
        });

        const inactiveBorderMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.5,
            shininess: 100
        });

        // Create cells only for valid positions
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                // Check if this position is valid for the current shape
                const isValidPosition = this.validPositions.some(pos => pos.row === row && pos.col === col);
                
                if (isValidPosition) {
                    const x = startX + col * (this.cellSize + this.cellSpacing);
                    const z = startZ + row * (this.cellSize + this.cellSpacing);
                    const isInactive = this.isCellInactive(row, col);

                    // Main cell
                    const cellGeometry = new THREE.BoxGeometry(this.cellSize, 0.1, this.cellSize);
                    const cellMaterial = isInactive ? inactiveCellMaterial : activeCellMaterial;
                    const cell = new THREE.Mesh(cellGeometry, cellMaterial);
                    cell.position.set(x, 0, z);
                    cell.castShadow = true;
                    cell.receiveShadow = true;
                    cell.userData = { row, col, isInactive };
                    this.gridGroup.add(cell);
                    this.cells.push(cell);

                    // Neon border
                    const borderGeometry = new THREE.BoxGeometry(
                        this.cellSize + 0.02, 
                        0.12, 
                        this.cellSize + 0.02
                    );
                    const borderMaterial = isInactive ? inactiveBorderMaterial : activeBorderMaterial;
                    const border = new THREE.Mesh(borderGeometry, borderMaterial);
                    border.position.set(x, 0, z);
                    this.gridGroup.add(border);

                    // Add neon effect only for active cells
                    if (!isInactive) {
                        this.addNeonEffect(cell, x, z);
                    }
                }
            }
        }
        


        // Dodaj pozadinu
        this.addBackground();

        // Add single north arrow to inactive cell
        this.addNorthArrowToInactiveCell();

        this.scene.add(this.gridGroup);

        // Prilagodi kameru
        this.adjustCamera();
        
        // Initialize game board and start game
        this.initializeGameBoard();
        this.startGame();
    }

    generateValidPositions() {
        this.validPositions = [];
        const center = Math.floor(this.gridSize / 2);
        
        switch (this.boardShape) {
            case 'square':
                // Standard square - all positions
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        this.validPositions.push({ row, col });
                    }
                }
                break;
                
            case 'rectangle':
                // Rectangle - wider than tall
                const width = this.gridSize;
                const height = Math.floor(this.gridSize * 0.7);
                const startRow = Math.floor((this.gridSize - height) / 2);
                for (let row = startRow; row < startRow + height; row++) {
                    for (let col = 0; col < width; col++) {
                        this.validPositions.push({ row, col });
                    }
                }
                break;
                
            case 'triangle':
                // Triangle pointing down
                for (let row = 0; row < this.gridSize; row++) {
                    const rowWidth = this.gridSize - row;
                    const startCol = Math.floor(row / 2);
                    for (let col = startCol; col < startCol + rowWidth; col++) {
                        if (col < this.gridSize) {
                            this.validPositions.push({ row, col });
                        }
                    }
                }
                break;
                
            case 'diamond':
                // Diamond shape
                for (let row = 0; row < this.gridSize; row++) {
                    const distanceFromCenter = Math.abs(row - center);
                    const rowWidth = this.gridSize - 2 * distanceFromCenter;
                    const startCol = center - Math.floor(rowWidth / 2);
                    for (let col = startCol; col < startCol + rowWidth; col++) {
                        if (col >= 0 && col < this.gridSize) {
                            this.validPositions.push({ row, col });
                        }
                    }
                }
                break;
                

                
            case 'circle':
                // Circle shape
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        const distance = Math.sqrt((row - center) ** 2 + (col - center) ** 2);
                        if (distance <= center) {
                            this.validPositions.push({ row, col });
                        }
                    }
                }
                break;
                
            case 'hexagon':
                // Hexagon shape
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        const distance = Math.abs(row - center) + Math.abs(col - center);
                        if (distance <= center + 1) {
                            this.validPositions.push({ row, col });
                        }
                    }
                }
                break;
                
            case 'star':
                // Star shape (simplified)
                for (let row = 0; row < this.gridSize; row++) {
                    for (let col = 0; col < this.gridSize; col++) {
                        const distance = Math.sqrt((row - center) ** 2 + (col - center) ** 2);
                        const angle = Math.atan2(row - center, col - center);
                        const starRadius = center * (0.3 + 0.7 * Math.abs(Math.sin(angle * 5)));
                        if (distance <= starRadius) {
                            this.validPositions.push({ row, col });
                        }
                    }
                }
                break;
                
            case 'asymmetric':
                // Completely asymmetric shape with random edges
                this.generateAsymmetricShape();
                break;
                
            case 'random':
                // Random shape - irregular pattern
                const shapes = ['triangle', 'diamond', 'circle', 'hexagon', 'star', 'asymmetric'];
                const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
                this.boardShape = randomShape;
                this.generateValidPositions();
                return;
        }
    }

    generateAsymmetricShape() {
        // Create a completely asymmetric shape using cellular automata
        const grid = [];
        const size = this.gridSize;
        
        // Initialize grid with random values
        for (let row = 0; row < size; row++) {
            grid[row] = [];
            for (let col = 0; col < size; col++) {
                // Start with some random cells in the center area
                const distanceFromCenter = Math.sqrt((row - size/2) ** 2 + (col - size/2) ** 2);
                const centerArea = size * 0.4;
                if (distanceFromCenter < centerArea) {
                    grid[row][col] = Math.random() > 0.3; // 70% chance to be active in center
                } else {
                    grid[row][col] = Math.random() > 0.8; // 20% chance to be active outside
                }
            }
        }
        
        // Apply cellular automata rules for a few iterations to create organic shape
        for (let iteration = 0; iteration < 3; iteration++) {
            const newGrid = [];
            for (let row = 0; row < size; row++) {
                newGrid[row] = [];
                for (let col = 0; col < size; col++) {
                    let neighbors = 0;
                    
                    // Count live neighbors
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (dr === 0 && dc === 0) continue;
                            const nr = row + dr;
                            const nc = col + dc;
                            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                                if (grid[nr][nc]) neighbors++;
                            }
                        }
                    }
                    
                    // Apply rules
                    if (grid[row][col]) {
                        // Live cell survives with 2-3 neighbors
                        newGrid[row][col] = neighbors >= 2 && neighbors <= 3;
                    } else {
                        // Dead cell becomes alive with exactly 3 neighbors
                        newGrid[row][col] = neighbors === 3;
                    }
                }
            }
            
            // Copy new grid back
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    grid[row][col] = newGrid[row][col];
                }
            }
        }
        
        // Add some random noise for more asymmetry
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (Math.random() < 0.1) { // 10% chance to flip
                    grid[row][col] = !grid[row][col];
                }
            }
        }
        
        // Ensure connectivity by filling small gaps
        for (let row = 1; row < size - 1; row++) {
            for (let col = 1; col < size - 1; col++) {
                if (!grid[row][col]) {
                    let liveNeighbors = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            if (grid[row + dr][col + dc]) liveNeighbors++;
                        }
                    }
                    // Fill isolated cells surrounded by live cells
                    if (liveNeighbors >= 6) {
                        grid[row][col] = true;
                    }
                }
            }
        }
        
        // Convert to valid positions
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                if (grid[row][col]) {
                    this.validPositions.push({ row, col });
                }
            }
        }
        
        // Ensure minimum size
        if (this.validPositions.length < size * 2) {
            // If too small, add some random cells
            for (let i = 0; i < size; i++) {
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);
                const pos = { row, col };
                if (!this.validPositions.some(p => p.row === row && p.col === col)) {
                    this.validPositions.push(pos);
                }
            }
        }
    }

    initializeGameBoard() {
        // Initialize 2D game board
        this.gameBoard = [];
        for (let row = 0; row < this.gridSize; row++) {
            this.gameBoard[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const isInactive = this.isCellInactive(row, col);
                const isValidPosition = this.validPositions.some(pos => pos.row === row && pos.col === col);
                
                if (isValidPosition) {
                    this.gameBoard[row][col] = isInactive ? 'inactive' : 'empty';
                } else {
                    this.gameBoard[row][col] = 'invalid';
                }
            }
        }
    }

    startGame() {
        this.gameState = 'playing';
        this.currentPlayer = 'blue';
        this.blueScore = 0;
        this.redScore = 0;
        this.calculateAvailableMoves();
        this.updateGameUI();
    }

    calculateAvailableMoves() {
        this.availableMoves = [];
        
        if (this.currentPlayer === 'blue') {
            // Blue player - horizontal moves (clicked cell is LEFT part)
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize - 1; col++) {
                    if (this.canPlaceHorizontalToken(row, col)) {
                        this.availableMoves.push({ row, col, direction: 'horizontal' });
                    }
                }
            }
        } else {
            // Red player - vertical moves (clicked cell is TOP part)
            for (let row = 0; row < this.gridSize - 1; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.canPlaceVerticalToken(row, col)) {
                        this.availableMoves.push({ row, col, direction: 'vertical' });
                    }
                }
            }
        }
    }

    canPlaceHorizontalToken(row, col) {
        // Check if both cells are valid and empty
        return this.gameBoard[row][col] === 'empty' && 
               this.gameBoard[row][col + 1] === 'empty';
    }

    canPlaceVerticalToken(row, col) {
        // Check if both cells are valid and empty
        return this.gameBoard[row][col] === 'empty' && 
               this.gameBoard[row + 1][col] === 'empty';
    }

    placeToken(row, col, direction) {
        if (direction === 'horizontal') {
            this.gameBoard[row][col] = 'blue';
            this.gameBoard[row][col + 1] = 'blue';
            this.blueScore += 2;
            this.updateCellVisual(row, col, 'blue');
            this.updateCellVisual(row, col + 1, 'blue');
        } else {
            this.gameBoard[row][col] = 'red';
            this.gameBoard[row + 1][col] = 'red';
            this.redScore += 2;
            this.updateCellVisual(row, col, 'red');
            this.updateCellVisual(row + 1, col, 'red');
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'blue' ? 'red' : 'blue';
        this.calculateAvailableMoves();
        
        // Check for game over - winner is the player who just placed the last token
        if (this.availableMoves.length === 0) {
            // The player who just placed the token is the winner
            const winner = this.currentPlayer === 'blue' ? 'red' : 'blue';
            this.endGame(winner);
        }
        
        this.updateGameUI();
    }

    updateCellVisual(row, col, player) {
        // Find the cell object and update its material
        const cell = this.cells.find(c => c.userData.row === row && c.userData.col === col);
        if (cell) {
            const color = player === 'blue' ? 0x6414FE : 0xFE14AE; // Electric violet : Shocking pink
            
            // Dispose old material to prevent memory leaks
            if (cell.material) {
                cell.material.dispose();
            }
            
            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 1.0,
                shininess: 100
            });
            
            cell.material = material;
            cell.userData.player = player;
            
            // Raise the token above the board surface
            cell.position.y = 0.15; // Lift token above the board
            
            // Force material update
            cell.material.needsUpdate = true;
            
            // Add neon glow effect for tokens
            this.addTokenNeonEffect(cell, color);
            
            // Force render update
            this.renderer.render(this.scene, this.camera);
        }
    }

    addTokenNeonEffect(cell, color) {
        // Add a neon glow around the token
        const glowGeometry = new THREE.BoxGeometry(
            this.cellSize + 0.05, 
            0.15, 
            this.cellSize + 0.05
        );
        
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(cell.position);
        glow.position.y += 0.05; // Position glow above the token
        
        this.gridGroup.add(glow);
        
        // Store reference to remove later if needed
        cell.userData.glow = glow;
    }

    endGame(winner) {
        this.gameState = 'gameOver';
        this.winner = winner;
        this.updateGameUI();
        this.showWinnerOverlay(winner);
        console.log(`Game Over! Winner: ${winner}, Blue: ${this.blueScore}, Red: ${this.redScore}`);
    }

    showWinnerOverlay(winner) {
        const overlay = document.getElementById('winnerOverlay');
        const winnerText = document.getElementById('winnerText');
        const winnerSubtitle = document.getElementById('winnerSubtitle');
        
        const winnerName = winner === 'blue' ? 'ELECTRIC VIOLET' : 'SHOCKING PINK';
        const winnerColor = winner === 'blue' ? '#6414FE' : '#FE14AE';
        
        winnerText.textContent = `WINNER: ${winnerName}`;
        winnerText.style.color = winnerColor;
        winnerSubtitle.textContent = '';
        
        overlay.style.display = 'flex';
        this.createParticles(winnerColor);
        
        // Add dramatic entrance animation
        winnerText.style.transform = 'scale(0)';
        winnerText.style.opacity = '0';
        
        setTimeout(() => {
            winnerText.style.transition = 'all 0.8s ease-out';
            winnerText.style.transform = 'scale(1)';
            winnerText.style.opacity = '1';
        }, 100);
    }

    createParticles(color) {
        const particlesContainer = document.getElementById('particles');
        particlesContainer.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = color;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 2) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    updateGameUI() {
        const gameInfo = document.getElementById('gameInfo');
        if (gameInfo) {
            let html = `
                <div class="crt-text">
                    <p><strong>Status:</strong> ${this.gameState.toUpperCase()}</p>
                    <p><strong>Player:</strong> <span style="color: ${this.currentPlayer === 'blue' ? '#6414FE' : '#FE14AE'}">${this.currentPlayer === 'blue' ? 'ELECTRIC VIOLET' : 'SHOCKING PINK'}</span></p>
                    <p><strong>Score:</strong> <span style="color: #6414FE;">${this.blueScore}</span> - <span style="color: #FE14AE;">${this.redScore}</span></p>
                    <p><strong>Moves:</strong> ${this.availableMoves.length}</p>
                </div>
            `;
            
            if (this.gameState === 'gameOver') {
                html += `<p style="color: #00ff00; margin-top: 8px;"><strong>Game Over!</strong></p>`;
            }
            
            gameInfo.innerHTML = html;
        }
    }

    addNorthArrowToInactiveCell() {
        // Add a single elegant white glow arrow to one inactive cell
        if (this.inactiveCells.length > 0) {
            // Choose the first inactive cell (or could be random)
            const inactivePos = this.inactiveCells[0];
            const cell = this.cells.find(c => c.userData.row === inactivePos.row && c.userData.col === inactivePos.col);
            
            if (cell) {
                // Create a proper arrow using custom geometry
                const arrowShape = new THREE.Shape();
                arrowShape.moveTo(0, -0.4); // Bottom point
                arrowShape.lineTo(-0.2, 0.2); // Left wing
                arrowShape.lineTo(-0.1, 0.2); // Left inner
                arrowShape.lineTo(-0.1, 0.4); // Left top
                arrowShape.lineTo(0.1, 0.4); // Right top
                arrowShape.lineTo(0.1, 0.2); // Right inner
                arrowShape.lineTo(0.2, 0.2); // Right wing
                arrowShape.lineTo(0, -0.4); // Back to bottom
                
                const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
                const arrowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.4,
                    side: THREE.DoubleSide
                });
                
                const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
                arrow.position.copy(cell.position);
                arrow.position.y = 0.15; // Raised above cell surface for better visibility
                arrow.rotation.x = -Math.PI / 2; // Lay flat on cell
                arrow.rotation.z = Math.PI; // Point north
                
                this.gridGroup.add(arrow);
                
                // Add white glow effect with arrow shape
                const glowShape = new THREE.Shape();
                glowShape.moveTo(0, -0.5); // Bottom point
                glowShape.lineTo(-0.25, 0.25); // Left wing
                glowShape.lineTo(-0.15, 0.25); // Left inner
                glowShape.lineTo(-0.15, 0.5); // Left top
                glowShape.lineTo(0.15, 0.5); // Right top
                glowShape.lineTo(0.15, 0.25); // Right inner
                glowShape.lineTo(0.25, 0.25); // Right wing
                glowShape.lineTo(0, -0.5); // Back to bottom
                
                const glowGeometry = new THREE.ShapeGeometry(glowShape);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.15
                });
                
                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                glow.position.copy(arrow.position);
                glow.position.y += 0.02; // Slightly above arrow
                glow.rotation.x = -Math.PI / 2;
                glow.rotation.z = Math.PI;
                
                this.gridGroup.add(glow);
                
                // Add subtle pulsing animation
                this.animateNorthArrow(arrow, glow);
            }
        }
    }
    
    animateNorthArrow(arrow, glow) {
        let time = 0;
        const animate = () => {
            time += 0.02;
            const pulse = 0.2 + 0.1 * Math.sin(time * 3);
            arrow.material.opacity = 0.2 + pulse;
            glow.material.opacity = 0.05 + pulse * 0.05;
            requestAnimationFrame(animate);
        };
        animate();
    }

    returnToNorth() {
        if (this.northPosition && !this.isRotating) {
            // Smoothly return to north position
            const distance = Math.max(this.gridSize * 2, 10);
            this.camera.position.set(0, distance, distance);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        }
    }

    handleCellClick(row, col) {
        if (this.gameBoard[row][col] !== 'empty') {
            return;
        }
        
        // Find available move for this cell based on new placement rules
        const availableMove = this.availableMoves.find(move => {
            if (this.currentPlayer === 'blue') {
                // Blue player (horizontal) - clicked cell is LEFT part of token
                return (move.row === row && move.col === col);
            } else {
                // Red player (vertical) - clicked cell is TOP part of token
                return (move.row === row && move.col === col);
            }
        });
        
        if (availableMove) {
            this.placeToken(availableMove.row, availableMove.col, availableMove.direction);
        }
    }

    generateInactiveCells() {
        const totalCells = this.validPositions.length;
        const inactivePercentage = Math.random() * 0.02 + 0.17; // 17-19%
        const inactiveCount = Math.floor(totalCells * inactivePercentage);
        
        // Create array of valid positions
        const availablePositions = [...this.validPositions];
        
        // Randomly select positions for inactive cells
        for (let i = 0; i < inactiveCount; i++) {
            if (availablePositions.length > 0) {
                const randomIndex = Math.floor(Math.random() * availablePositions.length);
                const position = availablePositions.splice(randomIndex, 1)[0];
                this.inactiveCells.push(position);
            }
        }
        
        console.log(`Generated ${inactiveCount} inactive cells (${(inactiveCount/totalCells*100).toFixed(1)}%)`);
        this.updateBoardInfo(inactiveCount, totalCells);
    }

    updateBoardInfo(inactiveCount, totalCells) {
        const boardInfo = document.getElementById('boardInfo');
        if (boardInfo) {
            const activeCount = totalCells - inactiveCount;
            const percentage = (inactiveCount/totalCells*100).toFixed(1);
            const shapeName = this.boardShape.charAt(0).toUpperCase() + this.boardShape.slice(1);
            boardInfo.innerHTML = `
                Shape: ${shapeName}<br>
                Active cells: ${activeCount}<br>
                Inactive cells: ${inactiveCount} (${percentage}%)
            `;
        }
    }

    isCellInactive(row, col) {
        return this.inactiveCells.some(cell => cell.row === row && cell.col === col);
    }

    addNeonEffect(cell, x, z) {
        // Dodaj neon linije
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x - this.cellSize/2, 0.06, z - this.cellSize/2),
            new THREE.Vector3(x + this.cellSize/2, 0.06, z - this.cellSize/2)
        ]);
        
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.9
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.gridGroup.add(line);

        // Dodaj vrhove sa neon efektom
        const cornerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const cornerMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 1.0
        });

        const corners = [
            [x - this.cellSize/2, 0.06, z - this.cellSize/2],
            [x + this.cellSize/2, 0.06, z - this.cellSize/2],
            [x - this.cellSize/2, 0.06, z + this.cellSize/2],
            [x + this.cellSize/2, 0.06, z + this.cellSize/2]
        ];

        corners.forEach(corner => {
            const cornerMesh = new THREE.Mesh(cornerGeometry, cornerMaterial);
            cornerMesh.position.set(corner[0], corner[1], corner[2]);
            this.gridGroup.add(cornerMesh);
        });
    }

    addBackground() {
        // Dodaj CRT monitor efekat
        const monitorGeometry = new THREE.PlaneGeometry(30, 20);
        const monitorMaterial = new THREE.MeshBasicMaterial({
            color: 0x001100,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(0, 0, -15);
        this.gridGroup.add(monitor);

        // Dodaj scanlines efekat
        for (let i = 0; i < 20; i++) {
            const scanlineGeometry = new THREE.PlaneGeometry(30, 0.01);
            const scanlineMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.1
            });
            
            const scanline = new THREE.Mesh(scanlineGeometry, scanlineMaterial);
            scanline.position.set(0, -10 + i, -14.9);
            this.gridGroup.add(scanline);
        }
    }

    adjustCamera() {
        const distance = Math.max(this.gridSize * 2, 10);
        this.camera.position.set(0, distance, distance); // North position
        this.controls.target.set(0, 0, 0);
        this.controls.update();
        
        // Store north position
        this.northPosition = {
            x: 0,
            y: distance,
            z: distance
        };
    }

    setupEventListeners() {
        // Event listener for creating new board
        document.getElementById('createGrid').addEventListener('click', () => {
            const size = parseInt(document.getElementById('sizeSelect').value);
            this.createGrid(size);
        });

        // Mouse click event for placing tokens
        this.renderer.domElement.addEventListener('click', (event) => {
            if (this.gameState !== 'playing') return;
            
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);

            const intersects = raycaster.intersectObjects(this.cells);
            
            if (intersects.length > 0) {
                const clickedCell = intersects[0].object;
                const row = clickedCell.userData.row;
                const col = clickedCell.userData.col;
                
                this.handleCellClick(row, col);
            }
        });

        // Resize event
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });


    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Just render the scene without animating opacity
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new CRTNeonGame();
});

// Global function to hide winner overlay
function hideWinnerOverlay() {
    const overlay = document.getElementById('winnerOverlay');
    overlay.style.display = 'none';
}
