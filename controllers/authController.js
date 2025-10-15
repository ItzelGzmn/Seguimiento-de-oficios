// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Account } = require('../models');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            where: { email },
            include: [{
                model: Account,
                attributes: ['id', 'name'],
                as: 'account'
            }]
        });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                account_id: user.account_id,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                account: user.account
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, account_id, role = 'user' } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Hash de la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            account_id,
            role
        });

        const userWithAccount = await User.findByPk(user.id, {
            include: [{
                model: Account,
                attributes: ['id', 'name'],
                as: 'account'
            }]
        });

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: userWithAccount.id,
                name: userWithAccount.name,
                email: userWithAccount.email,
                role: userWithAccount.role,
                account: userWithAccount.account
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
};