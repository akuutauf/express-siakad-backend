const { KomponenEvaluasiKelas, KomponenEvaluasiKelasSync, KelasKuliah } = require("../../../models");
const { getToken } = require("../api-feeder/get-token");
const axios = require("axios");

async function getKelasKuliahFromFeeder(semesterId, req, res, next) {
  try {
    if (!semesterId) {
      return res.status(400).json({
        message: "Semester ID is required",
      });
    }

    const { token, url_feeder } = await getToken();

    if (!token || !url_feeder) {
      throw new Error("Failed to obtain token or URL feeder");
    }

    const requestBody = {
      act: "GetListKelasKuliah",
      token: token,
      filter: `id_semester='${semesterId}'`,
    };

    const response = await axios.post(url_feeder, requestBody);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching data from Feeder:", error.message);
    throw error;
  }
}

async function getKomponenEvaluasiKelasFromFeeder(kelasKuliahId, req, res, next) {
  try {
    if (!kelasKuliahId) {
      return res.status(400).json({
        message: "Kelas Kuliah ID is required",
      });
    }

    const { token, url_feeder } = await getToken();

    if (!token || !url_feeder) {
      throw new Error("Failed to obtain token or URL feeder");
    }

    const requestBody = {
      act: "GetListKomponenEvaluasiKelas",
      token: token,
      filter: `id_kelas_kuliah='${kelasKuliahId}'`,
    };

    const response = await axios.post(url_feeder, requestBody);

    return response.data.data;
  } catch (error) {
    console.error("Error fetching data from Feeder:", error.message);
    throw error;
  }
}

