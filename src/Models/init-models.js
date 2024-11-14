import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _DANHGIA from  "./DANHGIA.js";
import _HOSO from  "./HOSO.js";
import _KHACHSAN from  "./KHACHSAN.js";
import _KHUYENMAI from  "./KHUYENMAI.js";
import _LOAIPHONG from  "./LOAIPHONG.js";
import _MAGIAMGIA from  "./MAGIAMGIA.js";
import _NGUOIDUNG from  "./NGUOIDUNG.js";
import _PHIEUDATPHG from  "./PHIEUDATPHG.js";
import _PHONG from  "./PHONG.js";
import _QUOCGIA from  "./QUOCGIA.js";
import _TIENNGHI from  "./TIENNGHI.js";
import _TINHTHANH from  "./TINHTHANH.js";
import _TINNHAN from  "./TINNHAN.js";
import _VITRI from  "./VITRI.js";

export default function initModels(sequelize) {
  const DANHGIA = _DANHGIA.init(sequelize, DataTypes);
  const HOSO = _HOSO.init(sequelize, DataTypes);
  const KHACHSAN = _KHACHSAN.init(sequelize, DataTypes);
  const KHUYENMAI = _KHUYENMAI.init(sequelize, DataTypes);
  const LOAIPHONG = _LOAIPHONG.init(sequelize, DataTypes);
  const MAGIAMGIA = _MAGIAMGIA.init(sequelize, DataTypes);
  const NGUOIDUNG = _NGUOIDUNG.init(sequelize, DataTypes);
  const PHIEUDATPHG = _PHIEUDATPHG.init(sequelize, DataTypes);
  const PHONG = _PHONG.init(sequelize, DataTypes);
  const QUOCGIA = _QUOCGIA.init(sequelize, DataTypes);
  const TIENNGHI = _TIENNGHI.init(sequelize, DataTypes);
  const TINHTHANH = _TINHTHANH.init(sequelize, DataTypes);
  const TINNHAN = _TINNHAN.init(sequelize, DataTypes);
  const VITRI = _VITRI.init(sequelize, DataTypes);

  KHACHSAN.belongsTo(HOSO, { as: "MA_HS_HOSO", foreignKey: "MA_HS"});
  HOSO.hasMany(KHACHSAN, { as: "KHACHSANs", foreignKey: "MA_HS"});
  DANHGIA.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(DANHGIA, { as: "DANHGIa", foreignKey: "MA_KS"});
  KHUYENMAI.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(KHUYENMAI, { as: "KHUYENMAIs", foreignKey: "MA_KS"});
  PHONG.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(PHONG, { as: "PHONGs", foreignKey: "MA_KS"});
  TIENNGHI.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(TIENNGHI, { as: "TIENNGHIs", foreignKey: "MA_KS"});
  TINNHAN.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(TINNHAN, { as: "TINNHANs", foreignKey: "MA_KS"});
  PHONG.belongsTo(KHUYENMAI, { as: "MA_KM_KHUYENMAI", foreignKey: "MA_KM"});
  KHUYENMAI.hasMany(PHONG, { as: "PHONGs", foreignKey: "MA_KM"});
  PHONG.belongsTo(LOAIPHONG, { as: "MA_LOAIPHG_LOAIPHONG", foreignKey: "MA_LOAIPHG"});
  LOAIPHONG.hasMany(PHONG, { as: "PHONGs", foreignKey: "MA_LOAIPHG"});
  PHIEUDATPHG.belongsTo(MAGIAMGIA, { as: "MA_MGG_MAGIAMGIum", foreignKey: "MA_MGG"});
  MAGIAMGIA.hasMany(PHIEUDATPHG, { as: "PHIEUDATPHGs", foreignKey: "MA_MGG"});
  DANHGIA.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(DANHGIA, { as: "DANHGIa", foreignKey: "MA_ND"});
  PHIEUDATPHG.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(PHIEUDATPHG, { as: "PHIEUDATPHGs", foreignKey: "MA_ND"});
  TINNHAN.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(TINNHAN, { as: "TINNHANs", foreignKey: "MA_ND"});
  PHIEUDATPHG.belongsTo(PHONG, { as: "MA_PHONG_PHONG", foreignKey: "MA_PHONG"});
  PHONG.hasMany(PHIEUDATPHG, { as: "PHIEUDATPHGs", foreignKey: "MA_PHONG"});
  TINHTHANH.belongsTo(QUOCGIA, { as: "MA_QUOCGIA_QUOCGIum", foreignKey: "MA_QUOCGIA"});
  QUOCGIA.hasMany(TINHTHANH, { as: "TINHTHANHs", foreignKey: "MA_QUOCGIA"});
  VITRI.belongsTo(TINHTHANH, { as: "MA_TINHTHANH_TINHTHANH", foreignKey: "MA_TINHTHANH"});
  TINHTHANH.hasMany(VITRI, { as: "VITRIs", foreignKey: "MA_TINHTHANH"});
  KHACHSAN.belongsTo(VITRI, { as: "MA_VITRI_VITRI", foreignKey: "MA_VITRI"});
  VITRI.hasMany(KHACHSAN, { as: "KHACHSANs", foreignKey: "MA_VITRI"});

  return {
    DANHGIA,
    HOSO,
    KHACHSAN,
    KHUYENMAI,
    LOAIPHONG,
    MAGIAMGIA,
    NGUOIDUNG,
    PHIEUDATPHG,
    PHONG,
    QUOCGIA,
    TIENNGHI,
    TINHTHANH,
    TINNHAN,
    VITRI,
  };
}
