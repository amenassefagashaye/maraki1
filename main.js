// Game State
const gameState = {
    gameType: null,
    payment: 0,
    stake: 25,
    totalWon: 0,
    boardId: 1,
    calledNumbers: [],
    markedNumbers: new Set(),
    gameActive: false,
    isCalling: false,
    callInterval: null,
    playerName: '',
    playerPhone: '',
    totalWithdrawn: 0,
    members: [],
    currentNumber: null,
    boardNumbers: [],
    winClaimed: false,
    autoCallEnabled: true,
    currentPattern: null
};

// DOM Elements
let currentPage = 0;

// Initialize game
function init() {
    setupBoardSelection();
    setupStakeOptions();
    setupBoardNumbers();
    generateSampleMembers();
    loadHelpContent();
    
    // Event listeners
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (gameState.gameType) {
            showPage(2);
        } else {
            showNotification('እባክዎ የቦርድ ዓይነት ይምረጡ', false);
        }
    });
    
    document.getElementById('confirmBtn').addEventListener('click', confirmRegistration);
    document.getElementById('circularCallBtn').addEventListener('click', toggleAutoCall);
    document.getElementById('announceBtn').addEventListener('click', announceWin);
    
    // Check for admin parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        window.location.href = 'admin.html';
    }
    
    // Initialize with welcome page
    showPage(0);
}

