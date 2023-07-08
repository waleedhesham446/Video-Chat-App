const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
let activeSockets = [];

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.send(`<h1>Hello World</h1>`); 
});

io.on("connection", socket => {
    const existingSocket = activeSockets.find(existingSocket => existingSocket === socket.id);
  
    if (!existingSocket) {
        activeSockets.push(socket.id);
  
        socket.emit("update-user-list", {
          users: activeSockets.filter(existingSocket => existingSocket !== socket.id)
        });
  
        socket.broadcast.emit("update-user-list", {
          users: [socket.id]
        });
        console.log(socket.id);
    }

    socket.on("disconnect", () => {
        activeSockets = activeSockets.filter(existingSocket => existingSocket !== socket.id);
        socket.broadcast.emit("remove-user", {
          socketId: socket.id
        });
    });

    socket.on("sendingOffer", ({ offer, to }) => {
		socket.broadcast.to(to).emit("offerSent", { offer, from: socket.id });
	});
	
	socket.on("sendingAnswer", ({ answer, to }) => {
		socket.broadcast.to(to).emit("answerSent", { answer, from: socket.id });
	});
	
	socket.on('newIceCandidate', (data) => {
		socket.broadcast.to(data.to).emit("iceCandidate", { iceCandidate: data['new-ice-candidate'] });
	});
});

server.listen(5000, () => console.log('Running on port 5000...'));