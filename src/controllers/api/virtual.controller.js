const { where } = require("sequelize");
const db = require("../../../models");
const {
  GetRelatedFaqs,
  GetRelatedGoogleReviews,
} = require("../../utils/faqHelper");

const {
  VirtualArchive,
  VirtualArchiveCounterCard,
  VirtualArchiveIconItem,
  VirtualArchiveAddonItem,
  VirtualArchiveGalleryImage,
  VirtualArchivePackageColumn,
  VirtualArchivePackageRow,
  VirtualArchivePackageCell,
  VirtualArchiveVideo,
  VirtualGame,
  Video,
} = db;

const virtualController = {
  /**
   * GET /api/virtual/archive
   */
  getArchive: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const archive = await VirtualArchive.findByPk(1, {
        include: [
          {
            model: VirtualArchiveCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: VirtualArchiveIconItem,
            as: "iconItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: VirtualArchiveAddonItem,
            as: "addonItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: VirtualArchiveGalleryImage,
            as: "galleryImages",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: VirtualArchivePackageColumn,
            as: "packageColumns",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: VirtualArchivePackageRow,
            as: "packageRows",
            separate: true,
            order: [["sort_order", "ASC"]],
            include: [
              {
                model: VirtualArchivePackageCell,
                as: "cells",
              },
            ],
          },

          // ✅ FIXED PART
          {
            model: Video,
            as: "videos",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
            through: {
              attributes: ["custom_title", "sort_order"],
            },
          },

          {
            model: Video,
            as: "bannerVideo",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
        ],
      });

      if (!archive) {
        return res.status(404).json({
          success: false,
          message: "Virtual archive not found",
        });
      }

      const faqs = await GetRelatedFaqs(null, "virtualroom", "archive");
      const googleReviews = await GetRelatedGoogleReviews(
        null,
        "virtualroom",
        "archive",
      );

      // ✅ FORMAT RESPONSE
      const formattedArchive = {
        // Banner
        banner_heading: archive.banner_heading,
        banner_description: archive.banner_description,
        banner_video: archive.bannerVideo
          ? {
              title: archive.bannerVideo.title,
              thumbnail: archive.bannerVideo.thumbnail,
              url: baseUrl + archive.bannerVideo.url,
              duration: archive.bannerVideo.duration,
            }
          : null,

        // Content Section
        content_section: {
          content: archive.content_section_content,
          note: archive.content_section_note,
        },

        // Counters
        counters: {
          heading: archive.counters_heading,
          counter_heading: archive.counters_counter_heading,
          rating: archive.counters_counter_rating,
          items: archive.counterCards.map((item) => ({
            count: item.count,
            description: item.description,
            image: item.image ? baseUrl + item.image : null,
          })),
        },

        // Icons
        icons: {
          heading: archive.icons_heading,
          items: archive.iconItems.map((item) => ({
            heading: item.heading,
            image: item.image ? baseUrl + item.image : null,
          })),
        },

        // Addons
        addons: {
          heading: archive.addons_heading,
          items: archive.addonItems.map((item) => ({
            heading: item.heading,
            link: item.link,
            image: item.image ? baseUrl + item.image : null,
          })),
        },

        // Gallery
        gallery: archive.galleryImages.map((img) => ({
          image: img.image ? baseUrl + img.image : null,
        })),

        // Packages
        packages: {
          heading: archive.packages_heading,

          columns: archive.packageColumns.map((col) => ({
            title: col.title,
            duration: col.duration,
            image: col.image ? baseUrl + col.image : null,
          })),

          rows: archive.packageRows.map((row) => ({
            feature: row.feature,
            cells: row.cells.map((cell) => ({
              column_id: cell.column_id,
              value: cell.value,
            })),
          })),
        },

        // Videos (testimonials)
        videos: (archive.videos || [])
          .sort(
            (a, b) =>
              (a.VirtualArchiveVideo?.sort_order || 0) -
              (b.VirtualArchiveVideo?.sort_order || 0),
          )
          .map((video) => ({
            title: video.VirtualArchiveVideo?.custom_title || video.title,
            thumbnail: video.thumbnail,
            url: baseUrl + video.url,
            duration: video.duration,
          })),

        // Footer
        footer: {
          heading: archive.footer_heading,
          description1: archive.footer_description1,
          description2: archive.footer_description2,
        },
        faqsection: faqs,
        googleReviews: googleReviews,
      };

      res.json({
        success: true,
        data: formattedArchive,
      });
    } catch (error) {
      console.error("Error in virtual archive API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch virtual archive",
      });
    }
  },

  getRooms: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const games = await VirtualGame.findAll({
        where: { isActive: true },
        attributes: ["id", "title", "slug", "banner_image", "success_rate", "capacity"],    
        });

        games.forEach((game) => {
            if (game.banner_image) {
                game.banner_image = baseUrl + game.banner_image;
            }
        });
      res.json({
        success: true,
        data: games,
      });
    } catch (error) {
      console.error("Error in virtual Games API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch virtual Games",
      });
    }
  },
  getRoomDetail: async (req, res) => {
    try {
      const slug = req.params.slug;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const game = await VirtualGame.findOne({
        where: { slug: slug, isActive: true }
      });

      game.banner_image = game.banner_image ? baseUrl + game.banner_image : null;

      const faqs = await GetRelatedFaqs(game.id, `vg:${game.slug}`, "virtualgame");
      const googleReviews = await GetRelatedGoogleReviews(game.id, `vg:${game.slug}`, "virtualgame");

      const formattedGame = {
        id: game.id,
        title: game.title,
        slug: game.slug,
        banner_heading: game.banner_heading,
        banner_description: game.banner_description,
        banner_content: game.banner_content,
        banner_image: game.banner_image ? baseUrl + game.banner_image : null,
        success_rate: game.success_rate,
        capacity: game.capacity,
        cta_label: game.cta_label,
        cta_link: game.cta_link,
        video_trailer: game.video_trailer,
        faqsection: faqs,
        googleReviews: googleReviews,
      };


      res.json({
        success: true,
        data: formattedGame,
      });
    } catch (error) {
      console.error("Error in virtual Games API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch virtual Games",
      });
    }
  },
};

module.exports = virtualController;
