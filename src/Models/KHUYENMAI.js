import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class KHUYENMAI extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_KM: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    TEN_KM: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    PHANTRAM_GIAM: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: false
    },
    NGAYBATDAU: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    NGAYKETTHUC: {
      type: DataTypes.DATEONLY,
      allowNull: false
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
    ]
  });
  }
}
