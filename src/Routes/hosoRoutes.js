import express from "express";
import { checkToken } from "../Config/jwtConfig.js";
import initModels from "../Models/init-models.js";
import sequelize from "../Models/index.js";
import multer from "multer";
import path from "path";
import fs from "fs"; 
import { accessHoSo, denyHoso, getDataHoso } from "../Controllers/hosoController.js";
const hosoRoutes = express.Router();

const model = initModels(sequelize);

// Cấu hình multer để lưu hình ảnh và giấy phép vào các thư mục khác nhau
const storage = multer.diskStorage({
    // Lưu hình ảnh vào thư mục IMG
    destination: (req, file, callback) => {
        if (file.fieldname === 'HINHANH') {
            callback(null, path.join(process.cwd(), "/../BAZOKA/img"));
        } else if (file.fieldname === 'GIAYPHEPKINHDOANH') {
            // Lưu giấy phép vào thư mục download
            callback(null, path.join(process.cwd(), "/../BAZOKA/download"));
        }
    },
    filename: (req, file, callback) => {
        let date = new Date();
        let newName = date.getTime();
        callback(null, newName + "_" + file.originalname);  // Tạo tên file mới với dấu thời gian
    }
});

// Tạo đối tượng multer để upload nhiều loại file
const upload = multer({ storage });

hosoRoutes.post('/create-hoso', upload.fields([{ name: 'HINHANH' }, { name: 'GIAYPHEPKINHDOANH' }]), async (req, res) => {
    try {
        // Lấy dữ liệu từ body
        let { HOTEN, EMAIL, SDT, TEN_KS, DIACHI, MO_TA, SOSAO, TRANGTHAI, NGAYDANGKY } = req.body;

        // Lưu hình ảnh nếu có
        let HINHANH = req.files['HINHANH'] ? path.basename(req.files['HINHANH'][0].path) : null;

        // Lưu giấy phép kinh doanh nếu có
        let GIAYPHEPKINHDOANH = null;
        if (req.files['GIAYPHEPKINHDOANH'] && req.files['GIAYPHEPKINHDOANH'][0].path) {
            GIAYPHEPKINHDOANH = path.basename(req.files['GIAYPHEPKINHDOANH'][0].path);  // Lưu đường dẫn tệp giấy phép
        }

        // Nếu không có trạng thái hoặc ngày đăng ký, gán giá trị mặc định
        TRANGTHAI = TRANGTHAI || "Chờ xác nhận";
        NGAYDANGKY = NGAYDANGKY || new Date();

        // Tạo đối tượng hồ sơ
        let hosoData = {
            HOTEN,
            EMAIL,
            SDT,
            TRANGTHAI,
            NGAYDANGKY,
            TEN_KS,
            DIACHI,
            MO_TA,
            HINHANH,
            SOSAO,
            GIAYPHEPKINHDOANH  // Lưu đường dẫn tệp giấy phép
        };

        // Lưu hồ sơ vào cơ sở dữ liệu
        await model.HOSO.create(hosoData);

        // Trả về phản hồi thành công
        res.status(200).send("Bạn đã tạo hồ sơ khách sạn thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi tạo hồ sơ khách sạn.");
    }
});

hosoRoutes.post('/find-hoso', async (req, res) => {
    try {
        let { EMAIL, SDT } = req.body;

        if (!EMAIL || !SDT) {
            return res.status(400).send("Cả Email và Số điện thoại đều bắt buộc phải nhập!");
        }

        const hoso = await model.HOSO.findAll(
            { 
                where: { 
                    EMAIL, SDT 
                },
                attributes:['MA_HS', 'TEN_KS', 'NGAYDANGKY', 'TRANGTHAI']
            }
        );

        if (hoso) {
            res.status(200).json(hoso);
        } else {
            res.status(404).send("Không tìm thấy hồ sơ với Email và Số điện thoại này!");
        }

    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi tìm kiếm hồ sơ");
    }
});

hosoRoutes.get("/get-data-hoso", checkToken, getDataHoso);
hosoRoutes.put("/deny-hoso/:MA_HS", checkToken, denyHoso);
hosoRoutes.put("/access-hoso/:MA_HS", checkToken, accessHoSo);

export default hosoRoutes;
