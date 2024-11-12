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

const getCountMoneyMonth = async (req, res) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).send("Người dùng không được xác thực");
    }

    const decodedToken = jwt.verify(token, 'MINHNGHIA');
    const currentUserRole = decodedToken.data.CHUCVU;

    const partnerIdMatch = currentUserRole.match(/Partner(\d+)/);
    const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

    if (!partnerId) {
        return res.status(400).send("ID đối tác không hợp lệ");
    }

    // Lấy ngày hiện tại và tính toán phạm vi 4 tuần trong tháng
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Định nghĩa các tuần trong tháng (với ngày thuần JavaScript)
    const weeks = [];
    let startOfWeek = new Date(startOfMonth);
    for (let i = 0; i < 4; i++) {
        let endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Cuối tuần (chủ nhật)
        weeks.push({
            start: startOfWeek.toISOString().split('T')[0],
            end: endOfWeek.toISOString().split('T')[0]
        });
        startOfWeek.setDate(startOfWeek.getDate() + 7); // Cập nhật sang tuần tiếp theo
    }

    try {
        const doanhthuPerWeek = [];

        for (let i = 0; i < weeks.length; i++) {
            const week = weeks[i];
            const doanhthu = await model.PHIEUDATPHG.findAll({
                where: {
                    TRANGTHAI: "Check-out",
                    [Op.or]: [
                        {
                            NGAYDEN: {
                                [Op.gte]: week.start,
                                [Op.lte]: week.end
                            }
                        },
                        {
                            NGAYDI: {
                                [Op.gte]: week.start,
                                [Op.lte]: week.end
                            }
                        },
                        {
                            [Op.and]: [
                                { NGAYDEN: { [Op.lt]: week.start } },
                                { NGAYDI: { [Op.gte]: week.start } }
                            ]
                        }
                    ]
                },
                include: [
                    {
                        model: model.PHONG,
                        as: 'MA_PHONG_PHONG',
                        required: true,
                        include: [
                            {
                                model: model.KHACHSAN,
                                as: 'MA_KS_KHACHSAN',
                                required: true,
                                where: {
                                    MA_KS: partnerId
                                }
                            }
                        ]
                    }
                ]
            });

            // Tính tổng doanh thu cho tuần này
            const totalRevenue = doanhthu.reduce((total, item) => {
                return total + item.THANHTIEN; // Giả sử 'TONGTIEN' là thuộc tính chứa doanh thu của phiếu đặt phòng
            }, 0);

            // Tạo tên tuần như 'TUAN1', 'TUAN2'...
            const weekName = `TUAN${i + 1}`;

            doanhthuPerWeek.push({
                week: weekName, // Tên tuần
                totalRevenue: totalRevenue
            });
        }

        // Trả về kết quả doanh thu theo tuần theo dạng bạn yêu cầu
        return res.status(200).json(doanhthuPerWeek);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Đã xảy ra lỗi khi tính toán doanh thu");
    }
};



const getCountBookingMonth = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear(); // Lấy năm hiện tại

        // Đếm số lượng phiếu đặt phòng theo từng tháng với điều kiện TRANGTHAI và XACNHAN
        const phieuDatPhgCounts = await model.PHIEUDATPHG.findAll({
            attributes: [
                [Sequelize.fn('MONTH', Sequelize.col('NGAYDEN')), 'month'], // Lấy tháng từ NGAYDEN
                [Sequelize.fn('COUNT', Sequelize.col('MA_DP')), 'count'], // Đếm số lượng
            ],
            where: {
                // Lọc theo trạng thái: Đặt thành công, Check-in, Check-out và XACNHAN = true
                TRANGTHAI: {
                    [Op.in]: ['Đặt thành công', 'Check-in', 'Check-out'], // Các trạng thái cần tính
                },
                XACNHAN: true, // Phải có XACNHAN = true
                NGAYDEN: {
                    [Op.gte]: new Date(currentYear, 0, 1), // Từ đầu năm
                    [Op.lte]: new Date(currentYear, 11, 31), // Đến cuối năm
                },
            },
            group: ['month'], // Nhóm theo tháng
            order: [['month', 'ASC']], // Sắp xếp theo tháng
        });

        // Chuyển đổi dữ liệu thành định dạng dễ đọc
        const monthlyCounts = Array(12).fill(0); // Mảng để lưu số lượng mỗi tháng
        phieuDatPhgCounts.forEach(item => {
            const month = item.dataValues.month - 1; // Tháng (0-11)
            monthlyCounts[month] = item.dataValues.count; // Cập nhật số lượng
        });

        // Gửi phản hồi về số lượng đặt phòng theo từng tháng
        res.json({
            monthlyCounts, // Gửi số lượng đặt phòng theo từng tháng
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra', error: error.message });
    }
};


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
            include: [
                {
                    model: model.PHONG,
                    as: 'MA_PHONG_PHONG',
                    attributes: ['TENPHONG'],
                    required: true,
                    order: [
                        ['NGAYDATPHG', 'DESC']
                    ],
                    include: [
                        {
                            model: model.KHACHSAN,
                            as: 'MA_KS_KHACHSAN',
                            attributes: ['TEN_KS']
                        }
                    ]
                },{
                    model: model.NGUOIDUNG,
                    as: 'MA_ND_NGUOIDUNG',
                    attributes: ['EMAIL', 'SDT'],
                    required: true
                }
        ],

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

