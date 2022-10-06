class Player {
  width = 50;
  height = 50;

  constructor({ x, y, score, id, radius }) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.radius = radius;
  }

  movePlayer(dir, speed) {
    switch (dir) {
      case "UP":
        this.y = this.y - speed;
        break;
      case "DOWN":
        this.y = this.y + speed;
        break;
      case "LEFT":
        this.x = this.x - speed;
        break;
      case "RIGHT":
        this.x = this.x + speed;
        break;
    }
  }

  collision(item) {
    var distX = Math.abs(item.x - this.x - this.width / 2);
    var distY = Math.abs(item.y - this.y - this.height / 2);

    if (distX > this.width / 2 + item.radius) {
      return false;
    }
    if (distY > this.height / 2 + item.radius) {
      return false;
    }

    if (distX <= this.width / 2) {
      return true;
    }
    if (distY <= this.height / 2) {
      return true;
    }

    var dx = distX - this.width / 2;
    var dy = distY - this.height / 2;
    return dx * dx + dy * dy <= item.radius * item.radius;
  }

  calculateRank(arr) {
    const sorted = arr.sort((a, b) => b.score - a.score);
    const myPosition = sorted.findIndex((p) => p.id === this.id);
    return `Rank ${myPosition + 1}/${sorted.length}`;
  }
}

export default Player;
