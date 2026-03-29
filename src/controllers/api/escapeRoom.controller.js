const db = require("../../../models");
const { Op } = require("sequelize");
const {
  GetRelatedGoogleReviews,
  GetRelatedFaqs,
} = require("../../utils/faqHelper");

const {
  EscapeRoom,
  EscapeRoomImage,
  EscapeRoomPricingCard,
  EscapeRoomLocationMapping,
  EscapeRoomLocation,
} = db;

const escapeRoomController = {
  list: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const rooms = await EscapeRoom.findAll({
        where: { isActive: true },
        order: [["createdAt", "DESC"]],
        attributes: ["id", "title", "slug", "banner_image"],
      });

      const formattedRooms = rooms.map((room) => ({
        id: room.id,
        title: room.title,
        slug: room.slug,
        banner_image: room.banner_image ? baseUrl + room.banner_image : null,
      }));
      res.json({
        success: true,
        data: formattedRooms,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  details: async (req, res) => {
    try {
      const { slug } = req.params;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // Find by slug or ID
      const room = await EscapeRoom.findOne({
        where: {
          slug: slug,
        },
        include: [
          {
            model: EscapeRoomLocation,
            as: "locations",
            through: { where: { isActive: true } },
            required: false,
            attributes: [
              "id",
              "title",
              "slug",
              "location_city",
              "location_address",
              "location_timings",
              "location_map_url",
            ],
          },
          {
            model: EscapeRoomImage,
            as: "images",
            where: { isActive: true },
            required: false,
            order: [["sort_order", "ASC"]],
            attributes: ["image_url", "sort_order"],
          },
          {
            model: EscapeRoomPricingCard,
            as: "pricingCards",
            where: { isActive: true },
            required: false,
            order: [["sort_order", "ASC"]],
            attributes: [
              "id",
              "day_range",
              "price_2_3_players",
              "price_4_6_players",
            ],
          },
        ],
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Escape room not found",
        });
      }

      const faqs = await GetRelatedFaqs(room.id, room.slug, "escaperoom");
      const googleReviews = await GetRelatedGoogleReviews(
        room.id,
        room.slug,
        "escaperoom",
      );

      // Format response with full details
      const formattedRoom = {
        id: room.id,
        title: room.title,
        slug: room.slug,
        tag: room.tag ? JSON.parse(room.tag) : [],
        banner_heading: room.banner_heading,
        banner_description: room.banner_description,
        banner_image: room.banner_image ? baseUrl + room.banner_image : null,
        banner_success_rate: room.banner_success_rate,
        banner_age_group: room.banner_age_group,
        banner_character: room.banner_character,
        banner_min_team: room.banner_min_team,
        banner_scare_factor: room.banner_scare_factor,
        banner_duration: room.banner_duration,
        banner_cta_label: room.banner_cta_label,
        banner_cta_link: room.banner_cta_link,
        banner_important_note: room.banner_important_note,
        banner_video_trailer: room.banner_video_trailer,
        pricing_note: room.pricing_note,
        pricing_heading: room.pricing_heading,
        isActive: room.isActive,
        locations: room.locations.map((loc) => ({
          id: loc.id,
          title: loc.title,
          slug: loc.slug,
          city: loc.location_city,
          address: loc.location_address,
          timings: loc.location_timings,
          map_url: loc.location_map_url,
        })),
        gallery: room.images.map((img) => ({
          id: img.id,
          url: baseUrl + img.image_url,
          sort_order: img.sort_order,
        })),
        pricing: room.pricingCards.map((card) => ({
          id: card.id,
          day_range: card.day_range,
          price_2_3_players: card.price_2_3_players,
          price_4_6_players: card.price_4_6_players,
        })),
        faqsection: faqs,
        googleReviews: googleReviews,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      };

      res.json({
        success: true,
        data: formattedRoom,
      });
    } catch (error) {
      console.error("Error in escape room details API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch escape room details",
      });
    }
  },
};

module.exports = escapeRoomController;
