"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("uji_mahasiswas", {
      id_uji: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(36),
        defaultValue: Sequelize.UUIDV4,
      },
      penguji_ke: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      last_sync: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      id_feeder: {
        type: Sequelize.STRING(36),
        allowNull: true,
      },
      id_aktivitas: {
        type: Sequelize.STRING(36),
        allowNull: false,
        references: {
          model: {
            tableName: "aktivitas_mahasiswas",
          },
          key: "id_aktivitas",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_kategori_kegiatan: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: "kategori_kegiatans",
          },
          key: "id_kategori_kegiatan",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_dosen: {
        type: Sequelize.STRING(36),
        allowNull: false,
        references: {
          model: {
            tableName: "dosens",
          },
          key: "id_dosen",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("uji_mahasiswas");
  },
};
