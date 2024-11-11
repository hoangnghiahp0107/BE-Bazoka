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

const getDiscountPartner = async (req, res) =>{
    try {
        const token = req.headers.token;

        // Kiểm tra token
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        // Giải mã token
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU;

        // Lấy partnerId từ token
        const partnerIdMatch = /Partner(\d+)/.exec(currentUserRole);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        // Kiểm tra ID đối tác
        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        const data = await model.KHUYENMAI.findAll({
            include: [
                {
                    model: model.KHACHSAN_KHUYENMAI,
                    as: 'KHACHSAN_KHUYENMAIs',
                    required: true,
                    attributes: [],
                    where: {
                        MA_KS: partnerId
                    }
                }
            ],
        })
        res.status(200).send(data);

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
}

const createDiscountPartner = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU;

        const partnerIdMatch = /Partner(\d+)/.exec(currentUserRole);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        const { MA_KM, TEN_KM, NGAYBATDAU, NGAYKETTHUC, PHANTRAM } = req.body;

        const discountData = {
            MA_KM,
            TEN_KM,
            PHANTRAM,
            NGAYBATDAU,
            NGAYKETTHUC,
        };

        const newDiscount = await model.KHUYENMAI.create(discountData);

        await model.KHACHSAN_KHUYENMAI.create({
            MA_KS: partnerId,  
            MA_KM: newDiscount.MA_KM, 
        });

        res.status(200).send("Bạn đã tạo mã giảm giá thành công!");

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi thêm dữ liệu");
    }
};

const deleteDiscountPartner = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU;

        const partnerIdMatch = /Partner(\d+)/.exec(currentUserRole);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        const { MA_KM } = req.params;

        if (!MA_KM) {
            return res.status(400).send("Mã giảm giá không được cung cấp");
        }

        // Kiểm tra nếu mã giảm giá thuộc về đối tác này
        const existingDiscount = await model.KHACHSAN_KHUYENMAI.findOne({
            where: { MA_KS: partnerId, MA_KM }
        });

        if (!existingDiscount) {
            return res.status(404).send("Mã giảm giá không tồn tại hoặc không thuộc đối tác này");
        }

        // Kiểm tra nếu mã giảm giá đã được áp dụng cho phòng nào không
        const discountInUse = await model.PHONG.findOne({
            where: { MA_KM }
        });

        if (discountInUse) {
            return res.status(400).send("Mã giảm giá đang được sử dụng trong phòng, không thể xóa.");
        }

        // Xóa mối quan hệ giữa khách sạn và mã giảm giá
        await model.KHACHSAN_KHUYENMAI.destroy({
            where: { MA_KS: partnerId, MA_KM }
        });

        // Xóa mã giảm giá
        await model.KHUYENMAI.destroy({
            where: { MA_KM }
        });

        res.status(200).send("Bạn đã xóa mã giảm giá thành công!");

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa dữ liệu");
    }
};

const updateDiscountPartner = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU;

        const partnerIdMatch = /Partner(\d+)/.exec(currentUserRole);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        const { TEN_KM, NGAYBATDAU, NGAYKETTHUC, PHANTRAM } = req.body;
        const { MA_KM } = req.params;

        if (!MA_KM) {
            return res.status(400).send("Mã giảm giá không được cung cấp");
        }

        // Kiểm tra nếu mã giảm giá thuộc về đối tác này
        const existingDiscount = await model.KHACHSAN_KHUYENMAI.findOne({
            where: { MA_KS: partnerId, MA_KM }
        });

        if (!existingDiscount) {
            return res.status(404).send("Mã giảm giá không tồn tại hoặc không thuộc đối tác này");
        }

        // Lấy thông tin hiện tại của mã giảm giá
        const currentDiscount = await model.KHUYENMAI.findOne({
            where: { MA_KM }
        });

        // Kiểm tra xem có thay đổi nào không
        const changes = {};

        if (TEN_KM && TEN_KM !== currentDiscount.TEN_KM) {
            changes.TEN_KM = TEN_KM;
        }

        if (NGAYBATDAU && NGAYBATDAU !== currentDiscount.NGAYBATDAU) {
            changes.NGAYBATDAU = NGAYBATDAU;
        }

        if (NGAYKETTHUC && NGAYKETTHUC !== currentDiscount.NGAYKETTHUC) {
            changes.NGAYKETTHUC = NGAYKETTHUC;
        }

        if (PHANTRAM && PHANTRAM !== currentDiscount.PHANTRAM) {
            changes.PHANTRAM = PHANTRAM;
        }

        // Nếu không có thay đổi nào thì trả về thành công mà không cập nhật
        if (Object.keys(changes).length === 0) {
            return res.status(200).send("Không có thay đổi nào. Cập nhật thành công.");
        }

        // Cập nhật mã giảm giá với những thay đổi
        await model.KHUYENMAI.update(changes, {
            where: { MA_KM }
        });

        res.status(200).send("Bạn đã cập nhật mã giảm giá thành công!");

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi cập nhật dữ liệu");
    }
};



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

        if (PHANTRAM >= 100) {
            return res.status(400).send("Phần trăm giảm giá phải nhỏ hơn 100.");
        }

        const existingDiscount = await model.MAGIAMGIA.findOne({
            where: { MA_MGG: MA_MGG }
        });

        if (!existingDiscount) {
            return res.status(404).send("Mã giảm giá không tồn tại.");
        }

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

const selectDiscountPartner = async (req, res) =>{
    try {
        const { MA_KM } = req.params;
        const data = await model.KHUYENMAI.findOne({
            where:{
                MA_KM: MA_KM
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

export { getDiscount, deleteDiscount, selectDiscountPartner, createDiscount, updateDiscount, selectDiscount, getDiscountPartner, createDiscountPartner, updateDiscountPartner, deleteDiscountPartner }