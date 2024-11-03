import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';

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




export { getRateID, getRateSummary, countRateStar }