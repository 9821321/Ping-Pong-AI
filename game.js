const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Create a rectangle
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Create a circle
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Create text
function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "45px Arial";
    ctx.fillText(text, x, y);
}

// Create the user paddle
const user = {
    x: 0, 
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "WHITE",
    score: 0,
    misses: 0 // Track user misses
}

// Create the AI paddle
const ai = {
    x: canvas.width - 10,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "WHITE",
    score: 0,
    misses: 0 // Track AI misses
}

// Create the ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "WHITE"
}

// Create the net
const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10,
    color: "WHITE"
}

// Draw the net
function drawNet() {
    for(let i = 0; i <= canvas.height; i += 15) {
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// Draw the paddles
function drawPaddle(x, y, width, height, color) {
    drawRect(x, y, width, height, color);
}

// Move the paddles
canvas.addEventListener("mousemove", movePaddle);

function movePaddle(evt) {
    let rect = canvas.getBoundingClientRect();
    user.y = evt.clientY - rect.top - user.height / 2;
}

// Ball collision detection
function collision(b, p) {
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 5;
}

// Update the game state
function update() {
    // Move the ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Improved AI speed (increase AI's response speed)
    ai.y += (ball.y - (ai.y + ai.height / 2)) * 0.3; // Increased AI speed

    // Check for collision with walls
    if(ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.velocityY = -ball.velocityY;
    }

    // Check for collision with paddles
    let player = (ball.x < canvas.width / 2) ? user : ai;

    if(collision(ball, player)) {
        // Calculate where the ball hit the paddle
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);

        // Calculate the angle of the ball after collision
        let angleRad = collidePoint * (Math.PI / 4);

        // Change the ball's direction
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Increase the ball speed
        ball.speed += 0.5;
    }

    // Update the score or misses if the ball goes out of bounds
    if(ball.x - ball.radius < 0) {
        ai.score++;
        user.misses++;
        resetBall();
    } else if(ball.x + ball.radius > canvas.width) {
        user.score++;
        ai.misses++;
        resetBall();
    }
}

// Check if a player has missed 3 times
function checkGameOver() {
    if(user.misses === 3) {
        drawText("AI Wins! Press R to Restart", canvas.width / 2 - 200, canvas.height / 2, "WHITE");
        return true;
    }
    if(ai.misses === 3) {
        drawText("You Win! Press R to Restart", canvas.width / 2 - 200, canvas.height / 2, "WHITE");
        return true;
    }
    return false;
}

// Restart the game
function restartGame() {
    user.score = 0;
    ai.score = 0;
    user.misses = 0;
    ai.misses = 0;
    resetBall();
}

// Listen for restart key (press "R" to restart the game)
window.addEventListener("keydown", function(event) {
    if(event.key === "r" || event.key === "R") {
        restartGame();
    }
});

// Render the game
function render() {
    // Clear the canvas
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");

    // Draw the net
    drawNet();

    // Draw the score
    drawText(user.score, canvas.width / 4, canvas.height / 5, "WHITE");
    drawText(ai.score, 3 * canvas.width / 4, canvas.height / 5, "WHITE");

    // Draw the paddles
    drawPaddle(user.x, user.y, user.width, user.height, user.color);
    drawPaddle(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Draw the ball
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Game loop
function game() {
    if (!checkGameOver()) {
        update();
        render();
    }
}

// Number of frames per second
const framePerSecond = 50;

// Call the game function 50 times every second
setInterval(game, 1000 / framePerSecond);
