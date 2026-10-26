const multer = require("multer");

const uploadApplicationForm = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
    files: 1,
  },

  fileFilter: (req, file, cb) => {
    const isPdfName = /.pdf$/i.test(file.originalname || "");

    if (file.mimetype !== "application/pdf" || !isPdfName) {
      return cb(new Error("Please upload a PDF file only."));
    }

    cb(null, true);
  },
}).single("applicationFormPdf");

module.exports = { uploadApplicationForm };
