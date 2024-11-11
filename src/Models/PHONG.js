import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class PHONG extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_PHONG: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    TENPHONG: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    MOTA: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    GIATIEN: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    HINHANH: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    MA_KS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'KHACHSAN',
        key: 'MA_KS'
      }
    },
    MA_KM: {
      type: DataTypes.STRING(6),
      allowNull: true,
      references: {
        model: 'KHUYENMAI',
        key: 'MA_KM'
      }
    },
    MA_LOAIPHG: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'LOAIPHONG',
        key: 'MA_LOAIPHG'
      }
    }
  }, {
    sequelize,
    tableName: 'PHONG',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_PHONG" },
        ]
      },
      {
        name: "MA_KS",
        using: "BTREE",
        fields: [
          { name: "MA_KS" },
        ]
      },
      {
        name: "MA_KM",
        using: "BTREE",
        fields: [
          { name: "MA_KM" },
        ]
      },
      {
        name: "MA_LOAIPHG",
        using: "BTREE",
        fields: [
          { name: "MA_LOAIPHG" },
        ]
      },
    ]
  });
  }
}
