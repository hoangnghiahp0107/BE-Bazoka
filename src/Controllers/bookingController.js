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

const getBookingUser = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserID = decodedToken.data.MA_ND; 

        const data = await model.PHIEUDATPHG.findAll({
            where: {
                MA_ND: currentUserID 
            },
            include: ['MA_PHONG_PHONG'],
            order: [
                [sequelize.literal(`CASE WHEN TRANGTHAI = 'Đặt thành công' THEN 0 ELSE 1 END`)],
                ['NGAYDATPHG', 'DESC']
            ]
        });

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const getBookingAll = async (req, res) =>{
    try {
        const token = req.headers.token;
        if(!token){
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }
        
        const data = await model.PHIEUDATPHG.findAll({
            include: ['MA_PHONG_PHONG'],
            order: [
                ['NGAYDATPHG', 'DESC']
            ]
        });        
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

const cancelBookingUser = async (req, res) => {
    try {
        const token = req.headers.token;
        let { MA_DP } = req.params;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const [updatedRows] = await model.PHIEUDATPHG.update(
            { TRANGTHAI: "Đã hủy" }, 
            {
                where: {
                    MA_DP: MA_DP 
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(404).send("Không tìm thấy mã đặt phòng");
        }

        res.status(200).send("Cập nhật thành công");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

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

const bookingRoomPay = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'MINHNGHIA');

        let { NGAYDEN, NGAYDI, SLKHACH, NGAYDATPHG, THANHTIEN, MA_MGG, MA_KS, numberOfRooms, LOAIPHONG } = req.body;
        MA_MGG = MA_MGG ? MA_MGG : null;
        NGAYDATPHG = NGAYDATPHG ? new Date(NGAYDATPHG) : new Date();
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
                // Dừng nếu đã đủ số lượng phòng cần đặt
                if (roomsToBook.length >= numberOfRooms) break;
            }
            // Dừng nếu đã đủ số lượng phòng cần đặt
            if (roomsToBook.length >= numberOfRooms) break;
        }

        if (roomsToBook.length < numberOfRooms) {
            return res.status(404).send("Không có phòng phù hợp để đặt.");
        }

        // Generate a unique description for the payment link
        const usedDescriptions = new Set(); // To track already used descriptions
        const uniqueDescription = await generateUniqueDescription(usedDescriptions);

        // Bước 2: Tạo bản ghi đặt phòng cho từng phòng
        const ORDERCODE = Number(String(Date.now()).slice(-6));
        const bookingPromises = roomsToBook.map((roomId) => {
            return model.PHIEUDATPHG.create({
                NGAYDEN,
                NGAYDI,
                SLKHACH,
                TRANGTHAI: "Đang chờ thanh toán",
                NGAYDATPHG,
                THANHTIEN: THANHTIEN * numberOfRooms, // Chia số tiền cho từng phòng
                MA_MGG,
                MA_ND,
                MA_PHONG: roomId,
                ORDERCODE
            });
        });

        await Promise.all(bookingPromises);

        // Bước 3: Tạo link thanh toán và trả về cho frontend
        const YOUR_DOMAIN = 'http://localhost:3000/layouts/';  // Tên miền frontend của bạn
        const paymentBody = {
            orderCode: ORDERCODE,
            amount: THANHTIEN,
            description: uniqueDescription,
            items: roomsToBook.map((roomId) => ({
                name: 'Đặt phòng khách sạn',
                quantity: 1,
                price: THANHTIEN * numberOfRooms, // Giá cho từng phòng
            })),
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


function sortObjDataByKey(object) {
    return Object.keys(object)
        .sort()
        .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
        }, {});
}

function convertObjToQueryStr(object) {
    return Object.keys(object)
        .filter((key) => object[key] !== undefined)
        .map((key) => {
            let value = object[key];

            // Sắp xếp đối tượng lồng
            if (value && typeof value === 'object') {
                value = JSON.stringify(sortObjDataByKey(value));
            }

            // Đặt chuỗi rỗng nếu null
            if ([null, undefined, "undefined", "null"].includes(value)) {
                value = "";
            }

            return `${key}=${encodeURIComponent(value)}`;
        })
        .join("&");
}

// Hàm tạo chữ ký
const generateSignature = (data, checksumKey) => {
    const sortedData = sortObjDataByKey(data);
    const queryString = convertObjToQueryStr(sortedData);
    return createHmac("sha256", checksumKey)
        .update(queryString)
        .digest("hex");
};

const verifyWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        console.log("Received webhook data:", webhookData); // Ghi log toàn bộ dữ liệu nhận được

        // Kiểm tra tính hợp lệ của dữ liệu webhook
        if (!webhookData || !webhookData.data || !webhookData.signature) {
            return res.status(400).send("Dữ liệu webhook không hợp lệ.");
        }

        const { orderCode, status } = webhookData.data;
        if (!orderCode || !status) {
            return res.status(400).send("Thông tin đơn hàng không hợp lệ.");
        }

        // Tạo chữ ký từ dữ liệu nhận được
        const expectedSignature = generateSignature(webhookData.data, process.env.PAYOS_CHECKSUM_KEY);
        console.log("Expected signature:", expectedSignature); // Ghi log chữ ký mong đợi

        // So sánh chữ ký
        if (expectedSignature !== webhookData.signature) {
            return res.status(400).send("Webhook không hợp lệ.");
        }

        // Tìm phiếu đặt phòng và cập nhật trạng thái
        const booking = await model.PHIEUDATPHG.findOne({
            where: { ORDERCODE: orderCode }
        });

        if (!booking) {
            return res.status(404).send("Không tìm thấy đơn đặt phòng.");
        }

        // Cập nhật trạng thái phiếu đặt phòng
        booking.TRANGTHAI = (status === 'success') ? 'Đặt thành công' : 'Thanh toán thất bại';
        await booking.save();
        res.status(200).send("Cập nhật trạng thái đặt phòng thành công.");
    } catch (error) {
        console.error("Lỗi trong quá trình xác thực webhook:", error);
        res.status(500).send("Đã có lỗi xảy ra.");
    }
};

