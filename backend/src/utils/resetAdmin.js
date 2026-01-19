const { User } = require('../models');
const bcrypt = require('bcrypt');
require('dotenv').config();

const resetPassword = async () => {
    try {
        const admin = await User.findOne({ where: { email: 'admin@empresa.com' } });

        if (!admin) {
            console.log('Usuario admin no encontrado');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin123!', salt);

        admin.password_hash = hashedPassword;
        await admin.save();

        console.log('✅ Contraseña de admin actualizada correctamente a: Admin123!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
};

resetPassword();
