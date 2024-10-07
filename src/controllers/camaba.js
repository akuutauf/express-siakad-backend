const {
  Camaba,
  User,
  SettingWSFeeder,
  PeriodePendaftaran,
  Prodi,
  ProdiCamaba,
  JenjangPendidikan,
  Semester,
  Role,
  UserRole,
  BiodataCamaba,
  PemberkasanCamaba,
  BerkasPeriodePendaftaran,
  JalurMasuk,
  SistemKuliah,
  TahapTesPeriodePendaftaran,
  JenisTes,
  TagihanCamaba,
  JenisTagihan,
  SumberPeriodePendaftaran,
  SumberInfoCamaba,
  Sumber
} = require("../../models");
const bcrypt = require("bcrypt");
const fs = require("fs"); // untuk menghapus file
const path = require("path");

// admin, admin-pmb
const getAllCamaba = async (req, res, next) => {
  try {
    // Ambil semua data camabas dari database
    const camabas = await Camaba.findAll({
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ]
    });

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: "<===== GET All Camaba Success",
      jumlahData: camabas.length,
      data: camabas
    });
  } catch (error) {
    next(error);
  }
};

// admin, admin-pmb
const getAllCamabaByFilter = async (req, res, next) => {
  const { id_periode_pendaftaran, status_berkas, status_tes } = req.query;

  if (!id_periode_pendaftaran) {
    return res.status(400).json({ message: "id_periode_pendaftaran is required" });
  }
  if (!status_berkas) {
    return res.status(400).json({ message: "status_berkas is required" });
  }
  if (!status_tes) {
    return res.status(400).json({ message: "status_tes is required" });
  }

  try {
    let status_berkas_now = null;
    let status_tes_now = null;

    // pengecekan status request query
    if (status_berkas === "true") {
      status_berkas_now = 1;
    } else {
      status_berkas_now = 0;
    }

    if (status_tes === "true") {
      status_tes_now = 1;
    } else {
      status_tes_now = 0;
    }

    // Ambil semua data camabas dari database
    const camabas = await Camaba.findAll({
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ],
      where: {
        id_periode_pendaftaran: id_periode_pendaftaran,
        status_berkas: status_berkas_now,
        status_tes: status_tes_now
      }
    });

    if (!camabas || camabas.length === 0) {
      return res.status(404).json({
        message: `<===== Camaba Not Found`
      });
    }

    // Loop melalui setiap camaba untuk mendapatkan prodi pertama mereka
    const camabaWithProdi = await Promise.all(
      camabas.map(async (camaba) => {
        // Ambil prodi pertama berdasarkan id_camaba
        const prodi_camaba = await ProdiCamaba.findOne({
          where: {
            id_camaba: camaba.id
          },
          order: [["createdAt", "ASC"]] // Mengambil berdasarkan urutan (prodi pertama)
        });

        // Jika prodi_camaba ditemukan, tambahkan ke data camaba
        return {
          ...camaba.toJSON(), // Konversi instance Sequelize menjadi JSON
          ProdiCamaba: prodi_camaba || null // Tambahkan ProdiCamaba atau null jika tidak ditemukan
        };
      })
    );

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: "<===== GET All Camaba By Filter Success",
      jumlahData: camabaWithProdi.length,
      data: camabaWithProdi
    });
  } catch (error) {
    next(error);
  }
};

// admin, admin-pmb, guest
const getCamabaById = async (req, res, next) => {
  try {
    // Dapatkan ID dari parameter permintaan
    const camabaId = req.params.id;

    if (!camabaId) {
      return res.status(400).json({
        message: "Camaba ID is required"
      });
    }

    // Cari data camaba berdasarkan ID di database
    const camaba = await Camaba.findByPk(camabaId, {
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ]
    });

    // Jika data tidak ditemukan, kirim respons 404
    if (!camaba) {
      return res.status(404).json({
        message: `<===== Camaba With ID ${camabaId} Not Found:`
      });
    }

    // get data Prodi Camaba
    const prodiCamaba = await ProdiCamaba.findAll({
      where: { id_camaba: camabaId },
      include: [{ model: Prodi, include: [{ model: JenjangPendidikan }] }]
    });

    // Jika data tidak ditemukan, kirim respons 404
    if (!prodiCamaba) {
      return res.status(404).json({
        message: `<===== Prodi Camaba With Camaba ID ${camabaId} Not Found:`
      });
    }

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: `<===== GET Camaba By ID ${camabaId} Success:`,
      data: camaba,
      prodiCamaba: prodiCamaba
    });
  } catch (error) {
    next(error);
  }
};

