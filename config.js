// Configuration for the Bingo Game
const CONFIG = {
    // Server settings
    SERVER_URL: "wss://ameng-gogs-maraki2-57.deno.dev/ws",
    RECONNECT_DELAY: 3000,
    
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
            labels: ['1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90'],
            columnRanges: [[1,9], [10,19], [20,29], [30,39], [40,49], [50,59], [60,69], [70,79], [80,90]]
        },
        { 
            id: '30ball', 
            name: '30-ቢንጎ', 
            icon: '⚡', 
            desc: '3×3 ፈጣን', 
            range: 30, 
            columns: 3,
            rows: 3,
            labels: ['1-10','11-20','21-30'],
            columnRanges: [[1,10], [11,20], [21,30]]
        },
        { 
            id: '50ball', 
            name: '50-ቢንጎ', 
            icon: '🎲', 
            desc: '5×5 ፈጣን', 
            range: 50, 
            columns: 5,
            rows: 5,
            labels: 'BINGO'.split(''),
            columnRanges: [[1,10], [11,20], [21,30], [31,40], [41,50]]
        },
        { 
            id: 'pattern', 
            name: 'የተለየ ቅርፅ', 
            icon: '✨', 
            desc: '5×5 ልዩ ቅርፅ', 
            range: 75, 
            columns: 5,
            rows: 5,
            labels: 'BINGO'.split(''),
            columnRanges: [[1,15], [16,30], [31,45], [46,60], [61,75]],
            patterns: [
                { name: 'X-ቅርፅ', pattern: [0,4,6,8,12,16,18,20,24] },
                { name: 'ፍሬም', pattern: [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24] },
                { name: 'ማህተም', pattern: [0,1,5,6,18,19,23,24] }
            ]
        },
        { 
            id: 'coverall', 
            name: 'ሙሉ ቦርድ', 
            icon: '🏆', 
            desc: '9×5 ሙሉ ቦርድ', 
            range: 90, 
            columns: 9,
            rows: 5,
            labels: ['1-10','11-20','21-30','31-40','41-50','51-60','61-70','71-80','81-90'],
            columnRanges: [[1,10], [11,20], [21,30], [31,40], [41,50], [51,60], [61,70], [71,80], [81,90]]
        }
    ],
    
    // Admin settings
    ADMIN_PASSWORD: "asse2123",
    
    // Game rules
    WINNING_PATTERNS: {
        '75ball': ['ረድፍ', 'አምድ', 'ዲያግናል', 'አራት ማዕዘን', 'ሙሉ ቤት'],
        '90ball': ['አንድ መስመር', 'ሁለት መስመሮች', 'ሙሉ ቤት'],
        '30ball': ['ሙሉ ቤት'],
        '50ball': ['ረድፍ', 'አምድ', 'ዲያግናል', 'አራት ማዕዘን', 'ሙሉ ቤት'],
        'pattern': ['X-ቅርፅ', 'ፍሬም', 'ማህተም', 'ሙሉ ቤት'],
        'coverall': ['ሙሉ ቦርድ']
    },
    
    // UI Settings
    THEME_COLORS: {
        primary: '#0d47a1',
        secondary: '#ffd700',
        success: '#4CAF50',
        danger: '#f44336',
        warning: '#ff9800',
        info: '#2196F3',
        light: '#f5f5f5',
        dark: '#212121'
    },
    
    // Sound settings
    SOUNDS: {
        numberCalled: 'sounds/number-called.mp3',
        win: 'sounds/win.mp3',
        background: 'sounds/background.mp3'
    },
    
    // Language settings (Amharic translations)
    TRANSLATIONS: {
        en: {
            register: "Register",
            gameType: "Game Type",
            stake: "Stake",
            boardId: "Board ID",
            phoneNumber: "Phone Number",
            fullName: "Full Name",
            joinGame: "Join Game",
            callingNumbers: "Calling Numbers",
            currentNumber: "Current Number",
            yourBoard: "Your Board",
            winners: "Winners",
            chat: "Chat",
            adminLogin: "Admin Login",
            startGame: "Start Game",
            stopGame: "Stop Game",
            callNumber: "Call Number",
            resetGame: "Reset Game",
            broadcast: "Broadcast",
            playerList: "Player List"
        },
        am: {
            register: "ተመዝገብ",
            gameType: "የጨዋታ አይነት",
            stake: "ዋጋ",
            boardId: "የቦርድ ቁጥር",
            phoneNumber: "ስልክ ቁጥር",
            fullName: "ሙሉ ስም",
            joinGame: "ጨዋታ ይቀላቀሉ",
            callingNumbers: "ቁጥሮች ይጠራሉ",
            currentNumber: "አሁን የተጠራው",
            yourBoard: "የእርስዎ ቦርድ",
            winners: "አሸናፊዎች",
            chat: "ውይይት",
            adminLogin: "አስተዳዳሪ ግባ",
            startGame: "ጨዋታ ጀምር",
            stopGame: "ጨዋታ አቁም",
            callNumber: "ቁጥር ጥራ",
            resetGame: "ጨዋታ ዳግም ጀምር",
            broadcast: "ማስተዋወቅ",
            playerList: "ተጫዋቾች ዝርዝር"
        }
    },
    
    // Default language
    DEFAULT_LANGUAGE: 'am'
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
