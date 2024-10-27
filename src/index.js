import cors from 'cors';
import express from 'express';
<<<<<<< HEAD
import cors from 'cors';
=======
import dotenv from 'dotenv';
const app = express();
dotenv.config();
app.use(cors()); 
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(express.static("."))


app.listen(8080); 


>>>>>>> bf4e8c2a189f39ef16eb368fec37ffb5d71b1100
import rootRoutes from './Routes/rootRoutes.js';

const app = express();
app.use(express.json());
app.use(express.static("."));
app.use(cors());

// Thêm một route để xử lý POST request tại /api/reviews
app.post('/api/reviews', (req, res) => {
    const review = req.body;

    // Xử lý lưu trữ đánh giá vào cơ sở dữ liệu ở đây
    console.log("Đánh giá nhận được:", review);

    // Gửi phản hồi thành công
    res.status(201).send('Đánh giá đã được tạo thành công');
});

// Đường dẫn API chính
app.use("/api", rootRoutes);

app.listen(8080, () => {
    console.log("Server đang chạy tại http://127.0.0.1:8080/");
});