// guest
const createCamaba = async (req, res, next) => {
  const { nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, nomor_hp, email, prodi = [], sumber_periode_pendaftaran = [] } = req.body;

  if (!nama_lengkap) {
    return res.status(400).json({ message: "nama_lengkap is required" });
  }
  if (!tempat_lahir) {
    return res.status(400).json({ message: "tempat_lahir is required" });
  }
  if (!tanggal_lahir) {
    return res.status(400).json({ message: "tanggal_lahir is required" });
  }
  if (!jenis_kelamin) {
    return res.status(400).json({ message: "jenis_kelamin is required" });
  }
  if (!nomor_hp) {
    return res.status(400).json({ message: "nomor_hp is required" });
  }
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }

  // validasi array prodis camaba (wajib)
  if (prodi.length === 0) {
    return res.status(400).json({ message: "Prodi is required" });
  }
  // validasi array sumber_periode_pendaftarans camaba (wajib)
  if (sumber_periode_pendaftaran.length === 0) {
    return res.status(400).json({ message: "Sumber Periode Pendaftaran is required" });
  }

  try {
    const periodePendaftaranId = req.params.id_periode_pendaftaran;

    if (!periodePendaftaranId) {
      return res.status(400).json({
        message: "Periode Pendaftaran ID is required"
      });
    }

    const periode_pendaftaran = await PeriodePendaftaran.findOne({
      where: {
        id: periodePendaftaranId
      }
    });

    if (!periode_pendaftaran) {
      return res.status(404).json({
        message: `<===== Periode Pendaftaran With ID ${periodePendaftaranId} Not Found:`
      });
    }

    const setting_ws_feeder_aktif = await SettingWSFeeder.findOne({
      where: { status: true }
    });

    if (!setting_ws_feeder_aktif) {
      return res.status(404).json({
        message: `<===== Setting WS Feeder Aktif Not Found:`
      });
    }

    const role = await Role.findOne({
      where: { nama_role: "camaba" }
    });

    if (!role) {
      return res.status(404).json({
        message: `<===== Role Camaba Not Found:`
      });
    }

    // Fungsi untuk menghasilkan nomor daftar
    const generateNomorDaftar = async (setting_ws_feeder_aktif, periode_pendaftaran) => {
      const usernameFeeder = setting_ws_feeder_aktif.username_feeder;
      const semesterId = periode_pendaftaran.id_semester.toString().slice(-3);

      const lastCamaba = await Camaba.findOne({
        where: { id_periode_pendaftaran: periode_pendaftaran.id },
        order: [["nomor_daftar", "DESC"]]
      });

      let nomorUrut = "0001"; // default jika belum ada
      if (lastCamaba) {
        const lastNomorDaftar = lastCamaba.nomor_daftar;
        const lastNomorUrut = parseInt(lastNomorDaftar.slice(-4));
        nomorUrut = (lastNomorUrut + 1).toString().padStart(4, "0");
      }

      return `${usernameFeeder}${semesterId}${nomorUrut}`;
    };

    // Buat nomor daftar baru
    const nomorDaftar = await generateNomorDaftar(setting_ws_feeder_aktif, periode_pendaftaran);

    // Konversi tanggal_lahir dan enkripsi untuk password
    const tanggal_lahir_format = convertTanggal(tanggal_lahir);
    const hashedPassword = await bcrypt.hash(tanggal_lahir_format, 10);

    // get data jenis tagihan PMB
    const jenis_tagihan_pmb = await JenisTagihan.findOne({
      where: { nama_jenis_tagihan: "PMB" }
    });

    if (!jenis_tagihan_pmb) {
      return res.status(404).json({
        message: `<===== Jenis Tagihan PMB Not Found:`
      });
    }

    // Buat data camaba baru
    const newCamaba = await Camaba.create({
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      nomor_hp,
      email,
      tanggal_pendaftaran: new Date(),
      nomor_daftar: nomorDaftar,
      hints: tanggal_lahir_format,
      id_periode_pendaftaran: periodePendaftaranId
    });

    // Buat data user baru
    const newUser = await User.create({
      nama: newCamaba.nama_lengkap,
      username: newCamaba.nomor_daftar,
      password: hashedPassword,
      hints: tanggal_lahir_format,
      email: null,
      status: true
    });

    await UserRole.create({
      id_role: role.id,
      id_user: newUser.id
    });

    // Buat data Biodata Camaba
    await BiodataCamaba.create({
      telepon: newCamaba.nomor_hp,
      handphone: newCamaba.nomor_hp,
      email: newCamaba.email,
      id_camaba: newCamaba.id
    });

    // Get data berkas periode pendaftaran
    const berkas_periode_pendaftaran = await BerkasPeriodePendaftaran.findAll({
      where: {
        id_periode_pendaftaran: periodePendaftaranId
      }
    });

    // Periksa apakah data ditemukan
    if (!berkas_periode_pendaftaran || berkas_periode_pendaftaran.length === 0) {
      return res.status(404).json({
        message: `<===== Berkas Periode Pendaftaran Not Found:`
      });
    }

    // Loop untuk setiap berkas yang ditemukan dan buat data pemberkasan camaba
    for (const berkas of berkas_periode_pendaftaran) {
      await PemberkasanCamaba.create({
        file_berkas: null,
        id_berkas_periode_pendaftaran: berkas.id,
        id_camaba: newCamaba.id
      });
    }

    // Variabel untuk menyimpan prodi yang berhasil ditambahkan
    let prodiCamaba = [];

    // Tambah data Prodi
    if (prodi.length > 0) {
      prodiCamaba = await Promise.all(
        prodi.map(async ({ id_prodi }) => {
          const data_prodi = await Prodi.findOne({
            where: { id_prodi: id_prodi }
          });

          if (data_prodi) {
            await ProdiCamaba.create({
              id_prodi: data_prodi.id_prodi,
              id_camaba: newCamaba.id
            });
            return data_prodi;
          } else {
            console.error(`Prodi with id_prodi: ${id_prodi} not found`);
            return null;
          }
        })
      );
    }

    // Hanya tambahkan data prodi yang berhasil ditemukan
    prodiCamaba = prodiCamaba.filter((prodi) => prodi !== null);

    // create data tagihan camaba
    await TagihanCamaba.create({
      jumlah_tagihan: periode_pendaftaran.biaya_pendaftaran,
      tanggal_tagihan: periode_pendaftaran.batas_akhir_pembayaran,
      id_jenis_tagihan: jenis_tagihan_pmb.id_jenis_tagihan,
      id_semester: periode_pendaftaran.id_semester,
      id_camaba: newCamaba.id,
      id_periode_pendaftaran: periode_pendaftaran.id
    });

    // Variabel untuk menyimpan sumber_periode_pendaftaran yang berhasil ditambahkan
    let sumberPeriodePendaftaran = [];

    if (sumber_periode_pendaftaran.length > 0) {
      sumberPeriodePendaftaran = await Promise.all(
        sumber_periode_pendaftaran.map(async ({ id, nama_sumber: namaSumberRequest }) => {
          // tambahkan nama_sumber dari request
          const data_sumber_periode_pendaftaran = await SumberPeriodePendaftaran.findOne({
            where: { id: id },
            include: [{ model: Sumber }]
          });

          if (data_sumber_periode_pendaftaran) {
            const namaSumber = data_sumber_periode_pendaftaran.Sumber.nama_sumber === "Lainnya" ? namaSumberRequest : data_sumber_periode_pendaftaran.Sumber.nama_sumber;

            await SumberInfoCamaba.create({
              nama_sumber: namaSumber, // menggunakan nama sumber sesuai kondisi
              id_camaba: newCamaba.id,
              id_sumber_periode_pendaftaran: data_sumber_periode_pendaftaran.id
            });

            return data_sumber_periode_pendaftaran;
          } else {
            console.error(`Sumber Periode Pendaftaran with id: ${id} not found`);
            return null;
          }
        })
      );
    }

    // Hanya tambahkan data sumber info camaba yang berhasil ditemukan
    sumberPeriodePendaftaran = sumberPeriodePendaftaran.filter((sumber_periode_pendaftaran) => sumber_periode_pendaftaran !== null);

    res.status(201).json({
      message: "<===== CREATE Camaba Success",
      dataCamaba: newCamaba,
      dataProdiCamaba: prodiCamaba,
      dataSumberInfoCamaba: sumberPeriodePendaftaran
    });
  } catch (error) {
    next(error);
  }
};