async function getKomponenEvaluasiKelasFromLocal(semesterId, req, res, next) {
  try {
    return await KomponenEvaluasiKelas.findAll({
      include: [
        {
          model: KelasKuliah,
          where: {
            id_semester: semesterId,
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching data from local DB:", error.message);
    throw error;
  }
}

// Fungsi pembanding nilai
function areEqual(value1, value2) {
  return value1 === value2 || (value1 == null && value2 == null);
}

async function matchingDataKomponenEvaluasiKelas(req, res, next) {
  try {
    // Dapatkan ID dari parameter permintaan
    const semesterId = req.params.id_semester;

    if (!semesterId) {
      return res.status(400).json({
        message: "Semester ID is required",
      });
    }

    let komponenEvaluasiKelasFeeder = [];

    // Mendapatkan semua kelas kuliah berdasarkan id_semester
    let kelasKuliahFeeder = await getKelasKuliahFromFeeder(semesterId);

    for (let kelas_kuliah of kelasKuliahFeeder) {
      // Mendapatkan komponen evaluasi kelas berdasarkan id_kelas_kuliah
      let dataKomponenEvaluasiKelasFeeder = await getKomponenEvaluasiKelasFromFeeder(kelas_kuliah.id_kelas_kuliah);

      if (dataKomponenEvaluasiKelasFeeder && dataKomponenEvaluasiKelasFeeder.length > 0) {
        // Menambahkan setiap item ke array utama dengan struktur yang sesuai
        dataKomponenEvaluasiKelasFeeder.forEach((komponen) => {
          komponenEvaluasiKelasFeeder.push({
            id_komponen_evaluasi: komponen.id_komponen_evaluasi,
            id_kelas_kuliah: kelas_kuliah.id_kelas_kuliah,
            id_jenis_evaluasi: komponen.id_jenis_evaluasi,
            nama: komponen.nama || "",
            nama_inggris: komponen.nama_inggris || "",
            nomor_urut: komponen.nomor_urut,
            bobot_evaluasi: komponen.bobot_evaluasi,
            last_update: komponen.last_update,
            tgl_create: komponen.tgl_create,
          });
        });
      }
    }

    const komponenEvaluasiKelasLocal = await getKomponenEvaluasiKelasFromLocal(semesterId);

    // komponen evaluasi kelas feeder
    const komponenEvaluasiKelasFeederMap = komponenEvaluasiKelasFeeder.reduce((map, komponen_evaluasi_kelas) => {
      map[komponen_evaluasi_kelas.id_komponen_evaluasi] = komponen_evaluasi_kelas;
      return map;
    }, {});

    // Loop untuk proses sinkronisasi
    for (let localKomponenEvaluasiKelas of komponenEvaluasiKelasLocal) {
      const feederKomponenEvaluasiKelas = komponenEvaluasiKelasFeederMap[localKomponenEvaluasiKelas.id_feeder];

      // get kelas kuliah yang terkait dengan localKomponenEvaluasiKelas
      let kelasKuliahLocal = await KelasKuliah.findOne({
        where: {
          id_kelas_kuliah: localKomponenEvaluasiKelas.id_kelas_kuliah,
        },
      });

      if (!kelasKuliahLocal) {
        console.warn(`Kelas kuliah ${localKomponenEvaluasiKelas.id_kelas_kuliah} tidak ditemukan. Melewatkan data ini.`);
        continue;
      }

      const existingSync = await KomponenEvaluasiKelasSync.findOne({
        where: {
          id_komponen_evaluasi: localKomponenEvaluasiKelas.id_komponen_evaluasi,
          jenis_singkron: feederKomponenEvaluasiKelas ? "update" : "create",
          status: false,
          id_feeder: feederKomponenEvaluasiKelas ? localKomponenEvaluasiKelas.id_feeder : null,
        },
      });

      if (existingSync) {
        console.log(`Data komponen evaluasi kelas ${localKomponenEvaluasiKelas.id_komponen_evaluasi} sudah disinkronisasi.`);
        continue;
      }

      if (!feederKomponenEvaluasiKelas) {
        // Proses create
        await KomponenEvaluasiKelasSync.create({
          jenis_singkron: "create",
          status: false,
          id_feeder: null,
          id_komponen_evaluasi: localKomponenEvaluasiKelas.id_komponen_evaluasi,
        });
        console.log(`Data komponen evaluasi kelas ${localKomponenEvaluasiKelas.id_komponen_evaluasi} ditambahkan ke sinkronisasi dengan jenis 'create'.`);
      } else {
        const isUpdated = compareKomponenEvaluasi(localKomponenEvaluasiKelas, feederKomponenEvaluasiKelas, kelasKuliahLocal);

        if (isUpdated) {
          await KomponenEvaluasiKelasSync.create({
            jenis_singkron: "update",
            status: false,
            id_feeder: localKomponenEvaluasiKelas.id_feeder,
            id_komponen_evaluasi: localKomponenEvaluasiKelas.id_komponen_evaluasi,
          });
          console.log(`Data komponen evaluasi kelas ${localKomponenEvaluasiKelas.id_komponen_evaluasi} ditambahkan ke sinkronisasi dengan jenis 'update'.`);
        }
      }
    }

    // Fungsi pembanding data local dengan feeder
    function compareKomponenEvaluasi(localKomponenEvaluasiKelas, feederKomponenEvaluasiKelas, kelasKuliahLocal) {
      return (
        kelasKuliahLocal.id_feeder !== feederKomponenEvaluasiKelas.id_kelas_kuliah ||
        localKomponenEvaluasiKelas.id_jenis_evaluasi !== feederKomponenEvaluasiKelas.id_jenis_evaluasi ||
        localKomponenEvaluasiKelas.nama !== feederKomponenEvaluasiKelas.nama ||
        !areEqual(localKomponenEvaluasiKelas.nama_inggris, feederKomponenEvaluasiKelas.nama_inggris) ||
        !areEqual(localKomponenEvaluasiKelas.nomor_urut, feederKomponenEvaluasiKelas.nomor_urut) ||
        !areEqual(localKomponenEvaluasiKelas.bobot_evaluasi, feederKomponenEvaluasiKelas.bobot_evaluasi)
      );
    }

    console.log("Matching komponen evaluasi kelas lokal ke feeder berhasil.");
  } catch (error) {
    console.error("Error during matchingDataKomponenEvaluasiKelas:", error.message);
    throw error;
  }
}

const matchingSyncDataKomponenEvaluasiKelas = async (req, res, next) => {
  try {
    await matchingDataKomponenEvaluasiKelas(req, res, next);
    res.status(200).json({ message: "Matching komponen evaluasi kelas lokal ke feeder berhasil." });
  } catch (error) {
    next(error);
  }
};

// fungsi singkron komponen evaluasi kelas
const insertKomponenEvaluasiKelas = async (id_komponen_evaluasi, req, res, next) => {
  try {
    // get data komponen evaluasi kelas from local
    let komponen_evaluasi_kelas = await KomponenEvaluasiKelas.findByPk(id_komponen_evaluasi);

    if (!komponen_evaluasi_kelas) {
      return res.status(404).json({ message: "Komponen Evaluasi Kelas not found" });
    }

    // Mendapatkan token
    const { token, url_feeder } = await getToken();

    // akan insert data komponen evaluasi kelas ke feeder
    const requestBody = {
      act: "InsertKomponenEvaluasiKelas",
      token: `${token}`,
      record: {
        id_kelas_kuliah: komponen_evaluasi_kelas.id_kelas_kuliah,
        id_jenis_evaluasi: komponen_evaluasi_kelas.id_jenis_evaluasi,
        nama: komponen_evaluasi_kelas.nama,
        nama_inggris: komponen_evaluasi_kelas.nama_inggris,
        nomor_urut: komponen_evaluasi_kelas.nomor_urut,
        bobot_evaluasi: komponen_evaluasi_kelas.bobot_evaluasi,
      },
    };

    // Menggunakan token untuk mengambil data
    const response = await axios.post(url_feeder, requestBody);

    // Mengecek jika ada error pada respons dari server
    if (response.data.error_code !== 0) {
      throw new Error(`Error from Feeder: ${response.data.error_desc}`);
    }

    // Mendapatkan id_komponen_evaluasi dari response feeder
    const idKomponenEvaluasi = response.data.data.id_komponen_evaluasi;

    // update id_feeder dan last sync pada komponen evaluasi kelas local
    komponen_evaluasi_kelas.id_feeder = idKomponenEvaluasi;
    komponen_evaluasi_kelas.last_sync = new Date();
    await komponen_evaluasi_kelas.save();

    // update status pada komponen_evaluasi_kelas_sync local
    let komponen_evaluasi_kelas_sync = await KomponenEvaluasiKelasSync.findOne({
      where: {
        id_komponen_evaluasi: id_komponen_evaluasi,
        status: false,
        jenis_singkron: "create",
        id_feeder: null,
      },
    });

    if (!komponen_evaluasi_kelas_sync) {
      return res.status(404).json({ message: "Komponen evaluasi kelas sync not found" });
    }

    komponen_evaluasi_kelas_sync.status = true;
    await komponen_evaluasi_kelas_sync.save();

    // result
    console.log(`Successfully inserted komponen evaluasi kelas with ID ${komponen_evaluasi_kelas_sync.id_komponen_evaluasi} to feeder`);
  } catch (error) {
    next(error);
  }
};

const updateKomponenEvaluasiKelas = async (id_komponen_evaluasi, req, res, next) => {
  try {
    // get data komponen evaluasi kelas from local
    let komponen_evaluasi_kelas = await KomponenEvaluasiKelas.findByPk(id_komponen_evaluasi);

    if (!komponen_evaluasi_kelas) {
      return res.status(404).json({ message: "Komponen evaluasi kelas not found" });
    }

    if (komponen_evaluasi_kelas.id_feeder == null || komponen_evaluasi_kelas.id_feeder == "") {
      return res.status(404).json({ message: `Komponen evaluasi kelas dengan ID ${komponen_evaluasi_kelas.id_komponen_evaluasi} belum dilakukan singkron ke feeder` });
    }

    // get data kelas kuliah yang sudah di singkron ke feeder
    let kelas_kuliah = await KelasKuliah.findOne({
      where: {
        id_kelas_kuliah: komponen_evaluasi_kelas.id_kelas_kuliah,
      },
    });

    if (!kelas_kuliah) {
      return res.status(404).json({ message: "Kelas kuliah not found" });
    }

    if (kelas_kuliah.id_feeder == null || kelas_kuliah.id_feeder == "") {
      return res.status(404).json({ message: `Kelas kuliah dengan ID ${kelas_kuliah.id_kelas_kuliah} belum dilakukan singkron ke feeder` });
    }

    // Mendapatkan token
    const { token, url_feeder } = await getToken();

    // akan update data komponen evaluasi kelas ke feeder
    const requestBody = {
      act: "UpdateKomponenEvaluasiKelas",
      token: `${token}`,
      key: {
        id_komponen_evaluasi: komponen_evaluasi_kelas.id_feeder,
      },
      record: {
        id_kelas_kuliah: kelas_kuliah.id_feeder,
        id_jenis_evaluasi: komponen_evaluasi_kelas.id_jenis_evaluasi,
        nama: komponen_evaluasi_kelas.nama,
        nama_inggris: komponen_evaluasi_kelas.nama_inggris,
        nomor_urut: komponen_evaluasi_kelas.nomor_urut,
        bobot_evaluasi: komponen_evaluasi_kelas.bobot_evaluasi,
      },
    };

    // Menggunakan token untuk mengambil data
    const response = await axios.post(url_feeder, requestBody);

    // Mengecek jika ada error pada respons dari server
    if (response.data.error_code !== 0) {
      throw new Error(`Error from Feeder: ${response.data.error_desc}`);
    }

    // update status pada komponen_evaluasi_kelas_sync local
    let komponen_evaluasi_kelas_sync = await KomponenEvaluasiKelasSync.findOne({
      where: {
        id_komponen_evaluasi: id_komponen_evaluasi,
        status: false,
        jenis_singkron: "update",
        id_feeder: komponen_evaluasi_kelas.id_feeder,
      },
    });

    if (!komponen_evaluasi_kelas_sync) {
      return res.status(404).json({ message: "Komponen evaluasi kelas sync not found" });
    }

    komponen_evaluasi_kelas_sync.status = true;
    await komponen_evaluasi_kelas_sync.save();

    // update last sync pada komponen evaluasi kelas
    komponen_evaluasi_kelas.last_sync = new Date();
    await komponen_evaluasi_kelas.save();

    // result
    console.log(`Successfully updated komponen evaluasi kelas with ID Feeder ${komponen_evaluasi_kelas_sync.id_feeder} to feeder`);
  } catch (error) {
    next(error);
  }
};

const syncKomponenEvaluasiKelas = async (req, res, next) => {
  try {
    const { komponen_evaluasi_kelas_syncs } = req.body;

    // Validasi input
    if (!komponen_evaluasi_kelas_syncs || !Array.isArray(komponen_evaluasi_kelas_syncs)) {
      return res.status(400).json({ message: "Request body tidak valid" });
    }

    // perulangan untuk aksi data komponen evaluasi kelas berdasarkan jenis singkron
    for (const komponen_evaluasi_kelas_sync of komponen_evaluasi_kelas_syncs) {
      // get data komponen evaluasi kelas sync
      const data_komponen_evaluasi_kelas_sync = await KomponenEvaluasiKelasSync.findByPk(komponen_evaluasi_kelas_sync.id);

      if (!data_komponen_evaluasi_kelas_sync) {
        return res.status(404).json({ message: "Data Komponen evaluasi kelas sync not found" });
      }

      if (data_komponen_evaluasi_kelas_sync.status === false) {
        if (data_komponen_evaluasi_kelas_sync.jenis_singkron === "create") {
          await insertKomponenEvaluasiKelas(data_komponen_evaluasi_kelas_sync.id_komponen_evaluasi, req, res, next);
        } else if (data_komponen_evaluasi_kelas_sync.jenis_singkron === "update") {
          await updateKomponenEvaluasiKelas(data_komponen_evaluasi_kelas_sync.id_komponen_evaluasi, req, res, next);
        }
      } else {
        console.log(`Data Komponen Evaluasi Kelas Sync dengan ID ${data_komponen_evaluasi_kelas_sync.id} tidak valid untuk dilakukan singkron`);
      }
    }

    // return
    res.status(200).json({ message: "Singkron komponen evaluasi kelas lokal ke feeder berhasil." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchingSyncDataKomponenEvaluasiKelas,
  syncKomponenEvaluasiKelas,
};
