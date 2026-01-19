import React, { useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { Search, Filter, Calendar, Folder, FileText, ChevronRight, User, Eye } from 'lucide-react';
import FilePreviewModal from '../components/FilePreviewModal';
import searchService from '../services/searchService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SearchPage = () => {
    const { user, isAdmin } = useAuth();
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        type: 'all',
        startDate: '',
        endDate: '',
        departmentId: ''
    });
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [previewDocument, setPreviewDocument] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) {
            toast.error('Por favor ingresa un término de búsqueda');
            return;
        }

        setLoading(true);
        try {
            const data = await searchService.search({
                q: query,
                ...filters
            });
            setResults(data.results);
            setHasSearched(true);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error al realizar la búsqueda');
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <Layout>
            <Header title="Búsqueda Avanzada" breadcrumbs={['Inicio', 'Búsqueda']} />

            <main className="flex-1 overflow-y-auto p-6">
                {/* Search Bar & Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <form onSubmit={handleSearch}>
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Buscar documentos, carpetas..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value="all">Todo</option>
                                    <option value="document">Documentos</option>
                                    <option value="folder">Carpetas</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>

                            {isAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                    <select
                                        value={filters.departmentId}
                                        onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    >
                                        <option value="">Todos</option>
                                        <option value="1">Recursos Humanos</option>
                                        <option value="2">Ventas</option>
                                        <option value="3">Contabilidad</option>
                                        {/* Should ideally fetch departments from API */}
                                    </select>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Results */}
                {hasSearched && (
                    <div className="space-y-6">
                        {/* Folders Results */}
                        {(filters.type === 'all' || filters.type === 'folder') && results?.folders?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-gray-500" />
                                    Carpetas Encontradas ({results.folders.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {results.folders.map(folder => (
                                        <div key={folder.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Folder className="w-8 h-8 text-primary-500" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{folder.name}</h4>
                                                    <p className="text-xs text-gray-500">{folder.department?.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-2 flex justify-between">
                                                <span>Creado por {folder.creator?.first_name}</span>
                                                <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents Results */}
                        {(filters.type === 'all' || filters.type === 'document') && results?.documents?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    Documentos Encontrados ({results.documents.length})
                                </h3>
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carpeta</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tamaño</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subido por</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {results.documents.map((doc) => (
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
                                                        {doc.folder?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatFileSize(doc.file_size)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {doc.uploader?.first_name} {doc.uploader?.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(doc.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => setPreviewDocument(doc)}
                                                            className="text-gray-600 hover:text-primary-600"
                                                            title="Ver"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {results?.folders?.length === 0 && results?.documents?.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3>
                                <p className="text-gray-500">Intenta ajustar los filtros o tu término de búsqueda.</p>
                            </div>
                        )}
                    </div>
                )}

                {!hasSearched && (
                    <div className="text-center py-20">
                        <Filter className="w-16 h-16 text-primary-100 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">Búsqueda Avanzada</h2>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">
                            Utiliza los filtros superiores para encontrar documentos específicos por fecha, tipo o departamento.
                        </p>
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

export default SearchPage;
