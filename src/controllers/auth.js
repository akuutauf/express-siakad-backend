const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { User, UserRole, Role, BlacklistedToken, RolePermission, Permission } = require("../../models");

// Fungsi untuk membuat token JWT
const generateToken = async (user) => {
  try {
    // Dapatkan peran pengguna dari tabel UserRole
    const userRoles = await UserRole.findAll({
      where: { id_user: user.id },
      include: [{ model: Role }],
    });

    // Ambil nama peran dari setiap objek userRole
    const dataRoles = userRoles.map((userRole) => userRole.Role.nama_role);

    // Cek apakah pengguna memiliki peran
    if (dataRoles.length === 0) {
      throw new Error("Pengguna tidak memiliki peran");
    }

    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        data_roles: dataRoles,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );
  } catch (error) {
    throw error;
  }
};

const doLogin = async (req, res, next) => {
  // Di sini Anda dapat memverifikasi username dan password
  const { username, password } = req.body;

  // validasi required
  if (!username) {
    return res.status(400).json({ message: "username is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "password is required" });
  }

  // valiasi tipe data
  if (typeof username !== "string") {
    return res.status(400).json({ message: "username must be a string" });
  }
  if (typeof password !== "string") {
    return res.status(400).json({ message: "password must be a string" });
  }

  // validasi input
  if (!validator.isLength(username, { min: 1, max: 13 })) {
    return res.status(400).json({ message: "username must be between 1 and 13 characters" });
  }
  if (!validator.isLength(password, { min: 8, max: 8 })) {
    return res.status(400).json({ message: "password must be 8 characters" });
  }

  try {
    // Cari user berdasarkan username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Username tidak ditemukan" });
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    // Jika username dan password cocok, buat token JWT
    const token = await generateToken(user);

    // mengambil data user role pengguna yang telah melakukan login
    const userRole = await UserRole.findOne({
      where: {
        id_user: user.id,
      },
    });

    // mengambil data role pengguna yang telah melakukan login
    const role = await Role.findOne({
      where: {
        id: userRole.id_role,
      },
    });

    // mengambil data permission berdasarkan role yang telah diperoleh
    const permissions = await RolePermission.findAll({
      where: {
        id_role: role.id,
      },
      include: [
        {
          model: Permission,
          attributes: ["nama_permission"],
        },
      ],
    });

    // Format permissions untuk hanya mengembalikan nama_permission
    const formattedPermissions = permissions.map((permission) => permission.Permission.nama_permission);

    // Kirim token sebagai respons
    res.json({
      message: "Login berhasil",
      token,
      user: user.nama,
      role: role.nama_role,
      permissions: formattedPermissions,
    });
  } catch (error) {
    next(error);
  }
};

// do logout dengan implementasi blacklist token
// const doLogout = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization;
//     if (!token) {
//       return res.status(400).json({ message: "Token tidak ditemukan" });
//     }

//     const blacklistToken = await BlacklistedToken.findOne({
//       where: {
//         token: token,
//       },
//     });

//     // mengecek apakah data blacklist token ada
//     if (blacklistToken) {
//       return res.status(400).json({ message: "Token Sudah Expired" });
//     }

//     // Tambahkan token ke dalam blacklist
//     await BlacklistedToken.create({
//       token,
//     });

//     // Hapus token dari sisi klien
//     res.clearCookie("token");

//     res.json({
//       message: "Anda baru saja logout",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const doLogout = (req, res, next) => {
  try {
    // Hapus token dari sisi klien
    res.clearCookie("token");

    res.json({
      message: "Anda baru saja logout",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateToken,
  doLogin,
  doLogout,
};
