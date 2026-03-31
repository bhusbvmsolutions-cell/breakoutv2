const db = require("../../../models");
const { Op } = require("sequelize");
const {
  GetRelatedGoogleReviews,
  GetRelatedFaqs,
} = require("../../utils/faqHelper");

const {
  EscapeRoomLocation,
  EscapeRoomLocationPricing,
  EscapeRoomLocationEventSpace,
  EscapeRoomLocationImageCard,
  EscapeRoomLocationVideo,
  Video,
  EscapeRoom,
  EscapeRoomLocationMapping,
} = db;

const escapeRoomLocationController = {
  /**
   * Get list of all locations
   * GET /api/public/escaperoomlocations
   */
  list: async (req, res) => {
    try {
      const where = {};
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const { count, rows: locations } =
        await EscapeRoomLocation.findAndCountAll({
          where: { isActive: true },
          attributes: [
            "id",
            "title",
            "slug",
            "banner_featured_image",
            "updatedAt",
          ],
        });

      // Format response
      const formattedLocations = locations
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // latest first
        .map((location) => ({
          title: location.title,
          slug: location.slug,
          banner_featured_image: location.banner_featured_image
            ? baseUrl + location.banner_featured_image
            : null,
        }));

      res.json({
        success: true,
        data: formattedLocations,
      });
    } catch (error) {
      console.error("Error in location list API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch locations",
      });
    }
  },

  /**
   * Get single location details by slug or ID
   * GET /api/public/escaperoomlocations/:slug
   */
  details: async (req, res) => {
    try {
      const { slug } = req.params;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const location = await EscapeRoomLocation.findOne({
        where: {
          slug: slug,
        },
        include: [
          {
            model: EscapeRoomLocationPricing,
            as: "pricings",
            separate: true,
            order: [["sort_order", "ASC"]],
            attributes: ["id", "day_range", "price_23", "price_46"],
          },
          {
            model: EscapeRoomLocationEventSpace,
            as: "eventSpaces",
            separate: true,
            order: [["sort_order", "ASC"]],
            attributes: ["id", "space_name", "capacity", "style"],
          },
          {
            model: EscapeRoomLocationImageCard,
            as: "imageCards",
            separate: true,
            order: [["sort_order", "ASC"]],
            attributes: [
              "id",
              "heading",
              "description",
              "image",
              "cta_label",
              "cta_link",
            ],
          },
          {
            model: EscapeRoomLocationVideo,
            as: "videos", // ✅ fixed
            separate: true,
            include: [
              {
                model: Video,
                as: "videoDetails",
                attributes: ["id", "title", "thumbnail", "url", "duration"],
              },
            ],
            order: [["sort_order", "ASC"]],
          },
          {
            model: Video,
            as: "bannerVideo",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
          {
            model: EscapeRoom,
            as: "escapeRooms",
            through: { where: { isActive: true } },
            required: false,
            where: { isActive: true },
            attributes: [
              "id",
              "title",
              "slug",
              "tag",
              "banner_heading",
              "banner_description",
              "banner_image",
              "banner_age_group",
              "banner_character",
              "banner_min_team",
              "banner_success_rate",
            ],
          },
        ],
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Location not found",
        });
      }

      const normalizeTags = (tag) => {
        if (!tag) return [];

        // If string (edge case)
        if (typeof tag === "string") {
          try {
            tag = JSON.parse(tag);
          } catch {
            return [];
          }
        }

        return Array.isArray(tag) ? tag.map((t) => t.toLowerCase().trim()) : [];
      };

      const allRooms = location.escapeRooms || [];

      const formatRoom = (room) => ({
        title: room.title,
        slug: room.slug,
        banner_heading: room.banner_heading,
        banner_description: room.banner_description,
        banner_age_group: room.banner_age_group,
        banner_min_team: room.banner_min_team,
        banner_success_rate: room.banner_success_rate,
        banner_image: room.banner_image ? baseUrl + room.banner_image : null,
      });

      // All rooms
      const all_escape_rooms = allRooms.map(formatRoom);

      // Filter safely
      const extremeRooms = allRooms.filter((room) =>
        normalizeTags(room.tag).includes("extreme"),
      );

      const ultraRooms = allRooms.filter((room) =>
        normalizeTags(room.tag).includes("ultra"),
      );

      const googleReviews = await GetRelatedGoogleReviews(
        location.id,
        location.slug,
        "escapeLocation",
      );
      const faqs = await GetRelatedFaqs(
        location.id,
        location.slug,
        "escapeLocation",
      );

      // Format response
      const formattedLocation = {
        id: location.id,
        title: location.title,
        slug: location.slug,
        banner_heading: location.banner_heading,
        banner_description: location.banner_description,
        banner_featured_image: location.banner_featured_image
          ? baseUrl + location.banner_featured_image
          : null,
        banner_video: location?.bannerVideo?.url ? baseUrl + location?.bannerVideo?.url : "",
        banner_cta_label: location.banner_cta_label,
        banner_cta_link: location.banner_cta_link,
        trailor_video: location.trailor_video,
        text_section_description: location.text_section_description,
        pricing_section_heading: location.pricing_section_heading,
        pricing_section_note: location.pricing_section_note,
        location_details: {
          city: location.location_city,
          timings: location.location_timings,
          total_capacity: location.location_total_capacity,
          parking_info: location.location_parking_info,
          parking_video_link: location.location_parking_video_link,
          address: location.location_address,
          map_url: location.location_map_url,
        },
        image_cards_heading: location.image_cards_heading,
        footer_heading: location.footer_heading,
        footer_description1: location.footer_description1,
        footer_description2: location.footer_description2,
        isActive: location.isActive,
        pricings: location.pricings,
        event_spaces: location.eventSpaces,
        image_cards: location.imageCards.map((card) => ({
          id: card.id,
          heading: card.heading,
          description: card.description,
          image: card.image ? baseUrl + card.image : null,
          cta_label: card.cta_label,
          cta_link: card.cta_link,
        })),
        testimonialVideos: location.videos.map((video) => ({
          id: video.id,
          title: video.title || video.videoDetails?.title,
          video_id: video.video_id,
          thumbnail: video.videoDetails?.thumbnail,
          url: video?.videoDetails?.url ? baseUrl + video.videoDetails.url : null,
          duration: video.videoDetails?.duration,
        })),
        all_escape_rooms: all_escape_rooms,
        escape_rooms: {
          extreme: extremeRooms.map(formatRoom),
          ultra: ultraRooms.map(formatRoom),
        },
        faqsection: faqs,
        googleReviews: googleReviews,

        createdAt: location.createdAt,
        updatedAt: location.updatedAt,
      };

      res.json({
        success: true,
        data: formattedLocation,
      });
    } catch (error) {
      console.error("Error in location details API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch location details",
      });
    }
  },
};

module.exports = escapeRoomLocationController;
