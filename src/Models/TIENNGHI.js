import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class TIENNGHI extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_TIENNGHI: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    TENTIENNGHI: {
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
    ICON: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'TIENNGHI',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_TIENNGHI" },
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
