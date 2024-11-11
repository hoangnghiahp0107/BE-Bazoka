import express from "express";
import { createRoom, deleteRoom, deleteRoomPartner, getConvenient, getDataRoom, getDataRoomDay, getDataRoomDayPartner, getPrice, getPriceDiscount, getRoom, getRoomAllPartner, getRoomPartner, getSearchNameRoom, selectRoom, updateRoom, updateRoomPartner } from "../Controllers/roomController.js";
import { checkToken } from "../Config/jwtConfig.js";
import initModels from "../Models/init-models.js";
import sequelize from "../Models/index.js";
import multer from "multer";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";
import path  from "path";

const roomRoutes = express.Router();

const model = initModels(sequelize);
const Op = Sequelize.Op;

const storage = multer.diskStorage({
    destination: process.cwd() + "/../BAZOKA/img",
    filename: (req, file, callback) => {
        let date = new Date();
        let newName = date.getTime();
        callback(null, newName + "_" + file.originalname);
    }
});

const upload = multer({ storage });

roomRoutes.get("/get-room", getRoom);
roomRoutes.post("/create-room", checkToken, createRoom);
roomRoutes.put("/update-room/:MA_PHONG", checkToken, updateRoom);
roomRoutes.delete("/delete-room/:MA_PHONG", checkToken, deleteRoom);
roomRoutes.get("/search-room/:TENPHONG", checkToken, getSearchNameRoom);
roomRoutes.get("/select-room/:MA_PHONG", selectRoom);
roomRoutes.get("/get-convenient/:MA_KS", getConvenient)
roomRoutes.get("/get-price/:MA_KS", getPrice);
roomRoutes.get("/get-price-discount/:MA_KS", getPriceDiscount);
roomRoutes.get("/get-data-room/:MA_KS", getDataRoom);
roomRoutes.get("/get-data-room-day/:MA_KS", getDataRoomDay);
roomRoutes.get("/get-data-room-day-partner", checkToken, getDataRoomDayPartner);

roomRoutes.get("/get-room-partner", checkToken, getRoomPartner);
roomRoutes.get("/get-room-all-partner", checkToken, getRoomAllPartner)

roomRoutes.delete("/delete-room-partner/:MA_PHONG", checkToken, deleteRoomPartner)

roomRoutes.post('/create-room-partner', checkToken, upload.fields([{ name: 'HINHANH' }]), async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU; 

        const partnerIdMatch = currentUserRole.match(/Partner(\d+)/);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        let { TENPHONG, MOTA, GIATIEN,  MA_KM, MA_LOAIPHG } = req.body;
        let HINHANH = req.files['HINHANH'] ? path.basename(req.files['HINHANH'][0].path) : null; 

        let roomData = {
            TENPHONG,   
            MOTA,
            GIATIEN,
            HINHANH,
            MA_KS: partnerId,
            MA_KM,
            MA_LOAIPHG
        };

        await model.PHONG.create(roomData);
        res.status(200).send("Bạn đã tạo phòng thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
});
roomRoutes.put('/update-room-partner/:MA_PHONG', checkToken, upload.fields([{ name: 'HINHANH' }]), async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU; 

        const partnerIdMatch = currentUserRole.match(/Partner(\d+)/);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        // Lấy MA_PHONG từ params
        const { MA_PHONG } = req.params;

        // Lấy thông tin phòng từ request body
        const { TENPHONG, MOTA, GIATIEN, MA_KM, MA_LOAIPHG } = req.body;
        let HINHANH = req.files['HINHANH'] ? path.basename(req.files['HINHANH'][0].path) : null;

        // Tìm phòng theo MA_PHONG
        const room = await model.PHONG.findOne({ where: { MA_PHONG } });
        if (!room) {
            return res.status(404).send("Phòng không tồn tại");
        }

        // Cập nhật thông tin phòng
        room.TENPHONG = TENPHONG;
        room.MOTA = MOTA;
        room.GIATIEN = GIATIEN;
        room.MA_KM = MA_KM;
        room.MA_LOAIPHG = MA_LOAIPHG;
        if (HINHANH) {
            room.HINHANH = HINHANH; // Cập nhật hình ảnh nếu có
        }

        await room.save(); // Lưu thay đổi vào cơ sở dữ liệu

        res.status(200).send("Bạn đã cập nhật phòng thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi cập nhật dữ liệu");
    }
});


export default roomRoutes;