// camaba
const getCamabaActiveByUser = async (req, res, next) => {
  try {
    const user = req.user;

    // get role user active
    const roleCamaba = await Role.findOne({
      where: { nama_role: "camaba" }
    });

    if (!roleCamaba) {
      return res.status(404).json({
        message: "Role Camaba not found"
      });
    }

    // mengecek apakah user saat ini memiliki role camaba
    const userRole = await UserRole.findOne({
      where: { id_user: user.id, id_role: roleCamaba.id }
    });

    if (!userRole) {
      return res.status(404).json({
        message: "User is not Camaba"
      });
    }

    const camaba = await Camaba.findOne({
      where: {
        nomor_daftar: user.username
      },
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ]
    });

    if (!camaba) {
      return res.status(404).json({
        message: "Camaba not found"
      });
    }

    // get data Prodi Camaba
    const prodiCamaba = await ProdiCamaba.findAll({
      where: { id_camaba: camaba.id },
      include: [{ model: Prodi, include: [{ model: JenjangPendidikan }] }]
    });

    // Jika data tidak ditemukan, kirim respons 404
    if (!prodiCamaba) {
      return res.status(404).json({
        message: `<===== Prodi Camaba Not Found:`
      });
    }

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: `<===== GET Camaba Active Success:`,
      data: camaba,
      prodiCamaba: prodiCamaba
    });
  } catch (error) {
    next(error);
  }
};

