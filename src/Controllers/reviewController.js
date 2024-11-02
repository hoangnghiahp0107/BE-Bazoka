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

        // Giải mã token để lấy thông tin người dùng
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const userId = decodedToken.data.MA_ND; // Giả sử bạn lưu MA_ND trong token

        let { SO_SAO, BINH_LUAN, MA_KS } = req.body;

        // Kiểm tra các trường cần thiết
        if (!SO_SAO || !BINH_LUAN || !MA_KS) {
            return res.status(400).send("Thông tin không đầy đủ");
        }

        let reviewData = {
            SO_SAO,
            BINH_LUAN,
            NGAY_DG: new Date(), // Đặt ngày đánh giá là ngày hiện tại
            MA_KS,
            MA_ND: userId // Sử dụng ID người dùng từ token
        };

        await model.DANHGIA.create(reviewData);
        res.status(201).send("Bạn đã tạo đánh giá thành công");
    } catch (error) {
        console.error("Lỗi khi thêm đánh giá:", error);
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
        const token = req.headers.token; // Lấy token từ headers
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA'); // Giải mã token để lấy thông tin người dùng
        const { MA_ND } = decodedToken.data; // Lấy mã người dùng từ token
        const { MA_DG } = req.params; // Lấy mã đánh giá từ tham số
        const { SO_SAO, BINH_LUAN } = req.body; // Lấy thông tin cần cập nhật từ body

        // Kiểm tra xem đánh giá có thuộc về người dùng không và lấy bình luận hiện tại
        const review = await model.DANHGIA.findOne({
            where: {
                MA_DG: MA_DG,
                MA_ND: MA_ND // So sánh với MA_ND từ token
            }
        });

        if (!review) {
            return res.status(403).send("Không có quyền chỉnh sửa đánh giá này"); // Không tìm thấy đánh giá
        }

        // Lấy thông tin bình luận hiện tại (nếu cần)
        const currentRating = review.SO_SAO; // Lấy số sao hiện tại
        const currentComment = review.BINH_LUAN; // Lấy bình luận hiện tại

        // Cập nhật đánh giá
        await model.DANHGIA.update(
            { SO_SAO, BINH_LUAN },
            {
                where: {
                    MA_DG
                }
            }
        );

        res.status(200).send({
            message: "Cập nhật bình luận thành công",
            currentRating, // Trả về số sao hiện tại
            currentComment // Trả về bình luận hiện tại
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi cập nhật bình luận");
    }
};



const deleteReview = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            res.end("Người dùng không được xác thực");
            return;
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');

        const { MA_DG } = req.params; // Lấy MA_DG từ tham số URL
        if (!MA_DG) {
            res.end("Mã đánh giá không hợp lệ");
            return;
        }

        // Tìm đánh giá để kiểm tra người dùng có quyền xóa hay không
        const review = await model.DANHGIA.findOne({ where: { MA_DG: MA_DG } });
        if (!review) {
            res.end("Không tìm thấy đánh giá");
            return;
        }

        console.log("Token Decoded MA_ND: ", decodedToken.data.MA_ND);
        console.log("Review MA_ND: ", review.MA_ND);

        // Kiểm tra xem người dùng có quyền xóa đánh giá hay không
        if (decodedToken.data.MA_ND === review.MA_ND) {
            // Nếu đánh giá của chính người dùng, cho phép xóa
            await model.DANHGIA.destroy({ where: { MA_DG } });
            res.end("Xóa đánh giá thành công");
        } else if (decodedToken.data.CHUCVU === "Quản lý") {
            // Nếu là quản lý, cho phép xóa
            await model.DANHGIA.destroy({ where: { MA_DG } });
            res.end("Xóa đánh giá thành công");
        } else {
            // Nếu không phải là người dùng tạo đánh giá hoặc quản lý, từ chối quyền
            res.end("Không có quyền truy cập chức năng này");
        }
    } catch (error) {
        console.error(error);
        res.end("Lỗi khi xóa đánh giá");
    }
};

// Hàm lấy bình luận của người dùng theo userId và roomId từ cơ sở dữ liệu
async function getReviewByUserId(userId, roomId) {
    const comment = await model.DANHGIA.findOne({
        where: {
            MA_ND: userId, // ID người dùng
            MA_PHONG: roomId // ID phòng
        }
    });

    return comment || { SO_SAO: 0, BINH_LUAN: "" }; // Trả về bình luận nếu tìm thấy, nếu không trả về mặc định
}

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

const getReviewsByHotelId = async (req, res) => {
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
        const data = await model.DANHGIA.findAll({
            where: {
                MA_KS: partnerId
            }
        })
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu đánh giá theo phòng");
    }
};

export { getReviews, createReview, selectReview, updateReview, deleteReview, getReviewsByRoomId, getReviewByUserId, getReviewsByHotelId };