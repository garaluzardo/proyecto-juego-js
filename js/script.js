class Snake {
    constructor(startX, startY, colorClass) {
        this.x = startX;
        this.y = startY;
        this.body = [];
        this.velocityX = 0;
        this.velocityY = 0;
        this.score = 0;
        this.colorClass = colorClass;
    }

    // Actualiza la posición de la serpiente y comprueba si ha comido
    updatePosition(foods) {
        const foodIndex = foods.findIndex(food => food.x === this.x && food.y === this.y);

        if (foodIndex !== -1) {
            // Si la serpiente ha comido la comida, eliminamos la comida del array
            foods.splice(foodIndex, 1);
            this.body.push([this.x, this.y]);
            this.score++;
            return true;
        }

        // Desplazamiento del cuerpo de la serpiente
        for (let i = this.body.length - 1; i > 0; i--) {
            this.body[i] = this.body[i - 1];
        }

        this.body[0] = [this.x, this.y];
        this.x += this.velocityX;
        this.y += this.velocityY;
        return false;
    }

    // Verifica si la serpiente colisiona consigo misma
    isCollidingWithSelf() {
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[0][0] === this.body[i][0] && this.body[0][1] === this.body[i][1]) {
                return true;
            }
        }
        return false;
    }

    // Verifica si la serpiente colisiona con la otra
    isCollidingWith(otherSnake) {
        for (let i = 0; i < otherSnake.body.length; i++) {
            if (this.body[0][0] === otherSnake.body[i][0] && this.body[0][1] === otherSnake.body[i][1]) {
                return true;
            }
        }
        return false;
    }

    // Renderiza el cuerpo de la serpiente como divs en el tablero
    render() {
        return this.body.map(segment => `<div class="head ${this.colorClass}" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`).join("");
    }
}

// Elementos HTML clave
const playBoard = document.querySelector(".play-board");
const scorePlayer1Element = document.querySelector(".score-player1");
const scorePlayer2Element = document.querySelector(".score-player2");
const gameOverScreen = document.getElementById("gameover-screen");
const timerElement = document.querySelector(".timer");
const snake1 = new Snake(4, 15, "player1");
const snake2 = new Snake(26, 15, "player2");
const fakeScreen = document.getElementById("fakescreen");
const music = document.getElementById("trollmusic");
const backgroundMusic = document.getElementById("background-music"); // Audio en loop
const startScreen = document.getElementById("start-screen");
const wrapper = document.getElementById("wrapper");
const multiplayerButton = document.querySelector(".multiplayer-button");

let gameOver = false;
let foods = [];  // Lista de comidas
let gameLoopIntervalId; // Para el game loop
let timerIntervalId;    // Para el temporizador
let countdownTime = 120; // Inicializamos el temporizador

// Eventos 
document.addEventListener("DOMContentLoaded", () => {
    // Inicialmente, solo mostrar #start-screen
    startScreen.style.display = "block";
    wrapper.style.display = "none";
    gameOverScreen.style.display = "none";
    fakeScreen.style.display = "none";

    // Loop musical de fondo
    backgroundMusic.loop = true; 
    backgroundMusic.play();

    // Movimiento serpientes
    document.addEventListener("keydown", changeDirection);

    // Evento singleplayer
    document.querySelector(".singleplayer-button").addEventListener("click", function () {
        startScreen.style.display = "none";
        wrapper.style.display = "none";
        gameOverScreen.style.display = "none";
        fakeScreen.style.display = "flex";
        music.play();
        backgroundMusic.pause();
    });

    // Evento restart desde fakescreen
    document.querySelector(".troll-restart").addEventListener("click", function () {
        startScreen.style.display = "flex";
        wrapper.style.display = "none";
        gameOverScreen.style.display = "none";
        fakeScreen.style.display = "none";
        music.pause();
        music.currentTime = 0;
        backgroundMusic.play();
        backgroundMusic.currentTime = 0;
    });

    // Evento multiplayer
    document.querySelector(".multiplayer-button").addEventListener("click", function () {
        startScreen.style.display = "none";
        wrapper.style.display = "flex";
        gameOverScreen.style.display = "none";
        fakeScreen.style.display = "none";
       
        countdownTime = 120;
        updateTimer(); 

        // Limpiar intervalos previos
        if (gameLoopIntervalId) {
            clearInterval(gameLoopIntervalId);
        }
        if (timerIntervalId) {
            clearInterval(timerIntervalId);
        }

        // Iniciar los intervalos con identificadores separados
        gameLoopIntervalId = setInterval(initGame, 125);  // Iniciar el game loop
        timerIntervalId = setInterval(updateTimer, 1000); // Iniciar el temporizador

        document.addEventListener("keydown", changeDirection);
    });

    // Evento restart desde gameover screen
    document.querySelector(".gameover-button").addEventListener("click", function () {
        clearInterval(gameLoopIntervalId);
        clearInterval(timerIntervalId);
        resetGame();
        startScreen.style.display = "flex";
        wrapper.style.display = "none";
        gameOverScreen.style.display = "none";
        fakeScreen.style.display = "none";
    });
});

