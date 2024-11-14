import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class KHUYENMAI extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_KM: {
      type: DataTypes.STRING(6),
      allowNull: false,
      primaryKey: true
    },
    TEN_KM: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    PHANTRAM: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    NGAYBATDAU: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    NGAYKETTHUC: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    MA_KS: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'KHACHSAN',
        key: 'MA_KS'
      }
    }
  }, {
    sequelize,
    tableName: 'KHUYENMAI',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_KM" },
        ]
      },
      {
        name: "MA_KS",
        using: "BTREE",
        fields: [
          { name: "MA_KS" },
        ]
      },
    ]
  });
  }
}
