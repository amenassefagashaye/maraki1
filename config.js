// Configuration for the Bingo Game
const CONFIG = {
    // Game settings
    MAX_PLAYERS: 90,
    AUTO_CALL_INTERVAL: 7000, // 7 seconds
    MAX_CALLED_NUMBERS_DISPLAY: 8,
    
    // Payment settings
    PAYMENT_OPTIONS: [25, 50, 100, 200, 500, 1000, 2000, 5000],
    SERVICE_CHARGE_PERCENT: 3,
    
    // Prize calculation
    PRIZE_POOL_PERCENT: 80,
    
    // Board types
    BOARD_TYPES: [
        { 
            id: '75ball', 
            name: '75-ቢንጎ', 
            icon: '🎯', 
            desc: '5×5 ከBINGO', 
            range: 75, 
            columns: 5,
            rows: 5,
            labels: 'BINGO'.split(''),
            columnRanges: [[1,15], [16,30], [31,45], [46,60], [61,75]]
        },
        { 
            id: '90ball', 
            name: '90-ቢንጎ', 
            icon: '🇬🇧', 
            desc: '9×3 ፈጣን', 
            range: 90, 
            columns: 9,
            rows: 3,
            labels: ['1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90']
        },
        { 
            id: '30ball', 
            name: '30-ቢንጎ', 
            icon: '⚡', 
            desc: '3×3 ፍጥነት', 
            range: 30, 
            columns: 3,
            rows: 3,
            labels: ['1-10','11-20','21-30']
        },
        { 
            id: '50ball', 
            name: '50-ቢንጎ', 
            icon: '🎲', 
            desc: '5×5 ከBINGO', 
            range: 50, 
            columns: 5,
            rows: 5,
            labels: 'BINGO'.split(''),
            columnRanges: [[1,10], [11,20], [21,30], [31,40], [41,50]]
        },
        { 
            id: 'pattern', 
            name: 'ንድፍ ቢንጎ', 
            icon: '✨', 
            desc: 'ተጠቀም ንድፍ', 
            range: 75, 
            columns: 5,
            rows: 5,
            labels: 'BINGO'.split(''),
            columnRanges: [[1,15], [16,30], [31,45], [46,60], [61,75]]
        },
        { 
            id: 'coverall', 
            name: 'ሙሉ ቤት', 
            icon: '🏆', 
            desc: 'ሁሉንም ምልክት ያድርጉ', 
            range: 90, 
            columns: 9,
            rows: 5,
            labels: ['1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90']
        }
    ],
    
    // Winning patterns
    WINNING_PATTERNS: {
        '75ball': ['row', 'column', 'diagonal', 'four-corners', 'full-house'],
        '90ball': ['one-line', 'two-lines', 'full-house'],
        '30ball': ['full-house'],
        '50ball': ['row', 'column', 'diagonal', 'four-corners', 'full-house'],
        'pattern': ['x-pattern', 'frame', 'postage-stamp', 'small-diamond'],
        'coverall': ['full-board']
    },
    
    // Pattern names in Amharic
    PATTERN_NAMES: {
        'row': 'ረድፍ',
        'column': 'አምድ',
        'diagonal': 'ዲያግናል',
        'four-corners': 'አራት ማእዘኖች',
        'full-house': 'ሙሉ ቤት',
        'one-line': 'አንድ ረድፍ',
        'two-lines': 'ሁለት ረድጎች',
        'x-pattern': 'X ንድፍ',
        'frame': 'አውራ ቀለበት',
        'postage-stamp': 'ማህተም',
        'small-diamond': 'ዲያምንድ',
        'full-board': 'ሙሉ ቦርድ'
    }
};

// WebSocket configuration
const WS_CONFIG = {
    wsPath: '/ws',
    reconnectDelay: 3000,
    maxReconnectAttempts: 5
};

// Export configurations
window.CONFIG = CONFIG;
window.WS_CONFIG = WS_CONFIG;

// Helper functions
window.calculatePotentialWin = function(stake, playerCount = 90) {
    const pool = stake * playerCount * (CONFIG.PRIZE_POOL_PERCENT / 100);
    const afterService = pool * (1 - CONFIG.SERVICE_CHARGE_PERCENT / 100);
    return Math.floor(afterService);
};

window.getPatternName = function(pattern) {
    return CONFIG.PATTERN_NAMES[pattern] || pattern;
};

// Generate unique board numbers based on game type and board ID
window.generateBoardNumbers = function(gameType, boardId) {
    const boardConfig = CONFIG.BOARD_TYPES.find(t => t.id === gameType);
    if (!boardConfig) return [];
    
    const numbers = [];
    
    switch(gameType) {
        case '75ball':
        case '50ball':
        case 'pattern':
            // 5x5 board with columns
            const columnRanges = boardConfig.columnRanges;
            for (let col = 0; col < 5; col++) {
                const [min, max] = columnRanges[col];
                const colNumbers = [];
                while (colNumbers.length < 5) {
                    const num = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (!colNumbers.includes(num)) {
                        colNumbers.push(num);
                    }
                }
                colNumbers.sort((a, b) => a - b);
                numbers.push(...colNumbers);
            }
            break;
            
        case '90ball':
            // 9x3 board with specific column ranges
            const colRanges90 = [
                [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
                [50, 59], [60, 69], [70, 79], [80, 90]
            ];
            
            // Create empty 3x9 board
            const board90 = Array(3).fill().map(() => Array(9).fill(0));
            
            // Fill each column with 1, 2, or 3 numbers randomly
            for (let col = 0; col < 9; col++) {
                const [min, max] = colRanges90[col];
                const numCount = Math.floor(Math.random() * 3) + 1; // 1-3 numbers per column
                const colNumbers = [];
                
                while (colNumbers.length < numCount) {
                    const num = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (!colNumbers.includes(num)) {
                        colNumbers.push(num);
                    }
                }
                
                colNumbers.sort((a, b) => a - b);
                
                // Place numbers in random rows
                const rows = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, numCount);
                for (let i = 0; i < numCount; i++) {
                    board90[rows[i]][col] = colNumbers[i];
                }
            }
            
            // Flatten board
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 9; col++) {
                    numbers.push(board90[row][col]);
                }
            }
            break;
            
        case '30ball':
            // 3x3 board with numbers 1-30
            const allNumbers30 = Array.from({length: 30}, (_, i) => i + 1);
            const shuffled30 = [...allNumbers30].sort(() => Math.random() - 0.5);
            numbers.push(...shuffled30.slice(0, 9));
            break;
            
        case 'coverall':
            // 9x5 board (45 numbers from 1-90)
            const allNumbers90 = Array.from({length: 90}, (_, i) => i + 1);
            const shuffled90 = [...allNumbers90].sort(() => Math.random() - 0.5);
            numbers.push(...shuffled90.slice(0, 45));
            break;
    }
    
    return numbers;
};