// Setup board selection
function setupBoardSelection() {
    const grid = document.getElementById('boardTypeGrid');
    grid.innerHTML = '';
    
    CONFIG.BOARD_TYPES.forEach(type => {
        const card = document.createElement('div');
        card.className = 'board-type-card';
        card.innerHTML = `
            <div class="board-type-icon">${type.icon}</div>
            <div class="board-type-title amharic-text">${type.name}</div>
            <div class="board-type-desc amharic-text">${type.desc}</div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.board-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            gameState.gameType = type.id;
            
            // Set random pattern for pattern bingo
            if (type.id === 'pattern') {
                const patterns = CONFIG.WINNING_PATTERNS.pattern;
                gameState.currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
            }
        });
        
        grid.appendChild(card);
    });
}

// Setup stake options
function setupStakeOptions() {
    const select = document.getElementById('playerStake');
    CONFIG.PAYMENT_OPTIONS.forEach(stake => {
        const option = document.createElement('option');
        option.value = stake;
        option.textContent = `${stake} ብር`;
        select.appendChild(option);
    });
    select.value = 25;
    gameState.stake = 25;
    updatePotentialWin();
}

// Setup board numbers
function setupBoardNumbers() {
    const select = document.getElementById('boardSelect');
    select.innerHTML = '<option value="">ቦርድ ይምረጡ</option>';
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `ቦርድ ${i}`;
        select.appendChild(option);
    }
    select.value = 1;
    gameState.boardId = 1;
}

// Generate sample members
function generateSampleMembers() {
    const amharicNames = [
        'አሰፋ ጋሻዬ', 'ብርሃን ነጋ', 'መለስ ዜናዊ', 'አብይ አህመድ',
        'ሳህለ ወልደማርያም', 'ደመቀ መኮንን', 'ተዋሕዶ ረዳ', 'ፍቅር አለማየሁ',
        'ሙሉጌታ ገብረክ', 'አያሌው ግርማ', 'ታደሰ ተክለ', 'ዘርኣየም ደምሴ'
    ];
    
    gameState.members = [];
    
    for (let i = 1; i <= 90; i++) {
        const name = amharicNames[Math.floor(Math.random() * amharicNames.length)];
        const boardType = CONFIG.BOARD_TYPES[Math.floor(Math.random() * CONFIG.BOARD_TYPES.length)].name;
        const paid = i <= 85;
        const stake = CONFIG.PAYMENT_OPTIONS[Math.floor(Math.random() * CONFIG.PAYMENT_OPTIONS.length)];
        const payment = paid ? stake : 0;
        const won = Math.random() > 0.9;
        const balance = payment + (won ? calculatePotentialWin(stake) : 0);
        
        gameState.members.push({
            id: i,
            name: `${name} ${i}`,
            phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
            boardType: boardType,
            paid: paid,
            won: won,
            stake: stake,
            payment: payment,
            balance: Math.floor(balance),
            active: paid
        });
    }
}

// Update potential win display
function updatePotentialWin() {
    const stakeSelect = document.getElementById('playerStake');
    const stake = parseInt(stakeSelect.value) || 25;
    const winAmount = calculatePotentialWin(stake);
    
    document.getElementById('currentWinDisplay').textContent = winAmount.toLocaleString();
    gameState.stake = stake;
}

// Show page
function showPage(pageNum) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(`page${pageNum}`);
    page.classList.add('active');
    currentPage = pageNum;
    
    // Page-specific actions
    switch(pageNum) {
        case 3: // Game board
            generateGameBoard();
            startNewGame();
            break;
        case 4: // Finance
            updateFinance();
            break;
        case 5: // Help
            showHelpTab('general');
            break;
    }
}

// Show help tab
function showHelpTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.help-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show tab content
    const helpContent = document.getElementById('helpContent');
    const tabData = getHelpTabContent(tabId);
    helpContent.innerHTML = tabData;
}

// Get help content for tab
function getHelpTabContent(tabId) {
    const helpContent = {
        'general': `
            <div class="help-section">
                <div class="help-title amharic-text">አጠቃላይ መረጃ / General Information</div>
                <div class="help-text amharic-text">
                    ይህ የአሰፋ ዲጂታል ቢንጎ ጨዋታ በኢትዮጵያ ውስጥ ለመጀመሪያ ጊዜ የተገነባ የኦንላይን ቢንጎ ጨዋታ ነው።
                </div>
                <div class="help-text">
                    This is Assefa Digital Bingo Game, the first online bingo platform specifically designed for Ethiopia.
                </div>
            </div>
            <div class="help-section">
                <div class="help-title amharic-text">ጨዋታ አወቃቀር / Game Structure</div>
                <div class="help-text amharic-text">
                    1. የቦርድ ምርጫ - 6 የተለያዩ ቢንጎ ዓይነቶች<br>
                    2. ምዝገባ - የተጫዋች መረጃ እና ክፍያ<br>
                    3. የጨዋታ ቦርድ - ቁጥር ምልክት እና አሸናፊነት<br>
                    4. ፋይናንስ - የገንዘብ አስተዳደር<br>
                    5. እርዳታ - ዝርዝር መመሪያ
                </div>
            </div>
        `,
        'rules': `
            <div class="help-section">
                <div class="help-title amharic-text">መሰረታዊ ደንቦች / Basic Rules</div>
                <div class="help-text amharic-text">
                    1. ቦርድ ይግዙ<br>
                    2. ቁጥሮች በራስ-ሰር ይጠራሉ (ሁለ 7 ሰከንድ)<br>
                    3. የተጠራው ቁጥር በቦርድዎ ላይ ካለ ይንኩ<br>
                    4. ንድፍ ሲጠናቀቅ "አሸናፊ ናለሁ!" ይንኩ<br>
                    5. ሽልማት ይቀበሉ
                </div>
            </div>
        `,
        '75ball': `
            <div class="help-section">
                <div class="help-title amharic-text">75-ቢንጎ ጨዋታ / 75-Ball Game</div>
                <div class="help-text amharic-text">
                    <strong>የቦርድ መጠን:</strong> 5×5 ፍርግርግ<br>
                    <strong>ቁጥር ክልል:</strong> 1-75<br>
                    <strong>የማሸነፍ ንድፎች:</strong><br>
                    • ረድፍ (5 ቁጥሮች በአንድ ረድፍ)<br>
                    • አምድ (5 ቁጥሮች በአንድ አምድ)<br>
                    • ዲያግናል (5 ቁጥሮች በዲያግናል)<br>
                    • አራት ማእዘኖች (4 ማዕዘኖች)<br>
                    • ሙሉ ቤት (ሁሉም ቁጥሮች)
                </div>
            </div>
        `,
        // Add other tab contents similarly
        'payment': `
            <div class="help-section">
                <div class="help-title amharic-text">የክፍያ ስርዓት / Payment System</div>
                <div class="help-text amharic-text">
                    <strong>የክፍያ አማራጮች:</strong><br>
                    • 25 ብር - መሰረታዊ<br>
                    • 50 ብር - መካከለኛ<br>
                    • 100 ብር - መደበኛ<br>
                    • 200 ብር - ከፍተኛ<br>
                    • 500 ብር - ብርቅ<br>
                    • 1000 ብር - ልዩ<br>
                    • 2000 ብር - ከፍተኛ ልዩ<br>
                    • 5000 ብር - በጣም ከፍተኛ
                </div>
                <div class="help-text amharic-text">
                    <strong>ማሳሰቢያ:</strong> 3% አገልግሎት ክፍያ ይቀንሳል።
                </div>
            </div>
        `
    };
    
    return helpContent[tabId] || helpContent['general'];
}

// Load all help content
function loadHelpContent() {
    // Content is loaded dynamically
}

// Show members modal
function showMembers() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';
    
    gameState.members.forEach(member => {
        const row = document.createElement('tr');
        row.className = 'member-row';
        row.innerHTML = `
            <td>${member.id}</td>
            <td class="member-name amharic-text">${member.name}</td>
            <td>${member.phone}</td>
            <td class="${member.paid ? 'member-paid' : 'member-not-paid'} amharic-text">
                ${member.paid ? '✓ ተከፍሏል' : '✗ አልተከፈለም'}
            </td>
            <td>${member.stake} ብር</td>
            <td>${member.balance.toLocaleString()} ብር</td>
        `;
        membersList.appendChild(row);
    });
    
    document.getElementById('membersModal').style.display = 'block';
}

// Show potential win modal
function showPotentialWin() {
    const tbody = document.getElementById('winningTableBody');
    tbody.innerHTML = '';
    
    CONFIG.PAYMENT_OPTIONS.forEach(stake => {
        const winAmount = calculatePotentialWin(stake);
        const row = document.createElement('tr');
        row.className = stake === gameState.stake ? 'current-stake-row' : '';
        row.innerHTML = `
            <td class="amharic-text">${stake} ብር</td>
            <td class="win-amount">${winAmount.toLocaleString()} ብር</td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('potentialWinModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Process payment
function processPayment() {
    const select = document.getElementById('paymentAmount');
    const amount = parseInt(select.value);
    
    if (amount && amount >= 25) {
        gameState.payment = amount;
        select.style.background = '#28a745';
        select.style.color = 'white';
        select.style.borderColor = '#28a745';
    }
}

// Confirm registration
function confirmRegistration() {
    const name = document.getElementById('playerName').value.trim();
    const phone = document.getElementById('playerPhone').value.trim();
    const stake = document.getElementById('playerStake').value;
    const board = document.getElementById('boardSelect').value;
    
    // Validation
    if (!name) {
        showNotification('እባክዎ ስምዎን ያስገቡ', false);
        return;
    }
    
    if (!phone || phone.length < 10) {
        showNotification('እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ', false);
        return;
    }
    
    if (!stake) {
        showNotification('እባክዎ ውርርድ መጠን ይምረጡ', false);
        return;
    }
    
    if (!board) {
        showNotification('እባክዎ ቦርድ ቁጥር ይምረጡ', false);
        return;
    }
    
    if (gameState.payment === 0) {
        showNotification('እባክዎ ክፍያ መጠን ይምረጡ', false);
        return;
    }
    
    // Save player info
    gameState.playerName = name;
    gameState.playerPhone = phone;
    gameState.stake = parseInt(stake);
    gameState.boardId = parseInt(board);
    
    // Add to members list
    const newMember = {
        id: gameState.members.length + 1,
        name: name,
        phone: phone,
        boardType: CONFIG.BOARD_TYPES.find(t => t.id === gameState.gameType).name,
        paid: true,
        won: false,
        stake: gameState.stake,
        payment: gameState.payment,
        balance: gameState.payment,
        active: true
    };
    gameState.members.unshift(newMember);
    
    // Show game board
    showPage(3);
}

// Generate game board
function generateGameBoard() {
    const board = document.getElementById('gameBoard');
    const header = document.getElementById('gameHeader');
    board.innerHTML = '';
    
    const boardType = CONFIG.BOARD_TYPES.find(t => t.id === gameState.gameType);
    if (!boardType) return;
    
    // Update header
    header.textContent = `${boardType.name} - ቦርድ ${gameState.boardId}`;
    
    // Generate board numbers
    gameState.boardNumbers = generateBoardNumbers(gameState.gameType, gameState.boardId);
    
    // Create board based on type
    switch(gameState.gameType) {
        case '75ball':
        case '50ball':
        case 'pattern':
            create5x5Board(board, boardType);
            break;
        case '90ball':
            create90BallBoard(board, boardType);
            break;
        case '30ball':
            create30BallBoard(board, boardType);
            break;
        case 'coverall':
            createCoverallBoard(board, boardType);
            break;
    }
}

// Create 5x5 board (75-ball, 50-ball, pattern)
function create5x5Board(container, boardType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'board-75-wrapper';
    
    // Create labels (BINGO)
    const labels = document.createElement('div');
    labels.className = 'bingo-labels';
    boardType.labels.forEach(letter => {
        const label = document.createElement('div');
        label.className = 'bingo-label';
        label.textContent = letter;
        labels.appendChild(label);
    });
    wrapper.appendChild(labels);
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = gameState.gameType === '75ball' ? 'board-75' : 'board-50';
    
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        const num = gameState.boardNumbers[i];
        
        // Center cell (free space for 75-ball)
        if (i === 12 && gameState.gameType === '75ball') {
            cell.textContent = '★';
            cell.classList.add('center-cell');
            cell.dataset.free = 'true';
        } else {
            cell.textContent = num;
            cell.dataset.number = num;
            cell.dataset.index = i;
            
            // Mark as pattern cell for pattern bingo
            if (gameState.gameType === 'pattern' && isPatternCell(i, gameState.currentPattern)) {
                cell.classList.add('pattern-cell');
            }
        }
        
        cell.addEventListener('click', () => toggleMark(cell, num));
        grid.appendChild(cell);
    }
    
    wrapper.appendChild(grid);
    container.appendChild(wrapper);
}

// Create 90-ball board
function create90BallBoard(container, boardType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'board-90-wrapper';
    
    // Labels
    const labels = document.createElement('div');
    labels.className = 'board-90-labels';
    boardType.labels.forEach(labelText => {
        const label = document.createElement('div');
        label.className = 'board-90-label';
        label.textContent = labelText;
        labels.appendChild(label);
    });
    wrapper.appendChild(labels);
    
    // Grid
    const grid = document.createElement('div');
    grid.className = 'board-90';
    
    for (let i = 0; i < 27; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        const num = gameState.boardNumbers[i];
        
        if (num === 0) {
            cell.classList.add('blank-cell');
            cell.textContent = '✗';
        } else {
            cell.textContent = num;
            cell.dataset.number = num;
            cell.dataset.index = i;
            
            // Center of the board (position 13)
            if (i === 13) {
                cell.classList.add('center-cell');
            }
            
            cell.addEventListener('click', () => toggleMark(cell, num));
        }
        
        grid.appendChild(cell);
    }
    
    wrapper.appendChild(grid);
    container.appendChild(wrapper);
}

// Create 30-ball board
function create30BallBoard(container, boardType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'board-30-wrapper';
    
    // Labels
    const labels = document.createElement('div');
    labels.className = 'board-30-labels';
    boardType.labels.forEach(labelText => {
        const label = document.createElement('div');
        label.className = 'board-30-label';
        label.textContent = labelText;
        labels.appendChild(label);
    });
    wrapper.appendChild(labels);
    
    // Grid
    const grid = document.createElement('div');
    grid.className = 'board-30';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        const num = gameState.boardNumbers[i];
        
        cell.textContent = num;
        cell.dataset.number = num;
        cell.dataset.index = i;
        
        // Center cell
        if (i === 4) {
            cell.classList.add('center-cell');
        }
        
        cell.addEventListener('click', () => toggleMark(cell, num));
        grid.appendChild(cell);
    }
    
    wrapper.appendChild(grid);
    container.appendChild(wrapper);
}

// Create coverall board
function createCoverallBoard(container, boardType) {
    const wrapper = document.createElement('div');
    wrapper.className = 'board-coverall-wrapper';
    
    // Labels
    const labels = document.createElement('div');
    labels.className = 'board-coverall-labels';
    boardType.labels.forEach(labelText => {
        const label = document.createElement('div');
        label.className = 'board-coverall-label';
        label.textContent = labelText;
        labels.appendChild(label);
    });
    wrapper.appendChild(labels);
    
    // Grid
    const grid = document.createElement('div');
    grid.className = 'board-coverall';
    
    for (let i = 0; i < 45; i++) {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        const num = gameState.boardNumbers[i];
        
        cell.textContent = num;
        cell.dataset.number = num;
        cell.dataset.index = i;
        
        // Center cell (position 22)
        if (i === 22) {
            cell.classList.add('center-cell');
        }
        
        cell.addEventListener('click', () => toggleMark(cell, num));
        grid.appendChild(cell);
    }
    
    wrapper.appendChild(grid);
    container.appendChild(wrapper);
}

// Check if cell is part of pattern
function isPatternCell(index, pattern) {
    const patternCells = {
        'x-pattern': [0, 4, 6, 8, 12, 16, 18, 20, 24],
        'frame': [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24],
        'postage-stamp': [0, 1, 5, 6, 18, 19, 23, 24],
        'small-diamond': [7, 11, 12, 13, 17]
    };
    
    return patternCells[pattern]?.includes(index) || false;
}

// Toggle mark on cell
function toggleMark(cell, number) {
    if (!gameState.gameActive || gameState.winClaimed) return;
    if (cell.classList.contains('center-cell') && !cell.dataset.number) return; // Skip free space
    
    if (cell.classList.contains('marked')) {
        cell.classList.remove('marked');
        gameState.markedNumbers.delete(number);
    } else {
        cell.classList.add('marked');
        gameState.markedNumbers.add(number);
        
        // Check for win after marking
        setTimeout(() => checkForWin(), 100);
    }
}

// Start new game
function startNewGame() {
    gameState.gameActive = true;
    gameState.winClaimed = false;
    gameState.calledNumbers = [];
    gameState.markedNumbers.clear();
    gameState.currentNumber = null;
    
    // Reset display
    document.getElementById('currentNumberDisplay').textContent = '';
    document.getElementById('calledNumbersBar').innerHTML = 
        '<span style="color: #888; font-style: italic;" class="amharic-text">ቁጥሮች ይጠራሉ...</span>';
    
    // Enable auto-call
    gameState.autoCallEnabled = true;
    document.getElementById('circularCallBtn').classList.add('calling');
    
    // Start calling numbers
    startAutoCall();
}

// Toggle auto-call
function toggleAutoCall() {
    gameState.autoCallEnabled = !gameState.autoCallEnabled;
    const btn = document.getElementById('circularCallBtn');
    
    if (gameState.autoCallEnabled) {
        btn.classList.add('calling');
        startAutoCall();
    } else {
        btn.classList.remove('calling');
        stopAutoCall();
    }
}

// Start auto-call
function startAutoCall() {
    if (gameState.callInterval) {
        clearInterval(gameState.callInterval);
    }
    
    gameState.callInterval = setInterval(() => {
        if (gameState.gameActive && gameState.autoCallEnabled) {
            callNumber();
        }
    }, CONFIG.AUTO_CALL_INTERVAL);
    
    // Call first number immediately
    setTimeout(() => callNumber(), 1000);
}

// Stop auto-call
function stopAutoCall() {
    if (gameState.callInterval) {
        clearInterval(gameState.callInterval);
        gameState.callInterval = null;
    }
}

// Call a number
function callNumber() {
    if (!gameState.gameActive || gameState.winClaimed) return;
    
    const boardType = CONFIG.BOARD_TYPES.find(t => t.id === gameState.gameType);
    if (!boardType) return;
    
    let number;
    do {
        number = Math.floor(Math.random() * boardType.range) + 1;
    } while (gameState.calledNumbers.includes(number) && gameState.calledNumbers.length < boardType.range);
    
    gameState.calledNumbers.push(number);
    
    // Format display based on game type
    let display = number.toString();
    if (['75ball', '50ball', 'pattern'].includes(gameState.gameType)) {
        const letters = 'BINGO';
        const columnSize = gameState.gameType === '75ball' ? 15 : 10;
        const columnIndex = Math.floor((number - 1) / columnSize);
        const letter = letters[Math.min(columnIndex, 4)];
        display = `${letter}-${number}`;
    }
    
    // Update display
    if (gameState.currentNumber) {
        addCalledNumberToBar(gameState.currentNumber);
    }
    
    gameState.currentNumber = display;
    document.getElementById('currentNumberDisplay').textContent = display;
    
    // Play sound
    const audio = document.getElementById('callAudio');
    audio.currentTime = 0;
    audio.play().catch(() => {});
    
    // Check if number is on player's board
    checkBoardForNumber(number);
    
    // Check for win
    checkForWin();
}

// Add called number to bar
function addCalledNumberToBar(number) {
    const bar = document.getElementById('calledNumbersBar');
    const span = document.createElement('span');
    span.className = 'called-number amharic-text';
    span.textContent = number;
    
    // Add to beginning
    if (bar.firstChild) {
        bar.insertBefore(span, bar.firstChild);
    } else {
        bar.appendChild(span);
    }
    
    // Limit displayed numbers
    const numbers = bar.querySelectorAll('.called-number');
    if (numbers.length > CONFIG.MAX_CALLED_NUMBERS_DISPLAY) {
        numbers[numbers.length - 1].remove();
    }
}

// Check board for called number
function checkBoardForNumber(number) {
    const cells = document.querySelectorAll('.board-cell[data-number]');
    cells.forEach(cell => {
        const cellNumber = parseInt(cell.dataset.number);
        if (cellNumber === number && !cell.classList.contains('marked')) {
            // Highlight the cell
            cell.style.animation = 'pulse 0.5s 3';
            setTimeout(() => {
                cell.style.animation = '';
            }, 1500);
        }
    });
}

// Check for win
function checkForWin() {
    if (!gameState.gameActive || gameState.winClaimed) return;
    
    const win = checkWinningPattern();
    if (win) {
        // Enable win button
        const announceBtn = document.getElementById('announceBtn');
        announceBtn.style.background = '#ffd700';
        announceBtn.style.color = '#0d47a1';
        announceBtn.style.borderColor = '#28a745';
        
        // Highlight winning cells
        highlightWinningCells(win.pattern);
    }
}

// Check winning pattern
function checkWinningPattern() {
    const patterns = CONFIG.WINNING_PATTERNS[gameState.gameType];
    if (!patterns) return null;
    
    for (const pattern of patterns) {
        if (checkPattern(pattern)) {
            return { pattern };
        }
    }
    
    return null;
}

// Check specific pattern
function checkPattern(pattern) {
    switch(gameState.gameType) {
        case '75ball':
        case '50ball':
            return check5x5Pattern(pattern);
        case '90ball':
            return check90BallPattern(pattern);
        case '30ball':
            return check30BallPattern(pattern);
        case 'pattern':
            return checkPatternBingo(pattern);
        case 'coverall':
            return checkCoverallPattern(pattern);
        default:
            return false;
    }
}

// Check 5x5 patterns
function check5x5Pattern(pattern) {
    const cells = Array.from(document.querySelectorAll('.board-cell'));
    const markedIndices = new Set();
    
    cells.forEach((cell, index) => {
        if (cell.classList.contains('marked') || 
            (cell.classList.contains('center-cell') && gameState.gameType === '75ball')) {
            markedIndices.add(index);
        }
    });
    
    switch(pattern) {
        case 'row':
            for (let row = 0; row < 5; row++) {
                let complete = true;
                for (let col = 0; col < 5; col++) {
                    const index = row * 5 + col;
                    if (!markedIndices.has(index)) {
                        complete = false;
                        break;
                    }
                }
                if (complete) return true;
            }
            return false;
            
        case 'column':
            for (let col = 0; col < 5; col++) {
                let complete = true;
                for (let row = 0; row < 5; row++) {
                    const index = row * 5 + col;
                    if (!markedIndices.has(index)) {
                        complete = false;
                        break;
                    }
                }
                if (complete) return true;
            }
            return false;
            
        case 'diagonal':
            // Main diagonal
            let diag1 = true;
            for (let i = 0; i < 5; i++) {
                const index = i * 5 + i;
                if (!markedIndices.has(index)) {
                    diag1 = false;
                    break;
                }
            }
            if (diag1) return true;
            
            // Anti-diagonal
            let diag2 = true;
            for (let i = 0; i < 5; i++) {
                const index = i * 5 + (4 - i);
                if (!markedIndices.has(index)) {
                    diag2 = false;
                    break;
                }
            }
            return diag2;
            
        case 'four-corners':
            const corners = [0, 4, 20, 24];
            return corners.every(index => markedIndices.has(index));
            
        case 'full-house':
            return markedIndices.size >= 25;
            
        default:
            return false;
    }
}

// Check 90-ball patterns
function check90BallPattern(pattern) {
    const rows = 3;
    const cols = 9;
    let completedRows = 0;
    
    for (let row = 0; row < rows; row++) {
        let rowComplete = true;
        for (let col = 0; col < cols; col++) {
            const index = row * cols + col;
            const cell = document.querySelector(`.board-cell[data-index="${index}"]`);
            if (cell && cell.dataset.number && cell.dataset.number !== '0' && 
                !cell.classList.contains('marked')) {
                rowComplete = false;
                break;
            }
        }
        if (rowComplete) completedRows++;
    }
    
    switch(pattern) {
        case 'one-line':
            return completedRows >= 1;
        case 'two-lines':
            return completedRows >= 2;
        case 'full-house':
            const totalCells = document.querySelectorAll('.board-cell[data-number]:not(.blank-cell)').length;
            const markedCells = document.querySelectorAll('.board-cell.marked').length;
            return markedCells >= totalCells;
        default:
            return false;
    }
}

// Check 30-ball pattern
function check30BallPattern(pattern) {
    if (pattern === 'full-house') {
        const totalCells = document.querySelectorAll('.board-cell[data-number]').length;
        const markedCells = document.querySelectorAll('.board-cell.marked').length;
        return markedCells >= totalCells;
    }
    return false;
}

// Check pattern bingo
function checkPatternBingo(pattern) {
    const patternCells = {
        'x-pattern': [0, 4, 6, 8, 12, 16, 18, 20, 24],
        'frame': [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24],
        'postage-stamp': [0, 1, 5, 6, 18, 19, 23, 24],
        'small-diamond': [7, 11, 12, 13, 17]
    };
    
    const cells = patternCells[pattern];
    if (!cells) return false;
    
    return cells.every(index => {
        const cell = document.querySelector(`.board-cell[data-index="${index}"]`);
        return cell && (cell.classList.contains('marked') || 
               (cell.classList.contains('center-cell') && index === 12));
    });
}

// Check coverall pattern
function checkCoverallPattern(pattern) {
    if (pattern === 'full-board') {
        const totalCells = document.querySelectorAll('.board-cell[data-number]').length;
        const markedCells = document.querySelectorAll('.board-cell.marked').length;
        return markedCells >= totalCells;
    }
    return false;
}

// Highlight winning cells
function highlightWinningCells(pattern) {
    const cells = document.querySelectorAll('.board-cell');
    cells.forEach(cell => {
        cell.classList.remove('winner-cell');
    });
    
    // Add winner indicator to center cell
    const centerCell = document.querySelector('.center-cell');
    if (centerCell) {
        centerCell.classList.add('winner-ready');
        centerCell.innerHTML = '🏆';
    }
}

// Announce win
function announceWin() {
    if (!gameState.gameActive) {
        showNotification('ጨዋታ አልተጀመረም', false);
        return;
    }
    
    if (gameState.winClaimed) {
        showNotification('ቀድሞውኑ አሸንተዋል', false);
        return;
    }
    
    const win = checkWinningPattern();
    if (!win) {
        showNotification('አሸናፊ ንድፍ አልተጠናቀቀም', false);
        return;
    }
    
    // Calculate win amount
    const winAmount = calculatePotentialWin(gameState.stake);
    gameState.totalWon += winAmount;
    gameState.winClaimed = true;
    
    // Stop auto-call
    stopAutoCall();
    document.getElementById('circularCallBtn').classList.remove('calling');
    
    // Update member status
    const playerMember = gameState.members.find(m => m.name === gameState.playerName);
    if (playerMember) {
        playerMember.won = true;
        playerMember.balance += winAmount;
    }
    
    // Show winner notification
    document.getElementById('winnerName').textContent = gameState.playerName;
    document.getElementById('winPattern').textContent = getPatternName(win.pattern);
    document.getElementById('displayWinAmount').textContent = `${winAmount.toLocaleString()} ብር`;
    document.getElementById('winnerNotification').style.display = 'block';
    
    // Play win sound
    const audio = document.getElementById('winAudio');
    audio.currentTime = 0;
    audio.play().catch(() => {});
    
    // Disable announce button
    document.getElementById('announceBtn').disabled = true;
}

// Continue game
function continueGame() {
    document.getElementById('winnerNotification').style.display = 'none';
    gameState.gameActive = false;
    gameState.winClaimed = false;
    document.getElementById('announceBtn').disabled = false;
    
    // Reset board for new game
    showPage(2);
}

// Update finance display
function updateFinance() {
    const balance = gameState.payment + gameState.totalWon - gameState.totalWithdrawn;
    const withdrawAmount = Math.floor(balance * 0.97); // 3% service charge
    
    document.getElementById('totalPayment').value = `${gameState.payment.toLocaleString()} ብር`;
    document.getElementById('totalWon').value = `${gameState.totalWon.toLocaleString()} ብር`;
    document.getElementById('currentBalance').value = `${balance.toLocaleString()} ብር`;
    document.getElementById('withdrawAmount').value = `${withdrawAmount.toLocaleString()} ብር`;
}

// Process withdrawal
function processWithdrawal() {
    const account = document.getElementById('withdrawAccount').value.trim();
    const amount = parseInt(document.getElementById('withdrawAmount').value.replace(/[^0-9]/g, ''));
    const balance = gameState.payment + gameState.totalWon - gameState.totalWithdrawn;
    
    if (!account) {
        showNotification('የአካውንት ቁጥር ያስገቡ', false);
        return;
    }
    
    if (amount < 25) {
        showNotification('ዝቅተኛ መጠን 25 ብር', false);
        return;
    }
    
    if (amount > balance) {
        showNotification('በቂ ሚዛን የለም', false);
        return;
    }
    
    gameState.totalWithdrawn += amount;
    updateFinance();
    
    showNotification(`${amount.toLocaleString()} ብር በተሳካ ሁኔታ ተወግዷል!`, false);
    document.getElementById('withdrawAccount').value = '';
}

// Show notification
function showNotification(message, showContinue = false) {
    document.getElementById('notificationText').textContent = message;
    document.getElementById('continueBtn').style.display = showContinue ? 'flex' : 'none';
    document.getElementById('notification').style.display = 'block';
}

// Hide notification
function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

// Continue with incomplete registration
function continueWithIncomplete() {
    hideNotification();
    
    // Fill missing data with defaults
    if (!gameState.playerName) {
        gameState.playerName = 'Guest_' + Math.floor(Math.random() * 1000);
        document.getElementById('playerName').value = gameState.playerName;
    }
    
    if (!gameState.playerPhone) {
        gameState.playerPhone = '091' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
        document.getElementById('playerPhone').value = gameState.playerPhone;
    }
    
    if (!gameState.stake) {
        gameState.stake = 25;
        document.getElementById('playerStake').value = '25';
    }
    
    if (!gameState.payment) {
        gameState.payment = 25;
    }
    
    // Proceed to game
    showPage(3);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);

// Make functions available globally
window.showPage = showPage;
window.showHelpTab = showHelpTab;
window.showMembers = showMembers;
window.showPotentialWin = showPotentialWin;
window.closeModal = closeModal;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.continueWithIncomplete = continueWithIncomplete;
window.processPayment = processPayment;
window.updatePotentialWin = updatePotentialWin;
window.processWithdrawal = processWithdrawal;
window.continueGame = continueGame;
window.toggleMark = toggleMark;
window.announceWin = announceWin;

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (gameState.gameType) {
            generateGameBoard();
        }
    }, 100);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('members-modal')) {
        closeModal('membersModal');
    }
    if (e.target.classList.contains('potential-win-modal')) {
        closeModal('potentialWinModal');
    }
});

// Ensure boards fit on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (gameState.gameType && currentPage === 3) {
            generateGameBoard();
        }
    }, 250);
});