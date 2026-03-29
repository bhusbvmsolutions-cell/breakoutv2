const db = require("../../../models");

const GoogleReviewsController = {
  // List reviews for a specific page (by page ID)
  index: async (req, res) => {
    try {
      const pageid = req.params.pageid;

      if (!pageid) {
        req.flash("error", "No page found for reviews");
        return res.redirect("/admin/dashboard");
      }

      const page = await db.Page.findOne({
        where: { id: pageid },
        include: [
          {
            model: db.GoogleReview,
            as: "googleReviews",
            required: false,
          },
        ],
      });

      // Sort reviews manually after fetching
      if (page && page.googleReviews) {
        page.googleReviews.sort((a, b) => a.sort_order - b.sort_order);
      }

      if (!page) {
        req.flash("error", "Page not found");
        return res.redirect("/admin/dashboard");
      }

      res.render("admin/googlereviews/index", {
        title: `Google Reviews - ${page.name}`,
        page: page,
        reviews: page.googleReviews || [],
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load reviews");
      res.redirect("/admin/dashboard");
    }
  },

  // List reviews for a specific page (by page slug)
  slugindex: async (req, res) => {
    try {
      const pageSlug = req.params.slug;

      if (!pageSlug) {
        req.flash("error", "No page found for reviews");
        return res.redirect("/admin/dashboard");
      }

      const page = await db.Page.findOne({
        where: { slug: pageSlug },
        include: [
          {
            model: db.GoogleReview,
            as: "googleReviews",
            required: false,
          },
        ],
      });

      // Sort reviews manually after fetching
      if (page && page.googleReviews) {
        page.googleReviews.sort((a, b) => a.sort_order - b.sort_order);
      }

      if (!page) {
        req.flash("error", "Page not found");
        return res.redirect("/admin/dashboard");
      }

      res.render("admin/googlereviews/index", {
        title: `Google Reviews - ${page.name}`,
        page: page,
        reviews: page.googleReviews || [],
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load reviews");
      res.redirect("/admin/dashboard");
    }
  },

  // Create new review
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const {
        page_id,
        reviewer_name,
        reviewer_image,
        rating,
        review_text,
        review_date,
        isActive,
      } = req.body;

      if (!reviewer_name || !review_text || !rating) {
        throw new Error("Reviewer name, rating, and review text are required");
      }

      // Validate rating
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Get max sort_order for this page
      const maxSort = await db.GoogleReview.max("sort_order", {
        where: { page_id },
        transaction,
      });
      const newSortOrder = (maxSort || 0) + 1;

      const review = await db.GoogleReview.create(
        {
          page_id,
          reviewer_name,
          reviewer_image: reviewer_image || "https://ui-avatars.com/api/?background=random&name=" + encodeURIComponent(reviewer_name),
          rating: ratingNum,
          review_text,
          review_date: review_date || new Date(),
          sort_order: newSortOrder,
          isActive: isActive === "on",
        },
        { transaction }
      );

      await transaction.commit();
      res.json({ success: true, message: "Review added successfully", review });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to add review",
      });
    }
  },

  // Update review
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const reviewId = req.params.id;
      const {
        reviewer_name,
        reviewer_image,
        rating,
        review_text,
        review_date,
        isActive,
      } = req.body;

      const review = await db.GoogleReview.findByPk(reviewId, { transaction });
      if (!review) throw new Error("Review not found");

      // Validate rating
      const ratingNum = parseInt(rating);
      if (ratingNum < 1 || ratingNum > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      await review.update(
        {
          reviewer_name,
          reviewer_image: reviewer_image || review.reviewer_image,
          rating: ratingNum,
          review_text,
          review_date: review_date || review.review_date,
          isActive: isActive === "on",
        },
        { transaction }
      );

      await transaction.commit();
      res.json({ success: true, message: "Review updated successfully", review });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update review",
      });
    }
  },

  // Delete review
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const reviewId = req.params.id;
      const review = await db.GoogleReview.findByPk(reviewId, { transaction });
      if (!review) throw new Error("Review not found");

      await review.destroy({ transaction });
      await transaction.commit();
      res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete review",
      });
    }
  },

  // Toggle review status
  toggleStatus: async (req, res) => {
    try {
      const reviewId = req.params.id;
      const review = await db.GoogleReview.findByPk(reviewId);
      if (!review) throw new Error("Review not found");

      review.isActive = !review.isActive;
      await review.save();

      res.json({
        success: true,
        isActive: review.isActive,
        message: `Review ${review.isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to toggle status",
      });
    }
  },

  // Reorder reviews
  reorder: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { reviews, page_id } = req.body;

      if (!reviews || !Array.isArray(reviews)) {
        throw new Error("Invalid data");
      }

      if (!page_id) {
        throw new Error("Page ID is required");
      }

      // Verify all reviews belong to this page
      const reviewIds = reviews.map((id) => parseInt(id));
      const count = await db.GoogleReview.count({
        where: {
          id: { [db.Sequelize.Op.in]: reviewIds },
          page_id: page_id,
        },
        transaction,
      });

      if (count !== reviewIds.length) {
        throw new Error("Some reviews do not belong to this page");
      }

      // Update sort_order for each review
      for (let i = 0; i < reviews.length; i++) {
        await db.GoogleReview.update(
          { sort_order: i },
          { where: { id: reviews[i] }, transaction }
        );
      }

      await transaction.commit();
      res.json({ success: true, message: "Reviews reordered successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reorder reviews",
      });
    }
  },
};

module.exports = GoogleReviewsController;