const bookingRoomPay = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'MINHNGHIA');

        let { NGAYDEN, NGAYDI, NGAYDATPHG, THANHTIEN, MA_MGG, MA_KS, numberOfRooms, LOAIPHONG, DACOC } = req.body;
        MA_MGG = MA_MGG ? MA_MGG : null;
        NGAYDATPHG = NGAYDATPHG ? new Date(NGAYDATPHG) : new Date();
        const MA_ND = decodedToken.data.MA_ND;

        // Kiểm tra các thông tin cần thiết
        if (!THANHTIEN || isNaN(THANHTIEN) || THANHTIEN <= 0) {
            return res.status(400).send("Số tiền không hợp lệ.");
        }
        if (!DACOC || isNaN(DACOC) || DACOC <= 0) {
            return res.status(400).send("Số tiền đặt cọc không hợp lệ.");
        }
        if (!MA_KS) {
            return res.status(400).send("Thông tin khách sạn không hợp lệ.");
        }
        if (!LOAIPHONG) {
            return res.status(400).send("Loại phòng không hợp lệ.");
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
                            where: { SLKHACH: { [Op.gte]: numberOfRooms }, MA_LOAIPHG: LOAIPHONG }
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

        // Bước 2: Tạo bản ghi đặt phòng cho từng phòng
        const ORDERCODE = Number(String(Date.now()).slice(-6));
        const bookingPromises = roomsToBook.map((roomId) => {
            return model.PHIEUDATPHG.create({
                NGAYDEN,
                NGAYDI,
                TRANGTHAI: "Đặt thành công",
                NGAYDATPHG,
                THANHTIEN, // Chia số tiền cho từng phòng
                MA_MGG,
                MA_ND,
                MA_PHONG: roomId,
                ORDERCODE,
                DACOC,
                XACNHAN: 1
            });
        });

        await Promise.all(bookingPromises);

        // Bước 3: Tạo link thanh toán và trả về cho frontend
        const YOUR_DOMAIN = 'http://127.0.0.1:3000/layouts';  // Tên miền frontend của bạn
        const paymentBody = {
            orderCode: ORDERCODE,
            amount: DACOC,
            description: `MA_KS: ${MA_KS}`,  // Sửa lại đây để dùng thông tin mã khách sạn
            items: roomsToBook.map((roomId) => ({
                name: 'Đặt phòng khách sạn',
                quantity: numberOfRooms,
                price: DACOC, // Giá cho từng phòng
            })),
            returnUrl: `${YOUR_DOMAIN}/success.html`,
            cancelUrl: `${YOUR_DOMAIN}/cancel.html`,
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
                        XACNHAN: 1,
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
                TRANGTHAI: "Đặt thành công",
                NGAYDATPHG,
                THANHTIEN, 
                MA_MGG,
                MA_ND,
                MA_PHONG: roomId,
                ORDERCODE: null
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

//CRUD dành cho Partner
const createBookingFormPartner = async (req, res) => {
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
        const partnerIdMatch = currentUserRole.match(/Partner(\d+)/);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        // Kiểm tra ID đối tác
        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        let { NGAYDEN, NGAYDI, SLKHACH, NGAYDATPHG, THANHTIEN, MA_MGG, MA_KS, numberOfRooms, LOAIPHONG } = req.body;
        MA_MGG = MA_MGG ? MA_MGG : null;
        NGAYDATPHG = NGAYDATPHG ? new Date(NGAYDATPHG) : new Date();

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
        console.error("Lỗi khi tạo đơn đặt phòng:", error);
        res.status(500).send("Lỗi khi tạo đơn đặt phòng");
    }
};


const getBookingFormPartner = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserRole = decodedToken.data.CHUCVU;

        const partnerIdMatch = currentUserRole.match(/Partner(\d+)/);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        if (!partnerId) {
            return res.status(400).send("ID đối tác không hợp lệ");
        }

        // Lấy danh sách đặt phòng và sắp xếp theo NGAYDATPHG từ cao đến thấp
        const bookings = await model.PHIEUDATPHG.findAll({
            include: [
                {
                    model: model.PHONG,
                    as: 'MA_PHONG_PHONG',
                    required: true,
                    where: {
                        MA_KS: partnerId
                    }
                },
                {
                    model: model.NGUOIDUNG,
                    as: 'MA_ND_NGUOIDUNG',
                    required: true
                },
            ],
            order: [
                ['NGAYDATPHG', 'DESC']  // Sắp xếp theo NGAYDATPHG từ cao đến thấp
            ]
        });

        res.status(200).send(bookings);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const updateBookingFormPartner = async (req, res) => {
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
        const partnerIdMatch = currentUserRole.match(/Partner(\d+)/);
        const partnerId = partnerIdMatch ? partnerIdMatch[1] : null;

        // Kiểm tra ID đối tác
        if (!partnerId) {
            return res.status(403).send("ID đối tác không hợp lệ");
        }

        const { MA_DP } = req.params;

        // Lấy thông tin cập nhật từ body
        let { MA_PHONG, NGAYDEN, NGAYDI, TRANGTHAI, THANHTIEN, MA_MGG, DACOC, XACNHAN } = req.body;
        MA_MGG = MA_MGG || null;

        // Kiểm tra xem phòng có đang được đặt trong khoảng thời gian đã chọn không
        const existingBooking = await model.PHIEUDATPHG.findOne({
            where: {
                MA_PHONG,
                [Op.or]: [
                    // Phòng đã được đặt trong khoảng thời gian cập nhật
                    {
                        NGAYDEN: {
                            [Op.between]: [new Date(NGAYDEN), new Date(NGAYDI)]
                        }
                    },
                    {
                        NGAYDI: {
                            [Op.between]: [new Date(NGAYDEN), new Date(NGAYDI)]
                        }
                    },
                    {
                        [Op.and]: [
                            { NGAYDEN: { [Op.lte]: new Date(NGAYDEN) } },
                            { NGAYDI: { [Op.gte]: new Date(NGAYDI) } }
                        ]
                    }
                ],
                TRANGTHAI: 'Đặt thành công', // Chỉ cần phòng đã được đặt thành công
                MA_DP: { [Op.ne]: MA_DP } // Không xét cho đơn đặt phòng hiện tại
            }
        });

        // Nếu phòng đã được đặt trong khoảng thời gian, không cho phép cập nhật
        if (existingBooking) {
            return res.status(400).send("Phòng này đã được đặt trong khoảng thời gian bạn chọn.");
        }

        // Nếu không có booking trùng, tiến hành cập nhật
        await model.PHIEUDATPHG.update({
            MA_PHONG,
            NGAYDEN,
            NGAYDI,
            TRANGTHAI,
            THANHTIEN,
            MA_MGG,
            DACOC,
            XACNHAN
        },
        {
            where: {
                MA_DP
            }
        });

        res.status(200).send("Đơn đặt phòng đã được cập nhật thành công");
    } catch (error) {
        console.error("Lỗi khi cập nhật đơn đặt phòng:", error);
        res.status(500).send("Lỗi khi cập nhật đơn đặt phòng");
    }
};




