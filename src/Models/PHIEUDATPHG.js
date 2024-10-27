import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PHIEUDATPHG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_DP: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NGAYDEN: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    NGAYDI: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    SLKHACH: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TRANGTHAI: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    NGAYDATPHG: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    THANHTIEN: {
      type: DataTypes.DECIMAL(15,3),
      allowNull: false
    },
    MA_MGG: {
      type: DataTypes.STRING(6),
      allowNull: true,
      references: {
        model: 'MAGIAMGIA',
        key: 'MA_MGG'
      }
    },
    MA_ND: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'NGUOIDUNG',
        key: 'MA_ND'
      }
    },
    MA_PHONG: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'PHONG',
        key: 'MA_PHONG'
      }
    },
    ORDERCODE: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'PHIEUDATPHG',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_DP" },
        ]
      },
      {
        name: "MA_MGG",
        using: "BTREE",
        fields: [
          { name: "MA_MGG" },
        ]
      },
      {
        name: "MA_ND",
        using: "BTREE",
        fields: [
          { name: "MA_ND" },
        ]
      },
      {
        name: "MA_PHONG",
        using: "BTREE",
        fields: [
          { name: "MA_PHONG" },
        ]
      },
    ]
  });
  }
}
