const { Sequelize } = require('sequelize');
const { Folder, Department, User, FolderShare } = require('./src/models');
require('dotenv').config();

const test = async () => {
    try {
        await require('./src/config/database').sequelize.authenticate();
        console.log('DB Connected');

        // Find a folder and a department to link
        const folder = await Folder.findOne();
        const dept = await Department.findOne({ where: { id: { [Sequelize.Op.ne]: folder.department_id } } });

        if (!folder || !dept) {
            console.log('Need at least 1 folder and 2 departments to test sharing');
            return;
        }

        console.log(`Attempting to share Folder ${folder.id} (${folder.name}) with Dept ${dept.id} (${dept.name})`);

        // Try using the magic method
        await folder.addShared_with_departments(dept.id);
        console.log('Magich method executed');

        // Verify
        const shares = await FolderShare.findAll();
        console.log('Total Folder Shares after add:', shares.length);
        console.log(JSON.stringify(shares, null, 2));

    } catch (error) {
        console.error('Error during manual share test:', error);
    } finally {
        process.exit();
    }
};

test();