const deleteBookingFormPartner = async (req, res) => {
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

        // Lấy MA_PHONG từ params
        const { MA_DP } = req.params;

        // Kiểm tra xem phòng có thuộc về partner không
        const room = await model.PHIEUDATPHG.findOne({
            include:[
                {
                    model: model.PHONG,
                    as: 'MA_PHONG_PHONG',
                    where: {
                        MA_KS: partnerId // Kiểm tra MA_KS của phòng có khớp với partnerId không
                    }
                }
            ]

        });

        if (!room) {
            return res.status(403).send("Bạn không có quyền xóa phòng này");
        }

        // Xóa phòng
        const destroyBookingForm = await model.PHIEUDATPHG.destroy({
            where: {
                MA_DP: MA_DP,
            }
        });

        if (!destroyBookingForm) {
            return res.status(404).send("Không tìm thấy phòng để xóa");
        }

        res.status(200).send("Xóa phòng thành công");
    } catch (error) {
        console.error("Lỗi khi xóa phòng:", error);
        
        // Kiểm tra nếu phòng đã có đơn đặt trước
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(500).send("Phòng đã được đặt, không thể xóa");
        }
        res.status(500).send("Lỗi khi xóa phòng");
    }
};

const selectBooking = async (req, res) =>{
    try {
        const { MA_DP } = req.params;
        const data = await model.PHIEUDATPHG.findOne({
            where:{
                MA_DP: MA_DP
            },
            include: [
                {
                    model: model.PHONG,
                    as: 'MA_PHONG_PHONG',
                    required: true,
                },
                {
                    model: model.NGUOIDUNG,
                    as: 'MA_ND_NGUOIDUNG',
                    required: true
                },
            ]
        })
        if (!data){
            return res.status(404).send("Không tìm thấy phiếu đặt phòng");
        }
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

export { getCountBookingMonth, bookingRoomPay, verifyWebhook, bookingRoom, getBookingUser, cancelBookingUser, getBookingAll, createBookingFormPartner, getBookingFormPartner, updateBookingFormPartner, deleteBookingFormPartner, selectBooking, getCountMoneyMonth };
