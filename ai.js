// AI Player for Squart Game
class AIPlayer {
    constructor(level, player) {
        this.level = level; // 'easy', 'medium', 'hard'
        this.player = player; // 'blue' or 'red'
        this.thinkingTime = 0; // Simulated thinking time
        
        // Transposition table for caching positions
        this.transpositionTable = new Map();
        this.WIN = 1e9;
        this.LOSS = -1e9;
    }

    // Main method to get AI move
    getMove(gameBoard, availableMoves, gridSize) {
        console.log(`AI ${this.player} (${this.level}) is thinking...`);
        
        // Simulate thinking time based on level
        this.thinkingTime = this.getThinkingTime();
        
        let move;
        switch(this.level) {
            case 'easy':
                move = this.getRandomMove(availableMoves);
                break;
            case 'medium':
                move = this.getGreedyMove(gameBoard, availableMoves, gridSize);
                break;
            case 'hard':
                move = this.getMinimaxMove(gameBoard, availableMoves, gridSize);
                break;
            default:
                move = this.getRandomMove(availableMoves);
        }
        
        console.log(`AI ${this.player} chose move:`, move);
        return move;
    }

    // EASY LEVEL: Random move selection
    getRandomMove(availableMoves) {
        if (availableMoves.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }

    // MEDIUM LEVEL: Greedy algorithm
    getGreedyMove(gameBoard, availableMoves, gridSize) {
        if (availableMoves.length === 0) return null;
        
        let bestMove = availableMoves[0];
        let bestScore = -Infinity;
        
        for (const move of availableMoves) {
            const score = this.evaluateMove(gameBoard, move, gridSize);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    // HARD LEVEL: Advanced AI with transposition table and iterative deepening
    getMinimaxMove(gameBoard, availableMoves, gridSize) {
        if (availableMoves.length === 0) return null;
        
        const startTime = performance.now();
        const maxTime = 3000; // 3 seconds max
        const maxDepth = this.calculateOptimalDepth(gridSize, availableMoves.length);
        
        // Clear transposition table for new search
        this.transpositionTable.clear();
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        // Iterative deepening
        for (let depth = 1; depth <= maxDepth; depth++) {
            const { move, score } = this.advancedAlphaBeta(
                this.createNode(gameBoard, gridSize), 
                depth, 
                -Infinity, 
                Infinity, 
                this.player, 
                this.player, 
                this.getOpponent(), 
                startTime, 
                maxTime
            );
            
            if (move) {
                bestMove = move;
                bestScore = score;
                console.log(`Hard AI: Depth ${depth}, score: ${score}`);
            }
            
            // Time management - stop if we're running out of time
            if ((performance.now() - startTime) > maxTime * 0.9) {
                console.log('Hard AI: Time limit reached, using best move so far');
                break;
            }
            
            // Early termination if we found a winning/losing position
            if (score >= this.WIN - 100 || score <= this.LOSS + 100) {
                console.log('Hard AI: Found terminal position, stopping search');
                break;
            }
        }
        
        console.log(`Hard AI: Final move with score ${bestScore}`);
        return bestMove;
    }

    calculateOptimalDepth(gridSize, availableMoves) {
        // Adaptive depth calculation
        if (gridSize <= 8) {
            return Math.min(8, availableMoves); // Deeper search for smaller boards
        } else if (gridSize <= 12) {
            return Math.min(6, availableMoves); // Medium depth for medium boards
        } else {
            return Math.min(5, availableMoves); // Shallow depth for large boards
        }
    }

    // Create a node representation for the AI engine
    createNode(gameBoard, gridSize) {
        const board = Array.from({length: gridSize}, (_, r) => 
            Array.from({length: gridSize}, (_, c) => gameBoard[r][c])
        );
        return { board, N: gridSize };
    }

    // Clone a node
    cloneNode(node) {
        const N = node.N;
        const board = Array.from({length: N}, (_, r) => node.board[r].slice());
        return { board, N };
    }

    // Advanced alpha-beta with transposition table
    advancedAlphaBeta(node, depth, alpha, beta, toMove, me, opp, startTime, maxTime) {
        // Time check
        if ((performance.now() - startTime) > maxTime) {
            return { move: null, score: this.advancedEvaluate(node, me) };
        }

        const moves = this.generateMoves(node, toMove);
        if (moves.length === 0) {
            const score = (toMove === me) ? this.LOSS : this.WIN;
            return { move: null, score };
        }
        if (depth === 0) {
            return { move: null, score: this.advancedEvaluate(node, me) };
        }

        // Transposition table lookup
        const key = this.hashPosition(node, toMove);
        const hit = this.transpositionTable.get(key);
        if (hit && hit.depth >= depth) {
            if (hit.flag === 'EXACT') return { move: hit.move, score: hit.score };
            if (hit.flag === 'LOWER') alpha = Math.max(alpha, hit.score);
            else if (hit.flag === 'UPPER') beta = Math.min(beta, hit.score);
            if (alpha >= beta) return { move: hit.move, score: hit.score };
        }

        // Sort moves by heuristic for better pruning
        moves.sort((a, b) => this.moveHeuristic(node, toMove, b) - this.moveHeuristic(node, toMove, a));

        let bestMove = null;
        if (toMove === me) {
            let value = -Infinity;
            for (const move of moves) {
                const nextNode = this.applyMove(node, move, toMove);
                const result = this.advancedAlphaBeta(
                    nextNode, depth - 1, alpha, beta, 
                    (toMove === 'blue' ? 'red' : 'blue'), me, opp, startTime, maxTime
                );
                if (result.score > value) {
                    value = result.score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, value);
                if (alpha >= beta) break;
            }
            const flag = (value <= alpha) ? 'UPPER' : (value >= beta ? 'LOWER' : 'EXACT');
            this.transpositionTable.set(key, { depth, score: value, flag, move: bestMove });
            return { move: bestMove, score: value };
        } else {
            let value = Infinity;
            for (const move of moves) {
                const nextNode = this.applyMove(node, move, toMove);
                const result = this.advancedAlphaBeta(
                    nextNode, depth - 1, alpha, beta, 
                    (toMove === 'blue' ? 'red' : 'blue'), me, opp, startTime, maxTime
                );
                if (result.score < value) {
                    value = result.score;
                    bestMove = move;
                }
                beta = Math.min(beta, value);
                if (alpha >= beta) break;
            }
            const flag = (value <= alpha) ? 'UPPER' : (value >= beta ? 'LOWER' : 'EXACT');
            this.transpositionTable.set(key, { depth, score: value, flag, move: bestMove });
            return { move: bestMove, score: value };
        }
    }

    // Generate moves for a node
    generateMoves(node, player) {
        const { board, N } = node;
        const moves = [];
        
        if (player === 'blue') {
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < N - 1; c++) {
                    if (board[r][c] === 'empty' && board[r][c + 1] === 'empty') {
                        moves.push({ row: r, col: c, direction: 'horizontal' });
                    }
                }
            }
        } else {
            for (let r = 0; r < N - 1; r++) {
                for (let c = 0; c < N; c++) {
                    if (board[r][c] === 'empty' && board[r + 1][c] === 'empty') {
                        moves.push({ row: r, col: c, direction: 'vertical' });
                    }
                }
            }
        }
        return moves;
    }

    // Apply a move to a node
    applyMove(node, move, player) {
        const next = this.cloneNode(node);
        const { row, col, direction } = move;
        
        if (direction === 'horizontal') {
            next.board[row][col] = 'blue';
            next.board[row][col + 1] = 'blue';
        } else {
            next.board[row][col] = 'red';
            next.board[row + 1][col] = 'red';
        }
        return next;
    }

    // Hash position for transposition table
    hashPosition(node, toMove) {
        return toMove + '|' + node.board.map(r => r.join('')).join('/');
    }

    // Move heuristic for move ordering
    moveHeuristic(node, player, move) {
        const { board, N } = node;
        const center = (N - 1) / 2;
        const cells = (move.direction === 'horizontal') ? 
            [[move.row, move.col], [move.row, move.col + 1]] : 
            [[move.row, move.col], [move.row + 1, move.col]];
        
        let centrality = 0;
        let blockBonus = 0;

        for (const [r, c] of cells) {
            const dr = Math.abs(r - center);
            const dc = Math.abs(c - center);
            centrality -= (dr + dc);
            
            if (player === 'blue') {
                const up = (r - 1 >= 0) ? board[r - 1][c] : 'wall';
                const dn = (r + 1 < N) ? board[r + 1][c] : 'wall';
                if (up !== 'empty') blockBonus += 0.6;
                if (dn !== 'empty') blockBonus += 0.6;
            } else {
                const lf = (c - 1 >= 0) ? board[r][c - 1] : 'wall';
                const rt = (c + 1 < N) ? board[r][c + 1] : 'wall';
                if (lf !== 'empty') blockBonus += 0.6;
                if (rt !== 'empty') blockBonus += 0.6;
            }
        }
        return 1.0 * blockBonus + 0.2 * (-centrality);
    }

    // Advanced evaluation function
    advancedEvaluate(node, me) {
        const opp = (me === 'blue') ? 'red' : 'blue';
        const myMoves = this.generateMoves(node, me).length;
        const oppMoves = this.generateMoves(node, opp).length;

        let score = 4 * (myMoves - oppMoves);

        // Top 3 move quality for each player
        const top3Quality = (player) => {
            const moves = this.generateMoves(node, player);
            return moves.map(m => this.moveHeuristic(node, player, m))
                .sort((a, b) => b - a)
                .slice(0, 3)
                .reduce((a, v) => a + v, 0);
        };
        
        score += (top3Quality(me) - top3Quality(opp));
        return score;
    }

    // Enhanced Minimax algorithm with alpha-beta pruning and time management
    enhancedMinimax(board, availableMoves, depth, isMaximizing, alpha, beta, gridSize, startTime, maxSearchTime) {
        // Check time limit
        if (Date.now() - startTime > maxSearchTime) {
            return this.evaluateBoard(board, gridSize);
        }
        
        // Terminal conditions
        if (depth === 0 || availableMoves.length === 0) {
            return this.enhancedEvaluateBoard(board, gridSize);
        }
        
        // Sort moves for better alpha-beta pruning efficiency
        const sortedMoves = this.sortMovesByHeuristic(board, availableMoves, isMaximizing ? this.player : this.getOpponent(), gridSize);
        
        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of sortedMoves) {
                const newBoard = this.copyGameBoard(board);
                this.makeMove(newBoard, move, this.player);
                const opponentMoves = this.getAvailableMoves(newBoard, this.getOpponent(), gridSize);
                const score = this.enhancedMinimax(newBoard, opponentMoves, depth - 1, false, alpha, beta, gridSize, startTime, maxSearchTime);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of sortedMoves) {
                const newBoard = this.copyGameBoard(board);
                this.makeMove(newBoard, move, this.getOpponent());
                const playerMoves = this.getAvailableMoves(newBoard, this.player, gridSize);
                const score = this.enhancedMinimax(newBoard, playerMoves, depth - 1, true, alpha, beta, gridSize, startTime, maxSearchTime);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) break; // Alpha-beta pruning
            }
            return minScore;
        }
    }

    // Sort moves by heuristic for better alpha-beta pruning
    sortMovesByHeuristic(board, moves, player, gridSize) {
        return moves.sort((a, b) => {
            const scoreA = this.evaluateMove(board, a, gridSize);
            const scoreB = this.evaluateMove(board, b, gridSize);
            return scoreB - scoreA; // Sort in descending order
        });
    }

    // Enhanced board evaluation with more sophisticated heuristics
    enhancedEvaluateBoard(board, gridSize) {
        let score = 0;
        let playerTokens = 0;
        let opponentTokens = 0;
        
        // Count tokens and analyze patterns
        const playerPatterns = this.analyzePatterns(board, this.player, gridSize);
        const opponentPatterns = this.analyzePatterns(board, this.getOpponent(), gridSize);
        
        // Base score from token count
        score += (playerTokens - opponentTokens) * 15;
        
        // Pattern analysis bonus
        score += playerPatterns.totalScore * 20;
        score -= opponentPatterns.totalScore * 20;
        
        // Connectivity bonus
        score += this.evaluateConnectivity(board, this.player, gridSize) * 10;
        score -= this.evaluateConnectivity(board, this.getOpponent(), gridSize) * 10;
        
        // Mobility bonus (available moves)
        const playerMoves = this.getAvailableMoves(board, this.player, gridSize);
        const opponentMoves = this.getAvailableMoves(board, this.getOpponent(), gridSize);
        score += playerMoves.length * 5;
        score -= opponentMoves.length * 5;
        
        // Endgame detection
        if (playerMoves.length === 0 && opponentMoves.length > 0) {
            score -= 1000; // Player loses
        } else if (opponentMoves.length === 0 && playerMoves.length > 0) {
            score += 1000; // Player wins
        }
        
        return score;
    }

    // Analyze board patterns for better evaluation
    analyzePatterns(board, player, gridSize) {
        const patterns = {
            clusters: 0,
            isolatedTokens: 0,
            edgeTokens: 0,
            centerTokens: 0,
            totalScore: 0
        };
        
        const visited = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === player && !visited[row][col]) {
                    const cluster = this.findCluster(board, row, col, player, visited, gridSize);
                    patterns.clusters++;
                    patterns.totalScore += cluster.size * 2;
                    
                    // Bonus for larger clusters
                    if (cluster.size >= 4) patterns.totalScore += 10;
                    if (cluster.size >= 6) patterns.totalScore += 20;
                }
            }
        }
        
        return patterns;
    }

    // Find connected tokens (cluster)
    findCluster(board, row, col, player, visited, gridSize) {
        const cluster = { size: 0, positions: [] };
        const stack = [{row, col}];
        
        while (stack.length > 0) {
            const {row: r, col: c} = stack.pop();
            
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize || 
                visited[r][c] || board[r][c] !== player) {
                continue;
            }
            
            visited[r][c] = true;
            cluster.size++;
            cluster.positions.push({row: r, col: c});
            
            // Check all 8 directions
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            for (const [dr, dc] of directions) {
                stack.push({row: r + dr, col: c + dc});
            }
        }
        
        return cluster;
    }

    // Evaluate connectivity of tokens
    evaluateConnectivity(board, player, gridSize) {
        let connectivity = 0;
        
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === player) {
                    // Check if token is connected to others
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (const [dr, dc] of directions) {
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && 
                            board[nr][nc] === player) {
                            connectivity++;
                        }
                    }
                }
            }
        }
        
        return connectivity;
    }

    // Evaluate a single move
    evaluateMove(gameBoard, move, gridSize) {
        let score = 0;
        
        // Base score for making a move
        score += 10;
        
        // Bonus for moves that create more opportunities
        const newBoard = this.copyGameBoard(gameBoard);
        this.makeMove(newBoard, move, this.player);
        const newMoves = this.getAvailableMoves(newBoard, this.player, gridSize);
        score += newMoves.length * 2;
        
        // Penalty for moves that give opponent many options
        const opponentMoves = this.getAvailableMoves(newBoard, this.getOpponent(), gridSize);
        score -= opponentMoves.length * 1.5;
        
        // Bonus for moves that block opponent's moves
        const originalOpponentMoves = this.getAvailableMoves(gameBoard, this.getOpponent(), gridSize);
        const blockedMoves = originalOpponentMoves.length - opponentMoves.length;
        score += blockedMoves * 5;
        
        // Position bonus (prefer center and edges)
        const center = Math.floor(gridSize / 2);
        const moveRow = move.row;
        const moveCol = move.col;
        
        // Center bonus
        const distanceFromCenter = Math.abs(moveRow - center) + Math.abs(moveCol - center);
        score += (gridSize - distanceFromCenter) * 0.5;
        
        return score;
    }

    // Evaluate the entire board state
    evaluateBoard(board, gridSize) {
        let score = 0;
        let playerTokens = 0;
        let opponentTokens = 0;
        
        // Count tokens
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === this.player) {
                    playerTokens++;
                } else if (board[row][col] === this.getOpponent()) {
                    opponentTokens++;
                }
            }
        }
        
        // Score based on token count
        score += (playerTokens - opponentTokens) * 10;
        
        // Bonus for strategic positions
        score += this.evaluateStrategicPositions(board, gridSize);
        
        return score;
    }

    // Evaluate strategic positions on the board
    evaluateStrategicPositions(board, gridSize) {
        let score = 0;
        const center = Math.floor(gridSize / 2);
        
        // Check for strategic patterns
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                if (board[row][col] === this.player) {
                    // Center position bonus
                    if (row === center && col === center) {
                        score += 20;
                    }
                    
                    // Edge position bonus
                    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) {
                        score += 5;
                    }
                    
                    // Corner position bonus
                    if ((row === 0 || row === gridSize - 1) && (col === 0 || col === gridSize - 1)) {
                        score += 10;
                    }
                }
            }
        }
        
        return score;
    }

    // Helper methods
    getOpponent() {
        return this.player === 'blue' ? 'red' : 'blue';
    }

    getThinkingTime() {
        switch(this.level) {
            case 'easy': return Math.random() * 500 + 200; // 200-700ms
            case 'medium': return Math.random() * 800 + 500; // 500-1300ms
            case 'hard': return Math.random() * 1000 + 2000; // 2000-3000ms (optimized for new algorithm)
            default: return 500;
        }
    }

    copyGameBoard(board) {
        return board.map(row => [...row]);
    }

    makeMove(board, move, player) {
        if (move.direction === 'horizontal') {
            board[move.row][move.col] = player;
            board[move.row][move.col + 1] = player;
        } else {
            board[move.row][move.col] = player;
            board[move.row + 1][move.col] = player;
        }
    }

    getAvailableMoves(board, player, gridSize) {
        const moves = [];
        
        if (player === 'blue') {
            // Horizontal moves
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize - 1; col++) {
                    if (board[row][col] === 'empty' && board[row][col + 1] === 'empty') {
                        moves.push({ row, col, direction: 'horizontal' });
                    }
                }
            }
        } else {
            // Vertical moves
            for (let row = 0; row < gridSize - 1; row++) {
                for (let col = 0; col < gridSize; col++) {
                    if (board[row][col] === 'empty' && board[row + 1][col] === 'empty') {
                        moves.push({ row, col, direction: 'vertical' });
                    }
                }
            }
        }
        
        return moves;
    }
}

