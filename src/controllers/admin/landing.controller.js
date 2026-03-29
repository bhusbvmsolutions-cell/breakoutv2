const { Op } = require("sequelize");
const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");
const { DeleteFaqPage, findOrCreatePage} = require("../../utils/faqHelper");

// Helper to get absolute filesystem path from stored path (handles both /uploads/... and public/uploads/...)
function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, '../../../');
  if (storedPath.startsWith('/')) {
    return path.join(projectRoot, 'public', storedPath);
  } else {
    return path.join(projectRoot, storedPath);
  }
}

function groupFilesByFieldname(files) {
    const grouped = {};
    if (files && files.length) {
      files.forEach(file => {
        if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
        grouped[file.fieldname].push(file);
      });
    }
    return grouped;
  }

const LandingController = {
  // List all landing pages with pagination and filters
  index: async (req, res) => {
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
          { slug: { [Op.like]: `%${search}%` } },
          { meta_title: { [Op.like]: `%${search}%` } },
        ];
      }

      if (status === "active") {
        whereClause.isActive = true;
      } else if (status === "inactive") {
        whereClause.isActive = false;
      }

      let order = [["createdAt", "DESC"]];
      if (sort === "oldest") {
        order = [["createdAt", "ASC"]];
      } else if (sort === "title_asc") {
        order = [["title", "ASC"]];
      } else if (sort === "title_desc") {
        order = [["title", "DESC"]];
      }

      const { count, rows: landings } = await db.Landing.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: db.EscapeRoomLocation,
            as: "locations",
            through: { attributes: [] },
            required: false,
          },
        ],
        order,
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/landing/index", {
        title: "Landing Pages",
        landings,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount: count,
        },
        filters: {
          search,
          status,
          sort,
        },
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error in landing index:", error);
      req.flash("error", "Failed to load landing pages");
      res.redirect("/admin/dashboard");
    }
  },

  // Show create form
  create: async (req, res) => {
    try {
      const locations = await db.EscapeRoomLocation.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
      });

      const videos = await db.Video.findAll({
        where: { status: true },
        order: [["title", "ASC"]],
      });

      res.render("admin/landing/create", {
        title: "Create Landing Page",
        locations,
        videos,
        landing: {},
        errors: {},
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error in create form:", error);
      req.flash("error", "Failed to load create form");
      res.redirect("/admin/landing");
    }
  },

  // Store landing page
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const { body } = req;
      const files = groupFilesByFieldname(req.files);

      // Validate required fields
      const errors = {};
      if (!body.title) errors.title = "Title is required";

      if (Object.keys(errors).length > 0) {
        await transaction.rollback();

        const locations = await db.EscapeRoomLocation.findAll({
          where: { isActive: true },
          order: [["title", "ASC"]],
        });
        const videos = await db.Video.findAll({
          where: { status: true },
          order: [["title", "ASC"]],
        });

        return res.render("admin/landing/create", {
          title: "Create Landing Page",
          locations,
          videos,
          landing: body,
          errors,
          error: "Please fix the errors below",
        });
      }

      // Check if slug exists
      if (body.slug) {
        const existingSlug = await db.Landing.findOne({
          where: { slug: body.slug },
          transaction,
        });
        if (existingSlug) {
          await transaction.rollback();
          errors.slug = "Slug already exists";

          const locations = await db.EscapeRoomLocation.findAll({
            where: { isActive: true },
            order: [["title", "ASC"]],
          });
          const videos = await db.Video.findAll({
            where: { status: true },
            order: [["title", "ASC"]],
          });

          return res.render("admin/landing/create", {
            title: "Create Landing Page",
            locations,
            videos,
            landing: body,
            errors,
            error: "Please fix the errors below",
          });
        }
      }

      // Create main landing record
      const landingData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        counters_heading: body.counters_heading,
        counters_content: body.counters_content,
        counters_note: body.counters_note,
        counters_counter_heading: body.counters_counter_heading,
        counters_counter_rating: body.counters_counter_rating,
        content_section: body.content_section,
        image_card_heading: body.image_card_heading,
        ideal_for_heading: body.ideal_for_heading,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        og_title: body.og_title,
        og_description: body.og_description,
        isActive: body.isActive === "on",
      };

      // Handle banner image
      if (files.banner_image && files.banner_image[0]) {
        landingData.banner_image = "/uploads/landing/" + files.banner_image[0].filename;
      }

      const landing = await db.Landing.create(landingData, { transaction });

      // Handle location mappings
      if (body.locations) {
        const locationIds = Array.isArray(body.locations) ? body.locations : [body.locations];
        const locationMappings = locationIds.map((locationId) => ({
          landing_id: landing.id,
          location_id: locationId,
          isActive: true,
        }));

        if (locationMappings.length > 0) {
          await db.LandingLocationMapping.bulkCreate(locationMappings, {
            transaction,
          });
        }
      }

      // Handle counter cards
      if (body.counter_headings) {
        const headings = Array.isArray(body.counter_headings) ? body.counter_headings : [body.counter_headings];
        const counts = Array.isArray(body.counter_counts) ? body.counter_counts : [body.counter_counts];
        const descriptions = Array.isArray(body.counter_descriptions) ? body.counter_descriptions : [body.counter_descriptions];

        const counterCards = [];
        for (let i = 0; i < headings.length; i++) {
          if (headings[i] || counts[i]) {
            const counterData = {
              landing_id: landing.id,
              heading: headings[i] || null,
              count: counts[i] || null,
              description: descriptions[i] || null,
              sort_order: i,
              isActive: true,
            };

            const counterImageKey = `counter_image_${i}`;
            if (files[counterImageKey] && files[counterImageKey][0]) {
              counterData.image = "/uploads/landing/" + files[counterImageKey][0].filename;
            }

            counterCards.push(counterData);
          }
        }

        if (counterCards.length > 0) {
          await db.LandingCounterCard.bulkCreate(counterCards, { transaction });
        }
      }

      // Handle image cards (array version)
      if (body.image_card_headings) {
        const headings = Array.isArray(body.image_card_headings) ? body.image_card_headings : [body.image_card_headings];
        const uploadedFiles = files.image_card_images || [];

        const imageCards = [];
        for (let i = 0; i < headings.length; i++) {
          if (headings[i]) {
            const imageCardData = {
              landing_id: landing.id,
              heading: headings[i],
              sort_order: i,
              isActive: true,
            };
            if (uploadedFiles[i] && uploadedFiles[i].filename) {
              imageCardData.image = "/uploads/landing/" + uploadedFiles[i].filename;
            }
            imageCards.push(imageCardData);
          }
        }

        if (imageCards.length > 0) {
          await db.LandingImageCard.bulkCreate(imageCards, { transaction });
        }
      }

      // Handle ideal for items (array version)
      if (body.ideal_for_headings) {
        const headings = Array.isArray(body.ideal_for_headings) ? body.ideal_for_headings : [body.ideal_for_headings];
        const uploadedFiles = files.ideal_for_images || [];

        const idealForItems = [];
        for (let i = 0; i < headings.length; i++) {
          if (headings[i]) {
            const idealForData = {
              landing_id: landing.id,
              heading: headings[i],
              sort_order: i,
              isActive: true,
            };
            if (uploadedFiles[i] && uploadedFiles[i].filename) {
              idealForData.image = "/uploads/landing/" + uploadedFiles[i].filename;
            }
            idealForItems.push(idealForData);
          }
        }

        if (idealForItems.length > 0) {
          await db.LandingIdealForItem.bulkCreate(idealForItems, { transaction });
        }
      }

      // Handle card sections
      if (body.card_section_headings) {
        const headings = Array.isArray(body.card_section_headings) ? body.card_section_headings : [body.card_section_headings];
        const descriptions = Array.isArray(body.card_section_descriptions) ? body.card_section_descriptions : [body.card_section_descriptions];
        const contents = Array.isArray(body.card_section_contents) ? body.card_section_contents : [body.card_section_contents];

        const cardSections = [];
        for (let i = 0; i < headings.length; i++) {
          if (headings[i] || descriptions[i]) {
            const cardSectionData = {
              landing_id: landing.id,
              heading: headings[i] || null,
              description: descriptions[i] || null,
              content: contents[i] || null,
              sort_order: i,
              isActive: true,
            };

            const imageKey = `card_section_image_${i}`;
            if (files[imageKey] && files[imageKey][0]) {
              cardSectionData.image = "/uploads/landing/" + files[imageKey][0].filename;
            }

            cardSections.push(cardSectionData);
          }
        }

        if (cardSections.length > 0) {
          await db.LandingCardSection.bulkCreate(cardSections, { transaction });
        }
      }

      // Handle video mappings
      if (body.videos) {
        const videoIds = Array.isArray(body.videos) ? body.videos : [body.videos];
        const videoTitles = Array.isArray(body.video_titles) ? body.video_titles : [body.video_titles];

        const videoMappings = videoIds.map((videoId, index) => ({
          landing_id: landing.id,
          video_id: videoId,
          video_title: videoTitles[index] || null,
          sort_order: index,
          isActive: true,
        }));

        if (videoMappings.length > 0) {
          await db.LandingVideo.bulkCreate(videoMappings, { transaction });
        }
      }


      await findOrCreatePage(landing.id, landing.title, landing.slug, 'landing');

      await transaction.commit();
      req.flash("success", "Landing page created successfully");
      res.redirect("/admin/landing");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in store landing:", error);
      req.flash("error", error.message || "Failed to create landing page");
      res.redirect("/admin/landing/create");
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const landing = await db.Landing.findByPk(req.params.id, {
        include: [
          {
            model: db.LandingCounterCard,
            as: "counterCards",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.LandingImageCard,
            as: "imageCards",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.LandingIdealForItem,
            as: "idealForItems",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.LandingCardSection,
            as: "cardSections",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.EscapeRoomLocation,
            as: "locations",
            through: { attributes: [] },
            required: false,
          },
          {
            model: db.Video,
            as: "videos",
            through: {
              model: db.LandingVideo,
              attributes: ["video_title", "sort_order"],
            },
            required: false,
          },
        ],
        order: [
          [{ model: db.LandingCounterCard, as: "counterCards" }, "sort_order", "ASC"],
          [{ model: db.LandingImageCard, as: "imageCards" }, "sort_order", "ASC"],
          [{ model: db.LandingIdealForItem, as: "idealForItems" }, "sort_order", "ASC"],
          [{ model: db.LandingCardSection, as: "cardSections" }, "sort_order", "ASC"],
        ],
      });

      if (!landing) {
        req.flash("error", "Landing page not found");
        return res.redirect("/admin/landing");
      }

      const locations = await db.EscapeRoomLocation.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
      });

      const videos = await db.Video.findAll({
        where: { status: true },
        order: [["title", "ASC"]],
      });

      // Get landing videos with pivot data
      const landingVideos = await db.LandingVideo.findAll({
        where: { landing_id: landing.id },
        include: [
          {
            model: db.Video,
            as: "video",
            required: true,
          },
        ],
        order: [["sort_order", "ASC"]],
      });

      res.render("admin/landing/edit", {
        title: "Edit Landing Page",
        landing,
        locations,
        videos,
        landingVideos,
        errors: {},
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error in edit form:", error);
      req.flash("error", "Failed to load edit form");
      res.redirect("/admin/landing");
    }
  },

  // Update landing page
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const landing = await db.Landing.findByPk(req.params.id, { transaction });
      if (!landing) {
        await transaction.rollback();
        req.flash("error", "Landing page not found");
        return res.redirect("/admin/landing");
      }

      const { body } = req;
      const files = groupFilesByFieldname(req.files);

      // Validate required fields
      const errors = {};
      if (!body.title) errors.title = "Title is required";

      if (Object.keys(errors).length > 0) {
        await transaction.rollback();

        const locations = await db.EscapeRoomLocation.findAll({
          where: { isActive: true },
          order: [["title", "ASC"]],
        });
        const videos = await db.Video.findAll({
          where: { status: true },
          order: [["title", "ASC"]],
        });

        // Get landing with associations for re-render
        const landingWithAssoc = await db.Landing.findByPk(req.params.id, {
          include: [
            {
              model: db.EscapeRoomLocation,
              as: "locations",
              through: { attributes: [] },
            },
            {
              model: db.Video,
              as: "videos",
              through: { attributes: ["video_title"] },
            },
          ],
        });

        return res.render("admin/landing/edit", {
          title: "Edit Landing Page",
          landing: landingWithAssoc,
          locations,
          videos,
          errors,
          error: "Please fix the errors below",
        });
      }

      // Check if slug exists (excluding current record)
      if (body.slug && body.slug !== landing.slug) {
        const existingSlug = await db.Landing.findOne({
          where: {
            slug: body.slug,
            id: { [Op.ne]: landing.id },
          },
          transaction,
        });
        if (existingSlug) {
          await transaction.rollback();
          errors.slug = "Slug already exists";

          const locations = await db.EscapeRoomLocation.findAll({
            where: { isActive: true },
            order: [["title", "ASC"]],
          });
          const videos = await db.Video.findAll({
            where: { status: true },
            order: [["title", "ASC"]],
          });

          // Get landing with associations
          const landingWithAssoc = await db.Landing.findByPk(req.params.id, {
            include: [
              {
                model: db.EscapeRoomLocation,
                as: "locations",
                through: { attributes: [] },
              },
              {
                model: db.Video,
                as: "videos",
                through: { attributes: ["video_title"] },
              },
            ],
          });

          return res.render("admin/landing/edit", {
            title: "Edit Landing Page",
            landing: landingWithAssoc,
            locations,
            videos,
            errors,
            error: "Please fix the errors below",
          });
        }
      }

      // Prepare update data
      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        counters_heading: body.counters_heading,
        counters_content: body.counters_content,
        counters_note: body.counters_note,
        counters_counter_heading: body.counters_counter_heading,
        counters_counter_rating: body.counters_counter_rating,
        content_section: body.content_section,
        image_card_heading: body.image_card_heading,
        ideal_for_heading: body.ideal_for_heading,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        og_title: body.og_title,
        og_description: body.og_description,
        isActive: body.isActive === "on",
      };

      // Handle banner image
      if (files.banner_image && files.banner_image[0]) {
        // Delete old image
        if (landing.banner_image) {
          const oldPath = getImageAbsolutePath(landing.banner_image);
          if (oldPath && fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        updateData.banner_image = "/uploads/landing/" + files.banner_image[0].filename;
      }

      await landing.update(updateData, { transaction });

      // Update locations
      await db.LandingLocationMapping.destroy({
        where: { landing_id: landing.id },
        transaction,
      });

      if (body.locations) {
        const locationIds = Array.isArray(body.locations) ? body.locations : [body.locations];
        const locationMappings = locationIds.map((locationId) => ({
          landing_id: landing.id,
          location_id: locationId,
          isActive: true,
        }));

        if (locationMappings.length > 0) {
          await db.LandingLocationMapping.bulkCreate(locationMappings, {
            transaction,
          });
        }
      }

      // Update counter cards
      await updateCounterCards(landing.id, body, files, transaction);

      // Update image cards
      await updateImageCards(landing.id, body, files, transaction);

      // Update ideal for items
      await updateIdealForItems(landing.id, body, files, transaction);

      // Update card sections
      await updateCardSections(landing.id, body, files, transaction);

      // Update video mappings
      await updateVideoMappings(landing.id, body, transaction);



      await findOrCreatePage(landing.id, landing.title, landing.slug, 'landing');

      await transaction.commit();
      req.flash("success", "Landing page updated successfully");
      res.redirect("/admin/landing");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in update landing:", error);
      req.flash("error", error.message || "Failed to update landing page");
      res.redirect(`/admin/landing/edit/${req.params.id}`);
    }
  },

  // View single landing page
  view: async (req, res) => {
    try {
      const landing = await db.Landing.findByPk(req.params.id, {
        include: [
          {
            model: db.LandingCounterCard,
            as: "counterCards",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.LandingImageCard,
            as: "imageCards",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.LandingIdealForItem,
            as: "idealForItems",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.LandingCardSection,
            as: "cardSections",
            required: false,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.EscapeRoomLocation,
            as: "locations",
            through: { attributes: [] },
            required: false,
          },
          {
            model: db.Video,
            as: "videos",
            through: {
              model: db.LandingVideo,
              attributes: ["video_title", "sort_order"],
            },
            required: false,
          },
        ],
        order: [
          [{ model: db.LandingCounterCard, as: "counterCards" }, "sort_order", "ASC"],
          [{ model: db.LandingImageCard, as: "imageCards" }, "sort_order", "ASC"],
          [{ model: db.LandingIdealForItem, as: "idealForItems" }, "sort_order", "ASC"],
          [{ model: db.LandingCardSection, as: "cardSections" }, "sort_order", "ASC"],
        ],
      });

      if (!landing) {
        req.flash("error", "Landing page not found");
        return res.redirect("/admin/landing");
      }

      res.render("admin/landing/show", {
        title: landing.title,
        landing,
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error in view landing:", error);
      req.flash("error", "Failed to load landing page");
      res.redirect("/admin/landing");
    }
  },

  // Delete landing page
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
      const landing = await db.Landing.findByPk(req.params.id, { transaction });
      if (!landing) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: "Landing page not found" });
      }

      // Delete banner image
      if (landing.banner_image) {
        const bannerPath = getImageAbsolutePath(landing.banner_image);
        if (bannerPath && fs.existsSync(bannerPath)) {
          fs.unlinkSync(bannerPath);
        }
      }

      // Delete all related images
      const counterCards = await db.LandingCounterCard.findAll({
        where: { landing_id: landing.id },
        transaction,
      });
      for (const card of counterCards) {
        if (card.image) {
          const imagePath = getImageAbsolutePath(card.image);
          if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }

      const imageCards = await db.LandingImageCard.findAll({
        where: { landing_id: landing.id },
        transaction,
      });
      for (const card of imageCards) {
        if (card.image) {
          const imagePath = getImageAbsolutePath(card.image);
          if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }

      const idealForItems = await db.LandingIdealForItem.findAll({
        where: { landing_id: landing.id },
        transaction,
      });
      for (const item of idealForItems) {
        if (item.image) {
          const imagePath = getImageAbsolutePath(item.image);
          if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }

      const cardSections = await db.LandingCardSection.findAll({
        where: { landing_id: landing.id },
        transaction,
      });
      for (const section of cardSections) {
        if (section.image) {
          const imagePath = getImageAbsolutePath(section.image);
          if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }
      }

      // Delete mappings
      await db.LandingVideo.destroy({ where: { landing_id: landing.id }, transaction });
      await db.LandingLocationMapping.destroy({ where: { landing_id: landing.id }, transaction });
      await landing.destroy({ transaction });

      await DeleteFaqPage(landing.id, landing.title, landing.slug, 'landing');

      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes("json")) {
        return res.json({ success: true, message: "Landing page deleted successfully" });
      }

      req.flash("success", "Landing page deleted successfully");
      res.redirect("/admin/landing");
    } catch (error) {
      await transaction.rollback();
      console.error("Error in delete landing:", error);
      if (req.xhr || req.headers.accept?.includes("json")) {
        return res.status(500).json({ success: false, message: "Failed to delete landing page" });
      }
      req.flash("error", "Failed to delete landing page");
      res.redirect("/admin/landing");
    }
  },

  // Toggle status
  toggleStatus: async (req, res) => {
    try {
      const landing = await db.Landing.findByPk(req.params.id);
      if (!landing) {
        return res.status(404).json({ success: false, message: "Landing page not found" });
      }

      landing.isActive = !landing.isActive;
      await landing.save();

      res.json({
        success: true,
        isActive: landing.isActive,
        message: `Landing page ${landing.isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      console.error("Error in toggle status:", error);
      res.status(500).json({ success: false, message: "Failed to toggle status" });
    }
  },

  // Check slug uniqueness
  checkSlug: async (req, res) => {
    try {
      const { slug, id } = req.query;
      const where = { slug };
      if (id) where.id = { [Op.ne]: id };
      const existing = await db.Landing.findOne({ where });
      res.json({ available: !existing });
    } catch (error) {
      console.error("Error in check slug:", error);
      res.status(500).json({ available: false, error: "Failed to check slug" });
    }
  },
};

// ========== HELPER FUNCTIONS ==========

async function updateCounterCards(landingId, body, files, transaction) {
  const existingCards = await db.LandingCounterCard.findAll({
    where: { landing_id: landingId },
    transaction,
  });
  for (const card of existingCards) {
    if (card.image) {
      const imagePath = getImageAbsolutePath(card.image);
      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
  await db.LandingCounterCard.destroy({ where: { landing_id: landingId }, transaction });

  if (body.counter_headings && body.counter_headings.length > 0) {
    const headings = Array.isArray(body.counter_headings) ? body.counter_headings : [body.counter_headings];
    const counts = Array.isArray(body.counter_counts) ? body.counter_counts : [body.counter_counts];
    const descriptions = Array.isArray(body.counter_descriptions) ? body.counter_descriptions : [body.counter_descriptions];

    const counterCards = [];
    for (let i = 0; i < headings.length; i++) {
      if (headings[i] || counts[i]) {
        const counterData = {
          landing_id: landingId,
          heading: headings[i] || null,
          count: counts[i] || null,
          description: descriptions[i] || null,
          sort_order: i,
          isActive: true,
        };
        const counterImageKey = `counter_image_${i}`;
        if (files[counterImageKey] && files[counterImageKey][0]) {
          counterData.image = "/uploads/landing/" + files[counterImageKey][0].filename;
        }
        counterCards.push(counterData);
      }
    }
    if (counterCards.length > 0) {
      await db.LandingCounterCard.bulkCreate(counterCards, { transaction });
    }
  }
}

async function updateImageCards(landingId, body, files, transaction) {
  const existingCards = await db.LandingImageCard.findAll({
    where: { landing_id: landingId },
    transaction,
  });
  for (const card of existingCards) {
    if (card.image) {
      const imagePath = getImageAbsolutePath(card.image);
      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
  await db.LandingImageCard.destroy({ where: { landing_id: landingId }, transaction });

  const headings = body.image_card_headings || [];
  const newImages = files.image_card_images || [];
  const oldImages = body.image_card_old_images || [];

  const imageCards = [];
  for (let i = 0; i < headings.length; i++) {
    if (headings[i]) {
      const imageCardData = {
        landing_id: landingId,
        heading: headings[i],
        sort_order: i,
        isActive: true,
      };
      if (newImages[i] && newImages[i].filename) {
        imageCardData.image = "/uploads/landing/" + newImages[i].filename;
      } else if (oldImages[i]) {
        imageCardData.image = oldImages[i];
      }
      imageCards.push(imageCardData);
    }
  }
  if (imageCards.length) {
    await db.LandingImageCard.bulkCreate(imageCards, { transaction });
  }
}

async function updateIdealForItems(landingId, body, files, transaction) {
  const existingItems = await db.LandingIdealForItem.findAll({
    where: { landing_id: landingId },
    transaction,
  });
  for (const item of existingItems) {
    if (item.image) {
      const imagePath = getImageAbsolutePath(item.image);
      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
  await db.LandingIdealForItem.destroy({ where: { landing_id: landingId }, transaction });

  const headings = body.ideal_for_headings || [];
  const newImages = files.ideal_for_images || [];
  const oldImages = body.ideal_for_old_images || [];

  const idealForItems = [];
  for (let i = 0; i < headings.length; i++) {
    if (headings[i]) {
      const idealForData = {
        landing_id: landingId,
        heading: headings[i],
        sort_order: i,
        isActive: true,
      };
      if (newImages[i] && newImages[i].filename) {
        idealForData.image = "/uploads/landing/" + newImages[i].filename;
      } else if (oldImages[i]) {
        idealForData.image = oldImages[i];
      }
      idealForItems.push(idealForData);
    }
  }
  if (idealForItems.length) {
    await db.LandingIdealForItem.bulkCreate(idealForItems, { transaction });
  }
}

async function updateCardSections(landingId, body, files, transaction) {
  const existingSections = await db.LandingCardSection.findAll({
    where: { landing_id: landingId },
    transaction,
  });
  for (const section of existingSections) {
    if (section.image) {
      const imagePath = getImageAbsolutePath(section.image);
      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
  await db.LandingCardSection.destroy({ where: { landing_id: landingId }, transaction });

  if (body.card_section_headings && body.card_section_headings.length > 0) {
    const headings = Array.isArray(body.card_section_headings) ? body.card_section_headings : [body.card_section_headings];
    const descriptions = Array.isArray(body.card_section_descriptions) ? body.card_section_descriptions : [body.card_section_descriptions];
    const contents = Array.isArray(body.card_section_contents) ? body.card_section_contents : [body.card_section_contents];

    const cardSections = [];
    for (let i = 0; i < headings.length; i++) {
      if (headings[i] || descriptions[i]) {
        const cardSectionData = {
          landing_id: landingId,
          heading: headings[i] || null,
          description: descriptions[i] || null,
          content: contents[i] || null,
          sort_order: i,
          isActive: true,
        };
        const imageKey = `card_section_image_${i}`;
        if (files[imageKey] && files[imageKey][0]) {
          cardSectionData.image = "/uploads/landing/" + files[imageKey][0].filename;
        }
        cardSections.push(cardSectionData);
      }
    }
    if (cardSections.length > 0) {
      await db.LandingCardSection.bulkCreate(cardSections, { transaction });
    }
  }
}

async function updateVideoMappings(landingId, body, transaction) {
  await db.LandingVideo.destroy({ where: { landing_id: landingId }, transaction });
  if (body.videos && body.videos.length > 0) {
    const videoIds = Array.isArray(body.videos) ? body.videos : [body.videos];
    const videoTitles = Array.isArray(body.video_titles) ? body.video_titles : [];
    const videoMappings = videoIds.map((videoId, index) => ({
      landing_id: landingId,
      video_id: videoId,
      video_title: videoTitles[index] || null,
      sort_order: index,
      isActive: true,
    }));
    if (videoMappings.length > 0) {
      await db.LandingVideo.bulkCreate(videoMappings, { transaction });
    }
  }
}

module.exports = LandingController;