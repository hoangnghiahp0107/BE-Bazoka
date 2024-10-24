import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import PayOS from "@payos/node";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { createHmac } from "crypto";

dotenv.config();
const Op = Sequelize.Op;
const model = initModels(sequelize);

const payOS = new PayOS(
    process.env.PAYOS_CLIENT_ID,
    process.env.PAYOS_API_KEY,
    process.env.PAYOS_CHECKSUM_KEY
);

// Utility function to generate a random 6-digit string
const generateUniqueDescription = async (usedDescriptions) => {
    const getUniqueDescription = () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random 6-digit number
    };

    let description;
    do {
        description = getUniqueDescription();
    } while (usedDescriptions.has(description)); // Ensure it's unique

    usedDescriptions.add(description); // Mark it as used
    return description;
};

const bookingRoom = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');

        let { NGAYDEN, NGAYDI, SLKHACH, NGAYDATPHG, THANHTIEN, MA_MGG, MA_KS, numberOfRooms, LOAIPHONG } = req.body;
        MA_MGG = MA_MGG ? MA_MGG : null;
        NGAYDATPHG = NGAYDATPHG ? NGAYDATPHG : new Date();
        const MA_ND = decodedToken.data.MA_ND;

        // Kiểm tra các thông tin cần thiết
        if (!THANHTIEN || isNaN(THANHTIEN)) {
            return res.status(400).send("Số tiền không hợp lệ.");
        }
        if (!MA_KS) {
            return res.status(400).send("Thông tin khách sạn không hợp lệ.");
        }

        // Bước 1: Tìm phòng có sẵn dựa trên loại phòng
        const availableHotels = await model.KHACHSAN.findAll({
            where: { MA_KS },
            include: [
                {
                    model: model.PHONG,
                    as: 'PHONGs',
                    required: true,
                    attributes: ['MA_LOAIPHG', 'MA_PHONG'],
                    include: [
                        {
                            model: model.LOAIPHONG,
                            as: 'MA_LOAIPHG_LOAIPHONG',
                            required: true,
                            attributes: ['SLKHACH'],
                            where: { SLKHACH: { [Op.gte]: SLKHACH }, MA_LOAIPHG: LOAIPHONG }
                        }
                    ]
                }
            ]
        });

        const roomsToBook = [];
        for (const hotel of availableHotels) {
            for (const room of hotel.PHONGs) {
                const bookings = await model.PHIEUDATPHG.findAll({
                    where: {
                        MA_PHONG: room.MA_PHONG,
                        TRANGTHAI: 'Đặt thành công',
                        [Op.or]: [
                            { NGAYDEN: { [Op.between]: [new Date(NGAYDEN), new Date(NGAYDI)] } },
                            { NGAYDI: { [Op.between]: [new Date(NGAYDEN), new Date(NGAYDI)] } },
                            {
                                [Op.and]: [
                                    { NGAYDEN: { [Op.lte]: new Date(NGAYDEN) } },
                                    { NGAYDI: { [Op.gte]: new Date(NGAYDI) } }
                                ]
                            }
                        ]
                    }
                });

                if (bookings.length === 0) {
                    roomsToBook.push(room.MA_PHONG);
                }
            }
        }

        if (roomsToBook.length < numberOfRooms) {
            return res.status(404).send("Không có phòng phù hợp để đặt.");
        }

        // Generate a unique description for the payment link
        const usedDescriptions = new Set(); // To track already used descriptions
        const uniqueDescription = await generateUniqueDescription(usedDescriptions);

        // Bước 2: Tạo bản ghi đặt phòng
        // Tạo mã orderCode (có thể sử dụng số timestamp cuối cùng)
        const orderCode = Number(String(Date.now()).slice(-6));

        const newData = {
            NGAYDEN,
            NGAYDI,
            SLKHACH,
            TRANGTHAI: "Đang chờ thanh toán",
            NGAYDATPHG,
            THANHTIEN,
            MA_MGG,
            MA_ND,
            MA_PHONG: roomsToBook[0],
            orderCode // Thêm orderCode vào bản ghi
        };

        await model.PHIEUDATPHG.create(newData);

        // Bước 3: Tạo link thanh toán và trả về cho frontend
        const YOUR_DOMAIN = 'http://localhost:3000/layouts/';  // Tên miền frontend của bạn
        const paymentBody = {
            orderCode: orderCode,  // Sử dụng orderCode trong thông tin thanh toán
            amount: THANHTIEN,
            description: uniqueDescription, // Use the unique description here
            items: [
                {
                    name: 'Đặt phòng khách sạn',
                    quantity: 1,
                    price: THANHTIEN,
                },
            ],
            returnUrl: `${YOUR_DOMAIN}/index.html`,
            cancelUrl: `${YOUR_DOMAIN}/index.html`,
        };

        const paymentLinkResponse = await payOS.createPaymentLink(paymentBody);

        res.status(200).json({
            checkoutUrl: paymentLinkResponse.checkoutUrl
        });

    } catch (error) {
        console.error("Lỗi trong quá trình đặt phòng:", error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};

const verifyWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        const isValid = isValidData(webhookData.data, webhookData.signature, process.env.PAYOS_CHECKSUM_KEY);

        if (!isValid) {
            return res.status(400).send("Webhook không hợp lệ.");
        }

        const { orderCode, status } = webhookData.data;
        // Tìm phiếu đặt phòng dựa trên orderCode
        const booking = await model.PHIEUDATPHG.findOne({
            where: { orderCode: orderCode }
        });

        if (!booking) {
            return res.status(404).send("Không tìm thấy đơn đặt phòng.");
        }

        // Cập nhật trạng thái phiếu đặt phòng dựa trên trạng thái thanh toán
        if (status === 'success') {
            booking.TRANGTHAI = 'Đặt phòng thành công';
        } else {
            booking.TRANGTHAI = 'Thanh toán thất bại';
        }

        await booking.save();
        res.status(200).send("Cập nhật trạng thái đặt phòng thành công.");
    } catch (error) {
        console.error("Lỗi trong quá trình xác thực webhook:", error);
        res.status(500).send("Đã có lỗi xảy ra.");
    }
};


export { bookingRoom, verifyWebhook };
