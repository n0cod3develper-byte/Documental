const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [[
                'LOGIN',
                'LOGIN_FAILED',
                'LOGOUT',
                'UPLOAD',
                'DOWNLOAD',
                'DELETE_DOCUMENT',
                'CREATE_FOLDER',
                'DELETE_FOLDER',
                'CREATE_USER',
                'UPDATE_USER',
                'UNAUTHORIZED_ACCESS_ATTEMPT'
            ]]
        }
    },
    resource_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            isIn: [['document', 'folder', 'user', 'department', 'auth']]
        }
    },
    resource_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    resource_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = AuditLog;
