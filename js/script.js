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

    updatePosition(foods) {
        // Verificamos si la cabeza de la serpiente ha comido alguna comida
        const foodIndex = foods.findIndex(food => food.x === this.x && food.y === this.y);
        
        if (foodIndex !== -1) {
            // Si la serpiente ha comido la comida, eliminamos la comida del array
            foods.splice(foodIndex, 1);
            this.body.push([this.x, this.y]);
            this.score++;
            return true;
        }

        for (let i = this.body.length - 1; i > 0; i--) {
            this.body[i] = this.body[i - 1];
        }

        this.body[0] = [this.x, this.y];
        this.x += this.velocityX;
        this.y += this.velocityY;
        return false;
    }

    isCollidingWithSelf() {
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[0][0] === this.body[i][0] && this.body[0][1] === this.body[i][1]) {
                return true;
            }
        }
        return false;
    }

    isCollidingWith(otherSnake) {
        for (let i = 0; i < otherSnake.body.length; i++) {
            if (this.body[0][0] === otherSnake.body[i][0] && this.body[0][1] === otherSnake.body[i][1]) {
                return true;
            }
        }
        return false;
    }

    render() {
        return this.body.map(segment => `<div class="head ${this.colorClass}" style="grid-area: ${segment[1]} / ${segment[0]}"></div>`).join("");
    }
}

const playBoard = document.querySelector(".play-board");
const scorePlayer1Element = document.querySelector(".score-player1");
const scorePlayer2Element = document.querySelector(".score-player2");

let gameOver = false;
let foods = []; 
const snake1 = new Snake(4, 15, "player1");
const snake2 = new Snake(26, 15, "player2");
let setIntervalId;

let countdownTime = 120; // Inicializamos el temporizador
const timerElement = document.querySelector(".timer"); 

let timerStarted = false; // Indicador para saber si el temporizador ha comenzado

const generateFood = () => {
    const foodX = Math.floor(Math.random() * 30) + 1;
    const foodY = Math.floor(Math.random() * 30) + 1;
    return { x: foodX, y: foodY };
};

const changeFoodPosition = () => {
    // Siempre habrá 3 piezas de comida
    while (foods.length < 3) {
        const newFood = generateFood();
        // Evitaque la comida aparezca donde están las serpientes
        const isFoodOnSnake = snake1.body.some(segment => segment[0] === newFood.x && segment[1] === newFood.y) || 
                              snake2.body.some(segment => segment[0] === newFood.x && segment[1] === newFood.y);
        if (!isFoodOnSnake) {
            foods.push(newFood);
        }
    }
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    alert(`Game Over!\nPlayer 1: ${snake1.score}\nPlayer 2: ${snake2.score}`);
    location.reload();
};

const changeDirection = (e) => {
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
};

const updateTimer = () => {
    if (countdownTime > 0) {
        countdownTime--;
        timerElement.innerHTML = `⏱️ ${countdownTime}s`;
    } else {
        gameOver = true; 
    }
};

const initGame = () => {
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
};

const startTimer = () => {
    // Comenzar el temporizador solo cuando hacemos clic en multi
    if (!timerStarted) {
        timerElement.innerHTML = `⏱️ ${countdownTime}s`;  // Muestra valor iniciaL
        setIntervalId = setInterval(updateTimer, 1000); 
        timerStarted = true; // Temp iniciado
    }
};

// Inicio del juego en multiplayer
const multiplayerButton = document.querySelector(".multiplayer-button");
const pantallaInicio = document.getElementById("pantalla-inicio");
const wrapper = document.querySelector(".wrapper");

multiplayerButton.addEventListener("click", () => {
    
    pantallaInicio.style.display = "none";
    wrapper.classList.remove("hidden");

    // Inicio temporizador
    startTimer();

   
});

setInterval(initGame, 125);

changeFoodPosition();

document.addEventListener("keydown", changeDirection);
