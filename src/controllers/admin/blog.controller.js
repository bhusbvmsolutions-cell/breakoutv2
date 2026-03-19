const db = require("../../../models");
const slugify = require("slugify");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

const BlogController = {
  // Main dashboard - Grid View
  bloglist: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const status = req.query.status || "";
      const sort = req.query.sort || "latest";

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } },
        ];
      }
      if (status) {
        whereClause.status = status;
      }

      let order = [["createdAt", "DESC"]];
      if (sort === "oldest") {
        order = [["createdAt", "ASC"]];
      }

      const { count, rows: blogs } = await db.Blog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.BlogBlock,
            as: "blocks",
            required: false,
            attributes: ["id", "type"],
          },
        ],
        order,
        limit,
        offset,
        distinct: true,
      });

      const totalBlogs = await db.Blog.count();
      const activeBlogs = await db.Blog.count({
        where: { status: "published" },
      });
      const draftBlogs = await db.Blog.count({ where: { status: "draft" } });

      const stats = {
        totalBlogs,
        activeBlogs,
        draftBlogs,
      };

      res.render("admin/blogs/index", {
        title: "Blog Management",
        stats,
        blogs,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
        search,
        status,
        sort,
        query: req.query,
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to load blogs");
      res.redirect("/admin/dashboard");
    }
  },

  // Show create form
  createForm: async (req, res) => {
    try {
      const oldInput = req.flash("oldInput")[0] || {};
      const errors = req.flash("errors")[0] || {};

      res.render("admin/blogs/create", {
        title: "Create New Blog",
        blog: oldInput,
        errors: errors,
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to load create form");
      res.redirect("/admin/blogs");
    }
  },

  // Store new blog
  store: async (req, res) => {
    try {
      console.log("=== BLOG CREATION START ===");

      const {
        title,
        excerpt,
        author,
        readTime,
        status,
        tags,
        locations,
        looking_for,
      } = req.body;

      let jsontags,
        jsonlocations,
        jsonlooking_for = "";
      if (!tags) {
        jsontags = null;
      } else {
        jsontags = [
          ...new Set(
            tags
              .split(",")
              .map((item) => item.trim().toLowerCase()) // convert to lowercase
              .filter(Boolean)
          ),
        ];
      }
      if (!locations) {
        jsonlocations = null;
      } else {
        jsonlocations = [
          ...new Set(
            locations
              .split(",")
              .map((item) => item.trim().toLowerCase()) // convert to lowercase
              .filter(Boolean)
          ),
        ];
      }
      if (!looking_for) {
        jsonlooking_for = null;
      } else {
        jsonlooking_for = [
          ...new Set(
            looking_for
              .split(",")
              .map((item) => item.trim().toLowerCase()) // convert to lowercase
              .filter(Boolean)
          ),
        ];
      }

      if (!title) {
        throw new Error("Title is required");
      }

      let slug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });

      const existingBlog = await db.Blog.findOne({ where: { slug } });
      if (existingBlog) {
        slug = `${slug}-${Date.now()}`;
      }

      let heroImage = null;
      if (req.file) {
        heroImage = `/uploads/blogs/${req.file.filename}`;
      }

      const publishedAt = status === "published" ? new Date() : null;

      const blog = await db.Blog.create({
        title,
        slug,
        excerpt,
        heroImage,
        author,
        tags: jsontags,
        locations: jsonlocations,
        looking_for: jsonlooking_for,
        readTime: parseInt(readTime) || null,
        status,
        publishedAt,
      });

      // Handle blocks - new format with blocks array
      if (req.body.blocks && Array.isArray(req.body.blocks)) {
        for (let i = 0; i < req.body.blocks.length; i++) {
          const blockData = JSON.parse(req.body.blocks[i]);

          // Create main block
          const block = await db.BlogBlock.create({
            blogId: blog.id,
            type: blockData.type,
            title: blockData.title || null,
            subtitle: blockData.subtitle || null,
            content: blockData.content || null,
            settings: blockData.settings || {},
            order: blockData.order || i,
          });

          // Handle nested items based on block type
          if (blockData.type === "cards" && blockData.cards) {
            for (let j = 0; j < blockData.cards.length; j++) {
              const card = blockData.cards[j];
              await db.BlogBlockItem.create({
                blockId: block.id,
                title: card.title,
                description: card.description,
                image: card.image,
                link: card.buttonLink,
                extraData: { buttonText: card.buttonText },
                sortOrder: j,
              });
            }
          }

          if (blockData.type === "faq" && blockData.items) {
            for (let j = 0; j < blockData.items.length; j++) {
              const item = blockData.items[j];
              await db.BlogBlockItem.create({
                blockId: block.id,
                title: item.question,
                description: item.answer,
                sortOrder: j,
              });
            }
          }

          if (blockData.type === "locations" && blockData.locations) {
            for (let j = 0; j < blockData.locations.length; j++) {
              const location = blockData.locations[j];
              await db.BlogBlockItem.create({
                blockId: block.id,
                title: location.name,
                description: location.address,
                extraData: {
                  phone: location.phone,
                  hours: location.hours,
                  map: location.map,
                },
                sortOrder: j,
              });
            }
          }

          if (blockData.type === "gallery" && blockData.images) {
            for (let j = 0; j < blockData.images.length; j++) {
              await db.BlogBlockItem.create({
                blockId: block.id,
                image: blockData.images[j],
                sortOrder: j,
              });
            }
          }
        }
      }
      // Handle old format for backward compatibility
      else if (req.body.content && Array.isArray(req.body.content)) {
        for (let i = 0; i < req.body.content.length; i++) {
          const block = req.body.content[i];
          if (block.type && block.content) {
            await db.BlogBlock.create({
              blogId: blog.id,
              type: block.type,
              content: block.content,
              order: i,
            });
          }
        }
      }

      console.log("Blog created successfully:", blog.id);
      req.flash("success", "Blog created successfully");
      res.redirect(`/admin/blogs/${blog.id}`);
    } catch (error) {
      console.error("=== BLOG CREATION ERROR ===");
      console.error(error);

      req.flash("oldInput", req.body);
      req.flash("error", "Failed to create blog: " + error.message);

      if (error.errors) {
        const validationErrors = {};
        error.errors.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        req.flash("errors", validationErrors);
      }

      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }

      res.redirect("/admin/blogs/create");
    }
  },

  // Show single blog
  show: async (req, res) => {
    try {
      const blog = await db.Blog.findByPk(req.params.id, {
        include: [
          {
            model: db.BlogBlock,
            as: "blocks",
            order: [["order", "ASC"]],
            include: [
              {
                model: db.BlogBlockItem,
                as: "items",
                order: [["sortOrder", "ASC"]],
              },
            ],
          },
        ],
      });

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      res.render("admin/blogs/show", {
        title: blog.title,
        blog,
        baseUrl: `${req.protocol}://${req.get("host")}`,
        host: req.get("host"),
      });
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to load blog");
      res.redirect("/admin/blogs");
    }
  },

  // Show edit form
  editForm: async (req, res) => {
    try {
      const blog = await db.Blog.findByPk(req.params.id, {
        include: [
          {
            model: db.BlogBlock,
            as: "blocks",
            order: [["order", "ASC"]],
            include: [
              {
                model: db.BlogBlockItem,
                as: "items",
                order: [["sortOrder", "ASC"]],
              },
            ],
          },
        ],
      });

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      const errors = req.flash("errors")[0] || {};

      res.render("admin/blogs/edit", {
        title: `Edit: ${blog.title}`,
        blog,
        errors,
        baseUrl: `${req.protocol}://${req.get("host")}`,
      });
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to load edit form");
      res.redirect("/admin/blogs");
    }
  },

  // Update blog
  update: async (req, res) => {
    try {
      const blog = await db.Blog.findByPk(req.params.id);

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      const {
        title,
        excerpt,
        author,
        readTime,
        status,
        tags,
        locations,
        looking_for,
      } = req.body;

      let slug = blog.slug;
      if (title !== blog.title) {
        slug = slugify(title, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g,
        });
        const existingBlog = await db.Blog.findOne({
          where: {
            slug,
            id: { [Op.ne]: blog.id },
          },
        });

        if (existingBlog) {
          slug = `${slug}-${Date.now()}`;
        }
      }
      let jsontags,
          jsonlocations,
          jsonlooking_for = "";
        if (!tags) {
          jsontags = null;
        } else {
          jsontags = [
            ...new Set(
              tags
                .split(",")
                .map((item) => item.trim().toLowerCase()) // convert to lowercase
                .filter(Boolean)
            ),
          ];
        }
        if (!locations) {
          jsonlocations = null;
        } else {
          jsonlocations = [
            ...new Set(
              locations
                .split(",")
                .map((item) => item.trim().toLowerCase()) // convert to lowercase
                .filter(Boolean)
            ),
          ];
        }
        if (!looking_for) {
          jsonlooking_for = null;
        } else {
          jsonlooking_for = [
            ...new Set(
              looking_for
                .split(",")
                .map((item) => item.trim().toLowerCase()) // convert to lowercase
                .filter(Boolean)
            ),
          ];
        }

      let heroImage = blog.heroImage;
      if (req.file) {
        heroImage = `/uploads/blogs/${req.file.filename}`;

        if (blog.heroImage) {
          const oldImagePath = path.join(
            __dirname,
            "../../../public",
            blog.heroImage
          );
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }
      }

      let publishedAt = blog.publishedAt;
      if (status === "published" && blog.status !== "published") {
        publishedAt = new Date();
      }

      await blog.update({
        title,
        slug,
        excerpt,
        heroImage,
        author,
        tags: jsontags,
        locations: jsonlocations,
        looking_for: jsonlooking_for,
        readTime: parseInt(readTime) || null,
        status,
        publishedAt,
      });

      // Delete existing blocks
      await db.BlogBlock.destroy({ where: { blogId: blog.id } });

      // Create new blocks
      if (req.body.blocks && Array.isArray(req.body.blocks)) {
        for (let i = 0; i < req.body.blocks.length; i++) {
          const blockData = JSON.parse(req.body.blocks[i]);

          const block = await db.BlogBlock.create({
            blogId: blog.id,
            type: blockData.type,
            title: blockData.title || null,
            subtitle: blockData.subtitle || null,
            content: blockData.content || null,
            settings: blockData.settings || {},
            order: blockData.order || i,
          });

          // Handle nested items
          if (blockData.type === "cards" && blockData.cards) {
            for (let j = 0; j < blockData.cards.length; j++) {
              const card = blockData.cards[j];
              await db.BlogBlockItem.create({
                blockId: block.id,
                title: card.title,
                description: card.description,
                image: card.image,
                link: card.buttonLink,
                extraData: { buttonText: card.buttonText },
                sortOrder: j,
              });
            }
          }

          if (blockData.type === "faq" && blockData.items) {
            for (let j = 0; j < blockData.items.length; j++) {
              const item = blockData.items[j];
              await db.BlogBlockItem.create({
                blockId: block.id,
                title: item.question,
                description: item.answer,
                sortOrder: j,
              });
            }
          }

          if (blockData.type === "locations" && blockData.locations) {
            for (let j = 0; j < blockData.locations.length; j++) {
              const location = blockData.locations[j];
              await db.BlogBlockItem.create({
                blockId: block.id,
                title: location.name,
                description: location.address,
                extraData: {
                  phone: location.phone,
                  hours: location.hours,
                  map: location.map,
                },
                sortOrder: j,
              });
            }
          }

          if (blockData.type === "gallery" && blockData.images) {
            for (let j = 0; j < blockData.images.length; j++) {
              await db.BlogBlockItem.create({
                blockId: block.id,
                image: blockData.images[j],
                sortOrder: j,
              });
            }
          }
        }
      }

      req.flash("success", "Blog updated successfully");
      res.redirect(`/admin/blogs/${blog.id}`);
    } catch (error) {
      console.error("Error updating blog:", error);

      req.flash("error", "Failed to update blog: " + error.message);

      if (error.errors) {
        const validationErrors = {};
        error.errors.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        req.flash("errors", validationErrors);
      }

      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting file:", unlinkError);
        }
      }

      res.redirect(`/admin/blogs/${req.params.id}/edit`);
    }
  },

  // Delete blog
  delete: async (req, res) => {
    try {
      const blog = await db.Blog.findByPk(req.params.id);

      if (!blog) {
        req.flash("error", "Blog not found");
        return res.redirect("/admin/blogs");
      }

      if (blog.heroImage) {
        const imagePath = path.join(
          __dirname,
          "../../../public",
          blog.heroImage
        );
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (err) {
          console.error("Error deleting image:", err);
        }
      }

      await blog.destroy();

      req.flash("success", "Blog deleted successfully");
      res.redirect("/admin/blogs");
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to delete blog");
      res.redirect("/admin/blogs");
    }
  },

  // Bulk delete
  bulkDelete: async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        req.flash("error", "No blog IDs provided");
        return res.redirect("/admin/blogs");
      }

      const blogs = await db.Blog.findAll({ where: { id: ids } });

      blogs.forEach((blog) => {
        if (blog.heroImage) {
          const imagePath = path.join(
            __dirname,
            "../../../public",
            blog.heroImage
          );
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          } catch (err) {
            console.error("Error deleting image:", err);
          }
        }
      });

      await db.Blog.destroy({ where: { id: ids } });

      req.flash("success", `${ids.length} blogs deleted successfully`);
      res.redirect("/admin/blogs");
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to delete blogs");
      res.redirect("/admin/blogs");
    }
  },

  // Toggle blog status
  toggleStatus: async (req, res) => {
    try {
      const blog = await db.Blog.findByPk(req.params.id);

      if (!blog) {
        req.flash("error", "Blog not found.");
        return res.redirect("/admin/blogs");
      }

      const newStatus = blog.status === "published" ? "draft" : "published";
      const publishedAt = newStatus === "published" ? new Date() : null;

      await blog.update({
        status: newStatus,
        publishedAt,
      });

      req.flash("success", `Blog status changed to ${newStatus}`);
      res.redirect(`/admin/blogs/${blog.id}`);
    } catch (error) {
      console.error("Error:", error);
      req.flash("error", "Failed to toggle status");
      res.redirect("/admin/blogs");
    }
  },
};

module.exports = BlogController;
