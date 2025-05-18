document.addEventListener('DOMContentLoaded', () => {
    // Game data
    const themes = {
        frutas: [
            'maçã', 'banana', 'laranja', 'morango', 'abacaxi',
            'uva', 'melancia', 'kiwi', 'manga', 'pêssego'
        ],
        animais: [
            'cachorro', 'gato', 'elefante', 'girafa', 'tigre',
            'leão', 'macaco', 'zebra', 'rinoceronte', 'panda'
        ],
        paises: [
            'brasil', 'canadá', 'japão', 'austrália', 'alemanha',
            'frança', 'itália', 'espanha', 'méxico', 'argentina'
        ],
        tecnologia: [
            'computador', 'smartphone', 'internet', 'aplicativo', 'software',
            'hardware', 'robô', 'algoritmo', 'inteligência', 'blockchain'
        ],

        // Novos temas atuais com 10 itens cada

        seriesEFilmes: [
            'terraformars', 'oeternauta', 'starwars', 'fundacao', 'andor',
            'wildflowers', 'cowboybebop', 'obrasil', 'sucession', 'rickemorty'
        ],
        musicasEArtistas: [
            'dancinha', 'anitta', 'drake', 'billieeilish', 'badbunny',
            'olodum', 'djzol', 'lollapalooza', 'rockinrio', 'coldplay'
        ],
        tecnologiasEmergentes: [
            'iagenerativa', 'blockchain', 'metaverso', 'quantica',
            'biometria', 'internetdascoisas', 'veiculoseletricos', 'drones', 'roboescolha'
        ],
        celebridades: [
            'whinderssonnunes', 'jairbolsonaro', 'gusmarionet', 'karolconka', 'pablosantoro',
            'naomiosaka', 'manogavassi', 'felipeneto', 'ludmilla', 'juliette'
        ],
        eventosRecentes: [
            'olimpiadessaopaulo', 'linha6metro', 'leimaria', 'blackfriday',
            'paralimpicos', 'premiodaacademia', 'eurocopa', 'copaamerica'
        ],

        // Temas extras, se quiser ainda mais variedade

        memesVirais: [
            'rickroll', 'dogelord', 'distractedboyfriend', 'thisisfine', 'pepe',
            'grumpycat', 'harlemshake', 'planking', 'dancingbaby', 'ymca'
        ],
        gamesLançados: [
            'eldenring', 'forzahorizon5', 'haloInfinite', 'godofwar',
            'horizonforbiddenwest', 'valorant', 'apexlegends', 'minecraft', 'zelda'
        ]
    };


    // Game state
    let currentTheme = '';
    let currentWord = '';
    let guessedLetters = [];
    let wrongGuesses = 0;
    let maxWrongGuesses = 6;
    let recentThemes = [];
    let gameActive = false;

    // DOM elements
    const wordDisplayEl = document.getElementById('wordDisplay');
    const usedLettersEl = document.getElementById('usedLettersList');
    const keyboardEl = document.getElementById('keyboard');
    const gameStatusEl = document.getElementById('gameStatus');
    const newGameBtn = document.getElementById('newGameBtn');
    const currentThemeEl = document.getElementById('currentTheme');
    const hangmanParts = {
        head: document.getElementById('head'),
        body: document.getElementById('body'),
        leftArm: document.getElementById('left-arm'),
        rightArm: document.getElementById('right-arm'),
        leftLeg: document.getElementById('left-leg'),
        rightLeg: document.getElementById('right-leg'),
        face: document.getElementById('face')
    };

    // Initialize keyboard
    function createKeyboard() {
        keyboardEl.innerHTML = '';
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

        letters.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter.toUpperCase();
            button.className = 'letter-tile bg-orange-200 hover:bg-orange-300 text-orange-800 font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500';
            button.dataset.letter = letter;
            button.addEventListener('click', () => handleGuess(letter));
            keyboardEl.appendChild(button);
        });
    }

    // Start a new game
    function startNewGame() {
        // Reset game state
        guessedLetters = [];
        wrongGuesses = 0;
        gameActive = true;

        // Hide all hangman parts
        Object.values(hangmanParts).forEach(part => {
            if (part.id !== 'face') {
                part.classList.remove('visible');
            } else {
                part.style.opacity = '0';
            }
        });

        // Select a random theme (avoiding recent ones)
        const availableThemes = Object.keys(themes).filter(theme => !recentThemes.includes(theme));
        currentTheme = availableThemes[Math.floor(Math.random() * availableThemes.length)];

        // Update recent themes (keep last 2)
        recentThemes.push(currentTheme);
        if (recentThemes.length > 2) {
            recentThemes.shift();
        }

        // Select a random word from the theme
        const themeWords = themes[currentTheme];
        currentWord = themeWords[Math.floor(Math.random() * themeWords.length)];

        // Update UI
        currentThemeEl.textContent = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
        updateWordDisplay();
        updateUsedLetters();
        gameStatusEl.textContent = '';
        gameStatusEl.className = 'text-center mb-4 font-semibold text-lg';

        // Enable all keyboard buttons
        document.querySelectorAll('.letter-tile').forEach(button => {
            button.disabled = false;
            button.className = 'letter-tile bg-orange-200 hover:bg-orange-300 text-orange-800 font-medium py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500';
        });

        // Add fade-in effect to word display
        wordDisplayEl.classList.add('fade-in');
        setTimeout(() => wordDisplayEl.classList.remove('fade-in'), 300);
    }

    // Update the word display with underscores and guessed letters
    function updateWordDisplay() {
        wordDisplayEl.innerHTML = '';

        currentWord.split('').forEach(letter => {
            const letterEl = document.createElement('span');
            letterEl.className = 'inline-block w-8 h-10 flex items-center justify-center text-2xl font-bold border-b-2 border-gray-800';

            if (guessedLetters.includes(letter)) {
                letterEl.textContent = letter.toUpperCase();
                letterEl.classList.add('text-indigo-600');
            } else {
                letterEl.textContent = '_';
            }

            wordDisplayEl.appendChild(letterEl);
        });
    }

    // Update the list of used letters
    function updateUsedLetters() {
        const usedLetters = guessedLetters.filter(letter => !currentWord.includes(letter));
        usedLettersEl.textContent = usedLetters.map(l => l.toUpperCase()).join(', ');

        if (usedLetters.length === 0) {
            usedLettersEl.textContent = 'Nenhuma letra errada ainda';
        }
    }

    // Handle a letter guess
    function handleGuess(letter) {
        if (!gameActive) return;

        // Check if letter was already guessed
        if (guessedLetters.includes(letter)) {
            return;
        }

        // Add to guessed letters
        guessedLetters.push(letter);

        // Get the keyboard button
        const button = document.querySelector(`.letter-tile[data-letter="${letter}"]`);

        // Check if letter is in the word
        if (currentWord.includes(letter)) {
            // Correct guess
            button.className = 'letter-tile revealed bg-green-100 text-green-800 font-medium py-2 px-3 rounded-md cursor-default';
            button.disabled = true;

            // Add animation to the correct letter in the word
            wordDisplayEl.classList.add('fade-in');
            setTimeout(() => wordDisplayEl.classList.remove('fade-in'), 300);
        } else {
            // Wrong guess
            button.className = 'letter-tile wrong bg-red-100 text-red-800 font-medium py-2 px-3 rounded-md cursor-default';
            button.disabled = true;
            wrongGuesses++;

            // Add hangman part
            updateHangman();

            // Shake animation for wrong guess
            wordDisplayEl.classList.add('shake');
            setTimeout(() => wordDisplayEl.classList.remove('shake'), 400);
        }

        // Update displays
        updateWordDisplay();
        updateUsedLetters();

        // Check game status
        checkGameStatus();
    }

    // Update the hangman drawing
    function updateHangman() {
        switch (wrongGuesses) {
            case 1:
                hangmanParts.head.classList.add('visible');
                break;
            case 2:
                hangmanParts.body.classList.add('visible');
                break;
            case 3:
                hangmanParts.leftArm.classList.add('visible');
                break;
            case 4:
                hangmanParts.rightArm.classList.add('visible');
                break;
            case 5:
                hangmanParts.leftLeg.classList.add('visible');
                break;
            case 6:
                hangmanParts.rightLeg.classList.add('visible');
                hangmanParts.face.style.opacity = '1';
                break;
        }
    }

    // Check if the game is won or lost
    function checkGameStatus() {
        // Check for win
        const wordGuessed = currentWord.split('').every(letter => guessedLetters.includes(letter));

        if (wordGuessed) {
            gameActive = false;
            gameStatusEl.textContent = 'Parabéns! Você ganhou!';
            gameStatusEl.className = 'text-center mb-4 font-semibold text-lg text-green-600';

            // Confetti effect
            triggerConfetti();

            // Show result modal
            showResultModal('Parabéns!', 'Você acertou a palavra!');
            return;
        }

        // Check for loss
        if (wrongGuesses >= maxWrongGuesses) {
            gameActive = false;
            gameStatusEl.innerHTML = `Game Over! A palavra era: <span class="text-indigo-600">${currentWord.toUpperCase()}</span>`;
            gameStatusEl.className = 'text-center mb-4 font-semibold text-lg text-red-600';

            // Reveal all letters
            currentWord.split('').forEach(letter => {
                if (!guessedLetters.includes(letter)) {
                    guessedLetters.push(letter);
                }
            });
            updateWordDisplay();

            // Show result modal
            showResultModal('Que pena!', `Você perdeu. A palavra era: ${currentWord.toUpperCase()}`);
        }
    }

    // Simple confetti effect
    function triggerConfetti() {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'absolute w-2 h-2 rounded-full';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.top = `${-10}px`;
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

                document.body.appendChild(confetti);

                const animation = confetti.animate([
                    { top: '-10px', opacity: 1, transform: `rotate(${Math.random() * 360}deg)` },
                    { top: `${Math.random() * 100 + 100}%`, opacity: 0, transform: `rotate(${Math.random() * 360}deg)` }
                ], {
                    duration: 1000 + Math.random() * 2000,
                    easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
                });

                animation.onfinish = () => confetti.remove();
            }, i * 50);
        }
    }

    // Função para mostrar o popup
    function showResultModal(title, message) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('resultModal').classList.remove('hidden');
        document.getElementById('resultModal').classList.add('flex');
    }

    // Função para esconder o popup
    document.getElementById('closeModalBtn').onclick = function () {
        document.getElementById('resultModal').classList.add('hidden');
        document.getElementById('resultModal').classList.remove('flex');
        startNewGame(); // ou sua função para reiniciar o jogo
    };

    // Keyboard event listener
    document.addEventListener('keydown', (e) => {
        if (!gameActive) return;

        const key = e.key.toLowerCase();
        if (/^[a-z]$/.test(key)) {
            handleGuess(key);

            // Add visual feedback for keyboard press
            const button = document.querySelector(`.letter-tile[data-letter="${key}"]`);
            if (button) {
                button.classList.add('bg-orange-100');
                setTimeout(() => button.classList.remove('bg-orange-100'), 200);
            }
        }
    });

    // New game button
    newGameBtn.addEventListener('click', () => {
        startNewGame();
        newGameBtn.classList.add('transform', 'scale-95');
        setTimeout(() => newGameBtn.classList.remove('transform', 'scale-95'), 300);
    });

    // Initialize the game
    createKeyboard();
    startNewGame();
});
