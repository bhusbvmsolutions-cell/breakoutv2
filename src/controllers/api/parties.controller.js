const { where } = require("sequelize");
const db = require("../../../models");
const {
  GetRelatedFaqs,
  GetRelatedGoogleReviews,
} = require("../../utils/faqHelper");

const partiesController = {
  getPartyArchive: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const archive = await db.PartyArchive.findByPk(1, {
        include: [
          {
            model: db.PartyArchiveCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
            attributes: ["id", "image", "count", "description", "sort_order"],
          },
        ],
      });

      if (!archive) {
        return res.status(404).json({
          success: false,
          message: "Party archive not found",
        });
      }

      const faqs = await GetRelatedFaqs(null, "party", "archive");
      const GoogleReviews = await GetRelatedGoogleReviews(
        null,
        "party",
        "archive",
      );
      // ✅ Format response
      const formattedArchive = {
        banner: {
          heading: archive.banner_heading,
          description: archive.banner_description,
          birthday_image: archive.banner_birthday_image
            ? baseUrl + archive.banner_birthday_image
            : null,
          bachelor_image: archive.banner_bachelor_image
            ? baseUrl + archive.banner_bachelor_image
            : null,
          farewell_image: archive.banner_farewell_image
            ? baseUrl + archive.banner_farewell_image
            : null,
          content: archive.banner_content,
          note: archive.banner_note,
        },

        // Counters Section
        counters: {
          heading: archive.counters_heading,
          rating: archive.counters_rating,
          items: (archive.counterCards || []).map((item) => ({
            image: item.image ? baseUrl + item.image : null,
            count: item.count,
            description: item.description,
          })),
        },

        // Footer Section
        footer: {
          heading: archive.footer_heading,
          description1: archive.footer_description1,
          description2: archive.footer_description2,
        },
        faqsection: faqs,
        googleReviews: GoogleReviews,
      };

      res.json({
        success: true,
        data: formattedArchive,
      });
    } catch (error) {
      console.error("Error fetching party archive:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch party archive",
      });
    }
  },

  getBirthdayArchive: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const archive = await db.BirthdayArchive.findByPk(1, {
        include: [
          {
            model: db.BirthdayArchiveCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayArchiveInclusionItem,
            as: "inclusionItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayArchiveSliderItem,
            as: "sliderItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.Video,
            as: "videos",
            through: {
              attributes: ["custom_title", "sort_order"],
            },
          },
          {
            model: db.Video,
            as: "bannerVideo",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
        ],
      });

      if (!archive) {
        return res.status(404).json({
          success: false,
          message: "Birthday archive not found",
        });
      }

      const formatted = {
        banner_heading: archive.banner_heading,
        banner_description: archive.banner_description,
        banner_content: archive.banner_content,
        banner_note: archive.banner_note,

        banner_video: archive.bannerVideo
          ? {
              id: archive.bannerVideo.id,
              title: archive.bannerVideo.title,
              thumbnail: archive.bannerVideo.thumbnail,
              url: archive.bannerVideo.url,
              duration: archive.bannerVideo.duration,
            }
          : null,

        counters_heading: archive.counters_heading,
        counters_rating: archive.counters_rating,

        party_inclusions_heading: archive.party_inclusions_heading,
        party_inclusions_note: archive.party_inclusions_note,

        slider_heading: archive.slider_heading,
        slider_description: archive.slider_description,

        image1: archive.image1 ? baseUrl + archive.image1 : null,
        image2: archive.image2 ? baseUrl + archive.image2 : null,
        image3: archive.image3 ? baseUrl + archive.image3 : null,

        footer_heading: archive.footer_heading,
        footer_content: archive.footer_content,

        // ✅ Counter Cards
        counter_cards: archive.counterCards.map((item) => ({
          count: item.count,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Inclusion Items
        inclusion_items: archive.inclusionItems.map((item) => ({
          heading: item.heading,
          link: item.link,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Slider Items
        slider_items: archive.sliderItems.map((item) => ({
          heading: item.heading,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Videos (with custom title support)
        videos: archive.videos.map((video) => ({
          title: video.BirthdayArchiveVideo?.custom_title || video.title,
          thumbnail: video.thumbnail,
          url: video.url,
          duration: video.duration,
        })),
        faqsection: await GetRelatedFaqs(null, "birthday", "archive"),
        googleReviews: await GetRelatedGoogleReviews(
          null,
          "birthday",
          "archive",
        ),
      };

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching birthday archive:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch birthday archive",
      });
    }
  },
  getBachelorArchive: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const archive = await db.BachelorFarewellArchive.findOne({
        where: { type: "bachelor", isActive: true },
        include: [
          {
            model: db.BachelorFarewellCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellImageCard,
            as: "imageCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellInclusionItem,
            as: "inclusionItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellSliderItem,
            as: "sliderItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellPackageColumn,
            as: "packageColumns",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellPackageRow,
            as: "packageRows",
            separate: true,
            order: [["sort_order", "ASC"]],
            include: [
              {
                model: db.BachelorFarewellPackageCell,
                as: "cells",
              },
            ],
          },
          {
            model: db.Video,
            as: "videos",
            through: {
              attributes: ["custom_title", "sort_order"],
            },
          },
          {
            model: db.Video,
            as: "bannerVideo",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
        ],
      });

      if (!archive) {
        return res.status(404).json({
          success: false,
          message: "Bachelor archive not found",
        });
      }

      const formatted = {
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

        counters_heading: archive.counters_heading,
        counters_content: archive.counters_content,
        counters_note: archive.counters_note,
        counters_counter_heading: archive.counters_counter_heading,
        counters_rating: archive.counters_rating,

        image_card_heading: archive.image_card_heading,

        party_inclusions_heading: archive.party_inclusions_heading,
        party_inclusions_note: archive.party_inclusions_note,

        slider_heading: archive.slider_heading,
        slider_description: archive.slider_description,

        image1: archive.image1 ? baseUrl + archive.image1 : null,
        image2: archive.image2 ? baseUrl + archive.image2 : null,
        image3: archive.image3 ? baseUrl + archive.image3 : null,

        footer_heading: archive.footer_heading,
        footer_content: archive.footer_content,

        // ✅ Counter Cards
        counter_cards: archive.counterCards.map((item) => ({
          count: item.count,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Image Cards
        image_cards: archive.imageCards.map((item) => ({
          heading: item.heading,
          link: item.link,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Inclusion Items
        inclusion_items: archive.inclusionItems.map((item) => ({
          heading: item.heading,
          link: item.link,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Slider Items
        slider_items: archive.sliderItems.map((item) => ({
          heading: item.heading,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Package Table
        package: {
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

        // ✅ Videos
        videos: archive.videos.map((video) => ({
          title: video.BachelorFarewellVideo?.custom_title || video.title,
          thumbnail: video.thumbnail,
          url: baseUrl + video.url,
          duration: video.duration,
        })),

        faqsection: await GetRelatedFaqs(null, "bachelor", "archive"),
        googleReviews: await GetRelatedGoogleReviews(
          null,
          "bachelor",
          "archive",
        ),
      };

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching bachelor archive:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch bachelor archive",
      });
    }
  },

  getFarewellArchive: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const archive = await db.BachelorFarewellArchive.findOne({
        where: { type: "farewell", isActive: true },
        include: [
          {
            model: db.BachelorFarewellCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellImageCard,
            as: "imageCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellInclusionItem,
            as: "inclusionItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellSliderItem,
            as: "sliderItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellPackageColumn,
            as: "packageColumns",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BachelorFarewellPackageRow,
            as: "packageRows",
            separate: true,
            order: [["sort_order", "ASC"]],
            include: [
              {
                model: db.BachelorFarewellPackageCell,
                as: "cells",
              },
            ],
          },
          {
            model: db.Video,
            as: "videos",
            through: {
              attributes: ["custom_title", "sort_order"],
            },
          },
          {
            model: db.Video,
            as: "bannerVideo",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
        ],
      });

      if (!archive) {
        return res.status(404).json({
          success: false,
          message: "Farewell archive not found",
        });
      }

      // 👉 SAME FORMAT (reuse logic)
      const formatted = {
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

        counters_heading: archive.counters_heading,
        counters_content: archive.counters_content,
        counters_note: archive.counters_note,
        counters_counter_heading: archive.counters_counter_heading,
        counters_rating: archive.counters_rating,

        image_card_heading: archive.image_card_heading,

        party_inclusions_heading: archive.party_inclusions_heading,
        party_inclusions_note: archive.party_inclusions_note,

        slider_heading: archive.slider_heading,
        slider_description: archive.slider_description,

        image1: archive.image1 ? baseUrl + archive.image1 : null,
        image2: archive.image2 ? baseUrl + archive.image2 : null,
        image3: archive.image3 ? baseUrl + archive.image3 : null,

        footer_heading: archive.footer_heading,
        footer_content: archive.footer_content,

        counter_cards: archive.counterCards.map((item) => ({
          count: item.count,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        image_cards: archive.imageCards.map((item) => ({
          heading: item.heading,
          link: item.link,
          image: item.image ? baseUrl + item.image : null,
        })),

        inclusion_items: archive.inclusionItems.map((item) => ({
          heading: item.heading,
          link: item.link,
          image: item.image ? baseUrl + item.image : null,
        })),

        slider_items: archive.sliderItems.map((item) => ({
          heading: item.heading,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        package: {
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

        videos: archive.videos.map((video) => ({
          title: video.BachelorFarewellVideo?.custom_title || video.title,
          thumbnail: video.thumbnail,
          url: baseUrl + video.url,
          duration: video.duration,
        })),

        faqsection: await GetRelatedFaqs(null, "farewell", "archive"),
        googleReviews: await GetRelatedGoogleReviews(
          null,
          "farewell",
          "archive",
        ),
      };

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching farewell archive:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch farewell archive",
      });
    }
  },
  getBirthDayPageList: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const pages = await db.BirthdayInnerPage.findAll({
        where: { isActive: true },
        attributes: ["title", "slug", "image"],
      });

      pages.forEach((page) => {
        if (page.image) {
          page.image = baseUrl + page.image;
        }
      });

      res.json({
        success: true,
        data: pages,
      });
    } catch (error) {
      console.error("Error fetching birthday pages list:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch birthday pages list",
      });
    }
  },

  getBirthDayPageDetails: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const { slug } = req.params;

      const page = await db.BirthdayInnerPage.findOne({
        where: { slug, isActive: true },
        include: [
          {
            model: db.BirthdayInnerCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayInnerImageCard,
            as: "imageCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayInnerInclusionItem,
            as: "inclusionItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayInnerSliderItem,
            as: "sliderItems",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayInnerPackageColumn,
            as: "packageColumns",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayInnerPackageRow,
            as: "packageRows",
            separate: true,
            order: [["sort_order", "ASC"]],
            include: [
              {
                model: db.BirthdayInnerPackageCell,
                as: "cells",
              },
            ],
          },
          {
            model: db.Video,
            as: "videos",
            through: {
              attributes: ["custom_title", "sort_order"],
            },
          },
          {
            model: db.Video,
            as: "bannerVideo",
            attributes: ["id", "title", "thumbnail", "url", "duration"],
          },
        ],
      });

      if (!page) {
        return res.status(404).json({
          success: false,
          message: "Birthday page not found",
        });
      }

      // ✅ FORMATTED RESPONSE
      const formatted = {
        title: page.title,
        slug: page.slug,

        image: page.image ? baseUrl + page.image : null,

        banner_heading: page.banner_heading,
        banner_description: page.banner_description,

        banner_video: page.bannerVideo
          ? {
              id: page.bannerVideo.id,
              title: page.bannerVideo.title,
              thumbnail: page.bannerVideo.thumbnail
                ? baseUrl + page.bannerVideo.thumbnail
                : null,
              url: page.bannerVideo.url,
              duration: page.bannerVideo.duration,
            }
          : null,

        counters_heading: page.counters_heading,
        counters_content: page.counters_content,
        counters_note: page.counters_note,
        counters_counter_heading: page.counters_counter_heading,
        counters_rating: page.counters_rating,

        image_card_heading: page.image_card_heading,

        party_inclusions_heading: page.party_inclusions_heading,
        party_inclusions_note: page.party_inclusions_note,

        slider_heading: page.slider_heading,
        slider_description: page.slider_description,

        image1: page.image1 ? baseUrl + page.image1 : null,
        image2: page.image2 ? baseUrl + page.image2 : null,
        image3: page.image3 ? baseUrl + page.image3 : null,

        footer_heading: page.footer_heading,
        footer_content: page.footer_content,

        // ✅ Counter Cards
        counter_cards: page.counterCards.map((item) => ({
          count: item.count,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Image Cards
        image_cards: page.imageCards.map((item) => ({
          heading: item.heading,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Inclusion Items
        inclusion_items: page.inclusionItems.map((item) => ({
          heading: item.heading,
          link: item.link,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Slider Items
        slider_items: page.sliderItems.map((item) => ({
          heading: item.heading,
          description: item.description,
          image: item.image ? baseUrl + item.image : null,
        })),

        // ✅ Package Table
        package: {
          columns: page.packageColumns.map((col) => ({
            title: col.title,
            duration: col.duration,
            image: col.image ? baseUrl + col.image : null,
          })),
          rows: page.packageRows.map((row) => ({
            feature: row.feature,
            cells: row.cells.map((cell) => ({
              column_id: cell.column_id,
              value: cell.value,
            })),
          })),
        },

        // ✅ Videos
        videos: page.videos.map((video) => ({
          title: video.BirthdayInnerVideo?.custom_title || video.title,
          thumbnail: video.thumbnail ? baseUrl + video.thumbnail : null,
          url: baseUrl + video.url,
          duration: video.duration,
        })),

        // ✅ Extras
        faqsection: await GetRelatedFaqs(page.id, page.slug, "birthdayinner"),
        googleReviews: await GetRelatedGoogleReviews(page.id, page.slug, "birthdayinner"),
      };    

      res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching birthday page details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch birthday page details",
      });
    }
  },
};

module.exports = partiesController;
