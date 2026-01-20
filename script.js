const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

const paddleWidth = 16;
const paddleHeight = 100;
const ballSize = 18;

let player = {
  x: 10,
  y: height / 2 - paddleHeight / 2,
  dy: 0,
  speed: 6,
  score: 0
};

let computer = {
  x: width - 10 - paddleWidth,
  y: height / 2 - paddleHeight / 2,
  dy: 0,
  speed: 6,
  score: 0
};

let ball = {
  x: width / 2 - ballSize / 2,
  y: height / 2 - ballSize / 2,
  dx: 5 * (Math.random() > 0.5 ? 1 : -1),
  dy: 4 * (Math.random() * 2 - 1),
  speed: 5
};

function resetBall(direction) {
  ball.x = width / 2 - ballSize / 2;
  ball.y = height / 2 - ballSize / 2;
  ball.dx = 5 * direction;
  ball.dy = 4 * (Math.random() * 2 - 1);
}

function drawRect(x, y, w, h, color="#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color="#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  // Clear
  drawRect(0, 0, width, height, '#000');
  // Middle line
  for (let i = 0; i < height; i += 24) {
    drawRect(width/2 - 2, i, 4, 14, "#444");
  }
  // Paddles
  drawRect(player.x, player.y, paddleWidth, paddleHeight, "#0ff");
  drawRect(computer.x, computer.y, paddleWidth, paddleHeight, "#f80");
  // Ball
  drawCircle(ball.x + ballSize/2, ball.y + ballSize/2, ballSize/2, "#fff");
}

function update() {
  // Move player with keyboard
  player.y += player.dy;
  // Mouse control handled in event
  // Clamp paddle on top/bottom
  if (player.y < 0) player.y = 0;
  if (player.y + paddleHeight > height) player.y = height - paddleHeight;

  // Computer AI: follow the ball, make it imperfect
  if (computer.y + paddleHeight/2 < ball.y + ballSize/2 - 12) {
    computer.y += computer.speed * 0.85;
  } else if (computer.y + paddleHeight/2 > ball.y + ballSize/2 + 12) {
    computer.y -= computer.speed * 0.85;
  }
  // Clamp
  if (computer.y < 0) computer.y = 0;
  if (computer.y + paddleHeight > height) computer.y = height - paddleHeight;

  // Move ball
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top/bottom wall collision
  if (ball.y < 0) {
    ball.y = 0;
    ball.dy *= -1;
  }
  if (ball.y + ballSize > height) {
    ball.y = height - ballSize;
    ball.dy *= -1;
  }

  // Paddle collision detection
  // Player
  if (
    ball.x <= player.x + paddleWidth &&
    ball.y + ballSize > player.y &&
    ball.y < player.y + paddleHeight &&
    ball.x >= player.x
  ) {
    ball.x = player.x + paddleWidth;
    ball.dx *= -1.04; // slightly increase speed
    // Add paddle "english"
    let collidePoint = (ball.y + ballSize/2) - (player.y + paddleHeight/2);
    collidePoint /= paddleHeight/2;
    ball.dy = collidePoint * 6;
  }

  // Computer
  if (
    ball.x + ballSize >= computer.x &&
    ball.y + ballSize > computer.y &&
    ball.y < computer.y + paddleHeight &&
    ball.x + ballSize <= computer.x + paddleWidth + ballSize
  ) {
    ball.x = computer.x - ballSize;
    ball.dx *= -1.04;
    let collidePoint = (ball.y + ballSize/2) - (computer.y + paddleHeight/2);
    collidePoint /= paddleHeight/2;
    ball.dy = collidePoint * 6;
  }

  // Score: right wall
  if (ball.x < 0) {
    computer.score++;
    updateScoreboard();
    resetBall(1);
  }
  if (ball.x + ballSize > width) {
    player.score++;
    updateScoreboard();
    resetBall(-1);
  }
}

function updateScoreboard() {
  document.getElementById('playerScore').textContent = player.score;
  document.getElementById('computerScore').textContent = computer.score;
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowUp') {
    player.dy = -player.speed;
  } else if (e.key === 'ArrowDown') {
    player.dy = player.speed;
  }
});
document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    player.dy = 0;
  }
});

// Mouse controls: paddle follows mouse Y
canvas.addEventListener('mousemove', function(e) {
  let rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  player.y = mouseY - paddleHeight / 2;
  if (player.y < 0) player.y = 0;
  if (player.y + paddleHeight > height) player.y = height - paddleHeight;
});

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

updateScoreboard();
gameLoop();
