import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TINNHAN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_TINNHAN: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    MA_KS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'KHACHSAN',
        key: 'MA_KS'
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
    NOIDUNG: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    THOIGIAN: {
      type: DataTypes.DATE,
      allowNull: false
    },
    SENDMESSAGE: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'TINNHAN',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_TINNHAN" },
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
        name: "MA_ND",
        using: "BTREE",
        fields: [
          { name: "MA_ND" },
        ]
      },
    ]
  });
  }
}
