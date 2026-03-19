const db = require("../../../models");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

const {
  EscapeRoomLocation,
  EscapeRoomLocationPricing,
  EscapeRoomLocationEventSpace,
  EscapeRoomLocationImageCard,
  EscapeRoomLocationVideo,
  Video,
} = db;

const escapeRoomLocationController = {
  // GET /admin/escape/locations
  list: async (req, res) => {
    try {
      const locations = await EscapeRoomLocation.findAll({
        order: [["createdAt", "DESC"]],
      });

      res.render("admin/escape/locations/index", {
        title: "Escape Room Locations",
        locations,
        success_msg: req.flash("success"),
        error_msg: req.flash("error"),
        baseUrl: process.env.BASE_URL || "",
      });
    } catch (error) {
      console.error("Error loading locations:", error);
      req.flash("error", "Failed to load locations");
      res.redirect("/admin/dashboard");
    }
  },

  // GET /admin/escape/locations/create
  createForm: async (req, res) => {
    try {
      const allVideos = await Video.findAll({
        where: { status: "active" },
        attributes: ["id", "title", "thumbnail", "duration", "url"],
        order: [["title", "ASC"]],
      });

      res.render("admin/escape/locations/form", {
        title: "Add Escape Room Location",
        location: null,
        pricings: [],
        eventSpaces: [],
        imageCards: [],
        selectedVideos: [],
        allVideos,
        success_msg: req.flash("success"),
        error_msg: req.flash("error"),
        baseUrl: process.env.BASE_URL || "",
      });
    } catch (error) {
      console.error("Error loading create form:", error);
      req.flash("error", "Failed to load form");
      res.redirect("/admin/escape/locations");
    }
  },

  // GET /admin/escape/locations/edit/:id
  editForm: async (req, res) => {
    try {
      const { id } = req.params;
      const location = await EscapeRoomLocation.findByPk(id, {
        include: [
            {
              model: Video,
              as: "bannerVideo",
              attributes: ["id", "title", "thumbnail", "url", "duration"],
            },
          ],
    });

      if (!location) {
        req.flash("error", "Location not found");
        return res.redirect("/admin/escape/locations");
      }

      const pricings = await EscapeRoomLocationPricing.findAll({
        where: { location_id: id },
        order: [["sort_order", "ASC"]],
      });

      const eventSpaces = await EscapeRoomLocationEventSpace.findAll({
        where: { location_id: id },
        order: [["sort_order", "ASC"]],
      });

      const imageCards = await EscapeRoomLocationImageCard.findAll({
        where: { location_id: id },
        order: [["sort_order", "ASC"]],
      });

      const selectedVideos = await EscapeRoomLocationVideo.findAll({
        where: { location_id: id },
        include: [
          {
            model: Video,
            as: "videoDetails",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
        ],
        order: [["sort_order", "ASC"]],
      });

      const allVideos = await Video.findAll({
        where: { status: "active" },
        attributes: ["id", "title", "thumbnail", "duration", "url"],
        order: [["title", "ASC"]],
      });

      res.render("admin/escape/locations/form", {
        title: "Edit Escape Room Location",
        location,
        pricings,
        eventSpaces,
        imageCards,
        selectedVideos,
        allVideos,
        success_msg: req.flash("success"),
        error_msg: req.flash("error"),
        baseUrl: process.env.BASE_URL || "",
      });
    } catch (error) {
      console.error("Error loading edit form:", error);
      req.flash("error", "Failed to load form");
      res.redirect("/admin/escape/locations");
    }
  },

  // POST /admin/escape/locations
  create: async (req, res) => {
    try {
      const {
        title,
        banner_heading,
        banner_video_id,
        banner_description,
        banner_cta_label,
        banner_cta_link,
        trailor_video,
        text_section_description,
        pricing_section_heading,
        pricing_section_note,
        location_city,
        location_timings,
        location_total_capacity,
        location_parking_info,
        location_parking_video_link,
        location_address,
        location_map_url,
        image_cards_heading,
        footer_heading,
        footer_description1,
        footer_description2,
        video_ids,
        // flat arrays
        pricing_day_range,
        pricing_price_23,
        pricing_price_46,
        event_space_name,
        event_space_capacity,
        event_space_style,
        image_card_heading,
        image_card_description,
        image_card_cta_label,
        image_card_cta_link,
        image_card_existing_image,
      } = req.body;

      // Generate slug
      const slug = slugify(title, { lower: true, strict: true });

      // Handle banner image
      let banner_featured_image = null;
      if (
        req.files &&
        req.files["banner_featured_image"] &&
        req.files["banner_featured_image"][0]
      ) {
        const file = req.files["banner_featured_image"][0];
        banner_featured_image = "/uploads/escaperoomlocations/" + file.filename;
      }

      // Create location
      const location = await EscapeRoomLocation.create({
        title,
        slug,
        banner_heading,
        banner_video_id: banner_video_id || null,
        banner_featured_image,
        banner_description,
        banner_cta_label,
        banner_cta_link,
        trailor_video,
        text_section_description,
        pricing_section_heading,
        pricing_section_note,
        location_city,
        location_timings,
        location_total_capacity: location_total_capacity
          ? parseInt(location_total_capacity)
          : null,
        location_parking_info,
        location_parking_video_link,
        location_address,
        location_map_url,
        image_cards_heading,
        footer_heading,
        footer_description1,
        footer_description2,
      });

      // Create pricings
      if (pricing_day_range && Array.isArray(pricing_day_range)) {
        for (let i = 0; i < pricing_day_range.length; i++) {
          const day_range = pricing_day_range[i];
          const price_23 =
            pricing_price_23 && pricing_price_23[i]
              ? pricing_price_23[i]
              : null;
          const price_46 =
            pricing_price_46 && pricing_price_46[i]
              ? pricing_price_46[i]
              : null;
          if (day_range || price_23 || price_46) {
            await EscapeRoomLocationPricing.create({
              location_id: location.id,
              day_range,
              price_23,
              price_46,
              sort_order: i,
            });
          }
        }
      }

      // Create event spaces
      if (event_space_name && Array.isArray(event_space_name)) {
        for (let i = 0; i < event_space_name.length; i++) {
          const name = event_space_name[i];
          const capacity =
            event_space_capacity && event_space_capacity[i]
              ? parseInt(event_space_capacity[i])
              : null;
          const style =
            event_space_style && event_space_style[i]
              ? event_space_style[i]
              : null;
          if (name || capacity || style) {
            await EscapeRoomLocationEventSpace.create({
              location_id: location.id,
              space_name: name,
              capacity,
              style,
              sort_order: i,
            });
          }
        }
      }

      // Create image cards (with file uploads)
      const imageFiles =
        req.files && req.files["image_card_images"]
          ? req.files["image_card_images"]
          : [];
      if (image_card_heading && Array.isArray(image_card_heading)) {
        for (let i = 0; i < image_card_heading.length; i++) {
          const heading = image_card_heading[i];
          const description =
            image_card_description && image_card_description[i]
              ? image_card_description[i]
              : null;
          const cta_label =
            image_card_cta_label && image_card_cta_label[i]
              ? image_card_cta_label[i]
              : null;
          const cta_link =
            image_card_cta_link && image_card_cta_link[i]
              ? image_card_cta_link[i]
              : null;
          let image = null;

          // Check if a file was uploaded for this index
          if (imageFiles[i]) {
            const file = imageFiles[i];
            image = "/uploads/escaperoomlocations/" + file.filename;
          } else if (
            image_card_existing_image &&
            image_card_existing_image[i]
          ) {
            image = image_card_existing_image[i]; // keep existing (only for update, but here it's create so probably empty)
          }

          if (heading || description || image) {
            await EscapeRoomLocationImageCard.create({
              location_id: location.id,
              heading,
              description,
              image,
              cta_label,
              cta_link,
              sort_order: i,
            });
          }
        }
      }

      // Create video associations
      if (video_ids && Array.isArray(video_ids)) {
        const validVideoIds = video_ids.filter((id) => id && id !== "");
        for (let i = 0; i < validVideoIds.length; i++) {
          const videoId = validVideoIds[i];
          await EscapeRoomLocationVideo.create({
            location_id: location.id,
            video_id: videoId,
            title: req.body[`video_title_${videoId}`] || "",
            sort_order: i,
          });
        }
      }

      req.flash("success", "Location created successfully!");
      res.redirect("/admin/escape/locations");
    } catch (error) {
      console.error("Error creating location:", error);
      req.flash("error", "Failed to create location: " + error.message);
      res.redirect("/admin/escape/locations/create");
    }
  },

  // PUT /admin/escape/locations/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const location = await EscapeRoomLocation.findByPk(id);

      if (!location) {
        req.flash("error", "Location not found");
        return res.redirect("/admin/escape/locations");
      }

      const {
        title,
        banner_heading,
        banner_video_id,
        banner_description,
        banner_cta_label,
        banner_cta_link,
        text_section_description,
        trailor_video,
        pricing_section_heading,
        pricing_section_note,
        location_city,
        location_timings,
        location_total_capacity,
        location_parking_info,
        location_parking_video_link,
        location_address,
        location_map_url,
        image_cards_heading,
        footer_heading,
        footer_description1,
        footer_description2,
        video_ids,
        delete_banner_image,
        delete_image_cards,
        // flat arrays
        pricing_day_range,
        pricing_price_23,
        pricing_price_46,
        event_space_name,
        event_space_capacity,
        event_space_style,
        image_card_heading,
        image_card_description,
        image_card_cta_label,
        image_card_cta_link,
        image_card_existing_image,
      } = req.body;

      // Generate slug
      const slug = slugify(title, { lower: true, strict: true });

      // Handle banner image
      let banner_featured_image = location.banner_featured_image;
      if (delete_banner_image === "1" && location.banner_featured_image) {
        const oldPath = path.join(
          __dirname,
          "../../public",
          location.banner_featured_image
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        banner_featured_image = null;
      }
      if (
        req.files &&
        req.files["banner_featured_image"] &&
        req.files["banner_featured_image"][0]
      ) {
        if (location.banner_featured_image && delete_banner_image !== "1") {
          const oldPath = path.join(
            __dirname,
            "../../public",
            location.banner_featured_image
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        const file = req.files["banner_featured_image"][0];
        banner_featured_image = "/uploads/escaperoomlocations/" + file.filename;
      }

      // Update location
      await location.update({
        title,
        slug,
        banner_heading,
        banner_video_id: banner_video_id || null,
        banner_featured_image,
        banner_description,
        banner_cta_label,
        banner_cta_link,
        trailor_video,
        text_section_description,
        pricing_section_heading,
        pricing_section_note,
        location_city,
        location_timings,
        location_total_capacity: location_total_capacity
          ? parseInt(location_total_capacity)
          : null,
        location_parking_info,
        location_parking_video_link,
        location_address,
        location_map_url,
        image_cards_heading,
        footer_heading,
        footer_description1,
        footer_description2,
      });

      // --- Delete marked image cards first ---
      if (delete_image_cards) {
        const deleteIds = Array.isArray(delete_image_cards)
          ? delete_image_cards
          : [delete_image_cards];
        for (const cardId of deleteIds) {
          const card = await EscapeRoomLocationImageCard.findByPk(cardId);
          if (card) {
            if (card.image) {
              const imgPath = path.join(__dirname, "../../public", card.image);
              if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }
            await card.destroy();
          }
        }
      }

      // --- Replace all pricing items ---
      await EscapeRoomLocationPricing.destroy({ where: { location_id: id } });
      if (pricing_day_range && Array.isArray(pricing_day_range)) {
        for (let i = 0; i < pricing_day_range.length; i++) {
          const day_range = pricing_day_range[i];
          const price_23 =
            pricing_price_23 && pricing_price_23[i]
              ? pricing_price_23[i]
              : null;
          const price_46 =
            pricing_price_46 && pricing_price_46[i]
              ? pricing_price_46[i]
              : null;
          if (day_range || price_23 || price_46) {
            await EscapeRoomLocationPricing.create({
              location_id: id,
              day_range,
              price_23,
              price_46,
              sort_order: i,
            });
          }
        }
      }

      // --- Replace all event spaces ---
      await EscapeRoomLocationEventSpace.destroy({
        where: { location_id: id },
      });
      if (event_space_name && Array.isArray(event_space_name)) {
        for (let i = 0; i < event_space_name.length; i++) {
          const name = event_space_name[i];
          const capacity =
            event_space_capacity && event_space_capacity[i]
              ? parseInt(event_space_capacity[i])
              : null;
          const style =
            event_space_style && event_space_style[i]
              ? event_space_style[i]
              : null;
          if (name || capacity || style) {
            await EscapeRoomLocationEventSpace.create({
              location_id: id,
              space_name: name,
              capacity,
              style,
              sort_order: i,
            });
          }
        }
      }

      // --- Replace all image cards (after deletions) ---
      // We will delete all remaining cards and recreate from the flat arrays.
      // But we must keep the ones that were not deleted? Actually we already deleted the marked ones.
      // To keep the unmarked ones, we need to either update them or delete all and recreate.
      // Simpler: delete all and recreate, using existing image paths from hidden fields.
      await EscapeRoomLocationImageCard.destroy({ where: { location_id: id } });

      const imageFiles =
        req.files && req.files["image_card_images"]
          ? req.files["image_card_images"]
          : [];
      if (image_card_heading && Array.isArray(image_card_heading)) {
        for (let i = 0; i < image_card_heading.length; i++) {
          const heading = image_card_heading[i];
          const description =
            image_card_description && image_card_description[i]
              ? image_card_description[i]
              : null;
          const cta_label =
            image_card_cta_label && image_card_cta_label[i]
              ? image_card_cta_label[i]
              : null;
          const cta_link =
            image_card_cta_link && image_card_cta_link[i]
              ? image_card_cta_link[i]
              : null;
          let image = null;

          // If a new file was uploaded, use it
          if (imageFiles[i]) {
            const file = imageFiles[i];
            image = "/uploads/escaperoomlocations/" + file.filename;
          } else if (
            image_card_existing_image &&
            image_card_existing_image[i]
          ) {
            // Otherwise keep the existing image path (from hidden field)
            image = image_card_existing_image[i];
          }

          // Only create if at least heading or image exists
          if (heading || description || image) {
            await EscapeRoomLocationImageCard.create({
              location_id: id,
              heading,
              description,
              image,
              cta_label,
              cta_link,
              sort_order: i,
            });
          }
        }
      }

      // --- Replace video associations ---
      await EscapeRoomLocationVideo.destroy({ where: { location_id: id } });
      if (video_ids && Array.isArray(video_ids)) {
        const validVideoIds = video_ids.filter((id) => id && id !== "");
        for (let i = 0; i < validVideoIds.length; i++) {
          const videoId = validVideoIds[i];
          await EscapeRoomLocationVideo.create({
            location_id: id,
            video_id: videoId,
            title: req.body[`video_title_${videoId}`] || "",
            sort_order: i,
          });
        }
      }

      req.flash("success", "Location updated successfully!");
      res.redirect("/admin/escape/locations");
    } catch (error) {
      console.error("Error updating location:", error);
      req.flash("error", "Failed to update location: " + error.message);
      res.redirect(`/admin/escape/locations/edit/${req.params.id}`);
    }
  },

  // DELETE /admin/escape/locations/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const location = await EscapeRoomLocation.findByPk(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Location not found",
        });
      }

      // Delete banner image if exists
      if (location.banner_featured_image) {
        const imagePath = path.join(
          __dirname,
          "../../public",
          location.banner_featured_image
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await location.destroy();

      res.json({
        success: true,
        message: "Location deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete location",
      });
    }
  },

  // DELETE /admin/escape/locations/image-card/:id
  deleteImageCard: async (req, res) => {
    try {
      const { id } = req.params;
      const card = await EscapeRoomLocationImageCard.findByPk(id);

      if (!card) {
        return res.status(404).json({
          success: false,
          message: "Image card not found",
        });
      }

      // Delete image file if exists
      if (card.image) {
        const imagePath = path.join(__dirname, "../../public", card.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await card.destroy();

      res.json({
        success: true,
        message: "Image card deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image card:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete image card",
      });
    }
  },
};

module.exports = escapeRoomLocationController;
