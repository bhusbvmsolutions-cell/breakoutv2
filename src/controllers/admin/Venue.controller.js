const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");
const { Op } = require("sequelize");
const { DeleteFaqPage, findOrCreatePage} = require("../../utils/faqHelper");

function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, "../../../");
  if (storedPath.startsWith("/")) {
    return path.join(projectRoot, "public", storedPath);
  }
  return path.join(projectRoot, storedPath);
}

function groupFilesByFieldname(files) {
  const grouped = {};
  if (files && files.length) {
    files.forEach((file) => {
      if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
      grouped[file.fieldname].push(file);
    });
  }
  return grouped;
}

const VenueController = {
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const locationId = req.query.location || "";
      const status = req.query.status || "";
      const sort = req.query.sort || "latest";

      const where = {};
      if (search) where.name = { [Op.like]: `%${search}%` };
      if (status === "active") where.isActive = true;
      else if (status === "inactive") where.isActive = false;

      let order = [["createdAt", "DESC"]];
      if (sort === "oldest") order = [["createdAt", "ASC"]];
      else if (sort === "name_asc") order = [["name", "ASC"]];
      else if (sort === "name_desc") order = [["name", "DESC"]];
      else if (sort === "rating_desc") order = [["rating", "DESC"]];

      // Build include array – always include all associations
      const include = [
        { model: db.Location, as: "locations" }, // many-to-many
        { model: db.VenueCategory, as: "categories" },
        { model: db.VenueExperienceType, as: "experienceTypes" },
        { model: db.VenueExperienceLookingFor, as: "lookingFor" },
        { model: db.VenuePartType, as: "partyTypes" },
        { model: db.VenueSuitableTime, as: "suitableTimes" },
        { model: db.VenueBudgetRange, as: "budgetRanges" },
        { model: db.VenueImage, as: "galleryImages" },
      ];

      // If a specific location is requested, filter venues that have that location
      if (locationId) {
        include.push({
          model: db.Location,
          as: "locations",
          where: { id: locationId },
          required: true, // only venues with that location
        });
      }

      const { count, rows: venues } = await db.Venue.findAndCountAll({
        where,
        include,
        order,
        limit,
        offset,
        distinct: true,
      });

      // Get all locations for the filter dropdown
      const locations = await db.Location.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
      });

      const totalPages = Math.ceil(count / limit);

      res.render("admin/venues/index", {
        title: "Venues",
        venues,
        locations,
        filters: {
          search,
          location: locationId,
          status,
          sort,
        },
        pagination: {
          page,
          limit,
          totalPages,
          totalCount: count,
        },
        success: req.flash("success"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load venues");
      res.redirect("/admin/dashboard");
    }
  },

  create: async (req, res) => {
    try {
      const locations = await db.Location.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
      });
      const categories = await db.VenueCategory.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const experienceTypes = await db.VenueExperienceType.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const lookingFor = await db.VenueExperienceLookingFor.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const partyTypes = await db.VenuePartType.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const suitableTimes = await db.VenueSuitableTime.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const budgetRanges = await db.VenueBudgetRange.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      res.render("admin/venues/create", {
        title: "Add Venue",
        venue: null,
        locations,
        categories,
        experienceTypes,
        lookingFor,
        partyTypes,
        suitableTimes,
        budgetRanges,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load create form");
      res.redirect("/admin/venues");
    }
  },

  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.name) throw new Error("Name is required");
      let slug = body.slug || slugify(body.name, { lower: true, strict: true });
      const existingSlug = await db.Venue.findOne({
        where: { slug },
        transaction,
      });
      if (existingSlug) throw new Error("Slug already exists");

      const venueData = {
        name: body.name,
        slug,
        price: body.price,
        rating: body.rating,
        capacity: body.capacity,
        is_featured: body.is_featured === "on",
        time: body.time,
        phone: body.phone,
        website: body.website,
        address: body.address,
        google_map: body.google_map,
        isActive: body.isActive === "on",
      };

      // Cover image
      if (files.cover_image && files.cover_image[0]) {
        venueData.cover_image = `/uploads/venues/${files.cover_image[0].filename}`;
      } else if (body.cover_image) {
        venueData.cover_image = body.cover_image;
      }

      const venue = await db.Venue.create(venueData, { transaction });

      // Many-to-many associations
      const assocMappings = [
        {
          input: body.categories,
          model: db.VenueCategoryMapping,
          field: "category_id",
        },
        {
          input: body.experienceTypes,
          model: db.VenueExperienceTypeMapping,
          field: "experience_type_id",
        },
        {
          input: body.lookingFor,
          model: db.VenueExperienceLookingForMapping,
          field: "looking_for_id",
        },
        {
          input: body.partyTypes,
          model: db.VenuePartyTypeMapping,
          field: "party_type_id",
        },
        {
          input: body.suitableTimes,
          model: db.VenueSuitableTimeMapping,
          field: "suitable_time_id",
        },
        {
          input: body.budgetRanges,
          model: db.VenueBudgetRangeMapping,
          field: "budget_range_id",
        },
      ];
      for (const mapping of assocMappings) {
        if (mapping.input && Array.isArray(mapping.input)) {
          const items = mapping.input.map((id) => ({
            venue_id: venue.id,
            [mapping.field]: id,
          }));
          await mapping.model.bulkCreate(items, { transaction });
        }
      }

      // Locations (many-to-many)
      if (body.locations && Array.isArray(body.locations)) {
        const locationMappings = body.locations.map((locId) => ({
          venue_id: venue.id,
          location_id: locId,
        }));
        await db.VenueLocationMapping.bulkCreate(locationMappings, {
          transaction,
        });
      }

      // Gallery images
      if (body.gallery_images && Array.isArray(body.gallery_images)) {
        for (let i = 0; i < body.gallery_images.length; i++) {
          const img = body.gallery_images[i];
          const imageFile = files[`gallery_images[${i}][image_file]`]?.[0];
          let imagePath = img.image || "";
          if (imageFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/venues/${imageFile.filename}`;
          }
          await db.VenueImage.create(
            {
              venue_id: venue.id,
              image: imagePath,
              sort_order: i,
            },
            { transaction }
          );
        }
      }

      if (body.content_sections && Array.isArray(body.content_sections)) {
        for (let i = 0; i < body.content_sections.length; i++) {
          const section = body.content_sections[i];
          await db.VenueContentSection.create(
            {
              venue_id: venue.id,
              heading: section.heading || null,
              content: section.content,
              sort_order: i,
              isActive: true,
            },
            { transaction }
          );
        }
      }

      await findOrCreatePage(venue.id, venue.name, venue.slug, 'venue');

      await transaction.commit();
      req.flash("success", "Venue created successfully");
      res.redirect("/admin/venues");
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash("error", error.message || "Failed to create venue");
      res.redirect("/admin/venues/create");
    }
  },

  edit: async (req, res) => {
    try {
      const venue = await db.Venue.findByPk(req.params.id, {
        include: [
          { model: db.Location, as: "locations" }, // many-to-many
          { model: db.VenueCategory, as: "categories" },
          { model: db.VenueExperienceType, as: "experienceTypes" },
          { model: db.VenueExperienceLookingFor, as: "lookingFor" },
          { model: db.VenuePartType, as: "partyTypes" },
          { model: db.VenueSuitableTime, as: "suitableTimes" },
          { model: db.VenueBudgetRange, as: "budgetRanges" },
          { model: db.VenueImage, as: "galleryImages" },
          { model: db.VenueContentSection, as: 'contentSections', order: [['sort_order', 'ASC']] },
        ],
      });
      if (!venue) {
        req.flash("error", "Venue not found");
        return res.redirect("/admin/venues");
      }
      const locations = await db.Location.findAll({
        where: { isActive: true },
        order: [["title", "ASC"]],
      });
      const categories = await db.VenueCategory.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const experienceTypes = await db.VenueExperienceType.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const lookingFor = await db.VenueExperienceLookingFor.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const partyTypes = await db.VenuePartType.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const suitableTimes = await db.VenueSuitableTime.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      const budgetRanges = await db.VenueBudgetRange.findAll({
        where: { isActive: true },
        order: [["name", "ASC"]],
      });
      res.render("admin/venues/edit", {
        title: "Edit Venue",
        venue,
        locations,
        categories,
        experienceTypes,
        lookingFor,
        partyTypes,
        suitableTimes,
        budgetRanges,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load edit form");
      res.redirect("/admin/venues");
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const venue = await db.Venue.findByPk(req.params.id, { transaction });
      if (!venue) throw new Error("Venue not found");

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        name: body.name,
        slug: body.slug || slugify(body.name, { lower: true, strict: true }),
        price: body.price,
        rating: body.rating,
        capacity: body.capacity,
        is_featured: body.is_featured === "on",
        time: body.time,
        phone: body.phone,
        website: body.website,
        address: body.address,
        google_map: body.google_map,
        isActive: body.isActive === "on",
      };

      // Cover image
      if (files.cover_image && files.cover_image[0]) {
        if (venue.cover_image) {
          const oldPath = getImageAbsolutePath(venue.cover_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.cover_image = `/uploads/venues/${files.cover_image[0].filename}`;
      } else if (body.cover_image) {
        updateData.cover_image = body.cover_image;
      }

      if (updateData.slug !== venue.slug) {
        const existing = await db.Venue.findOne({
          where: { slug: updateData.slug, id: { [Op.ne]: venue.id } },
          transaction,
        });
        if (existing) throw new Error("Slug already exists");
      }

      await venue.update(updateData, { transaction });

      // Replace many-to-many associations
      const assocModels = [
        {
          model: db.VenueCategoryMapping,
          idField: "category_id",
          inputName: "categories",
        },
        {
          model: db.VenueExperienceTypeMapping,
          idField: "experience_type_id",
          inputName: "experienceTypes",
        },
        {
          model: db.VenueExperienceLookingForMapping,
          idField: "looking_for_id",
          inputName: "lookingFor",
        },
        {
          model: db.VenuePartyTypeMapping,
          idField: "party_type_id",
          inputName: "partyTypes",
        },
        {
          model: db.VenueSuitableTimeMapping,
          idField: "suitable_time_id",
          inputName: "suitableTimes",
        },
        {
          model: db.VenueBudgetRangeMapping,
          idField: "budget_range_id",
          inputName: "budgetRanges",
        },
      ];
      for (const assoc of assocModels) {
        await assoc.model.destroy({
          where: { venue_id: venue.id },
          transaction,
        });
        if (body[assoc.inputName] && Array.isArray(body[assoc.inputName])) {
          const mapping = body[assoc.inputName].map((id) => ({
            venue_id: venue.id,
            [assoc.idField]: id,
          }));
          await assoc.model.bulkCreate(mapping, { transaction });
        }
      }

      // Locations (many-to-many)
      await db.VenueLocationMapping.destroy({
        where: { venue_id: venue.id },
        transaction,
      });
      if (body.locations && Array.isArray(body.locations)) {
        const locationMappings = body.locations.map((locId) => ({
          venue_id: venue.id,
          location_id: locId,
        }));
        await db.VenueLocationMapping.bulkCreate(locationMappings, {
          transaction,
        });
      }

      // Gallery images
      await db.VenueImage.destroy({
        where: { venue_id: venue.id },
        transaction,
      });
      if (body.gallery_images && Array.isArray(body.gallery_images)) {
        for (let i = 0; i < body.gallery_images.length; i++) {
          const img = body.gallery_images[i];
          const imageFile = files[`gallery_images[${i}][image_file]`]?.[0];
          let imagePath = img.image || "";
          if (imageFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/venues/${imageFile.filename}`;
          }
          await db.VenueImage.create(
            {
              venue_id: venue.id,
              image: imagePath,
              sort_order: i,
            },
            { transaction }
          );
        }
      }

      await db.VenueContentSection.destroy({
        where: { venue_id: venue.id },
        transaction,
      });
      if (body.content_sections && Array.isArray(body.content_sections)) {
        for (let i = 0; i < body.content_sections.length; i++) {
          const section = body.content_sections[i];
          await db.VenueContentSection.create(
            {
              venue_id: venue.id,
              heading: section.heading || null,
              content: section.content,
              sort_order: i,
              isActive: section.isActive === "on",
            },
            { transaction }
          );
        }
      }

      await findOrCreatePage(venue.id, venue.name, venue.slug, 'venue');

      await transaction.commit();
      req.flash("success", "Venue updated successfully");
      res.redirect("/admin/venues");
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash("error", error.message || "Failed to update venue");
      res.redirect(`/admin/venues/edit/${req.params.id}`);
    }
  },

  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const venue = await db.Venue.findByPk(req.params.id, { transaction });
      if (!venue) throw new Error("Venue not found");

      if (venue.cover_image) {
        const coverPath = getImageAbsolutePath(venue.cover_image);
        if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      }
      const galleryImages = await db.VenueImage.findAll({
        where: { venue_id: venue.id },
        transaction,
      });
      for (const img of galleryImages) {
        if (img.image) {
          const imgPath = getImageAbsolutePath(img.image);
          if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      }

      await venue.destroy({ transaction });

      await DeleteFaqPage(venue.id, venue.name, venue.slug, 'venue');

      await transaction.commit();
      res.json({ success: true, message: "Venue deleted successfully" });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete venue",
      });
    }
  },

  toggleStatus: async (req, res) => {
    try {
      const venue = await db.Venue.findByPk(req.params.id);
      if (!venue)
        return res
          .status(404)
          .json({ success: false, message: "Venue not found" });
      venue.isActive = !venue.isActive;
      await venue.save();
      res.json({ success: true, isActive: venue.isActive });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to toggle status" });
    }
  },
};

module.exports = VenueController;
