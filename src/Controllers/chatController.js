import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';

const Op = Sequelize.Op;
const model = initModels(sequelize);

// Hàm gửi tin nhắn hỗ trợ từ khách sạn (hotel)
const sendSupportHotel = async (req, res, io) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const { MA_KS } = req.params;
        const { NOIDUNG, THOIGIAN } = req.body;
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'MINHNGHIA');
        const MA_ND = decodedToken.data.MA_ND;

        const currentTime = THOIGIAN ? new Date(THOIGIAN) : new Date();

        const chatData = {
            MA_KS,
            MA_ND,
            NOIDUNG,
            THOIGIAN: currentTime,
            SENDMESSAGE: 1
        };

        await model.TINNHAN.create(chatData);
        res.status(200).send("Gửi tin nhắn thành công!");

    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi gửi dữ liệu");
    }
};

// Hàm gửi tin nhắn hỗ trợ cho khách hàng (customer)
const sendSupportCustomer = async (req, res, io) => {
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

        const { MA_ND } = req.params;
        const { NOIDUNG, THOIGIAN } = req.body;

        const currentTime = THOIGIAN ? new Date(THOIGIAN) : new Date();

        const chatData = {
            MA_ND,
            MA_KS: partnerId,
            NOIDUNG,
            THOIGIAN: currentTime,
            SENDMESSAGE: 0
        };

        await model.TINNHAN.create(chatData);
        res.status(200).send("Gửi tin nhắn thành công!");

    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi gửi dữ liệu");
    }
};

const getSupport = async (req, res) => {
    try {
        const { MA_KS, MA_ND } = req.params;

        const data = await model.TINNHAN.findAll({
            where: {
                [Op.or]: [
                    {
                        MA_KS: MA_KS,
                        MA_ND: MA_ND
                    },
                    {
                        MA_KS: MA_ND,
                        MA_ND: MA_KS
                    }
                ]
            },
            order: [
                ['THOIGIAN', 'ASC']
            ]
        });

        res.send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu tin nhắn");
    }
};

const getSupportAll = async (req, res) => {
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

        // Truy vấn tin nhắn cuối cùng cho mỗi người dùng
        const data = await model.TINNHAN.findAll({
            attributes: [
                'MA_ND',
                [Sequelize.fn('max', Sequelize.col('THOIGIAN')), 'THOIGIAN'], // Lấy thời gian tin nhắn mới nhất
                [Sequelize.literal(`
                    (SELECT NOIDUNG 
                     FROM TINNHAN AS T2
                     WHERE T2.MA_ND = TINNHAN.MA_ND 
                     ORDER BY T2.THOIGIAN DESC 
                     LIMIT 1
                    )`), 'NOIDUNG'] // Lấy nội dung tin nhắn mới nhất cho mỗi người dùng
            ],
            where: {
                MA_KS: partnerId,
            },
            group: ['MA_ND'], // Nhóm theo MA_ND để lấy mỗi người dùng một lần
            order: [[Sequelize.fn('max', Sequelize.col('THOIGIAN')), 'DESC']], // Sắp xếp theo thời gian mới nhất
            include: [
                {
                    model: model.NGUOIDUNG,
                    as: 'MA_ND_NGUOIDUNG',
                    attributes: ['HOTEN', 'ANHDAIDIEN'], // Thông tin người dùng
                }
            ]
        });

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu tin nhắn");
    }
};

export { sendSupportHotel, sendSupportCustomer, getSupport, getSupportAll }