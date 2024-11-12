import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class HOSO extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_HS: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    HOTEN: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    EMAIL: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    SDT: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    TEN_KS: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    DIACHI: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    MO_TA: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    SOSAO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    HINHANH: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    GIAYPHEPKINHDOANH: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    TRANGTHAI: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    NGAYDANGKY: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'HOSO',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_HS" },
        ]
      },
    ]
  });
  }
}
