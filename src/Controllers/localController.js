import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";

const Op = Sequelize.Op;
const model = initModels(sequelize);

const createTienNghi = async (req, res) => {
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

        const { TENTIENNGHI, ICON} = req.body;

        const tiennghiData = {
            TENTIENNGHI,
            ICON,
            MA_KS: partnerId
        };

        await model.TIENNGHI.create(tiennghiData);

        res.status(200).send("Bạn đã tạo tiện nghi thành công!");

    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi thêm dữ liệu");
    }
};

const getCountry = async (req, res) => {
    try {
        const data = await model.QUOCGIA.findAll({
            attributes: [
                'MA_QUOCGIA',
                'TEN_QUOCGIA', 
                'HINHANH',    
                [sequelize.fn('COUNT', model.KHACHSAN.MA_KS), 'hotelCount']
            ],
            include: [
                {
                    model: model.TINHTHANH,
                    as: "TINHTHANHs", 
                    include: [
                        {
                            model: model.VITRI,
                            as: "VITRIs",
                            include: [
                                {
                                    model: model.KHACHSAN,
                                    as: "KHACHSANs", 
                                    attributes: [], 
                                },
                            ],
                        },
                    ],
                },
            ],
            group: 'QUOCGIA.MA_QUOCGIA',
            order: [[sequelize.col('hotelCount'), 'DESC']],
            limit: 6, 
        });
        
        const countryData = data.map(country => ({
            MA_QUOCGIA: country.MA_QUOCGIA,
            TEN_QUOCGIA: country.TEN_QUOCGIA,
            HINHANH: country.HINHANH
        }));

        res.status(200).send(countryData);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const getProvince = async (req, res) =>{
    try {
        const data = await model.TINHTHANH.findAll({
            include: ['MA_QUOCGIA_QUOCGIum'],
            where: {
                MA_QUOCGIA: 1 // Điều kiện MA_QUOCGIA = 1
            }
        });
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

const getTienNghi = async (req, res) => {
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

        const data = await model.TIENNGHI.findAll({
            where: {
                MA_KS: partnerId // Lọc phòng theo mã khách sạn (đối tác)
            }
        });

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const getAllDiaDiem = async (req, res) =>{
    try {
        const data = await model.VITRI.findAll({
            attributes: ['MA_VITRI', 'TENVITRI']
        })
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
}

const getAllLocation = async (req, res) => {
    try {
        const data = await model.VITRI.findAll({
            include: [
                {
                    model: model.TINHTHANH,
                    as: 'MA_TINHTHANH_TINHTHANH',
                    required: true,
                    attributes: ['TEN_TINHTHANH'],
                    include: [
                        {
                            model: model.QUOCGIA,
                            as: 'MA_QUOCGIA_QUOCGIum',
                            required: true,
                            attributes: ['TEN_QUOCGIA']
                        }
                    ]
                }
            ],
            attributes: ['TENVITRI'] // Chỉ lấy thuộc tính TENVITRI
        });

        // Tạo một Set để lưu trữ các giá trị duy nhất
        const uniqueValues = new Set();

        // Thêm các giá trị vào Set
        data.forEach(location => {
            uniqueValues.add(location.TENVITRI);
            uniqueValues.add(location.MA_TINHTHANH_TINHTHANH.TEN_TINHTHANH);
            uniqueValues.add(location.MA_TINHTHANH_TINHTHANH.MA_QUOCGIA_QUOCGIum.TEN_QUOCGIA);
        });

        // Chuyển đổi Set thành mảng
        const result = Array.from(uniqueValues);

        // Gửi kết quả
        res.status(200).send(result);
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};

export { getCountry, getProvince, getAllLocation, getAllDiaDiem, getTienNghi, createTienNghi }