const bookingRoom = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'MINHNGHIA');
        let { NGAYDEN, NGAYDI, SLKHACH, NGAYDATPHG, THANHTIEN, MA_MGG, MA_KS, numberOfRooms, LOAIPHONG } = req.body;
        MA_MGG = MA_MGG ? MA_MGG : null;
        NGAYDATPHG = NGAYDATPHG ? new Date(NGAYDATPHG) : new Date();
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
                // Dừng nếu đã đủ số lượng phòng cần đặt
                if (roomsToBook.length >= numberOfRooms) break;
            }
            // Dừng nếu đã đủ số lượng phòng cần đặt
            if (roomsToBook.length >= numberOfRooms) break;
        }

        if (roomsToBook.length < numberOfRooms) {
            return res.status(404).send("Không có phòng phù hợp để đặt.");
        }

        // Bước 2: Tạo một phiếu đặt phòng cho từng phòng
        const bookingPromises = roomsToBook.map((roomId) => {
            return model.PHIEUDATPHG.create({
                NGAYDEN,
                NGAYDI,
                SLKHACH,
                TRANGTHAI: "Đặt thành công", // Trạng thái là "Đặt thành công"
                NGAYDATPHG,
                THANHTIEN, // Tổng số tiền
                MA_MGG,
                MA_ND,
                MA_PHONG: roomId,
                ORDERCODE: null // Bỏ trống ORDERCODE
            });
        });

        await Promise.all(bookingPromises);

        // Trả về thông tin phiếu đặt phòng
        res.status(200).json({
            message: "Đặt phòng thành công",
            rooms: roomsToBook
        });

    } catch (error) {
        console.error("Lỗi trong quá trình đặt phòng:", error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};



export { bookingRoomPay, verifyWebhook, bookingRoom, getBookingUser, cancelBookingUser, getBookingAll };
