import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import documentService from '../services/documentService';
import toast from 'react-hot-toast';

const FilePreviewModal = ({ document, onClose }) => {
    if (!document) return null;

    const previewUrl = documentService.getPreviewUrl(document.id);
    const isImage = document.mime_type.startsWith('image/');
    const isPdf = document.mime_type === 'application/pdf';
    const isText = document.mime_type === 'text/plain';

    const handleDownload = async () => {
        try {
            await documentService.downloadDocument(document.id, document.original_name);
            toast.success('Descarga iniciada');
        } catch (error) {
            toast.error('Error descargando documento');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{document.name}</h3>
                            <p className="text-xs text-gray-500">{new Date(document.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
                            title="Descargar"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition"
                            title="Cerrar"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-100 overflow-hidden relative flex items-center justify-center">
                    {isImage ? (
                        <img
                            src={previewUrl}
                            alt={document.name}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : isPdf ? (
                        <iframe
                            src={`${previewUrl}#toolbar=0`}
                            title={document.name}
                            className="w-full h-full border-none"
                        />
                    ) : isText ? (
                        <iframe
                            src={previewUrl}
                            title={document.name}
                            className="w-full h-full border-none bg-white p-8"
                        />
                    ) : (
                        <div className="text-center p-8">
                            <FileText className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                            <h4 className="text-xl font-medium text-gray-900 mb-2">Previsualización no disponible</h4>
                            <p className="text-gray-500 mb-6">Este tipo de archivo no se puede previsualizar directamente.</p>
                            <button
                                onClick={handleDownload}
                                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 mx-auto"
                            >
                                <Download className="w-5 h-5" />
                                Descargar para ver
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
