import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if specific role is required
    if (requiredRole && user.role.name !== requiredRole) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-700">
                        No tienes permisos suficientes para acceder a esta página.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Rol requerido: <span className="font-semibold">{requiredRole}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                        Tu rol: <span className="font-semibold">{user.role.name}</span>
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