// AI Game Manager - handles AI vs AI games
class AIGameManager {
    constructor(blueAI, redAI) {
        this.blueAI = blueAI;
        this.redAI = redAI;
        this.gameHistory = [];
        this.currentGame = null;
    }

    // Simulate a complete AI vs AI game
    simulateGame(gameBoard, gridSize) {
        const board = this.copyGameBoard(gameBoard);
        const moves = [];
        let currentPlayer = 'blue';
        let gameOver = false;
        
        while (!gameOver) {
            const ai = currentPlayer === 'blue' ? this.blueAI : this.redAI;
            const availableMoves = ai.getAvailableMoves(board, currentPlayer, gridSize);
            
            if (availableMoves.length === 0) {
                gameOver = true;
                break;
            }
            
            const move = ai.getMove(board, availableMoves, gridSize);
            if (!move) {
                gameOver = true;
                break;
            }
            
            ai.makeMove(board, move, currentPlayer);
            moves.push({
                player: currentPlayer,
                move: move,
                board: this.copyGameBoard(board)
            });
            
            currentPlayer = currentPlayer === 'blue' ? 'red' : 'blue';
        }
        
        const winner = currentPlayer === 'blue' ? 'red' : 'blue';
        return {
            winner: winner,
            moves: moves,
            finalBoard: board
        };
    }

    copyGameBoard(board) {
        return board.map(row => [...row]);
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIPlayer, AIGameManager };
}
