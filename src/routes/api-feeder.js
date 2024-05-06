const express = require("express");

const router = express.Router();

// import controllers
const AgamaController = require("../controllers/api-feeder/agama");
const NegaraController = require("../controllers/api-feeder/negara");
const WilayahController = require("../controllers/api-feeder/wilayah");
const PerguruanTinggiController = require("../controllers/api-feeder/perguruan-tinggi");
const ProfilPTController = require("../controllers/api-feeder/profil-pt");
const JalurMasukController = require("../controllers/api-feeder/jalur-masuk");
const JenisPendaftaranController = require("../controllers/api-feeder/jenis-pendaftaran");
const JenisTinggalController = require("../controllers/api-feeder/jenis-tinggal");
const AlatTransportasiController = require("../controllers/api-feeder/alat-transportasi");
const StatusMahasiswaController = require("../controllers/api-feeder/status-mahasiswa");
const KebutuhanKhususController = require("../controllers/api-feeder/kebutuhan-khusus");
const PenghasilanController = require("../controllers/api-feeder/penghasilan");
const JenisSMSController = require("../controllers/api-feeder/jenis-sms");
const LembagaPengangkatanController = require("../controllers/api-feeder/lembaga-pengangkatan");
const StatusKeaktifanPegawaiController = require("../controllers/api-feeder/status-keaktifan-pegawai");
const PangkatGolonganController = require("../controllers/api-feeder/pangkat-golongan");
const PekerjaanController = require("../controllers/api-feeder/pekerjaan");
const DosenController = require("../controllers/api-feeder/dosen");
const BiodataDosenController = require("../controllers/api-feeder/biodata-dosen");
const JenjangPendidikanController = require("../controllers/api-feeder/jenjang-pendidikan");
const ProdiController = require("../controllers/api-feeder/prodi");
const PeriodeController = require("../controllers/api-feeder/periode");
const JenisSubstansiController = require("../controllers/api-feeder/jenis-substansi");
const SubstansiController = require("../controllers/api-feeder/substansi");
const SubstansiKuliahController = require("../controllers/api-feeder/substansi-kuliah");
const MataKuliahController = require("../controllers/api-feeder/mata-kuliah");
const TahunAjaranController = require("../controllers/api-feeder/tahun-ajaran");
const FakultasController = require("../controllers/api-feeder/fakultas");
const SemesterController = require("../controllers/api-feeder/semester");
const KurikulumController = require("../controllers/api-feeder/kurikulum");
const DetailKurikulumController = require("../controllers/api-feeder/detail-kurikulum");
const PenugasanDosenController = require("../controllers/api-feeder/penugasan-dosen");
const MatkulKurikulumController = require("../controllers/api-feeder/matkul-kurikulum");
const KelasKuliahController = require("../controllers/api-feeder/kelas-kuliah");
const DetailKelasKuliahController = require("../controllers/api-feeder/detail-kelas-kuliah");
const PerhitunganSKSController = require("../controllers/api-feeder/perhitungan-sks");
const JenisKeluarController = require("../controllers/api-feeder/jenis-keluar");
const PembiayaanController = require("../controllers/api-feeder/pembiayaan");
const BidangMinatController = require("../controllers/api-feeder/bidang-minat");
const SkalaNilaiProdiController = require("../controllers/api-feeder/skala-nilai-prodi");
const PeriodePerkuliahanController = require("../controllers/api-feeder/periode-perkuliahan");
const DetailPeriodePerkuliahanController = require("../controllers/api-feeder/detail-periode-perkuliahan");
const JenisAktivitasMahasiswaController = require("../controllers/api-feeder/jenis-aktivitas-mahasiswa");
const AktivitasMahasiswaController = require("../controllers/api-feeder/aktivitas-mahasiswa");
const BiodataMahasiswaController = require("../controllers/api-feeder/biodata-mahasiswa");
const MahasiswaController = require("../controllers/api-feeder/mahasiswa");
const RiwayatPendidikanMahasiswaController = require("../controllers/api-feeder/riwayat-pendidikan-mahasiswa");
const DetailNilaiPerkuliahanKelasController = require("../controllers/api-feeder/detail-nilai-perkuliahan-kelas");
const RiwayatNilaiMahasiswaController = require("../controllers/api-feeder/riwayat-nilai-mahasiswa");
const PesertaKelasKuliahController = require("../controllers/api-feeder/peserta-kelas-kuliah");
const PerkuliahanMahasiswaController = require("../controllers/api-feeder/perkuliahan-mahasiswa");
const DetailPerkuliahanMahasiswaController = require("../controllers/api-feeder/detail-perkuliahan-mahasiswa");
const KRSMahasiswaController = require("../controllers/api-feeder/krs-mahasiswa");
const AktivitasKuliahMahasiswaController = require("../controllers/api-feeder/aktivitas-kuliah-mahasiswa");
const AnggotaAktivitasMahasiswaController = require("../controllers/api-feeder/anggota-aktivitas-mahasiswa");
const KonversiKampusMerdekaController = require("../controllers/api-feeder/konversi-kampus-merdeka");
const TranskripMahasiswaController = require("../controllers/api-feeder/transkrip-mahasiswa");
const RekapJumlahMahasiswaController = require("../controllers/api-feeder/rekap-jumlah-mahasiswa");
const RekapKHSMahasiswaController = require("../controllers/api-feeder/rekap-khs-mahasiswa");
const RekapKRSMahasiswaController = require("../controllers/api-feeder/rekap-krs-mahasiswa");
const DataLengkapMahasiswaProdiController = require("../controllers/api-feeder/data-lengkap-mahasiswa-prodi");

