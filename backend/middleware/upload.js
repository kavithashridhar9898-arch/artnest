/**
 * File Upload Middleware
 * Multer configuration for handling file uploads
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('✅ Created directory:', dirPath);
    }
};

// Initialize upload directories
ensureDirectoryExists('./backend/uploads/images');
ensureDirectoryExists('./backend/uploads/videos');
ensureDirectoryExists('./backend/uploads/profiles');
ensureDirectoryExists('./backend/uploads/chat');

/**
 * Configure storage for different file types
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine destination based on file type
        if (file.mimetype.startsWith('image/')) {
            // Check if it's a profile picture
            if (req.body.type === 'profile') {
                cb(null, './backend/uploads/profiles');
            } else if (req.body.type === 'chat') {
                cb(null, './backend/uploads/chat');
            } else {
                cb(null, './backend/uploads/images');
            }
        } else if (file.mimetype.startsWith('video/')) {
            cb(null, './backend/uploads/videos');
        } else {
            cb(new Error('Invalid file type'), null);
        }
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, sanitizedName + '-' + uniqueSuffix + ext);
    }
});

/**
 * File filter to validate file types
 */
const fileFilter = (req, file, cb) => {
    // Allowed image types
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    // Allowed video types
    const videoTypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
    
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (mimetype.startsWith('image/')) {
        const isValidImage = imageTypes.test(extname.slice(1)) && imageTypes.test(mimetype.split('/')[1]);
        if (isValidImage) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!'), false);
        }
    } else if (mimetype.startsWith('video/')) {
        const isValidVideo = videoTypes.test(extname.slice(1));
        if (isValidVideo) {
            cb(null, true);
        } else {
            cb(new Error('Only video files (MP4, MOV, AVI, WMV, FLV, MKV) are allowed!'), false);
        }
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

/**
 * Multer upload configurations
 */

// General media upload (images and videos)
const uploadMedia = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB max
    },
    fileFilter: fileFilter
});

// Profile picture upload
const uploadProfile = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max for profile pictures
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile pictures!'), false);
        }
    }
});

// Cover photo upload
const uploadCover = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max for cover photos
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for cover photos!'), false);
        }
    }
});

// Chat attachment upload
const uploadChat = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB max for chat attachments
    },
    fileFilter: fileFilter
});

/**
 * Error handling middleware for multer
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size exceeded.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field in file upload.'
            });
        }
        return res.status(400).json({
            success: false,
            message: 'File upload error: ' + err.message
        });
    } else if (err) {
        // Other errors
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

module.exports = {
    uploadMedia,
    uploadProfile,
    uploadCover,
    uploadChat,
    handleUploadError
};
