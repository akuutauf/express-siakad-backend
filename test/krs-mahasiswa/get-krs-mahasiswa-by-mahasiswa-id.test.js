const httpMocks = require("node-mocks-http");
const { getKRSMahasiswaByMahasiswaId } = require("../../src/controllers/krs-mahasiswa");
const { KRSMahasiswa, Mahasiswa, Semester, Prodi, MataKuliah, KelasKuliah, SettingGlobalSemester, DetailKelasKuliah, RuangPerkuliahan, DosenPengajarKelasKuliah, Dosen } = require("../../models");

jest.mock("../../models");

describe("getKRSMahasiswaByMahasiswaId", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  // Kode uji 1 - Mengembalikan KRS mahasiswa dengan ID registrasi yang valid dan status 200 jika ditemukan
  it("should return KRS mahasiswa by ID registrasi with status 200 if found", async () => {
    const idRegistrasiMahasiswa = 1;
    const mockSemesterAktif = { id_semester_krs: 2 };
    const mockKRSMahasiswa = [
      { id: 1, MataKuliah: { sks_mata_kuliah: "3" } },
      { id: 2, MataKuliah: { sks_mata_kuliah: "2" } },
    ];

    SettingGlobalSemester.findOne.mockResolvedValue(mockSemesterAktif);
    KRSMahasiswa.findAll.mockResolvedValue(mockKRSMahasiswa);

    req.params.id_registrasi_mahasiswa = idRegistrasiMahasiswa;

    await getKRSMahasiswaByMahasiswaId(req, res, next);

    expect(SettingGlobalSemester.findOne).toHaveBeenCalledWith({ where: { status: true } });
    expect(KRSMahasiswa.findAll).toHaveBeenCalledWith({
      where: {
        id_registrasi_mahasiswa: idRegistrasiMahasiswa,
        id_semester: mockSemesterAktif.id_semester_krs,
      },
      include: [
        { model: Mahasiswa },
        { model: Semester },
        { model: Prodi },
        { model: MataKuliah },
        {
          model: KelasKuliah,
          include: [
            { model: DetailKelasKuliah, include: [{ model: RuangPerkuliahan }] },
            { model: DosenPengajarKelasKuliah, include: [{ model: Dosen }] },
          ],
        },
      ],
    });
    expect(res.statusCode).toEqual(200);
    expect(res._getJSONData()).toEqual({
      message: `<===== GET KRS Mahasiswa By ID ${idRegistrasiMahasiswa} Success:`,
      jumlahData: mockKRSMahasiswa.length,
      total_sks_mata_kuliah: 5, // 3 + 2 dari mock data
      data: mockKRSMahasiswa,
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Kode uji 2 - Mengembalikan respons 404 jika KRS mahasiswa tidak ditemukan
  it("should return 404 if KRS mahasiswa by ID registrasi is not found", async () => {
    const idRegistrasiMahasiswa = 1;
    const mockSemesterAktif = { id_semester_krs: 2 };

    SettingGlobalSemester.findOne.mockResolvedValue(mockSemesterAktif);
    KRSMahasiswa.findAll.mockResolvedValue([]);

    req.params.id_registrasi_mahasiswa = idRegistrasiMahasiswa;

    await getKRSMahasiswaByMahasiswaId(req, res, next);

    expect(SettingGlobalSemester.findOne).toHaveBeenCalledWith({ where: { status: true } });
    expect(KRSMahasiswa.findAll).toHaveBeenCalled();
    expect(res.statusCode).toEqual(404);
    expect(res._getJSONData()).toEqual({
      message: `<===== KRS Mahasiswa With ID ${idRegistrasiMahasiswa} Not Found:`,
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Kode uji 3 - Mengembalikan respons 400 jika ID registrasi mahasiswa tidak disediakan
  it("should return 400 if ID registrasi mahasiswa is not provided", async () => {
    req.params.id_registrasi_mahasiswa = undefined;

    await getKRSMahasiswaByMahasiswaId(req, res, next);

    expect(res.statusCode).toEqual(400);
    expect(res._getJSONData()).toEqual({
      message: "ID Registrasi Mahasiswa is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  // Kode uji 4 - Mengembalikan respons 500 jika terjadi kesalahan di server
  it("should call next with error if there is an error on the server", async () => {
    const errorMessage = "Database error";
    SettingGlobalSemester.findOne.mockRejectedValueOnce(new Error(errorMessage));

    const idRegistrasiMahasiswa = 1;
    req.params.id_registrasi_mahasiswa = idRegistrasiMahasiswa;

    await getKRSMahasiswaByMahasiswaId(req, res, next);

    expect(SettingGlobalSemester.findOne).toHaveBeenCalledWith({ where: { status: true } });
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
