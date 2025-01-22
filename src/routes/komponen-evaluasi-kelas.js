const express = require("express");

const router = express.Router();

// import controller dan middleware
const KomponenEvaluasiKelasController = require("../controllers/komponen-evaluasi-kelas.js");
const checkRole = require("../middlewares/check-role");

// all routes
router.get("/", checkRole(["admin", "admin-prodi"]), KomponenEvaluasiKelasController.getAllKomponenEvaluasiKelas);
router.get("/:id/get", checkRole(["admin", "admin-prodi"]), KomponenEvaluasiKelasController.getKomponenEvaluasiKelasById);
router.get("/kelas-kuliah/:id_kelas_kuliah/get", checkRole(["admin", "admin-prodi"]), KomponenEvaluasiKelasController.getKomponenEvaluasiKelasByKelasKuliahId);
router.post("/kelas-kuliah/:id_kelas_kuliah/create", checkRole(["admin", "admin-prodi"]), KomponenEvaluasiKelasController.createOrUpdateKomponenEvaluasiKelas);

module.exports = router;
