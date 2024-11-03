import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";

const Op = Sequelize.Op;
const model = initModels(sequelize);

const getRoom = async (req, res) =>{
    try {
        const data = await model.PHONG.findAll();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
}

const getRoomPartner = async (req, res) => {
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

        const data = await model.PHONG.findAll({
            where: {
                MA_KS: partnerId 
            },
        });

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};


const getDataRoom = async (req, res) => {
    try {
        const { MA_KS } = req.params;

        // Define today's date and tomorrow's date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 1); // Set endDate to tomorrow

        // Fetch room types and rooms associated with the hotel MA_KS
        const data = await model.LOAIPHONG.findAll({
            include: [
                {
                    model: model.PHONG,
                    as: 'PHONGs',
                    required: true,
                    where: {
                        MA_KS: MA_KS
                    },
                    include: [
                        {
                            model: model.KHUYENMAI,
                            as: 'MA_KM_KHUYENMAI',
                            required: false,
                            attributes: ['PHANTRAM']
                        }
                    ]
                }
            ]
        });

        // Check room statuses
        const result = await Promise.all(data.map(async (type) => {
            const roomsStatus = await Promise.all(type.PHONGs.map(async (room) => {
                // Check if the room is booked during the specified period
                const booking = await model.PHIEUDATPHG.findOne({
                    where: {
                        MA_PHONG: room.MA_PHONG,
                        [Op.or]: [
                            {
                                NGAYDEN: {
                                    [Op.between]: [startDate, endDate]
                                }
                            },
                            {
                                NGAYDI: {
                                    [Op.between]: [startDate, endDate]
                                }
                            },
                            {
                                [Op.and]: [
                                    { NGAYDEN: { [Op.lte]: startDate } },
                                    { NGAYDI: { [Op.gte]: endDate } }
                                ]
                            }
                        ],
                        TRANGTHAI: {
                            [Op.ne]: 'Đã hủy'
                        }
                    }
                });

                // If there are no bookings during this time, the room is available
                const isAvailable = !booking; // Simplified boolean check
                return { room, isAvailable };
            }));

            // Filter available rooms
            const availableRooms = roomsStatus.filter(rs => rs.isAvailable).map(rs => rs.room);
            const roomToShow = availableRooms.length === 0 ? roomsStatus[0].room : availableRooms[0];

            const giaGoc = roomToShow.GIATIEN;
            const discountPercent = roomToShow.MA_KM_KHUYENMAI ? roomToShow.MA_KM_KHUYENMAI.PHANTRAM : null;
            let giaDaGiam = null;

            if (discountPercent !== null) {
                // Calculate discounted price
                giaDaGiam = Math.round(giaGoc * (100 - discountPercent) / 100);
            }

            return {
                MA_LOAIPHG: type.MA_LOAIPHG,
                TENLOAIPHG: type.TENLOAIPHG,
                SLPHONG: availableRooms.length, // Number of available rooms
                TRANGTHAI: availableRooms.length === 0 ? "Hết phòng" : "Trống",
                PHONG: roomToShow, // Room to display
                GIADAGIAM: giaDaGiam // Discounted price (if applicable)
            };
        }));

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};



const getDataRoomDay = async (req, res) => {
    try {
        const { MA_KS } = req.params;
        const { NGAYDEN, NGAYDI } = req.query; // Nhận ngày đến và ngày đi từ query

        const startDate = new Date(NGAYDEN); // Chuyển đổi NGAYDEN thành dạng Date
        const endDate = new Date(NGAYDI);    // Chuyển đổi NGAYDI thành dạng Date

        // Lấy danh sách các loại phòng và các phòng thuộc khách sạn MA_KS
        const data = await model.LOAIPHONG.findAll({
            include: [
                {
                    model: model.PHONG,
                    as: 'PHONGs',
                    required: true,
                    where: {
                        MA_KS: MA_KS
                    },
                    include: [
                        {
                            model: model.KHUYENMAI,
                            as: 'MA_KM_KHUYENMAI',
                            required: false,
                            attributes: ['PHANTRAM']
                        }
                    ]
                }
            ]
        });

        // Duyệt qua các loại phòng để kiểm tra trạng thái phòng
        const result = await Promise.all(data.map(async (type) => {
            const roomsStatus = await Promise.all(type.PHONGs.map(async (room) => {
                // Kiểm tra xem phòng này có được đặt trong khoảng thời gian cụ thể không
                const booking = await model.PHIEUDATPHG.findOne({
                    where: {
                        MA_PHONG: room.MA_PHONG,
                        [Op.or]: [
                            {
                                NGAYDEN: {
                                    [Op.between]: [startDate, endDate]
                                }
                            },
                            {
                                NGAYDI: {
                                    [Op.between]: [startDate, endDate]
                                }
                            },
                            {
                                [Op.and]: [
                                    { NGAYDEN: { [Op.lte]: startDate } },
                                    { NGAYDI: { [Op.gte]: endDate } }
                                ]
                            }
                        ],
                        TRANGTHAI: 'Đặt thành công'
                    }
                });

                // Nếu không có booking nào trùng thời gian, phòng đang trống
                const isAvailable = booking ? false : true;
                return { room, isAvailable };
            }));

            // Lọc ra các phòng trống
            const availableRooms = roomsStatus.filter(rs => rs.isAvailable).map(rs => rs.room);

            // Lấy thông tin phòng để hiển thị
            const roomToShow = availableRooms.length === 0 ? roomsStatus[0].room : availableRooms[0];

            const giaGoc = roomToShow.GIATIEN;
            const discountPercent = roomToShow.MA_KM_KHUYENMAI ? roomToShow.MA_KM_KHUYENMAI.PHANTRAM : null;
            let giaDaGiam = null;

            if (discountPercent !== null) {
                // Tính giá đã giảm
                giaDaGiam = Math.round(giaGoc * (100 - discountPercent) / 100);
            }

            return {
                MA_LOAIPHG: type.MA_LOAIPHG, // Thêm MA_LOAIPHG vào kết quả
                TENLOAIPHG: type.TENLOAIPHG,
                SLKHACH: type.SLKHACH,
                SLGIUONGDON: type.SLGIUONGDON,
                SLGIUONGDOI: type.SLGIUONGDOI,
                SLPHONG: availableRooms.length, // Số lượng phòng trống
                TRANGTHAI: availableRooms.length === 0 ? "Hết phòng" : "Trống",
                PHONG: roomToShow, // Phòng hiển thị
                GIADAGIAM: giaDaGiam // Giá đã giảm (nếu có)
            };
        }));

        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};



const createRoom = async (req, res) =>{
    try {
        const token = req.headers.token;
        if(!token){
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }
        let { TENPHONG, MOTA, GIATIEN, HINHANH, TRANGTHAIPHG, MA_KS, MA_KM, MA_LOAIPHG } = req.body;
        let roomData = {
            TENPHONG,
            MOTA,
            GIATIEN,
            HINHANH,
            TRANGTHAIPHG, 
            MA_KS,
            MA_KM,
            MA_LOAIPHG
        }
        await model.PHONG.create(roomData);
        res.status(200).send("Bạn đã tạo phòng thành công");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

const selectRoom = async (req, res) =>{
    try {
        const { MA_PHONG } = req.params;
        const data = await model.PHONG.findOne({
            where:{
                MA_PHONG: MA_PHONG
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

const updateRoom = async (req, res) =>{
    try {
        const token = req.headers.token;
        if(!token){
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }
        let { MA_PHONG } = req.params;
        let { TENPHONG, MOTA, GIATIEN, HINHANH, TRANGTHAIPHG, MA_KS, MA_KM, MA_LOAIPHG } = req.body;
        await model.PHONG.update(
            { TENPHONG, MOTA, GIATIEN, HINHANH, TRANGTHAIPHG, MA_KS, MA_KM, MA_LOAIPHG },
            {
                where:{
                    MA_PHONG
                }
            }
        )
        res.status(200).send("Cập nhật phòng thành công");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

const deleteRoom = async (req, res)=>{
    try {
        const token = req.headers.token;
        if(!token){
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }
        let { MA_PHONG } = req.body;
        if (!MA_PHONG){
            return res.status(400).send("Mã phòng không hợp lệ");
        }
        const destroyRoom = await model.PHONG.destroy({
            where:{
                MA_PHONG
            }
        });
        if (!destroyRoom){
            return res.status(404).send("Không tìm thấy phòng");
        }
        res.status(200).send("Xóa phòng thành công");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")  
    }
}

const getSearchNameRoom = async (req, res) => {
    const { TENPHONG } = req.params;
    const data = await model.PHONG.findAll({
        where: {
            TENPHONG: {
                [Op.like]: `%${TENPHONG}%`
            }
        }
    });
    res.status(200).send(data);
}

const getRoomID = async (req, res) => {
    const { MA_PHONG } = req.params;
    const data = await model.PHONG.findOne({
        where:{
            MA_PHONG: MA_PHONG
        }
    });
    res.status(200).send(data);
}

const getConvenient = async (req, res) =>{
    const { MA_KS } = req.params;
    const data = await model.KHACHSAN_TIENNGHI.findAll({
        where:{
            MA_KS: MA_KS
        }
    })
    res.status(200).send(data);
}

const getPrice = async (req, res) => {
    const { MA_KS } = req.params;
    try {
        const minPrice = await model.PHONG.min('GIATIEN', {
            where: {
                MA_KS: MA_KS
            }
        });
        
        if (minPrice === null) {
            return res.status(404).send({ message: "Không tìm thấy phòng cho khách sạn này." });
        }

        res.status(200).send({ GIATIEN: minPrice });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Có lỗi xảy ra khi lấy dữ liệu." });
    }
}

const getPriceDiscount = async (req, res) => {
    const { MA_KS } = req.params;
    try {
        const data = await model.PHONG.findAll({
            where: {
                MA_KS: MA_KS
            },
            attributes: ['GIATIEN'],
            include: [
                {
                    model: model.KHUYENMAI,
                    as: 'MA_KM_KHUYENMAI',
                    required: false, 
                    attributes: ['PHANTRAM'] 
                }
            ]
        });

        let minRoom = null;
        let minPrice = Infinity;

        data.forEach(item => {
            const giaGoc = item.GIATIEN;
            const discountPercent = item.MA_KM_KHUYENMAI ? item.MA_KM_KHUYENMAI.PHANTRAM : null;

            if (discountPercent !== null) {
                // Tính giá đã giảm nếu có khuyến mãi
                const giaDaGiam = giaGoc * (100 - discountPercent) / 100;

                // Cập nhật giá đã giảm nếu thấp hơn giá tối thiểu hiện tại
                if (giaDaGiam < minPrice) {
                    minPrice = giaDaGiam;
                    minRoom = {
                        giaGoc: Math.round(giaGoc), // Làm tròn giá gốc
                        giaDaGiam: Math.round(giaDaGiam) // Làm tròn giá đã giảm
                    };
                }
            } else {
                // Nếu không có khuyến mãi, chỉ so sánh giá gốc
                if (giaGoc < minPrice) {
                    minPrice = giaGoc;
                    minRoom = {
                        giaGoc: Math.round(giaGoc), // Làm tròn giá gốc
                        giaDaGiam: null // Bỏ giá đã giảm
                    };
                }
            }
        });

        if (minRoom) {
            res.status(200).send(minRoom);
        } else {
            res.status(404).send({ message: "Không tìm thấy phòng trong khách sạn này." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Có lỗi xảy ra khi lấy dữ liệu." });
    }
};




export { getRoom, createRoom, updateRoom, deleteRoom, selectRoom, getSearchNameRoom, getRoomID, getConvenient, getPrice, getPriceDiscount, getDataRoom, getDataRoomDay, getRoomPartner } 