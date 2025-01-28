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

    updatePosition(foodX, foodY) {
        if (this.x === foodX && this.y === foodY) {
            this.body.push([foodX, foodY]);
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
const scoreElement = document.querySelector(".score");

let gameOver = false;
let foodX = 13, foodY = 10;

const snake1 = new Snake(5, 10, "player1");
const snake2 = new Snake(25, 20, "player2");
let setIntervalId;

const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    alert(`Game Over!\nPlayer 1 Score: ${snake1.score}\nPlayer 2 Score: ${snake2.score}`);
    location.reload();
};

const changeDirection = (e) => {
    if (e.key === "ArrowUp" && snake1.velocityY === 0) {
        snake1.velocityX = 0;
        snake1.velocityY = -1;
    } else if (e.key === "ArrowDown" && snake1.velocityY === 0) {
        snake1.velocityX = 0;
        snake1.velocityY = 1;
    } else if (e.key === "ArrowLeft" && snake1.velocityX === 0) {
        snake1.velocityX = -1;
        snake1.velocityY = 0;
    } else if (e.key === "ArrowRight" && snake1.velocityX === 0) {
        snake1.velocityX = 1;
        snake1.velocityY = 0;
    }

    if (e.key === "w" && snake2.velocityY === 0) {
        snake2.velocityX = 0;
        snake2.velocityY = -1;
    } else if (e.key === "s" && snake2.velocityY === 0) {
        snake2.velocityX = 0;
        snake2.velocityY = 1;
    } else if (e.key === "a" && snake2.velocityX === 0) {
        snake2.velocityX = -1;
        snake2.velocityY = 0;
    } else if (e.key === "d" && snake2.velocityX === 0) {
        snake2.velocityX = 1;
        snake2.velocityY = 0;
    }
};

const initGame = () => {
    if (gameOver) return handleGameOver();

    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snake1.updatePosition(foodX, foodY)) {
        changeFoodPosition();
    }

    if (snake2.updatePosition(foodX, foodY)) {
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
    scoreElement.innerHTML = `Player 1 Score: ${snake1.score} | Player 2 Score: ${snake2.score}`;
};

changeFoodPosition();
setIntervalId = setInterval(initGame, 200);
document.addEventListener("keydown", changeDirection);