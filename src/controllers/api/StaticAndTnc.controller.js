const db = require("../../../models");

// ✅ Static Pages Config
const STATIC_PAGES = [
  { slug: "career", label: "Career" },
  { slug: "contact-us", label: "Contact Us" },
  { slug: "refund-policy", label: "Refund Policy" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-services", label: "Terms of Service" },
];

// ✅ TNC References
const REFERENCES = ["escaperooms", "birthdays", "corporate", "virtualrooms"];

const StaticAndTncController = {
  // =========================================================
  // ✅ STATIC PAGE APIs
  // =========================================================

  // 🔹 Get Static Page by Slug
  getStaticPage: async (req, res) => {
    try {
      const { slug } = req.params;

      // Ensure page exists
      const pageInfo = STATIC_PAGES.find((p) => p.slug === slug);
      let page = await db.StaticPage.findOne({ where: { slug } });

      if (!page && pageInfo) {
        page = await db.StaticPage.create({
          slug,
          heading: pageInfo.label,
          content: "",
          isActive: true,
        });
      }

      if (!page || !page.isActive) {
        return res.status(404).json({
          success: false,
          message: "Page not found",
        });
      }

      const formatted = {
        heading: page.heading,
        content: page.content,
        slug: page.slug,
      };

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching static page:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch static page",
      });
    }
  },

  // 🔹 Get All Static Pages
  getAllStaticPages: async (req, res) => {
    try {
      // Ensure all predefined pages exist
      for (const pageInfo of STATIC_PAGES) {
        await db.StaticPage.findOrCreate({
          where: { slug: pageInfo.slug },
          defaults: {
            heading: pageInfo.label,
            content: "",
            isActive: true,
          },
        });
      }

      const pages = await db.StaticPage.findAll({
        where: { isActive: true },
        attributes: ["heading", "slug"],
        order: [["slug", "ASC"]],
      });

      res.json({
        success: true,
        data: pages,
      });
    } catch (error) {
      console.error("Error fetching static pages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pages",
      });
    }
  },

  // =========================================================
  // ✅ TNC PAGE APIs
  // =========================================================

  // 🔹 Get T&C Page by Reference
  getTncPage: async (req, res) => {
    try {
      const { reference } = req.params;

      if (!REFERENCES.includes(reference)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reference",
        });
      }

      let page = await db.TncPage.findOne({
        where: { reference },
      });

      // Auto-create if missing
      if (!page) {
        page = await db.TncPage.create({
          reference,
          title:
            reference.charAt(0).toUpperCase() + reference.slice(1),
          content: "",
          isActive: true,
        });
      }

      if (!page.isActive) {
        return res.status(404).json({
          success: false,
          message: "Page not active",
        });
      }

      const formatted = {
        title: page.title,
        content: page.content,
        reference: page.reference,
      };

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching T&C page:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch T&C page",
      });
    }
  },

  // 🔹 Get All T&C Pages
  getAllTncPages: async (req, res) => {
    try {
      // Ensure all references exist
      for (const ref of REFERENCES) {
        await db.TncPage.findOrCreate({
          where: { reference: ref },
          defaults: {
            title: ref.charAt(0).toUpperCase() + ref.slice(1),
            content: "",
            isActive: true,
          },
        });
      }

      const pages = await db.TncPage.findAll({
        where: { isActive: true },
        attributes: ["title", "reference"],
        order: [["reference", "ASC"]],
      });

      res.json({
        success: true,
        data: pages,
      });
    } catch (error) {
      console.error("Error fetching T&C pages:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch T&C pages",
      });
    }
  },
};

module.exports = StaticAndTncController;