const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
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
    original_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 0,
            max: 26214400 // 25MB in bytes
        }
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [[
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'image/jpeg',
                'image/png'
            ]]
        }
    },
    extension: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.jpeg', '.png']]
        }
    },
    folder_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'folders',
            key: 'id'
        }
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'documents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance method to format file size
Document.prototype.getFormattedSize = function () {
    const bytes = this.file_size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

module.exports = Document;