// camaba
const updateProfileCamabaActive = async (req, res, next) => {
  try {
    const user = req.user;

    // get role user active
    const roleCamaba = await Role.findOne({
      where: { nama_role: "camaba" }
    });

    if (!roleCamaba) {
      return res.status(404).json({
        message: "Role Camaba not found"
      });
    }

    // mengecek apakah user saat ini memiliki role camaba
    const userRole = await UserRole.findOne({
      where: { id_user: user.id, id_role: roleCamaba.id }
    });

    if (!userRole) {
      return res.status(404).json({
        message: "User is not Camaba"
      });
    }

    const camaba = await Camaba.findOne({
      where: {
        nomor_daftar: user.username
      },
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ]
    });

    if (!camaba) {
      return res.status(404).json({
        message: "Camaba not found"
      });
    }

    // Simpan path file lama jika ada
    const originalProfilePath = camaba.foto_profil;

    // Jika ada file baru di-upload, update path profile dan hapus file lama
    if (req.file) {
      // Cek tipe MIME file yang di-upload
      if (req.file.mimetype !== "image/jpeg" && req.file.mimetype !== "image/png") {
        return res.status(400).json({ message: "File type not supported" });
      } else {
        const protocol = process.env.PROTOCOL || "http";
        const host = process.env.HOST || "localhost";
        const port = process.env.PORT || 4000;

        const fileName = req.file.filename;
        const fileUrl = `${protocol}://${host}:${port}/src/storage/camaba/profile/${fileName}`;

        camaba.foto_profil = fileUrl;

        // Hapus file lama jika ada
        if (originalProfilePath) {
          const oldFilePath = path.resolve(__dirname, `../storage/camaba/profile/${path.basename(originalProfilePath)}`);
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error(`Gagal menghapus gambar: ${err.message}`);
            }
          });
        }
      }
    }

    // Simpan perubahan camaba
    await camaba.save();

    res.json({
      message: "UPDATE Profile Camaba Success",
      data: camaba
    });
  } catch (error) {
    next(error);
  }
};

// camaba
const finalisasiByCamabaActive = async (req, res, next) => {
  const { finalisasi } = req.body;

  if (!finalisasi) {
    return res.status(400).json({ message: "finalisasi is required" });
  }

  try {
    const user = req.user;

    // get role user active
    const roleCamaba = await Role.findOne({
      where: { nama_role: "camaba" }
    });

    if (!roleCamaba) {
      return res.status(404).json({
        message: "Role Camaba not found"
      });
    }

    // mengecek apakah user saat ini memiliki role camaba
    const userRole = await UserRole.findOne({
      where: { id_user: user.id, id_role: roleCamaba.id }
    });

    if (!userRole) {
      return res.status(404).json({
        message: "User is not Camaba"
      });
    }

    const camaba = await Camaba.findOne({
      where: {
        nomor_daftar: user.username
      }
    });

    if (!camaba) {
      return res.status(404).json({
        message: "Camaba not found"
      });
    }

    // update data finalisasi pada camaba aktif
    camaba.finalisasi = finalisasi;
    await camaba.save();

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: `<===== Finalisasi Camaba Active Success:`,
      data: camaba
    });
  } catch (error) {
    next(error);
  }
};

