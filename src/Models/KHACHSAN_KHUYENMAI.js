import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class KHACHSAN_KHUYENMAI extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_KS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'KHACHSAN',
        key: 'MA_KS'
      }
    },
    MA_KM: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'KHUYENMAI',
        key: 'MA_KM'
      }
    }
  }, {
    sequelize,
    tableName: 'KHACHSAN_KHUYENMAI',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_KS" },
          { name: "MA_KM" },
        ]
      },
      {
        name: "MA_KM",
        using: "BTREE",
        fields: [
          { name: "MA_KM" },
        ]
      },
    ]
  });
  }
}
