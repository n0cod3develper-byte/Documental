import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { FolderOpen, FileText, Users, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const { user, isAdmin } = useAuth();
    const [stats, setStats] = useState({
        folders: 0,
        documents: 0,
        users: 0,
        recentDocuments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch folders
            const foldersRes = await api.get('/folders');

            // Fetch documents
            const docsRes = await api.get('/documents?limit=5');

            // Fetch users (only for admin)
            let usersCount = 0;
            if (isAdmin) {
                const usersRes = await api.get('/users');
                usersCount = usersRes.data.pagination?.total || 0;
            }

            setStats({
                folders: foldersRes.data.folders?.length || 0,
                documents: docsRes.data.pagination?.total || 0,
                users: usersCount,
                recentDocuments: docsRes.data.documents || []
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Error cargando datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Carpetas',
            value: stats.folders,
            icon: FolderOpen,
            color: 'bg-blue-500',
            show: true
        },
        {
            title: 'Documentos',
            value: stats.documents,
            icon: FileText,
            color: 'bg-green-500',
            show: true
        },
        {
            title: 'Usuarios',
            value: stats.users,
            icon: Users,
            color: 'bg-purple-500',
            show: isAdmin
        }
    ];

    return (
        <Layout>
            <Header title="Dashboard" breadcrumbs={['Inicio']} />

            <main className="flex-1 overflow-y-auto p-6">
                {/* Welcome Message */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        ¡Bienvenido, {user?.first_name}!
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {user?.department ? `Departamento de ${user.department.name}` : 'Administrador del Sistema'}
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {statCards.filter(card => card.show).map((card, index) => (
                                <div key={index} className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                                        </div>
                                        <div className={`${card.color} p-3 rounded-lg`}>
                                            <card.icon className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Documents */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Documentos Recientes</h3>
                            </div>

                            {stats.recentDocuments.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>No hay documentos recientes</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {stats.recentDocuments.map((doc) => (
                                        <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 transition">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{doc.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Subido por {doc.uploader?.first_name} {doc.uploader?.last_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(doc.created_at).toLocaleDateString('es-ES')}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {(doc.file_size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg p-6 text-white">
                                <h3 className="text-xl font-bold mb-2">Acceso Rápido</h3>
                                <p className="text-primary-100 mb-4">Navega directamente a las secciones más usadas</p>
                                <div className="space-y-2">
                                    <a href="/folders" className="block px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition">
                                        Ver Carpetas
                                    </a>
                                    <a href="/documents" className="block px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition">
                                        Ver Documentos
                                    </a>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Información del Sistema</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Rol:</span>
                                        <span className="font-semibold text-gray-900">{user?.role?.name}</span>
                                    </div>
                                    {user?.department && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Departamento:</span>
                                            <span className="font-semibold text-gray-900">{user.department.name}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Último acceso:</span>
                                        <span className="font-semibold text-gray-900">
                                            {user?.last_login ? new Date(user.last_login).toLocaleDateString('es-ES') : 'Primera vez'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </Layout>
    );
};

export default DashboardPage;
