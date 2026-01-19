import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    FolderOpen,
    Search,
    Users,
    Building2,
    FileText,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout, isAdmin, isManager } = useAuth();

    const navItems = [
        { to: '/', icon: Home, label: 'Inicio', roles: ['Admin', 'Manager', 'User'] },
        { to: '/folders', icon: FolderOpen, label: 'Carpetas', roles: ['Admin', 'Manager', 'User'] },
        { to: '/documents', icon: FileText, label: 'Documentos', roles: ['Admin', 'Manager', 'User'] },
        { to: '/search', icon: Search, label: 'Búsqueda', roles: ['Admin', 'Manager', 'User'] },
        { to: '/departments', icon: Building2, label: 'Departamentos', roles: ['Admin'] },
        { to: '/users', icon: Users, label: 'Usuarios', roles: ['Admin'] },
    ];

    const filteredNavItems = navItems.filter(item =>
        item.roles.includes(user?.role?.name)
    );

    return (
        <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
            {/* Logo/Brand */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-xl font-bold">Documental</h1>
                <p className="text-xs text-gray-400 mt-1">Gestión de Documentos</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-800">
                <div className="mb-3 px-4">
                    <p className="text-sm font-semibold text-white truncate">
                        {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    <div className="mt-1">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary-600 text-white">
                            {user?.role?.name}
                        </span>
                        {user?.department && (
                            <span className="inline-block ml-2 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
                                {user.department.name}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
