import sequelize from "../Models/index.js";
import initModels from "../Models/init-models.js";
import bcrypt from "bcrypt";
import {taoToken} from "../Config/jwtConfig.js";
import { Sequelize } from 'sequelize';
import jwt from "jsonwebtoken";

const Op = Sequelize.Op;
const model = initModels(sequelize);

const signUp = async (req, res) => {
    try {
        let { HOTEN, EMAIL, MATKHAU, SDT, NGAYSINH, GIOITINH, NGAYDANGKY, ANHDAIDIEN, CHUCVU } = req.body;
        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(MATKHAU)) {
            res.status(400).send("Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ cái thường, 1 chữ cái hoa và 1 ký tự đặc biệt.");
            return;
        }

        let whereCondition = {};
        if (SDT) {
            whereCondition.SDT = SDT;
        }
        if (EMAIL) {
            whereCondition.EMAIL = EMAIL;
        }

        let checkTK = await model.NGUOIDUNG.findOne({
            where: whereCondition,
        });

        if (checkTK) {
            res.status(200).send("Email hoặc số điện thoại đã tồn tại!");
            return;
        }
        

        ANHDAIDIEN = ANHDAIDIEN || "noimg.png";
        CHUCVU = CHUCVU || "Customer";
        NGAYDANGKY = NGAYDANGKY || new Date();

        let newData = {
            HOTEN,
            EMAIL,
            MATKHAU: bcrypt.hashSync(MATKHAU, 10),
            SDT,
            NGAYSINH,
            GIOITINH,
            CHUCVU,
            NGAYDANGKY,
            ANHDAIDIEN
        };
        
        await model.NGUOIDUNG.create(newData);
        res.status(200).send("Đăng ký tài khoản thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};

const loginAdmin = async (req, res) => { 
    try {
        let { EMAIL, SDT_ND, MATKHAU } = req.body;

        if (!EMAIL && !SDT_ND) {
            res.status(400).send("Vui lòng cung cấp email hoặc số điện thoại");
            return;
        }

        let checkTK = await model.NGUOIDUNG.findOne({
            where: {
                [Op.or]: [
                    EMAIL ? { EMAIL } : {}, 
                    SDT_ND ? { SDT_ND } : {}
                ]
            },
        });

        if (checkTK) {
            if (checkTK.CHUCVU !== "Admin") {
                res.status(403).send("Chỉ Admin mới có thể đăng nhập");
                return;
            }
            let checkPass = bcrypt.compareSync(MATKHAU, checkTK.MATKHAU);
            if (checkPass) {
                let token = taoToken(checkTK);
                res.status(200).send(token);
            } else {
                res.status(400).send("Mật khẩu không đúng");
            }
        } else {
            res.status(400).send("Tài khoản không đúng");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};


const loginUser = async (req, res) => { 
    try {
        let { EMAIL, SDT_ND, MATKHAU } = req.body;

        if (!EMAIL && !SDT_ND) {
            res.status(400).send("Vui lòng cung cấp email hoặc số điện thoại");
            return;
        }

        let checkTK = await model.NGUOIDUNG.findOne({
            where: {
                [Op.or]: [
                    EMAIL ? { EMAIL } : {}, 
                    SDT_ND ? { SDT_ND } : {}
                ]
            },
        });

        if (checkTK) {
            let checkPass = bcrypt.compareSync(MATKHAU, checkTK.MATKHAU);
            if (checkPass) {
                let token = taoToken(checkTK);
                res.status(200).send(token);
            } else {
                res.status(400).send("Mật khẩu không đúng");
            }
        } else {
            res.status(400).send("Tài khoản không đúng");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};

const loginPartner = async (req, res) => { 
    try {
        let { EMAIL, SDT_ND, MATKHAU } = req.body;

        if (!EMAIL && !SDT_ND) {
            res.status(400).send("Vui lòng cung cấp email hoặc số điện thoại");
            return;
        }

        let checkTK = await model.NGUOIDUNG.findOne({
            where: {
                [Op.or]: [
                    EMAIL ? { EMAIL } : {}, 
                    SDT_ND ? { SDT_ND } : {}
                ]
            },
        });

        if (checkTK) {
            // Kiểm tra xem CHUCVU có chứa "Partner" hay không
            if (!checkTK.CHUCVU.includes("Partner")) {
                res.status(403).send("Chỉ Partner mới có thể đăng nhập");
                return;
            }
            let checkPass = bcrypt.compareSync(MATKHAU, checkTK.MATKHAU);
            if (checkPass) {
                let token = taoToken(checkTK);
                res.status(200).send(token);
            } else {
                res.status(400).send("Mật khẩu không đúng");
            }
        } else {
            res.status(400).send("Tài khoản không đúng");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};



const getUserAll = async(req, res) =>{
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');

        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }
        const data = await model.NGUOIDUNG.findAll();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi khi lấy dữ liệu");
    }
}

const selectUser = async (req, res) => {
    try {
        const { MA_ND } = req.params;
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }
        
        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserID = decodedToken.data.MA_ND;
        if (Number(MA_ND) !== currentUserID && (decodedToken.data.CHUCVU !== "Admin" && decodedToken.data.CHUCVU !== "Nhân viên")) {
            return res.status(403).send("Không có quyền truy cập thông tin người dùng này");
        }
            
        const data = await model.NGUOIDUNG.findOne({
            where: {
                MA_ND: MA_ND
            },
            attributes: { exclude: ['MATKHAU']} 
        });

        if (!data) {
            return res.status(404).send("Không tìm thấy người dùng");
        }

        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        return res.status(500).send("Lỗi xác thực token");
    }
}

const updateUser = async (req, res) => {
    try {
        let { MA_ND } = req.params;
        let { EMAIL, HOTEN, MATKHAU, SDT, NGAYSINH, GIOITINH, CHUCVU } = req.body;
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        const currentUserID = decodedToken.data.MA_ND;
        const currentUserRole = decodedToken.data.CHUCVU;

        if (Number(MA_ND) !== currentUserID && currentUserRole !== "Admin") {
            return res.status(403).send("Không có quyền truy cập thông tin người dùng này");
        }

        await model.NGUOIDUNG.update(
            { EMAIL, HOTEN, MATKHAU, SDT, NGAYSINH, GIOITINH, CHUCVU },
            {
                where: {
                    MA_ND
                }
            }
        );

        res.status(200).send("Cập nhật thông tin người dùng thành công!");
    } catch (error) {
        console.error(error); 
        res.status(500).send("Đã có lỗi trong quá trình xử lý!");
    }
};


const deleteUser = async (req, res) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).send("Người dùng không được xác thực");
        }

        const decodedToken = jwt.verify(token, 'MINHNGHIA');
        if (decodedToken.data.CHUCVU !== "Admin") {
            return res.status(403).send("Không có quyền truy cập chức năng này");
        }

        let { MA_ND } = req.params;

        // Xóa đánh giá liên quan đến người dùng
        await model.DANHGIA.destroy({
            where: {
                MA_ND: MA_ND
            }
        });

        // Xóa người dùng
        await model.NGUOIDUNG.destroy({
            where: {
                MA_ND: MA_ND
            }
        });
        
        res.status(200).send("Xóa người dùng và đánh giá thành công!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Đã có lỗi trong quá trình xử lý!");
    }
};


const logout = async (req, res) => {
    try {
      const token = req.headers.authorization || req.body.token;
  
      if (!token) {
        return res.status(401).send("Token không hợp lệ");
      }
  
      blacklistedTokens.push(token);
  
      res.status(200).send("Đã đăng xuất thành công");
    } catch (error) {
      res.status(500).send("Đã có lỗi trong quá trình xử lý");
    }
};

export { signUp, loginUser, getUserAll, logout, selectUser, updateUser, deleteUser, loginAdmin, loginPartner }