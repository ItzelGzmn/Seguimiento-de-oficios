// controllers/oficiosController.js
const { Op } = require('sequelize');
const { Oficio, User, Account } = require('../models');

// Obtener oficios según el rol del usuario
exports.getOficios = async (req, res) => {
    try {
        let whereCondition = {};
        
        // Si no es admin, solo ve los oficios de su cuenta
        if (req.user.role !== 'admin') {
            whereCondition.account_id = req.user.account_id;
        }

        const oficios = await Oficio.findAll({
            where: whereCondition,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    as: 'creator'
                },
                {
                    model: Account,
                    attributes: ['id', 'name'],
                    as: 'account'
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(oficios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener oficios' });
    }
};

// Crear nuevo oficio
exports.createOficio = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        const oficio = await Oficio.create({
            title,
            description,
            account_id: req.user.account_id, // Siempre se asigna a la cuenta del usuario
            created_by: req.user.id
        });

        const oficioWithRelations = await Oficio.findByPk(oficio.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    as: 'creator'
                },
                {
                    model: Account,
                    attributes: ['id', 'name'],
                    as: 'account'
                }
            ]
        });

        res.status(201).json(oficioWithRelations);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear oficio' });
    }
};

// Obtener oficio específico con control de acceso
exports.getOficioById = async (req, res) => {
    try {
        let whereCondition = { id: req.params.id };
        
        // Si no es admin, solo puede ver oficios de su cuenta
        if (req.user.role !== 'admin') {
            whereCondition.account_id = req.user.account_id;
        }

        const oficio = await Oficio.findOne({
            where: whereCondition,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    as: 'creator'
                },
                {
                    model: Account,
                    attributes: ['id', 'name'],
                    as: 'account'
                }
            ]
        });

        if (!oficio) {
            return res.status(404).json({ error: 'Oficio no encontrado' });
        }

        res.json(oficio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener oficio' });
    }
};
const { enviarCorreo } = require('../services/emailService');
const db = require('../models/database').pool;

exports.registrarOficio = (req, res) => {
  const { numero_oficio, remitente, asunto, ambito, correo_destinatario } = req.body;

  db.query(
    'INSERT INTO tb_oficios (numero_oficio, remitente, asunto, ambito) VALUES (?, ?, ?, ?)',
    [numero_oficio, remitente, asunto, ambito],
    async (err, result) => {
      if (err) {
        console.error('❌ Error al registrar oficio:', err);
        return res.status(500).json({ success: false, message: 'Error al registrar el oficio' });
      }

      // Enviar correo de notificación
      const mensajeHTML = `
        <h3>Nuevo oficio registrado</h3>
        <p><b>Número:</b> ${numero_oficio}</p>
        <p><b>Remitente:</b> ${remitente}</p>
        <p><b>Asunto:</b> ${asunto}</p>
        <p><b>Ámbito:</b> ${ambito}</p>
        <hr/>
        <p>Por favor, ingresa al sistema para revisarlo.</p>
      `;

      await enviarCorreo(correo_destinatario, 'Nuevo oficio registrado', mensajeHTML);

      res.json({ success: true, message: 'Oficio registrado y correo enviado' });
    }
  );
};
