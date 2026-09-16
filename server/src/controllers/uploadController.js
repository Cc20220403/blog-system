const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保 uploads 目录存在
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 文件过滤：只允许图片
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 jpg/png/gif/webp 格式的图片'), false);
  }
};

// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

const uploadController = {
  /**
   * 上传图片
   * POST /api/upload
   */
  async uploadImage(req, res, next) {
    try {
      // 使用 multer 处理单文件（字段名 'image'）
      upload.single('image')(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(400).json({ message: '文件大小不能超过 2MB' });
            }
            return res.status(400).json({ message: err.message });
          }
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: '请选择要上传的图片' });
        }

        // 返回可访问的 URL
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
          success: true,
          message: '图片上传成功',
          data: { url: fileUrl },
        });
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = uploadController;
