const { sequelize } = require('../config/database');

// Import all models
const Role = require('./Role');
const Department = require('./Department');
const User = require('./User');
const Folder = require('./Folder');
const Document = require('./Document');
const Permission = require('./Permission');
const AuditLog = require('./AuditLog');
const FolderShare = require('./FolderShare');

// ============================================
// ASSOCIATIONS
// ============================================

// Role associations
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
Role.hasMany(Permission, { foreignKey: 'role_id', as: 'permissions' });

// Department associations
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
Department.hasMany(Folder, { foreignKey: 'department_id', as: 'folders' });
Department.belongsToMany(Folder, {
    through: FolderShare,
    as: 'shared_folders',
    foreignKey: 'department_id',
    otherKey: 'folder_id'
});

// User associations
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
User.hasMany(Folder, { foreignKey: 'created_by', as: 'created_folders' });
User.hasMany(Document, { foreignKey: 'uploaded_by', as: 'uploaded_documents' });
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });

// Folder associations
Folder.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Folder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Folder.belongsTo(Folder, { foreignKey: 'parent_folder_id', as: 'parent' });
Folder.hasMany(Folder, { foreignKey: 'parent_folder_id', as: 'subfolders' });
Folder.hasMany(Document, { foreignKey: 'folder_id', as: 'documents' });
Folder.belongsToMany(Department, {
    through: FolderShare,
    as: 'shared_with_departments',
    foreignKey: 'folder_id',
    otherKey: 'department_id'
});

// Document associations
Document.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });
Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Permission associations
Permission.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// AuditLog associations
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ============================================
// EXPORT
// ============================================

module.exports = {
    sequelize,
    Role,
    Department,
    User,
    Folder,
    Document,
    Permission,
    AuditLog,
    FolderShare
};