// admin, admin pmb
const updateStatusKelulusanPendaftar = async (req, res, next) => {
  const { status_berkas, status_tes, id_prodi_diterima, id_pembiayaan, finalisasi, status_akun_pendaftar } = req.body; // nim tidak dilampirkan

  // Mengecek jika variabel undefined atau null, tetapi tetap menerima nilai false
  if (status_berkas === undefined || status_berkas === null) {
    return res.status(400).json({ message: "status_berkas is required" });
  }
  if (status_tes === undefined || status_tes === null) {
    return res.status(400).json({ message: "status_tes is required" });
  }
  if (status_akun_pendaftar === undefined || status_akun_pendaftar === null) {
    return res.status(400).json({ message: "status_akun_pendaftar is required" });
  }
  // if (!nim) {
  //   return res.status(400).json({ message: "nim is required" });
  // }
  if (!id_prodi_diterima) {
    return res.status(400).json({ message: "id_prodi_diterima is required" });
  }
  if (!id_pembiayaan) {
    return res.status(400).json({ message: "id_pembiayaan is required" });
  }
  if (!finalisasi) {
    return res.status(400).json({ message: "finalisasi is required" });
  }

  try {
    // Dapatkan ID dari parameter permintaan
    const camabaId = req.params.id;

    if (!camabaId) {
      return res.status(400).json({
        message: "Camaba ID is required"
      });
    }

    // Cari data camaba berdasarkan ID di database
    const camaba = await Camaba.findByPk(camabaId);

    // update data camaba aktif
    camaba.status_berkas = status_berkas;
    camaba.status_tes = status_tes;
    // camaba.nim = nim;
    camaba.id_prodi_diterima = id_prodi_diterima;
    camaba.id_pembiayaan = id_pembiayaan;
    camaba.finalisasi = finalisasi;
    camaba.status_akun_pendaftar = status_akun_pendaftar;
    await camaba.save();

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: `<===== UPDATE Status Kelulusan Pendaftar By Camaba ID ${camabaId} Success:`,
      data: camaba
    });
  } catch (error) {
    next(error);
  }
};

// camaba
const cetakFormPendaftaranByCamabaActive = async (req, res, next) => {
  try {
    const user = req.user;

    // get role user active
    const roleCamaba = await Role.findOne({
      where: { nama_role: "camaba" }
    });

    if (!roleCamaba) {
      return res.status(404).json({
        message: "Role Camaba not found"
      });
    }

    // mengecek apakah user saat ini memiliki role camaba
    const userRole = await UserRole.findOne({
      where: { id_user: user.id, id_role: roleCamaba.id }
    });

    if (!userRole) {
      return res.status(404).json({
        message: "User is not Camaba"
      });
    }

    const camaba = await Camaba.findOne({
      where: {
        nomor_daftar: user.username
      },
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }, { model: JalurMasuk }, { model: SistemKuliah }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ]
    });

    if (!camaba) {
      return res.status(404).json({
        message: "Camaba not found"
      });
    }

    // get data user
    const user_camaba = await User.findOne({
      where: {
        username: camaba.nomor_daftar
      },
      attributes: ["username", "hints"]
    });

    if (!user_camaba) {
      return res.status(404).json({
        message: "User Camaba not found"
      });
    }

    // get data Prodi Camaba
    const prodiCamaba = await ProdiCamaba.findAll({
      where: { id_camaba: camaba.id },
      include: [{ model: Prodi, include: [{ model: JenjangPendidikan }] }]
    });

    // Jika data tidak ditemukan, kirim respons 404
    if (!prodiCamaba) {
      return res.status(404).json({
        message: `<===== Prodi Camaba Not Found:`
      });
    }

    // Kirim respons JSON jika berhasil
    res.status(200).json({
      message: `<===== Cetak Form Pendaftaran Camaba Active Success:`,
      dataCamaba: camaba,
      dataProdiCamaba: prodiCamaba,
      dataUserCamaba: user_camaba
    });
  } catch (error) {
    next(error);
  }
};

