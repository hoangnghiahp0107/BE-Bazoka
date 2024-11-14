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

const getDiscountUser = async (req, res) => {
    try {
        const token = req.headers.token; // Lấy token từ header

        // Kiểm tra xem token có tồn tại không
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        // Giải mã token để lấy thông tin người dùng
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'MINHNGHIA');
        const MA_ND = decodedToken.data.MA_ND; // Mã người dùng từ token

        // Lấy danh sách mã giảm giá mà người dùng đã sử dụng
        const usedDiscounts = await model.PHIEUDATPHG.findAll({
            where: {
                MA_ND: MA_ND,
                TRANGTHAI: "Đặt thành công", // Đảm bảo đơn hàng đã được đặt thành công
                XACNHAN: 1 // Đảm bảo đơn hàng đã được xác nhận
            },
            attributes: ['MA_MGG'] // Chỉ lấy MA_MGG (mã giảm giá) đã sử dụng
        });

        // Lấy danh sách mã giảm giá có thể sử dụng (tất cả mã giảm giá)
        const allDiscounts = await model.MAGIAMGIA.findAll();

        // Chuyển danh sách mã giảm giá đã sử dụng thành mảng các mã giảm giá
        const usedDiscountCodes = usedDiscounts.map(item => item.MA_MGG);

        // Lọc ra những mã giảm giá mà người dùng chưa sử dụng
        const availableDiscounts = allDiscounts.filter(discount => !usedDiscountCodes.includes(discount.MA_MGG));

        res.status(200).send(availableDiscounts);

    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
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
            where: {
                MA_KS: partnerId
            }
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
            MA_KS: partnerId
        };

        await model.KHUYENMAI.create(discountData);

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

        // Kiểm tra nếu mã giảm giá đã được áp dụng cho phòng nào không
        const discountInUse = await model.PHONG.findOne({
            where: { MA_KM }
        });

        if (discountInUse) {
            return res.status(400).send("Mã giảm giá đang được sử dụng trong phòng, không thể xóa.");
        }

        // Xóa mã giảm giá
        await model.KHUYENMAI.destroy({
            where: { MA_KS: partnerId }
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
        const { MA_KM } = req.params;
        const { TEN_KM, NGAYBATDAU, NGAYKETTHUC, PHANTRAM } = req.body;

        // Kiểm tra nếu thiếu MA_KM
        if (!MA_KM) {
            return res.status(400).send("Mã giảm giá (MA_KM) là bắt buộc");
        }

        // Tìm mã giảm giá dựa trên MA_KM và ID đối tác
        const existingDiscount = await model.KHUYENMAI.findOne({
            where: {
                MA_KM: MA_KM,
                MA_KS: partnerId
            }
        });

        if (!existingDiscount) {
            return res.status(404).send("Mã giảm giá không tồn tại hoặc không thuộc đối tác này");
        }

        // Cập nhật các trường
        const updatedData = {
            TEN_KM: TEN_KM || existingDiscount.TEN_KM, // Giữ nguyên nếu không có giá trị mới
            NGAYBATDAU: NGAYBATDAU || existingDiscount.NGAYBATDAU,
            NGAYKETTHUC: NGAYKETTHUC || existingDiscount.NGAYKETTHUC,
            PHANTRAM: PHANTRAM || existingDiscount.PHANTRAM
        };

        await existingDiscount.update(updatedData);

        res.status(200).send("Cập nhật mã giảm giá thành công!");

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

    const applyDiscount = async (req, res) => {
        try {
            const { MA_MGG } = req.params; // Lấy mã giảm giá từ request params
            const token = req.headers.token; // Lấy token từ header

            // Kiểm tra xem token có tồn tại không
            if (!token) {
                return res.status(401).send("Người dùng không được xác thực");
            }

            // Giải mã token để lấy thông tin người dùng
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'MINHNGHIA');
            const MA_ND = decodedToken.data.MA_ND; // Mã người dùng từ token

            // Kiểm tra xem MA_ND và MA_MGG đã tồn tại trong PHIEUDATPHG chưa
            const existingBooking = await model.PHIEUDATPHG.findOne({
                where: {
                    MA_ND: MA_ND,
                    MA_MGG: MA_MGG
                }
            });

            // Nếu đã tồn tại thì trả về lỗi
            if (existingBooking) {
                return res.status(400).send("Mã giảm giá này đã được sử dụng cho người dùng này.");
            }

            // Kiểm tra xem mã giảm giá có tồn tại trong bảng MAGIAMGIA không
            const discount = await model.MAGIAMGIA.findOne({
                where: {
                    MA_MGG: MA_MGG
                }
            });

            // Nếu không tìm thấy mã giảm giá trong bảng MAGIAMGIA
            if (!discount) {
                return res.status(404).send("Không tìm thấy mã giảm giá.");
            }

            // Trả về thông tin mã giảm giá nếu tất cả các điều kiện đều thỏa mãn
            res.status(200).send(discount);

        } catch (error) {
            // Xử lý lỗi nếu có
            console.log(error);
            res.status(500).send("Lỗi khi lấy dữ liệu");
        }
    };



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

export { getDiscount, deleteDiscount, selectDiscountPartner, createDiscount, updateDiscount, selectDiscount, getDiscountPartner, createDiscountPartner, updateDiscountPartner, deleteDiscountPartner, applyDiscount, getDiscountUser }