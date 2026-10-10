const mongoose = require("mongoose");
const News = require("../models/News");

const ALLOWED_CATEGORIES = ["Visa Updates", "Travel Updates"];

// Convert date into YYYY-MM-DD for HTML date inputs
function formatDateForInput(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, "0"),
    String(parsedDate.getDate()).padStart(2, "0"),
  ].join("-");
}

// Prepare form values
function getNewsFormData(body = {}) {
  return {
    title: String(body.title || "").trim(),
    slug: String(body.slug || "")
      .trim()
      .toLowerCase(),
    category: String(body.category || "").trim(),
    image: String(body.image || "").trim(),
    excerpt: String(body.excerpt || "").trim(),
    content: String(body.content || "").trim(),
    date: String(body.date || "").trim(),
  };
}

// Validate form fields
function validateNews(data) {
  const errors = [];

  if (!data.title) {
    errors.push("Title is required.");
  }

  if (!data.slug) {
    errors.push("Slug is required.");
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    errors.push(
      "Slug must contain lowercase letters, numbers and hyphens only.",
    );
  }

  if (!ALLOWED_CATEGORIES.includes(data.category)) {
    errors.push("Please select a valid news category.");
  }

  if (!data.excerpt) {
    errors.push("Excerpt is required.");
  }

  if (data.date) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(data.date)) {
      errors.push("Please enter a valid date.");
    } else {
      const parsedDate = new Date(`${data.date}T00:00:00.000Z`);

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== data.date
      ) {
        errors.push("Please enter a valid date.");
      }
    }
  }

  if (data.image) {
    try {
      const imageUrl = new URL(data.image);

      if (!["http:", "https:"].includes(imageUrl.protocol)) {
        errors.push("Image URL must use HTTP or HTTPS.");
      }
    } catch {
      errors.push("Please enter a valid image URL.");
    }
  }

  return errors;
}

// Check whether slug is already used
async function slugAlreadyExists(slug, excludeId = null) {
  const query = { slug };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Boolean(await News.exists(query));
}

// Render form with validation errors
function renderNewsForm(res, view, data, errors, status = 400) {
  return res.status(status).render(view, {
    news: data,
    errors,
    categories: ALLOWED_CATEGORIES,
    dateValue: data.date || "",
  });
}

// =====================================================
// SHOW NEWS LIST
// GET /admin/news
// =====================================================

exports.showNews = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const filter = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { slug: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    if (ALLOWED_CATEGORIES.includes(category)) {
      filter.category = category;
    }

    const news = await News.find(filter).sort({ date: -1, _id: -1 }).lean();

    res.render("admin/news/index", {
      news,
      search,
      category,
      success: req.query.success || "",
      error: req.query.error || "",
    });
  } catch (error) {
    console.error("Admin news listing error:", error);
    next(error);
  }
};

// =====================================================
// SHOW ADD NEWS FORM
// GET /admin/news/new
// =====================================================

exports.showNewNewsForm = (req, res) => {
  res.render("admin/news/new", {
    news: {
      title: "",
      slug: "",
      category: "Visa Updates",
      image: "",
      excerpt: "",
      content: "",
      date: formatDateForInput(new Date()),
    },
    errors: [],
    categories: ALLOWED_CATEGORIES,
    dateValue: formatDateForInput(new Date()),
  });
};

// =====================================================
// CREATE NEWS
// POST /admin/news/new
// =====================================================

exports.createNews = async (req, res, next) => {
  try {
    const data = getNewsFormData(req.body);
    const errors = validateNews(data);

    if (errors.length) {
      return renderNewsForm(res, "admin/news/new", data, errors);
    }

    if (await slugAlreadyExists(data.slug)) {
      return renderNewsForm(
        res,
        "admin/news/new",
        data,
        ["This slug already exists. Please use a different slug."],
        409,
      );
    }

    const article = new News({
      title: data.title,
      slug: data.slug,
      category: data.category,
      image: data.image,
      excerpt: data.excerpt,
      content: data.content,
      date: data.date ? new Date(`${data.date}T00:00:00.000Z`) : new Date(),
    });

    await article.save();

    res.redirect("/admin/news?success=created");
  } catch (error) {
    if (error.code === 11000) {
      return renderNewsForm(
        res,
        "admin/news/new",
        getNewsFormData(req.body),
        ["This slug already exists. Please use a different slug."],
        409,
      );
    }

    console.error("Create news error:", error);
    next(error);
  }
};

// =====================================================
// SHOW EDIT NEWS FORM
// GET /admin/news//edit
// =====================================================

exports.showEditNewsForm = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).send("News article not found.");
    }

    const article = await News.findById(id).lean();

    if (!article) {
      return res.status(404).send("News article not found.");
    }

    res.render("admin/news/edit", {
      news: article,
      errors: [],
      categories: ALLOWED_CATEGORIES,
      dateValue: formatDateForInput(article.date),
    });
  } catch (error) {
    console.error("Edit news page error:", error);
    next(error);
  }
};

// =====================================================
// UPDATE NEWS
// POST /admin/news//edit
// =====================================================

exports.updateNews = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).send("News article not found.");
    }

    const article = await News.findById(id);

    if (!article) {
      return res.status(404).send("News article not found.");
    }

    const data = getNewsFormData(req.body);
    const errors = validateNews(data);

    if (errors.length) {
      return renderNewsForm(res, "admin/news/edit", data, errors);
    }

    if (await slugAlreadyExists(data.slug, id)) {
      return renderNewsForm(
        res,
        "admin/news/edit",
        data,
        ["This slug already belongs to another article."],
        409,
      );
    }

    article.title = data.title;
    article.slug = data.slug;
    article.category = data.category;
    article.image = data.image;
    article.excerpt = data.excerpt;
    article.content = data.content;

    if (data.date) {
      article.date = new Date(`${data.date}T00:00:00.000Z`);
    }

    await article.save();

    res.redirect("/admin/news?success=updated");
  } catch (error) {
    if (error.code === 11000) {
      return renderNewsForm(
        res,
        "admin/news/edit",
        getNewsFormData(req.body),
        ["This slug already exists. Please use a different slug."],
        409,
      );
    }

    console.error("Update news error:", error);
    next(error);
  }
};

// =====================================================
// DELETE NEWS
// POST /admin/news//delete
// =====================================================

exports.deleteNews = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.redirect("/admin/news?error=invalid");
    }

    const article = await News.findById(id);

    if (!article) {
      return res.redirect("/admin/news?error=notfound");
    }

    await News.findByIdAndDelete(id);

    res.redirect("/admin/news?success=deleted");
  } catch (error) {
    console.error("Delete news error:", error);
    next(error);
  }
};
