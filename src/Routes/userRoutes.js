import express from "express";
import { deleteUser, getUserAll, loginAdmin, loginUser, logout, selectUser, signUp, updateUser } from "../Controllers/userController.js";
import { checkToken } from "../Config/jwtConfig.js";
import initModels from "../Models/init-models.js";
import sequelize from "../Models/index.js";
import bcrypt from "bcrypt";
import multer from "multer";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";


const model = initModels(sequelize);
const Op = Sequelize.Op;

const userRoutes = express.Router();

const storage = multer.diskStorage({
    destination: process.cwd() + "/../BAZOKA/img",
    filename: (req, file, callback) => {
        let date = new Date();
        let newName = date.getTime();
        callback(null, newName + "_" + file.originalname);
    }
});

const upload = multer({ storage });

userRoutes.post("/sign-up", signUp);
userRoutes.post("/login-user", loginUser);
userRoutes.post("/login-admin", loginAdmin);
userRoutes.get("/get-user-all", checkToken, getUserAll);
userRoutes.post("/logout", logout);
userRoutes.get("/select-user/:MA_ND", checkToken, selectUser);
userRoutes.delete("/delete-user/:MA_ND", checkToken, deleteUser);
userRoutes.put('/update-user/:MA_ND', upload.single('ANHDAIDIEN'), checkToken, async (req, res) => {
    try {
        const MA_ND = req.params.MA_ND;
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserID = decodedToken.data.MA_ND;
        const currentUserRole = decodedToken.data.CHUCVU;

        if (Number(MA_ND) !== currentUserID && currentUserRole !== "Admin") {
            return res.status(403).send("Không có quyền truy cập thông tin người dùng này");
        }

        let { EMAIL, SDT, MATKHAU, NGAYSINH, GIOITINH, HOTEN, CHUCVU } = req.body;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (MATKHAU && !passwordRegex.test(MATKHAU)) {
            return res.status(400).send("Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái thường, 1 chữ cái hoa và 1 ký tự đặc biệt.");
        }

        let whereCondition = {};
        if (SDT) {
            whereCondition.SDT = SDT;
        }
        if (EMAIL) {
            whereCondition.EMAIL = EMAIL;
        }
        whereCondition.MA_ND = {
            [Op.not]: MA_ND
        };

        let checkTK = await model.NGUOIDUNG.findOne({
            where: whereCondition
        });

        if (checkTK) {
            return res.status(409).send("Email hoặc số điện thoại đã tồn tại!");
        }

        let updateData = {};
        if (EMAIL) updateData.EMAIL = EMAIL;
        if (SDT) updateData.SDT = SDT;
        if (MATKHAU) updateData.MATKHAU = bcrypt.hashSync(MATKHAU, 10);
        if (NGAYSINH) updateData.NGAYSINH = NGAYSINH;
        if (GIOITINH) updateData.GIOITINH = GIOITINH;
        if (HOTEN) updateData.HOTEN = HOTEN;
        if (CHUCVU) updateData.CHUCVU = CHUCVU;
        if (req.file) updateData.ANHDAIDIEN = req.file.filename;

        await model.NGUOIDUNG.update(updateData, {
            where: { MA_ND },
        });
        
        res.status(200).send("Cập nhật tài khoản thành công!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
});

export default userRoutes;