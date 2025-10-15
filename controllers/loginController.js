const bcrypt = require('bcryptjs');
const db = require('../models/database').pool;

exports.login = (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = email.trim().toLowerCase();

  db.query('SELECT * FROM tb_users WHERE email = ?', [normalizedEmail], (err, results) => {
    if (err) {
      console.error('Error al consultar usuario:', err);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err);
        return res.status(500).json({ success: false, message: 'Error al verificar la contraseña' });
      }

      if (!match) {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }

      // Si coincide, respondemos con los datos necesarios
      res.json({
        success: true,
        user: {
          id: user.id_user,
          nombre: user.nombre,
          apellidos: user.apellidos,
          email: user.email,
          rol: user.rol,
          cargo: user.cargo,
          area: user.area,
          puesto: user.puesto,
          foto: user.foto
        }
      });
    });
  });
};
