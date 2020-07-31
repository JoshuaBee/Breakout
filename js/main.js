var table = document.getElementById('table');
var bricks = [...document.querySelectorAll('.brick')];
var ball = document.getElementById('ball');
var paddle = document.getElementById('paddle');
var paddleBlocker = document.getElementById('paddle-blocker');
var scoreElement = document.getElementById('score');
var livesElement = document.getElementById('lives');

// Get the table dimensions.
var tableHeight = parseInt(window.getComputedStyle(table).height, 10);
var tableWidth = parseInt(window.getComputedStyle(table).width, 10);

// Get the paddles current position.
var paddleTop = parseInt(window.getComputedStyle(paddle).top, 10);
var paddleLeft = parseInt(window.getComputedStyle(paddle).left, 10);
var paddleHeight = parseInt(window.getComputedStyle(paddle).height, 10);
var paddleWidth = parseInt(window.getComputedStyle(paddle).width, 10);

// Get the balls current position.
var ballTop = parseInt(window.getComputedStyle(ball).top, 10);
var ballHeight = parseInt(window.getComputedStyle(ball).height, 10);
var ballLeft = parseInt(window.getComputedStyle(ball).left, 10);
var ballWidth = parseInt(window.getComputedStyle(ball).width, 10);

// Set inital conditions
var score = 0;
var lives = 1;
var verticalSpeed = 0;
var horizontalSpeed = 0;
var speed = 0;
const speedIncrease = 1;
var speedIncrease1 = false;
var speedIncrease2 = false;
var speedIncrease3 = false;
var speedIncrease4 = false;
var brokenBricks = 0;
var currentBrokenBricks = 0;
var stage = 1;

const columns = 14;
var availableRows = 1;
var availableBricks = bricks.slice(bricks.length - (columns * availableRows), bricks.length);

var aPressed = false;
var dPressed = false;

var frame;
const frames = 300;

function resetGame() {
	score = 0;
	scoreElement.innerHTML = score.toString().padStart(3, '0');;
	lives = 1;
	livesElement.innerHTML = lives;
	paddleBlocker.classList.add('hidden');
}

function resetStage() {
	// Reset Bricks
	bricks.forEach(brick => {
		brick.classList.remove('hidden');
	});
	brokenBricks = 0;
}

function resetLife() {
	// Set ball position
	ballTop = paddleTop - ballHeight - 5;
	ballLeft = ((tableWidth + ballWidth) / 2);

	// Set the speeds
	//verticalSpeed = 1;
	//horizontalSpeed = 2;
	verticalSpeed = (-0.5 * Math.random()) - 0.5;
	horizontalSpeed = 2 * Math.random() - 1;
	if (horizontalSpeed < 0) {
		horizontalSpeed = Math.min(horizontalSpeed, -0.5);
	}
	if (horizontalSpeed > 0) {
		horizontalSpeed = Math.max(horizontalSpeed, 0.5);
	}
	normalizeSpeeds();
	
	speed = 2;
	speedIncrease1 = false;
	speedIncrease2 = false;
	speedIncrease3 = false;
	speedIncrease4 = false;
	currentBrokenBricks = 0;
}

function normalizeSpeeds() {
	var norm = Math.sqrt(horizontalSpeed**2 + verticalSpeed**2);
	horizontalSpeed /= norm;
	verticalSpeed /= norm;
}

document.addEventListener('keydown', function(event){
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	
	// A pressed -> Paddle moves left
	aPressed = event.keyCode === 65;

	// D pressed -> Paddle moves right
	dPressed = event.keyCode === 68;
});

document.addEventListener('keyup', function(event){
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	
	// W pressed -> Paddle moves left
	if (event.keyCode === 65) {
		aPressed = false;
	}	

	// S pressed -> Paddle moves right
	if (event.keyCode === 68) {
		dPressed = false;
	}
});

document.addEventListener('DOMContentLoaded', function(event){
	resetGame();
	resetStage();
	resetLife();

	// Start the game
	clearInterval(frame);
	frame = setInterval(generateNextFrame, 1000 / frames);
});

