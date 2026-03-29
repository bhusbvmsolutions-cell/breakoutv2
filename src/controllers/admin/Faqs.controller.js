const db = require("../../../models");

const FaqsController = {
  // List FAQs for a specific page
  index: async (req, res) => {
    try {
      const pageid = req.params.pageid;

      if (!pageid) {
        req.flash("error", "No page found for FAQs");
        return res.redirect("/admin/dashboard");
      }

      const page = await db.Page.findOne({
        where: { id: pageid },
        include: [
          {
            model: db.Faq,
            as: "faqs",
            required: false,
          },
        ],
      });
      
      // Sort FAQs manually after fetching
      if (page && page.faqs) {
        page.faqs.sort((a, b) => a.sort_order - b.sort_order);
      }

      if (!page) {
        req.flash("error", "Page not found");
        return res.redirect("/admin/dashboard");
      }

      res.render("admin/faqs/index", {
        title: `FAQs - ${page.name}`,
        page: page,
        faqs: page.faqs || [],
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load FAQs");
      res.redirect("/admin/dashboard");
    }
  },

  // Create new FAQ
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { page_id, question, answer, isActive } = req.body;

      if (!question || !answer) {
        throw new Error("Question and answer are required");
      }

      // Get max sort_order for this page
      const maxSort = await db.Faq.max("sort_order", {
        where: { page_id },
        transaction,
      });
      const newSortOrder = (maxSort || 0) + 1;

      const faq = await db.Faq.create(
        {
          page_id,
          question,
          answer,
          sort_order: newSortOrder,
          isActive: isActive === "on",
        },
        { transaction }
      );

      await transaction.commit();
      res.json({ success: true, message: "FAQ added successfully", faq });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to add FAQ",
      });
    }
  },

  // Update FAQ
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const faqId = req.params.id;
      const { question, answer, isActive } = req.body;

      const faq = await db.Faq.findByPk(faqId, { transaction });
      if (!faq) throw new Error("FAQ not found");

      await faq.update(
        {
          question,
          answer,
          isActive: isActive === "on",
        },
        { transaction }
      );

      await transaction.commit();
      res.json({ success: true, message: "FAQ updated successfully", faq });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update FAQ",
      });
    }
  },

  // Delete FAQ
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const faqId = req.params.id;
      const faq = await db.Faq.findByPk(faqId, { transaction });
      if (!faq) throw new Error("FAQ not found");

      await faq.destroy({ transaction });
      await transaction.commit();
      res.json({ success: true, message: "FAQ deleted successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete FAQ",
      });
    }
  },

  // Toggle FAQ status
  toggleStatus: async (req, res) => {
    try {
      const faqId = req.params.id;
      const faq = await db.Faq.findByPk(faqId);
      if (!faq) throw new Error("FAQ not found");

      faq.isActive = !faq.isActive;
      await faq.save();

      res.json({
        success: true,
        isActive: faq.isActive,
        message: `FAQ ${
          faq.isActive ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to toggle status",
      });
    }
  },

  // Reorder FAQs
  reorder: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { faqs, page_id } = req.body;

      if (!faqs || !Array.isArray(faqs)) {
        throw new Error("Invalid data");
      }

      if (!page_id) {
        throw new Error("Page ID is required");
      }

      // Verify all FAQs belong to this page
      const faqIds = faqs.map((id) => parseInt(id));
      const count = await db.Faq.count({
        where: {
          id: { [db.Sequelize.Op.in]: faqIds },
          page_id: page_id,
        },
        transaction,
      });

      if (count !== faqIds.length) {
        throw new Error("Some FAQs do not belong to this page");
      }

      // Update sort_order for each FAQ
      for (let i = 0; i < faqs.length; i++) {
        await db.Faq.update(
          { sort_order: i },
          { where: { id: faqs[i] }, transaction }
        );
      }

      await transaction.commit();
      res.json({ success: true, message: "FAQs reordered successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reorder FAQs",
      });
    }
  },



  slugindex: async (req, res) => {
    try {
      const pageSlug = req.params.slug;

      if (!pageSlug) {
        req.flash("error", "No page found for FAQs");
        return res.redirect("/admin/dashboard");
      }

      const page = await db.Page.findOne({
        where: { slug: pageSlug },
        include: [
          {
            model: db.Faq,
            as: "faqs",
            required: false,
          },
        ],
      });
      
      // Sort FAQs manually after fetching
      if (page && page.faqs) {
        page.faqs.sort((a, b) => a.sort_order - b.sort_order);
      }

      if (!page) {
        req.flash("error", "Page not found");
        return res.redirect("/admin/dashboard");
      }

      res.render("admin/faqs/index", {
        title: `FAQs - ${page.name}`,
        page: page,
        faqs: page.faqs || [],
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load FAQs");
      res.redirect("/admin/dashboard");
    }
  },
};

module.exports = FaqsController;
