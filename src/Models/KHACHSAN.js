import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class KHACHSAN extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    MA_KS: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    TEN_KS: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    MO_TA: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    HINHANH: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    SOSAO: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    TRANGTHAI_KS: {
      type: DataTypes.ENUM('Hoạt động','Ngừng hoạt động'),
      allowNull: false
    },
    QRTHANHTOAN: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    MA_VITRI: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'VITRI',
        key: 'MA_VITRI'
      }
    },
    YEU_CAU_COC: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    TI_LE_COC: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'KHACHSAN',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "MA_KS" },
        ]
      },
      {
        name: "MA_VITRI",
        using: "BTREE",
        fields: [
          { name: "MA_VITRI" },
        ]
      },
    ]
  });
  }
}