// GameLoop functions
function generateFood() {
    const foodX = Math.floor(Math.random() * 30) + 1;
    const foodY = Math.floor(Math.random() * 30) + 1;
    return { x: foodX, y: foodY };
}

function changeFoodPosition() {
    // Siempre habrá 3 piezas de comida
    while (foods.length < 3) {
        const newFood = generateFood();
        // Evitar que la comida aparezca donde están las serpientes
        const isFoodOnSnake = snake1.body.some(segment => segment[0] === newFood.x && segment[1] === newFood.y) ||
            snake2.body.some(segment => segment[0] === newFood.x && segment[1] === newFood.y);
        if (!isFoodOnSnake) {
            foods.push(newFood);
        }
    }
}

function changeDirection(e) {
    if (e.key === "w" && snake1.velocityY === 0) {
        snake1.velocityX = 0;
        snake1.velocityY = -1;
    } else if (e.key === "s" && snake1.velocityY === 0) {
        snake1.velocityX = 0;
        snake1.velocityY = 1;
    } else if (e.key === "a" && snake1.velocityX === 0) {
        snake1.velocityX = -1;
        snake1.velocityY = 0;
    } else if (e.key === "d" && snake1.velocityX === 0) {
        snake1.velocityX = 1;
        snake1.velocityY = 0;
    }

    if (e.key === "ArrowUp" && snake2.velocityY === 0) {
        snake2.velocityX = 0;
        snake2.velocityY = -1;
    } else if (e.key === "ArrowDown" && snake2.velocityY === 0) {
        snake2.velocityX = 0;
        snake2.velocityY = 1;
    } else if (e.key === "ArrowLeft" && snake2.velocityX === 0) {
        snake2.velocityX = -1;
        snake2.velocityY = 0;
    } else if (e.key === "ArrowRight" && snake2.velocityX === 0) {
        snake2.velocityX = 1;
        snake2.velocityY = 0;
    }
}

function updateTimer() {
    if (countdownTime > 0) {
        countdownTime--;
        timerElement.innerHTML = `⏱️ ${countdownTime}s`;
    } else {
        gameOver = true;
        handleGameOver();
    }
}

function handleGameOver() {
    clearInterval(timerIntervalId); // Detener solo el temporizador
    startScreen.style.display = "none";
    wrapper.style.display = "flex";
    gameOverScreen.style.display = "flex";
    scorePlayer1Element.innerText = `Player 1 score: ${snake1.score}`;
    scorePlayer2Element.innerText = `Player 2 score: ${snake2.score}`;
}

function resetGame() {
    // Limpiar intervalos anteriores
    if (gameLoopIntervalId) {
        clearInterval(gameLoopIntervalId);
    }
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }

    // Reiniciar el estado del juego
    snake1.x = 4;
    snake1.y = 15;
    snake1.body = [];
    snake1.velocityX = 0;
    snake1.velocityY = 0;
    snake1.score = 0;

    snake2.x = 26;
    snake2.y = 15;
    snake2.body = [];
    snake2.velocityX = 0;
    snake2.velocityY = 0;
    snake2.score = 0;

    foods = [];

    countdownTime = 120;
    gameOver = false;

    changeFoodPosition();
    playBoard.innerHTML = '';
    scorePlayer1Element.innerText = `Player 1 score: 0`;
    scorePlayer2Element.innerText = `Player 2 score: 0`;

    // Reiniciar los intervalos
    gameLoopIntervalId = setInterval(initGame, 125);  // Game loop
    timerIntervalId = setInterval(updateTimer, 1000); // Temporizador
}

// GameLoop funciton
function initGame() {
    if (gameOver) return handleGameOver();

    let htmlMarkup = "";

    foods.forEach(food => {
        htmlMarkup += `<div class="food" style="grid-area: ${food.y} / ${food.x}"></div>`;
    });

    // Verificamos si las serpientes comieron alguna comida y cambiamos su posición
    if (snake1.updatePosition(foods)) {
        changeFoodPosition();
    }

    if (snake2.updatePosition(foods)) {
        changeFoodPosition();
    }

    if (snake1.x <= 0 || snake1.x > 30 || snake1.y <= 0 || snake1.y > 30 || snake2.x <= 0 || snake2.x > 30 || snake2.y <= 0 || snake2.y > 30) {
        gameOver = true;
    }

    if (snake1.isCollidingWithSelf() || snake2.isCollidingWithSelf() || snake1.isCollidingWith(snake2) || snake2.isCollidingWith(snake1)) {
        gameOver = true;
    }

    htmlMarkup += snake1.render();
    htmlMarkup += snake2.render();

    playBoard.innerHTML = htmlMarkup;

    // Puntos de cada jugador por separado
    scorePlayer1Element.innerHTML = `Player 1: ${snake1.score}`;
    scorePlayer2Element.innerHTML = `Player 2: ${snake2.score}`;
}

// Iniciar el juego con el intervalo original (cada 125 ms para movimiento)
gameLoopIntervalId = setInterval(initGame, 125);

changeFoodPosition();
