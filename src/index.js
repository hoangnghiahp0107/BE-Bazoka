import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io'; // Import 'Server' từ socket.io

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app); // Tạo server HTTP
const io = new Server(server, { // Sử dụng Server thay vì socketIo
    cors: {
        origin: '*', // Chấp nhận tất cả các domain, bạn có thể giới hạn tùy theo nhu cầu
    }
});

server.listen(8080);

app.use(express.static("."));

app.post("/receive-hook", async (req, res) => {
    console.log(req.body);
    res.json();
});

import rootRoutes from './Routes/rootRoutes.js';
app.use("/api", rootRoutes);

// Xử lý kết nối WebSocket
io.on('connection', (socket) => {
    console.log('A user connected');

    // Lắng nghe tin nhắn gửi từ client
    socket.on('sendMessage', (data) => {
        // Gửi tin nhắn đến các clients
        io.emit('newMessage', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
