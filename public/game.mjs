import Player from "./Player.mjs";
import Collectible from "./Collectible.mjs";

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer(player, context, src) {
  context.drawImage(avatar, player.x, player.y, 50, 50);
}

function drawCollectible(collectible, context) {
  context.beginPath();
  context.arc(
    collectible.x,
    collectible.y,
    collectible.radius,
    0,
    Math.PI * 2,
    true
  );
  context.closePath();
  context.fillStyle = "red";
  context.fill();
}

const socket = io();
const canvas = document.getElementById("game-window");
const context = canvas.getContext("2d");

const playerRadius = 10;
const playerSpeed = 1;
let player;

const collectibleRadius = 5;

const directions = {
  // WASD
  65: false, // left
  87: false, // up
  68: false, // right
  83: false, // down

  // ARROWS
  37: false, // left
  38: false, // up
  39: false, // right
  40: false, // down
};

function createCollectible() {
  const newCollectible = new Collectible({
    x: randomInteger(collectibleRadius, canvas.width - collectibleRadius * 2),
    y: randomInteger(collectibleRadius, canvas.height - collectibleRadius * 2),
    id: "collectible",
    value: 1,
    radius: collectibleRadius,
  });
  socket.emit("update collectible", newCollectible);
}

const avatar = new Image();

socket.on("new player", (id, collectible, playerNum) => {
  avatar.src = "../assets/a1.png";

  const newPlayer = new Player({
    x: randomInteger(playerRadius, canvas.width - playerRadius * 2),
    y: randomInteger(playerRadius, canvas.height - playerRadius * 2),
    score: 0,
    id,
    radius: playerRadius,
  });

  if (!player) {
    player = newPlayer;
    listenToUpdates();
  }

  if (!collectible) {
    createCollectible();
  }
});

socket.on("update game", (players, collectible) => {
  clearCanvas();
  drawCollectible(collectible, context);
  players.forEach((p) => {
    drawPlayer(p, context);
  });

  document.getElementById("rank").innerHTML = player.calculateRank(players);
  document.getElementById("score").innerHTML = `Score ${player.score}`;

  if (player.collision(collectible)) {
    player.score = player.score + collectible.value;
    createCollectible();
  }
});

function updatePlayer() {
  const hasDirection = Object.values(directions).some((direction) => direction);
  if (hasDirection) {
    let currentDirections = [];
    if (directions[65] || directions[37]) currentDirections.push("LEFT");
    if (directions[87] || directions[38]) currentDirections.push("UP");
    if (directions[68] || directions[39]) currentDirections.push("RIGHT");
    if (directions[83] || directions[40]) currentDirections.push("DOWN");

    currentDirections.forEach((direction) => {
      player.movePlayer(direction, playerSpeed);
    });
  }

  socket.emit("update player", player);
}

function listenToUpdates() {
  const enableDirection = (e) => {
    directions[e.keyCode] = true;
    e.preventDefault();
  };

  const disableDirection = (e) => {
    directions[e.keyCode] = false;
    e.preventDefault();
  };

  window.addEventListener("keydown", enableDirection);
  window.addEventListener("keyup", disableDirection);

  setInterval(updatePlayer, 10);
}