// all routes
router.get("/get-agama", AgamaController.getAgama);
router.get("/get-negara", NegaraController.getNegara);
router.get("/get-wilayah", WilayahController.getWilayah);
router.get("/get-all-pt", PerguruanTinggiController.getAllPerguruanTinggi);
router.get("/get-profil-pt", ProfilPTController.getProfilPT);
router.get("/get-jalur-masuk", JalurMasukController.getJalurMasuk);
router.get("/get-jenis-pendaftaran", JenisPendaftaranController.getJenisPendaftaran);
router.get("/get-jenis-tinggal", JenisTinggalController.getJenisTinggal);
router.get("/get-alat-transportasi", AlatTransportasiController.getAlatTransportasi);
router.get("/get-status-mahasiswa", StatusMahasiswaController.getStatusMahasiswa);
router.get("/get-kebutuhan-khusus", KebutuhanKhususController.getKebutuhanKhusus);
router.get("/get-penghasilan", PenghasilanController.getPenghasilan);
router.get("/get-jenis-sms", JenisSMSController.getJenisSms);
router.get("/get-lembaga-pengangkatan", LembagaPengangkatanController.getLembagaPengangkatan);
router.get("/get-status-keaktifan-pegawai", StatusKeaktifanPegawaiController.getStatusKeaktifanPegawai);
router.get("/get-pangkat-golongan", PangkatGolonganController.getPangkatGolongan);
router.get("/get-pekerjaan", PekerjaanController.getPekerjaan);
router.get("/get-dosen", DosenController.getDosen);
router.get("/get-biodata-dosen", BiodataDosenController.getBiodataDosen);
router.get("/get-jenjang-pendidikan", JenjangPendidikanController.getJenjangPendidikan);
router.get("/get-prodi", ProdiController.getProdi);
router.get("/get-periode", PeriodeController.getPeriode);
router.get("/get-jenis-substansi", JenisSubstansiController.getJenisSubstansi);
router.get("/get-substansi", SubstansiController.getSubstansi);
router.get("/get-substansi-kuliah", SubstansiKuliahController.getSubstansiKuliah);
router.get("/get-mata-kuliah", MataKuliahController.getMataKuliah);
router.get("/get-tahun-ajaran", TahunAjaranController.getTahunAjaran);
router.get("/get-fakultas", FakultasController.getFakultas);
router.get("/get-semester", SemesterController.getSemester);
router.get("/get-kurikulum", KurikulumController.getKurikulum);
router.get("/get-detail-kurikulum", DetailKurikulumController.getDetailKurikulum);
router.get("/get-penugasan-dosen", PenugasanDosenController.getPenugasanDosen);
router.get("/get-matkul-kurikulum", MatkulKurikulumController.getMatkulKurikulum);
router.get("/get-kelas-kuliah", KelasKuliahController.getKelasKuliah);
router.get("/get-detail-kelas-kuliah", DetailKelasKuliahController.getDetailKelasKuliah);
router.get("/get-perhitungan-sks", PerhitunganSKSController.getPerhitunganSKS);
router.get("/get-jenis-keluar", JenisKeluarController.getJenisKeluar);
router.get("/get-pembiayaan", PembiayaanController.getPembiayaan);
router.get("/get-bidang-minat", BidangMinatController.getBidangMinat);
router.get("/get-skala-nilai-prodi", SkalaNilaiProdiController.getSkalaNilaiProdi);
router.get("/get-periode-perkuliahan", PeriodePerkuliahanController.getPeriodePerkuliahan);
router.get("/get-detail-periode-perkuliahan", DetailPeriodePerkuliahanController.getDetailPeriodePerkuliahan);
router.get("/get-jenis-aktivitas-mahasiswa", JenisAktivitasMahasiswaController.getJenisAktivitasMahasiswa);
router.get("/get-aktivitas-mahasiswa", AktivitasMahasiswaController.getAktivitasMahasiswa);
router.get("/get-biodata-mahasiswa", BiodataMahasiswaController.getBiodataMahasiswa);
router.get("/get-mahasiswa", MahasiswaController.getMahasiswa);
router.get("/get-riwayat-pendidikan-mahasiswa", RiwayatPendidikanMahasiswaController.getRiwayatPendidikanMahasiswa);
router.get("/get-detail-nilai-perkuliahan-kelas", DetailNilaiPerkuliahanKelasController.getDetailNilaiPerkuliahanKelas);
router.get("/get-riwayat-nilai-mahasiswa", RiwayatNilaiMahasiswaController.getRiwayatNilaiMahasiswa);
router.get("/get-peserta-kelas-kuliah", PesertaKelasKuliahController.getPesertaKelasKuliah);
router.get("/get-perkuliahan-mahasiswa", PerkuliahanMahasiswaController.getPerkuliahanMahasiswa);
router.get("/get-detail-perkuliahan-mahasiswa", DetailPerkuliahanMahasiswaController.getDetailPerkuliahanMahasiswa);
router.get("/get-krs-mahasiswa", KRSMahasiswaController.getKRSMahasiswa);
router.get("/get-aktivitas-kuliah-mahasiswa", AktivitasKuliahMahasiswaController.getAktivitasKuliahMahasiswa);
router.get("/get-anggota-aktivitas-mahasiswa", AnggotaAktivitasMahasiswaController.getAnggotaAktivitasMahasiswa);
router.get("/get-konversi-kampus-merdeka", KonversiKampusMerdekaController.getKonversiKampusMerdeka);
router.get("/get-transkrip-mahasiswa", TranskripMahasiswaController.getTranskripMahasiswa);
router.get("/get-rekap-jumlah-mahasiswa", RekapJumlahMahasiswaController.getRekapJumlahMahasiswa);
router.get("/get-rekap-khs-mahasiswa", RekapKHSMahasiswaController.getRekapKHSMahasiswa);
router.get("/get-rekap-krs-mahasiswa", RekapKRSMahasiswaController.getRekapKRSMahasiswa);
router.get("/get-data-lengkap-mahasiswa-prodi", DataLengkapMahasiswaProdiController.getDataLengkapMahasiswaProdi);

module.exports = router;
