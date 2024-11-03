import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";

const Op = Sequelize.Op;
const model = initModels(sequelize);

const getDiscount = async (req, res) =>{
    try {
        const data = await model.MAGIAMGIA.findAll();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

const deleteDiscount = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        let { MA_MGG } = req.params;
        await model.MAGIAMGIA.destroy({
            where:{
                MA_MGG: MA_MGG
            }
        });
        res.status(200).send("Xóa mã giảm giá thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý!");
    }
};

const createDiscount = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        const { MA_MGG, PHANTRAM, NGAYBATDAU, NGAYKETTHUC, DIEU_KIEN } = req.body;

        // Kiểm tra PHANTRAM phải nhỏ hơn 100
        if (PHANTRAM >= 100) {
            return res.status(400).send("Phần trăm giảm giá phải nhỏ hơn 100.");
        }

        const discountData = {
            MA_MGG,
            PHANTRAM,
            NGAYBATDAU,
            NGAYKETTHUC,
            DIEU_KIEN
        };

        const existingDiscount = await model.MAGIAMGIA.findOne({
            where: { MA_MGG: MA_MGG }
        });

        if (existingDiscount) {
            return res.status(400).send("Mã giảm giá đã tồn tại.");
        }

        await model.MAGIAMGIA.create(discountData);
        res.status(200).send("Bạn đã tạo mã giảm giá thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const updateDiscount = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const { MA_MGG } = req.params

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        const { PHANTRAM, NGAYBATDAU, NGAYKETTHUC, DIEU_KIEN } = req.body;

        // Kiểm tra PHANTRAM phải nhỏ hơn 100
        if (PHANTRAM >= 100) {
            return res.status(400).send("Phần trăm giảm giá phải nhỏ hơn 100.");
        }

        const existingDiscount = await model.MAGIAMGIA.findOne({
            where: { MA_MGG: MA_MGG }
        });

        if (!existingDiscount) {
            return res.status(404).send("Mã giảm giá không tồn tại.");
        }

        // Cập nhật thông tin mã giảm giá
        await model.MAGIAMGIA.update(
            {
                PHANTRAM,
                NGAYBATDAU,
                NGAYKETTHUC,
                DIEU_KIEN
            },
            {
                where: { MA_MGG: MA_MGG }
            }
        );

        res.status(200).send("Bạn đã cập nhật mã giảm giá thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const selectDiscount = async (req, res) =>{
    try {
        const { MA_MGG } = req.params;
        const data = await model.MAGIAMGIA.findOne({
            where:{
                MA_MGG: MA_MGG
            }
        })
        if (!data){
            return res.status(404).send("Không tìm thấy phòng");
        }
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

export { getDiscount, deleteDiscount, createDiscount, updateDiscount, selectDiscount }