import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';
const Op = Sequelize.Op;
const model = initModels(sequelize);

const getReviews = async (req, res) => {
    try {
        const data = await model.DANHGIA.findAll();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu đánh giá");
    }
};

const createReview = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        let { SO_SAO, BINH_LUAN, NGAY_DG, MA_KS, MA_ND } = req.body;

        let sao =5;
        let reviewData = {
            sao,
            BINH_LUAN,
            NGAY_DG,
            MA_KS,
            MA_ND
        };
        await model.DANHGIA.create(reviewData);
        res.status(200).send("Bạn đã tạo đánh giá thành công");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi thêm đánh giá");
    }
};

const selectReview = async (req, res) => {
    try {
        const { MA_DG } = req.params;
        const data = await model.DANHGIA.findOne({
            where: {
                MA_DG: MA_DG
            }
        });
        if (!data) {
            return res.status(404).send("Không tìm thấy đánh giá");
        }
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu đánh giá");
    }
};

const updateReview = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.VAITRO !== "Quản lý") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        let { MA_DG } = req.params;
        let { MA_KS, MA_ND, SO_SAO, BINH_LUAN, NGAY_DG } = req.body;
        await model.DANHGIA.update(
            { MA_KS, MA_ND, SO_SAO, BINH_LUAN, NGAY_DG },
            {
                where: {
                    MA_DG
                }
            }
        );
        res.status(200).send("Cập nhật đánh giá thành công");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi cập nhật đánh giá");
    }
};

const deleteReview = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.VAITRO !== "Quản lý") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        let { MA_DG } = req.body;
        if (!MA_DG) {
            return res.status(400).send("Mã đánh giá không hợp lệ");
        }
        const destroyReview = await model.DANHGIA.destroy({
            where: {
                MA_DG
            }
        });
        if (!destroyReview) {
            return res.status(404).send("Không tìm thấy đánh giá");
        }
        res.status(200).send("Xóa đánh giá thành công");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi xóa đánh giá");
    }
};

const getReviewsByRoomId = async (req, res) => {
    try {
        const { MA_PHONG } = req.params;
        const data = await model.DANHGIA.findAll({
            where: {
                MA_PHONG: MA_PHONG
            }
        });
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu đánh giá theo phòng");
    }
};

export { getReviews, createReview, selectReview, updateReview, deleteReview, getReviewsByRoomId };
