"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class JenisKeluar extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // relasi tabel child
      JenisKeluar.hasMany(models.RiwayatPendidikanMahasiswa, { foreignKey: "id_jenis_keluar" });
      JenisKeluar.hasMany(models.MahasiswaLulusDO, { foreignKey: "id_jenis_keluar" });
    }
  }
  JenisKeluar.init(
    {
      id_jenis_keluar: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.CHAR(1),
      },
      jenis_keluar: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      apa_mahasiswa: {
        type: DataTypes.CHAR(1),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "JenisKeluar",
      tableName: "jenis_keluars",
    }
  );
  return JenisKeluar;
};
