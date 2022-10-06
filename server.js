require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const expect = require("chai");
const socket = require("socket.io");
const cors = require("cors");
const http = require("http");

const app = express();

// SOCKET
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const players = {};
let collectible;
io.on("connection", (socket) => {
  io.emit("new player", socket.id, collectible);

  socket.on("update player", (player) => {
    players[socket.id] = player;
  });

  socket.on("update collectible", (newCollectible) => {
    collectible = newCollectible;
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });

  setInterval(() => {
    socket.emit("update game", Object.values(players), collectible);
  }, 1000 / 60);
});

//

const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner.js");

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/assets", express.static(process.cwd() + "/assets"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({ origin: "*" }));

// Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log("Tests are not valid:");
        console.error(error);
      }
    }, 1500);
  }
});

module.exports = app; // For testing
