const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const fileType = require('file-type');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'image/jpeg',
    'image/png'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 26214400; // 25MB

// Configure storage
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const user = req.user;
            const deptId = user.department_id || 'public';
            const uploadPath = path.join(process.cwd(), 'uploads', `dept_${deptId}`);

            // Create directory if it doesn't exist
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${uuidv4()}${ext}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Validate extension
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error(`Extensión no permitida: ${ext}`), false);
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
    }

    cb(null, true);
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1 // Only one file at a time
    }
});

/**
 * Middleware to validate file magic bytes
 * Ensures file content matches declared MIME type
 */
const validateFileMagicBytes = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const fileTypeResult = await fileType.fromFile(req.file.path);

        if (!fileTypeResult || !ALLOWED_MIME_TYPES.includes(fileTypeResult.mime)) {
            // Delete suspicious file
            await fs.unlink(req.file.path);
            return res.status(400).json({
                error: 'Archivo corrupto o tipo no válido'
            });
        }

        next();
    } catch (error) {
        console.error('Error validando archivo:', error);

        // Try to delete file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error eliminando archivo:', unlinkError);
            }
        }

        return res.status(500).json({ error: 'Error validando archivo' });
    }
};

/**
 * Error handler for multer
 */
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: `Archivo demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Solo se permite subir un archivo a la vez'
            });
        }
        return res.status(400).json({ error: err.message });
    }

    if (err) {
        return res.status(400).json({ error: err.message });
    }

    next();
};

module.exports = {
    upload,
    validateFileMagicBytes,
    handleMulterError
};
