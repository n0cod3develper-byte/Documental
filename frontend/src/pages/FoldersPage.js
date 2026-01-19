import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { FolderPlus, Folder, ChevronRight, File, ArrowLeft, Download, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import folderService from '../services/folderService';
import departmentService from '../services/departmentService';
import documentService from '../services/documentService';
import toast from 'react-hot-toast';
import FilePreviewModal from '../components/FilePreviewModal';

const FoldersPage = () => {
    const { user, isAdmin, isManager } = useAuth();

    // Data states
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Navigation states
    const [currentFolder, setCurrentFolder] = useState(null); // null = root
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Inicio' }]);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);

    // Form states
    const [newFolder, setNewFolder] = useState({
        name: '',
        department_id: user?.department_id || '',
        is_public: false,
        shared_departments: []
    });

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [currentFolder]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const promises = [
                folderService.getFolders({ parent_folder_id: currentFolder?.id || null }),
                departmentService.getDepartments()
            ];

            // If we are inside a folder, also fetch documents
            if (currentFolder) {
                promises.push(documentService.getDocuments({ folder_id: currentFolder.id }));
            }

            const [foldersData, departmentsData, documentsData] = await Promise.all(promises);

            setFolders(foldersData.folders || []);
            setDepartments(departmentsData.departments || []);
            setDocuments(documentsData?.documents || []);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleNavigate = (folder) => {
        setCurrentFolder(folder);
        setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
    };

    const handleBreadcrumbClick = (crumb, index) => {
        // If clicking the last one, do nothing
        if (index === breadcrumbs.length - 1) return;

        // Set current folder to the clicked crumb (null if root)
        if (crumb.id === null) {
            setCurrentFolder(null);
        } else {
            setCurrentFolder(crumb.folderObj || null);
        }

        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newFolder,
                parent_folder_id: currentFolder?.id || null
            };
            await folderService.createFolder(payload);
            toast.success('Carpeta creada exitosamente');
            setShowCreateModal(false);
            setNewFolder({
                name: '',
                department_id: user?.department_id || '',
                is_public: false,
                shared_departments: []
            });
            fetchData();
        } catch (error) {
            const message = error.response?.data?.error || 'Error creando carpeta';
            toast.error(message);
        }
    };

    const handleDeleteFolder = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar la carpeta "${name}"?`)) {
            try {
                await folderService.deleteFolder(id);
                toast.success('Carpeta eliminada');
                fetchData();
            } catch (error) {
                const message = error.response?.data?.error || 'Error eliminando carpeta';
                toast.error(message);
            }
        }
    };

    const handleDownload = async (doc) => {
        try {
            await documentService.downloadDocument(doc.id, doc.original_name);
            toast.success('Descarga iniciada');
        } catch (error) {
            console.error('Error downloading:', error);
            toast.error('Error al descargar el archivo');
        }
    };

    const handlePreview = (doc) => {
        setPreviewDocument(doc);
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <ImageIcon className="w-6 h-6 text-blue-500" />;
        if (ext === 'pdf') return <FileText className="w-6 h-6 text-red-500" />;
        return <File className="w-6 h-6 text-gray-500" />;
    };

    const canCreateFolder = isAdmin || isManager;

    return (
        <Layout>
            <Header title="Carpetas" breadcrumbs={['Inicio', 'Carpetas']} />

            <main className="flex-1 overflow-y-auto p-6">

                {/* Navigation Bar */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2 text-gray-600 overflow-x-auto">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={index} className="flex items-center whitespace-nowrap">
                                {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                                <button
                                    onClick={() => handleBreadcrumbClick(crumb, index)}
                                    className={`hover:text-primary-600 transition ${index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900 pointer-events-none' : ''
                                        }`}
                                >
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>

                    {canCreateFolder && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex-shrink-0 ml-4"
                        >
                            <FolderPlus className="w-5 h-5" />
                            <span className="hidden sm:inline">Nueva Carpeta</span>
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Subfolders Section */}
                        {folders.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                    <Folder className="w-5 h-5 mr-2" />
                                    Carpetas
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {folders.map((folder) => (
                                        <div
                                            key={folder.id}
                                            onClick={() => handleNavigate({ ...folder, folderObj: folder })}
                                            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 cursor-pointer group border border-transparent hover:border-primary-100"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <Folder className="w-12 h-12 text-primary-600" />
                                                {canCreateFolder && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteFolder(folder.id, folder.name);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 transition text-sm px-2 py-1 rounded hover:bg-red-50"
                                                    >
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>

                                            <h3 className="font-semibold text-gray-900 mb-2 truncate" title={folder.name}>
                                                {folder.name}
                                            </h3>

                                            <div className="flex items-center flex-wrap gap-2 text-xs">
                                                <span className="text-gray-500">{folder.department?.name}</span>
                                                {folder.is_public && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                                        Público
                                                    </span>
                                                )}
                                                {folder.shared_with_departments && folder.shared_with_departments.length > 0 && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded" title={`Compartido con: ${folder.shared_with_departments.map(d => d.name).join(', ')}`}>
                                                        Compartido
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents Section */}
                        {currentFolder && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
                                    <File className="w-5 h-5 mr-2" />
                                    Documentos
                                </h3>

                                {documents.length === 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500">Esta carpeta está vacía de documentos.</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="min-w-full divide-y divide-gray-200">
                                            {documents.map((doc) => (
                                                <div key={doc.id} className="p-4 hover:bg-gray-50 flex items-center justify-between transition group">
                                                    <div className="flex items-center overflow-hidden">
                                                        <div className="flex-shrink-0 mr-4">
                                                            {getFileIcon(doc.original_name)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {doc.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(doc.size / 1024).toFixed(2)} KB • {new Date(doc.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                                                        <button
                                                            onClick={() => handlePreview(doc)}
                                                            className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-primary-50"
                                                            title="Vista previa"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(doc)}
                                                            className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50"
                                                            title="Descargar"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State for Root */}
                        {!currentFolder && folders.length === 0 && (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay carpetas</h3>
                                <p className="text-gray-600">
                                    {canCreateFolder ? 'Crea tu primera carpeta para organizar documentos' : 'No tienes acceso a ninguna carpeta'}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {/* Create Folder Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                {currentFolder ? `Nueva Subcarpeta en "${currentFolder.name}"` : 'Nueva Carpeta Raíz'}
                            </h2>

                            <form onSubmit={handleCreateFolder} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de la Carpeta
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newFolder.name}
                                        onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Ej: Proyectos 2026"
                                    />
                                </div>

                                {isAdmin && !currentFolder && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Departamento
                                        </label>
                                        <select
                                            required
                                            value={newFolder.department_id}
                                            onChange={(e) => setNewFolder({ ...newFolder, department_id: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="">Seleccionar departamento</option>
                                            {departments.map((dept) => (
                                                <option key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={newFolder.is_public}
                                        onChange={(e) => setNewFolder({ ...newFolder, is_public: e.target.checked })}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                                        Carpeta pública
                                    </label>
                                </div>

                                {!newFolder.is_public && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Compartir con otros departamentos
                                        </label>
                                        <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                            {departments
                                                .filter(d => d.id !== parseInt(newFolder.department_id || user.department_id))
                                                .map(dept => (
                                                    <div key={dept.id} className="flex items-center mb-2 last:mb-0">
                                                        <input
                                                            type="checkbox"
                                                            id={`share_dept_${dept.id}`}
                                                            checked={newFolder.shared_departments?.includes(dept.id)}
                                                            onChange={(e) => {
                                                                const currentShared = newFolder.shared_departments || [];
                                                                let newShared;
                                                                if (e.target.checked) {
                                                                    newShared = [...currentShared, dept.id];
                                                                } else {
                                                                    newShared = currentShared.filter(id => id !== dept.id);
                                                                }
                                                                setNewFolder({ ...newFolder, shared_departments: newShared });
                                                            }}
                                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                                        />
                                                        <label htmlFor={`share_dept_${dept.id}`} className="ml-2 text-sm text-gray-700">
                                                            {dept.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            {departments.filter(d => d.id !== parseInt(newFolder.department_id || user.department_id)).length === 0 && (
                                                <p className="text-xs text-gray-500 italic">No hay otros departamentos disponibles para compartir.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                                    >
                                        Crear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Preview Modal */}
                {previewDocument && (
                    <FilePreviewModal
                        document={previewDocument}
                        onClose={() => setPreviewDocument(null)}
                    />
                )}
            </main>
        </Layout>
    );
};

export default FoldersPage;
