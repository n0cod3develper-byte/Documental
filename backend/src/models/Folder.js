const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Folder = sequelize.define('Folder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255]
        }
    },
    parent_folder_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    }
}, {
    tableName: 'folders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance method to get full path
Folder.prototype.getFullPath = async function () {
    let path = [this.name];
    let currentFolder = this;

    while (currentFolder.parent_folder_id) {
        currentFolder = await Folder.findByPk(currentFolder.parent_folder_id);
        if (currentFolder) {
            path.unshift(currentFolder.name);
        } else {
            break;
        }
    }

    return path.join(' > ');
};

module.exports = Folder;
