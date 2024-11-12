import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import { Sequelize } from 'sequelize';
import jwt from 'jsonwebtoken';

const Op = Sequelize.Op;
const model = initModels(sequelize);

const getDataHoso = async (req, res) =>{
    try {
        const token = req.headers.token;
        if(!token){
            return res.status(401).send("Người dùng không được xác thực");
        }
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }
        const data = await model.HOSO.findAll();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu")
    }
}

const denyHoso = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        const { MA_HS } = req.params;
        if (!MA_HS) {
            return res.status(400).send("Mã khách sạn không hợp lệ");
        }

        await model.HOSO.update(
            { TRANGTHAI: "Từ chối" },
            {
                where: { 
                    MA_HS
                }
            }
        );
        res.status(200).send("Bạn đã cập nhật trạng thái hồ sơ thành công");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

const accessHoSo = async (req, res) => {
    try {
        const token = req.headers.token;
        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        const { MA_HS } = req.params;
        if (!MA_HS) {
            return res.status(400).send("Mã khách sạn không hợp lệ");
        }

        await model.HOSO.update(
            { TRANGTHAI: "Xác nhận" },
            {
                where: { 
                    MA_HS
                }
            }
        );
        res.status(200).send("Bạn đã cập nhật trạng thái hồ sơ thành công");
    } catch (error) {
        console.log(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
};

export { getDataHoso, denyHoso, accessHoSo }