import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { Building2, Plus, Pencil, Trash2, Search, X, Check } from 'lucide-react';
import departmentService from '../services/departmentService';
import toast from 'react-hot-toast';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await departmentService.getDepartments();
            // Backend returns { departments: [...] }
            setDepartments(data.departments);
        } catch (error) {
            console.error('Error fetching departments:', error);
            toast.error('Error cargando departamentos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingDept) {
                await departmentService.updateDepartment(editingDept.id, formData);
                toast.success('Departamento actualizado exitosamente');
            } else {
                await departmentService.createDepartment(formData);
                toast.success('Departamento creado exitosamente');
            }

            setShowModal(false);
            resetForm();
            fetchDepartments();
        } catch (error) {
            const message = error.response?.data?.error || 'Error al guardar departamento';
            toast.error(message);
        }
    };

    const handleDelete = async (dept) => {
        if (!window.confirm(`¿Estás seguro de desactivar el departamento "${dept.name}"?`)) {
            return;
        }

        try {
            await departmentService.deleteDepartment(dept.id);
            toast.success('Departamento desactivado correcamente');
            fetchDepartments();
        } catch (error) {
            toast.error('Error al desactivar el departamento');
        }
    };

    const handleEdit = (dept) => {
        setEditingDept(dept);
        setFormData({
            name: dept.name,
            description: dept.description || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingDept(null);
        setFormData({ name: '', description: '' });
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <Header title="Departamentos" breadcrumbs={['Inicio', 'Departamentos']} />

            <main className="flex-1 overflow-y-auto p-6">
                {/* Actions Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar departamentos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Departamento
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredDepartments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No hay departamentos</h3>
                        <p className="text-gray-500 mt-2">Crea el primero para comenzar a organizar tu empresa.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDepartments.map((dept) => (
                            <div key={dept.id} className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition ${!dept.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary-50 rounded-lg">
                                        <Building2 className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="p-1 text-gray-400 hover:text-primary-600 transition"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition"
                                            title="Desactivar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
                                    {dept.description || 'Sin descripción'}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-100">
                                    <span className={`px-2 py-1 rounded-full ${dept.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {dept.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <span>ID: {dept.id}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingDept ? 'Editar Departamento' : 'Nuevo Departamento'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Ej: Recursos Humanos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        rows="3"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Descripción opcional del departamento"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex justify-center items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default DepartmentsPage;