function brickBounce() {
	var newBallTop = ballTop + (verticalSpeed * speed);
	var newBallLeft = ballLeft + (horizontalSpeed * speed);
	var newBallRight = newBallLeft + ballWidth;
	var newBallBottom = newBallTop + ballHeight;
	var bounce = false;

	availableBricks.every(brick => {
		if (brick.classList.contains('hidden')) {
			return true;
		}
	
		var rect = brick.getBoundingClientRect();
	
		if (!(
			(newBallBottom < rect.top) ||
			(newBallTop > rect.top + rect.height) ||
			(newBallRight < rect.left) ||
			(newBallLeft > rect.left + rect.width)
		)) {
			brick.classList.add('hidden');
			score += parseInt(brick.dataset.points);
			scoreElement.innerHTML = score.toString().padStart(3, '0');
			bounce = true;
			brokenBricks++;
			currentBrokenBricks++;

			// Start next stage
			if (stage === 1 & brokenBricks === bricks.length) {
				stage++;
				resetLife();
				resetStage();
			}

			if (!speedIncrease1 && currentBrokenBricks === 4) {
				speedIncrease1 = true;
				speed += speedIncrease;
			}
			if (!speedIncrease2 && currentBrokenBricks === 12) {
				speedIncrease2 = true;
				speed += speedIncrease;
			}
			if (!speedIncrease3 && brick.dataset.points === "5") {
				speedIncrease3 = true;
				speed += speedIncrease;
			}

			// Bounces off the side of the brick
			if ((ballLeft + ballWidth < rect.left && newBallRight > rect.left) || (ballLeft > rect.right && newBallLeft < rect.right)) {
				horizontalSpeed *= -1.0;
			}
			// Bounces off the top or bottom of the brick
			else {
				verticalSpeed *= -1.0;
			}

			// Update available bricks
			availableRows = Math.max(availableRows, Math.floor(parseInt(brick.dataset.brickId) / columns) + 2);
			availableBricks = bricks.slice(Math.max(bricks.length - (columns * availableRows), 0), bricks.length);

			return false;
		}
		return true;
	});

	// If the ball has changed direction, we have to check whether the new direction will hit a brick before moving the ball
	if (bounce) {
		brickBounce();
	}
}

function generateNextFrame() {
	var t0 = performance.now();
	
	var newBallTop = ballTop + (verticalSpeed * speed);
	var newBallLeft = ballLeft + (horizontalSpeed * speed);
	var newBallRight = newBallLeft + ballWidth;
	var newBallBottom = newBallTop + ballHeight;

	// Bounces off a brick
	brickBounce();

	// Bounces off the top of the screen
	if (newBallTop < 0) {
		verticalSpeed *= -1.0;

		if (!speedIncrease4) {
			speedIncrease4 = true;
			speed += speedIncrease;
		}
	}

	// Bounces off the sides of the screen
	if (newBallLeft < 0 || newBallRight > tableWidth) {
		horizontalSpeed *= -1.0;
	}

	// Life lost
	if(newBallBottom > tableHeight) {
		// Stop the game
		clearInterval(frame);

		lives++;
		livesElement.innerHTML = lives;
		resetLife();
		if (lives <= 3) {
			// Continue
			frame = setInterval(generateNextFrame, 1000 / frames);
		}
		else {
			// Game over
			paddleBlocker.classList.remove('hidden');
		}
	}

	// Bounces off the paddle
	if ((
		(ballTop + ballHeight < paddleTop) ||
		(ballTop > paddleTop + paddleHeight) ||
		(ballLeft + ballWidth < paddleLeft) ||
		(ballLeft > paddleLeft + paddleWidth)
	) && !(
		(newBallBottom < paddleTop) ||
		(newBallTop > paddleTop + paddleHeight) ||
		(newBallRight < paddleLeft) ||
		(newBallLeft > paddleLeft + paddleWidth)
	)) {
		// Bounces off the side of the paddle
		if ((ballLeft + ballWidth < paddleLeft && newBallRight > paddleLeft) || (ballLeft > paddleLeft + paddleWidth && newBallLeft < paddleLeft + paddleWidth)) {
			horizontalSpeed *= -1.0;
		}
		// Bounces off the top of the paddle
		else {
			verticalSpeed *= -1.0;
			horizontalSpeed = 2 * ((ballLeft + (ballWidth / 2) - paddleLeft) / (paddleWidth)) - 1;
			normalizeSpeeds();
		}
	}

	// Update the balls position
	ballTop = ballTop + (verticalSpeed * speed);
	ballLeft = ballLeft + (horizontalSpeed * speed);

	// Move the ball
	ball.style.top = ballTop + 'px';
	ball.style.left = ballLeft + 'px';

	// Move the paddles
	if (aPressed) {
		paddleLeft = Math.max(paddleLeft - 5, 0);
		paddle.style.left = paddleLeft + 'px';
	}

	if (dPressed) {
		paddleLeft = Math.min(paddleLeft + 5, tableWidth - paddleWidth);
		paddle.style.left = paddleLeft + 'px';
	}

	var t1 = performance.now();
	//console.log(`Time Taken: ${t1 - t0}ms`);
}