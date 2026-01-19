const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FolderShare = sequelize.define('FolderShare', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    folder_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'folders',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    }
}, {
    tableName: 'folder_shares',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = FolderShare;
