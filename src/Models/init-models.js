import _sequelize from "sequelize";
const DataTypes = _sequelize.DataTypes;
import _DANHGIA from  "./DANHGIA.js";
import _HOSO from  "./HOSO.js";
import _KHACHSAN from  "./KHACHSAN.js";
import _KHACHSAN_KHUYENMAI from  "./KHACHSAN_KHUYENMAI.js";
import _KHACHSAN_TIENNGHI from  "./KHACHSAN_TIENNGHI.js";
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
  const KHACHSAN_KHUYENMAI = _KHACHSAN_KHUYENMAI.init(sequelize, DataTypes);
  const KHACHSAN_TIENNGHI = _KHACHSAN_TIENNGHI.init(sequelize, DataTypes);
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

  KHACHSAN.belongsToMany(KHUYENMAI, { as: 'MA_KM_KHUYENMAIs', through: KHACHSAN_KHUYENMAI, foreignKey: "MA_KS", otherKey: "MA_KM" });
  KHACHSAN.belongsToMany(TIENNGHI, { as: 'MA_TIENNGHI_TIENNGHIs', through: KHACHSAN_TIENNGHI, foreignKey: "MA_KS", otherKey: "MA_TIENNGHI" });
  KHUYENMAI.belongsToMany(KHACHSAN, { as: 'MA_KS_KHACHSANs', through: KHACHSAN_KHUYENMAI, foreignKey: "MA_KM", otherKey: "MA_KS" });
  TIENNGHI.belongsToMany(KHACHSAN, { as: 'MA_KS_KHACHSAN_KHACHSAN_TIENNGHIs', through: KHACHSAN_TIENNGHI, foreignKey: "MA_TIENNGHI", otherKey: "MA_KS" });
  DANHGIA.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(DANHGIA, { as: "DANHGIa", foreignKey: "MA_KS"});
  KHACHSAN_KHUYENMAI.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(KHACHSAN_KHUYENMAI, { as: "KHACHSAN_KHUYENMAIs", foreignKey: "MA_KS"});
  KHACHSAN_TIENNGHI.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(KHACHSAN_TIENNGHI, { as: "KHACHSAN_TIENNGHIs", foreignKey: "MA_KS"});
  PHONG.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(PHONG, { as: "PHONGs", foreignKey: "MA_KS"});
  TINNHAN.belongsTo(KHACHSAN, { as: "MA_KS_KHACHSAN", foreignKey: "MA_KS"});
  KHACHSAN.hasMany(TINNHAN, { as: "TINNHANs", foreignKey: "MA_KS"});
  KHACHSAN_KHUYENMAI.belongsTo(KHUYENMAI, { as: "MA_KM_KHUYENMAI", foreignKey: "MA_KM"});
  KHUYENMAI.hasMany(KHACHSAN_KHUYENMAI, { as: "KHACHSAN_KHUYENMAIs", foreignKey: "MA_KM"});
  PHONG.belongsTo(KHUYENMAI, { as: "MA_KM_KHUYENMAI", foreignKey: "MA_KM"});
  KHUYENMAI.hasMany(PHONG, { as: "PHONGs", foreignKey: "MA_KM"});
  PHONG.belongsTo(LOAIPHONG, { as: "MA_LOAIPHG_LOAIPHONG", foreignKey: "MA_LOAIPHG"});
  LOAIPHONG.hasMany(PHONG, { as: "PHONGs", foreignKey: "MA_LOAIPHG"});
  PHIEUDATPHG.belongsTo(MAGIAMGIA, { as: "MA_MGG_MAGIAMGIum", foreignKey: "MA_MGG"});
  MAGIAMGIA.hasMany(PHIEUDATPHG, { as: "PHIEUDATPHGs", foreignKey: "MA_MGG"});
  DANHGIA.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(DANHGIA, { as: "DANHGIa", foreignKey: "MA_ND"});
  HOSO.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(HOSO, { as: "HOSOs", foreignKey: "MA_ND"});
  PHIEUDATPHG.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(PHIEUDATPHG, { as: "PHIEUDATPHGs", foreignKey: "MA_ND"});
  TINNHAN.belongsTo(NGUOIDUNG, { as: "MA_ND_NGUOIDUNG", foreignKey: "MA_ND"});
  NGUOIDUNG.hasMany(TINNHAN, { as: "TINNHANs", foreignKey: "MA_ND"});
  PHIEUDATPHG.belongsTo(PHONG, { as: "MA_PHONG_PHONG", foreignKey: "MA_PHONG"});
  PHONG.hasMany(PHIEUDATPHG, { as: "PHIEUDATPHGs", foreignKey: "MA_PHONG"});
  TINHTHANH.belongsTo(QUOCGIA, { as: "MA_QUOCGIA_QUOCGIum", foreignKey: "MA_QUOCGIA"});
  QUOCGIA.hasMany(TINHTHANH, { as: "TINHTHANHs", foreignKey: "MA_QUOCGIA"});
  KHACHSAN_TIENNGHI.belongsTo(TIENNGHI, { as: "MA_TIENNGHI_TIENNGHI", foreignKey: "MA_TIENNGHI"});
  TIENNGHI.hasMany(KHACHSAN_TIENNGHI, { as: "KHACHSAN_TIENNGHIs", foreignKey: "MA_TIENNGHI"});
  VITRI.belongsTo(TINHTHANH, { as: "MA_TINHTHANH_TINHTHANH", foreignKey: "MA_TINHTHANH"});
  TINHTHANH.hasMany(VITRI, { as: "VITRIs", foreignKey: "MA_TINHTHANH"});
  KHACHSAN.belongsTo(VITRI, { as: "MA_VITRI_VITRI", foreignKey: "MA_VITRI"});
  VITRI.hasMany(KHACHSAN, { as: "KHACHSANs", foreignKey: "MA_VITRI"});

  return {
    DANHGIA,
    HOSO,
    KHACHSAN,
    KHACHSAN_KHUYENMAI,
    KHACHSAN_TIENNGHI,
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
