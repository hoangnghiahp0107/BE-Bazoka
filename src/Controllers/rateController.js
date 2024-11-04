import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";

const Op = Sequelize.Op;
const model = initModels(sequelize);

const countRateStar = async (req, res) => {
    try {
        const danhGiaStars = await Promise.all([
            model.DANHGIA.count({ where: { SO_SAO: 1 } }),
            model.DANHGIA.count({ where: { SO_SAO: 2 } }),
            model.DANHGIA.count({ where: { SO_SAO: 3 } }),
            model.DANHGIA.count({ where: { SO_SAO: 4 } }),
            model.DANHGIA.count({ where: { SO_SAO: 5 } })
        ]);

        res.json({
            danhGiaStars 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
    }
};


const getRateID = async (req, res) => {
    try {
        const { MA_KS } = req.params;
        const data = await model.DANHGIA.findAll({
            where: {
                MA_KS: MA_KS
            },
            include: [
                {
                    model: model.NGUOIDUNG,
                    as: 'MA_ND_NGUOIDUNG',
                    required: true,
                    attributes: ['HOTEN']
                }
            ],
        }
        );
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const getRateSummary = async (req, res) => {
    try {
        const { MA_KS } = req.params;

        const count = await model.DANHGIA.count({
            where: {
                MA_KS: MA_KS
            }
        });

        if (count === 0) {
            return res.status(200).send({
                totalReviews: 0,
                averageRating: 0,
                ratingLabel: 'Chưa có đánh giá' 
            });
        }

        const result = await model.DANHGIA.findOne({
            where: {
                MA_KS: MA_KS
            },
            attributes: [[sequelize.fn('AVG', sequelize.col('SO_SAO')), 'averageRating']], 
            raw: true 
        });

        const averageRating = result && result.averageRating !== null ? parseFloat(result.averageRating).toFixed(1) : 0;
        let ratingLabel = '';

        if (averageRating >= 4.5) {
            ratingLabel = 'Tuyệt vời'; 
        } else if (averageRating >= 4.0) {
            ratingLabel = 'Rất tốt';
        } else if (averageRating >= 3.5) {
            ratingLabel = 'Tốt'; 
        } else if (averageRating >= 3.0) {
            ratingLabel = 'Trung bình'; 
        } else {
            ratingLabel = 'Kém';
        }

        res.status(200).send({
            totalReviews: count,
            averageRating: averageRating,
            ratingLabel: ratingLabel 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu đánh giá");
    }
};

const createRate = async (req, res) => {
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

        // Kiểm tra xem userId đã có trong PHIEUDATPHG chưa
        const reservation = await model.PHIEUDATPHG.findOne({
            where: {
                MA_ND: userId,
                TRANGTHAI: "Đặt thành công"
            },
            include: [
                {
                    model: model.PHONG,
                    as: 'MA_PHONG_PHONG',
                    required: true,
                    where: {
                        MA_KS: MA_KS
                    }
                }
            ]
        });

        if (!reservation) {
            return res.status(403).send("Người dùng chưa sử dụng phòng tại khách sạn");
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

const selectRate = async (req, res) => {
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

const deleteRate = async (req, res) =>{
    try {
        const { MA_DG } = req.params;
        const data = await model.DANHGIA.destroy({
            where: {
                MA_DG: MA_DG
            }
        });
        if (!data) {
            return res.status(404).send("Không tìm thấy đánh giá");
        }
        res.status(200).send("Bạn đã xóa đánh giá thành công");
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu đánh giá");
    }
}


export { getRateID, getRateSummary, countRateStar, createRate, selectRate, deleteRate }