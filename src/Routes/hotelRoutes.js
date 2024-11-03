import express from "express";
import { deleteHotel, getData, getHotel, getHotelCountry, getHotelID, getHotelLocal, getSearchNameHotel, selectHotel } from "../Controllers/hotelController.js";
import { checkToken } from "../Config/jwtConfig.js";
import initModels from "../Models/init-models.js";
import sequelize from "../Models/index.js";
import multer from "multer";
import path  from "path";
import jwt from "jsonwebtoken";

const hotelRoutes = express.Router();

hotelRoutes.get("/get-hotel", getHotel);
hotelRoutes.put("/delete-hotel/:MA_KS", checkToken, deleteHotel);
hotelRoutes.get("/search-hotel/:searchParam", getSearchNameHotel);
hotelRoutes.get("select-hotel/:MA_KS", selectHotel);
hotelRoutes.get("/get-hotel-local/:MA_VITRI", getHotelLocal);
hotelRoutes.get("/get-hotel-country/:MA_QUOCGIA", getHotelCountry);
hotelRoutes.get("/get-hotel-id/:MA_KS", getHotelID);
hotelRoutes.get("/get-data", checkToken, getData);


const model = initModels(sequelize);


const storage = multer.diskStorage({
    destination: process.cwd() + "/../BAZOKA/img",
    filename: (req, file, callback) => {
        let date = new Date();
        let newName = date.getTime();
        callback(null, newName + "_" + file.originalname);
    }
});

const upload = multer({ storage });

hotelRoutes.post('/create-hotel', checkToken, upload.fields([{ name: 'HINHANH' }, { name: 'QRTHANHTOAN' }]), async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        let { TEN_KS, MO_TA, SOSAO, TRANGTHAI_KS, MA_VITRI, YEU_CAU_COC, TI_LE_COC } = req.body;
        let HINHANH = req.files['HINHANH'] ? path.basename(req.files['HINHANH'][0].path) : null; 
        let QRTHANHTOAN = req.files['QRTHANHTOAN'] ? path.basename(req.files['QRTHANHTOAN'][0].path) : null; 
        TRANGTHAI_KS = TRANGTHAI_KS || "Hoạt động";

        let hotelData = {
            TEN_KS,
            MO_TA,
            SOSAO,
            TRANGTHAI_KS,
            MA_VITRI,
            YEU_CAU_COC,
            TI_LE_COC,
            HINHANH,
            QRTHANHTOAN
        };

        await model.KHACHSAN.create(hotelData);
        res.status(200).send("Bạn đã tạo khách sạn thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
});

hotelRoutes.put('/update-hotel/:MA_KS', checkToken, upload.fields([{ name: 'HINHANH' }, { name: 'QRTHANHTOAN' }]), async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        const { MA_KS } = req.params; 
        const { TEN_KS, MO_TA, SOSAO, TRANGTHAI_KS, MA_VITRI, YEU_CAU_COC, TI_LE_COC } = req.body;

        const hotel = await model.KHACHSAN.findByPk(MA_KS);
        if (!hotel) {
            return res.status(404).send("Khách sạn không tồn tại");
        }

        if (req.files) {
            if (req.files['HINHANH'] && req.files['HINHANH'].length > 0) {
                hotel.HINHANH = path.basename(req.files['HINHANH'][0].path);
            }
            if (req.files['QRTHANHTOAN'] && req.files['QRTHANHTOAN'].length > 0) {
                hotel.QRTHANHTOAN = path.basename(req.files['QRTHANHTOAN'][0].path);
            }
        }

        hotel.TEN_KS = TEN_KS || hotel.TEN_KS;
        hotel.MO_TA = MO_TA || hotel.MO_TA;
        hotel.SOSAO = SOSAO || hotel.SOSAO;
        hotel.TRANGTHAI_KS = TRANGTHAI_KS || hotel.TRANGTHAI_KS;
        hotel.MA_VITRI = MA_VITRI || hotel.MA_VITRI;
        hotel.YEU_CAU_COC = YEU_CAU_COC || hotel.YEU_CAU_COC;
        hotel.TI_LE_COC = TI_LE_COC || hotel.TI_LE_COC;

        await hotel.save();

        res.status(200).send("Bạn đã cập nhật khách sạn thành công!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi cập nhật dữ liệu");
    }
});

export default hotelRoutes;
