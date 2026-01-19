import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, Download, Trash2, Search, Eye } from 'lucide-react';
import FilePreviewModal from '../components/FilePreviewModal';
import documentService from '../services/documentService';
import folderService from '../services/folderService';
import toast from 'react-hot-toast';

const DocumentsPage = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadData, setUploadData] = useState({
        folder_id: '',
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [docsData, foldersData] = await Promise.all([
                documentService.getDocuments(),
                folderService.getFolders()
            ]);
            setDocuments(docsData.documents || []);
            setFolders(foldersData.folders || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error cargando datos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (25MB)
            if (file.size > 26214400) {
                toast.error('El archivo es demasiado grande. Máximo 25MB');
                return;
            }
            setSelectedFile(file);
            setUploadData({ ...uploadData, name: file.name });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            toast.error('Por favor selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder_id', uploadData.folder_id);
        formData.append('name', uploadData.name);
        if (uploadData.description) {
            formData.append('description', uploadData.description);
        }

        try {
            await documentService.uploadDocument(formData);
            toast.success('Documento subido exitosamente');
            setShowUploadModal(false);
            setSelectedFile(null);
            setUploadData({ folder_id: '', name: '', description: '' });
            fetchData();
        } catch (error) {
            const message = error.response?.data?.error || 'Error subiendo documento';
            toast.error(message);
        }
    };

    const handleDownload = async (doc) => {
        try {
            await documentService.downloadDocument(doc.id, doc.original_name);
            toast.success('Descarga iniciada');
        } catch (error) {
            toast.error('Error descargando documento');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`¿Estás seguro de eliminar "${name}"?`)) {
            try {
                await documentService.deleteDocument(id);
                toast.success('Documento eliminado');
                fetchData();
            } catch (error) {
                const message = error.response?.data?.error || 'Error eliminando documento';
                toast.error(message);
            }
        }
    };

    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Layout>
            <Header title="Documentos" breadcrumbs={['Inicio', 'Documentos']} />

            <main className="flex-1 overflow-y-auto p-6">
                {/* Action Bar */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar documentos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition whitespace-nowrap"
                    >
                        <Upload className="w-5 h-5" />
                        Subir Documento
                    </button>
                </div>

                {/* Documents Table */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredDocuments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No se encontraron documentos' : 'No hay documentos'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery ? 'Intenta con otra búsqueda' : 'Sube tu primer documento para comenzar'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Carpeta
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tamaño
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                                    <div className="text-sm text-gray-500">{doc.original_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doc.folder?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatFileSize(doc.file_size)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(doc.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setPreviewDocument(doc)}
                                                className="text-gray-600 hover:text-primary-600 mr-4"
                                                title="Ver"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDownload(doc)}
                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                                title="Descargar"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id, doc.name)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subir Documento</h2>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Carpeta de Destino
                                    </label>
                                    <select
                                        required
                                        value={uploadData.folder_id}
                                        onChange={(e) => setUploadData({ ...uploadData, folder_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="">Seleccionar carpeta</option>
                                        {folders.map(folder => (
                                            <option key={folder.id} value={folder.id}>
                                                {folder.name} ({folder.department?.name})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Archivo
                                    </label>
                                    <input
                                        type="file"
                                        required
                                        onChange={handleFileSelect}
                                        accept=".pdf,.docx,.xlsx,.pptx,.jpg,.jpeg,.png"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Formatos: PDF, DOCX, XLSX, PPTX, JPG, PNG (Máx. 25MB)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del Documento
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={uploadData.name}
                                        onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción (Opcional)
                                    </label>
                                    <textarea
                                        value={uploadData.description}
                                        onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setSelectedFile(null);
                                            setUploadData({ folder_id: '', name: '', description: '' });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                                    >
                                        Subir
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* Preview Modal */}
            {previewDocument && (
                <FilePreviewModal
                    document={previewDocument}
                    onClose={() => setPreviewDocument(null)}
                />
            )}
        </Layout>
    );
};

export default DocumentsPage;