// camaba
const cetakKartuUjianByCamabaActive = async (req, res, next) => {
  try {
    const user = req.user;

    // get role user active
    const roleCamaba = await Role.findOne({
      where: { nama_role: "camaba" }
    });

    if (!roleCamaba) {
      return res.status(404).json({
        message: "Role Camaba not found"
      });
    }

    // mengecek apakah user saat ini memiliki role camaba
    const userRole = await UserRole.findOne({
      where: { id_user: user.id, id_role: roleCamaba.id }
    });

    if (!userRole) {
      return res.status(404).json({
        message: "User is not Camaba"
      });
    }

    const camaba = await Camaba.findOne({
      where: {
        nomor_daftar: user.username
      },
      include: [
        { model: PeriodePendaftaran, include: [{ model: Semester }, { model: JalurMasuk }, { model: SistemKuliah }] },
        { model: Prodi, include: [{ model: JenjangPendidikan }] }
      ]
    });

    if (!camaba) {
      return res.status(404).json({
        message: "Camaba not found"
      });
    }

    // mengecek apakah camaba sudah melakukan finalisasi atau belum
    if (camaba.finalisasi === true) {
      // get biodata camaba
      const biodata_camaba = await BiodataCamaba.findOne({
        where: {
          id_camaba: camaba.id
        }
      });

      // Jika data tidak ditemukan, kirim respons 404
      if (!biodata_camaba) {
        return res.status(404).json({
          message: `<===== Biodata Camaba Not Found:`
        });
      }

      // get data periode pendaftaran
      const periode_pendaftaran = await PeriodePendaftaran.findOne({
        where: {
          id: camaba.id_periode_pendaftaran
        }
      });

      // Jika data tidak ditemukan, kirim respons 404
      if (!periode_pendaftaran) {
        return res.status(404).json({
          message: `<===== Periode Pendaftaran Not Found:`
        });
      }

      // get tahap tes periode pendaftaran
      const tahap_tes_periode_pendaftaran = await TahapTesPeriodePendaftaran.findAll({
        where: {
          id_periode_pendaftaran: periode_pendaftaran.id
        },
        include: [{ model: JenisTes }]
      });

      // Jika data tidak ditemukan, kirim respons 404
      if (!tahap_tes_periode_pendaftaran) {
        return res.status(404).json({
          message: `<===== Tahap Tes Periode Pendaftaran Not Found:`
        });
      }

      // get data Prodi Camaba
      const prodiCamaba = await ProdiCamaba.findAll({
        where: { id_camaba: camaba.id },
        include: [{ model: Prodi, include: [{ model: JenjangPendidikan }] }]
      });

      // Jika data tidak ditemukan, kirim respons 404
      if (!prodiCamaba) {
        return res.status(404).json({
          message: `<===== Prodi Camaba Not Found:`
        });
      }

      // Kirim respons JSON jika berhasil
      res.status(200).json({
        message: `<===== Cetak Form Pendaftaran Camaba Active Success:`,
        dataCamaba: camaba,
        dataBiodataCamaba: biodata_camaba,
        dataProdiCamaba: prodiCamaba,
        dataTahapTes: tahap_tes_periode_pendaftaran
      });
    } else {
      return res.status(404).json({
        message: "Camaba belum melakukan finalisasi"
      });
    }
  } catch (error) {
    next(error);
  }
};

// Fungsi untuk mengkonversi tanggal_lahir
const convertTanggal = (tanggal_lahir) => {
  const dateParts = tanggal_lahir.split("-");
  const tanggal = dateParts[2];
  const bulan = dateParts[1];
  const tahun = dateParts[0];
  return `${tanggal}${bulan}${tahun}`;
};

module.exports = {
  getAllCamaba,
  getAllCamabaByFilter,
  getCamabaById,
  createCamaba,
  getCamabaActiveByUser,
  updateProfileCamabaActive,
  finalisasiByCamabaActive,
  updateStatusKelulusanPendaftar,
  cetakFormPendaftaranByCamabaActive,
  cetakKartuUjianByCamabaActive
};
