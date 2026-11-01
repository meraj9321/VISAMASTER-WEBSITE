const multer = require("multer");

const storage = multer.memoryStorage();

const uploadApplicationForm = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 50,
  },

  fileFilter: (req, file, cb) => {
    const allowedCategories = ["e-visa", "sticker-visa", "visa-on-arrival"];

    const match = file.fieldname.match(
      /^subcategoryPdf\[([a-z0-9-]+)\]\[([a-z0-9-]+)\]$/,
    );

    if (!match) {
      return cb(new Error(`Invalid PDF field name: ${file.fieldname}`));
    }

    const categorySlug = match[1];

    if (!allowedCategories.includes(categorySlug)) {
      return cb(new Error("Invalid visa category."));
    }

    const isPdf =
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return cb(new Error("Only PDF files are allowed."));
    }

    cb(null, true);
  },
}).any();

module.exports = {
  uploadApplicationForm,
};
