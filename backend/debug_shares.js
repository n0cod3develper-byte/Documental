const { Sequelize } = require('sequelize');
const { Folder, Department, User, FolderShare } = require('./src/models');
require('dotenv').config();

const test = async () => {
    try {
        await require('./src/config/database').sequelize.authenticate();
        console.log('DB Connected');

        const shares = await FolderShare.findAll();
        console.log('Total Folder Shares:', shares.length);
        console.log(JSON.stringify(shares, null, 2));

        const folders = await Folder.findAll({
            include: [{ model: Department, as: 'shared_with_departments' }]
        });

        console.log('\n--- Folders with Shares ---');
        folders.forEach(f => {
            if (f.shared_with_departments && f.shared_with_departments.length > 0) {
                console.log(`Folder "${f.name}" (ID: ${f.id}) is shared with:`);
                f.shared_with_departments.forEach(d => console.log(` - Dept ID ${d.id} (${d.name})`));
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

test();
