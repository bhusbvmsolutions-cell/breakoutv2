const db = require("../../../models");

const {
  EscapeRoomArchive,
  EscapeRoomArchiveIcon,
  EscapeRoomArchiveCounter,
  EscapeRoomArchiveImage,
  EscapeRoomArchiveVideo,
  Video,
} = db;

const {
  GetRelatedGoogleReviews,
  GetRelatedFaqs,
} = require("../../utils/faqHelper");

const escapeRoomArchiveController = {
  /**
   * Get escape room archive data
   * GET /api/escaperoomarchive
   */
  getArchive: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const archive = await EscapeRoomArchive.findByPk(1, {
        include: [
          {
            model: Video,
            as: "bannerVideo",
          },
          {
            model: EscapeRoomArchiveIcon,
            as: "icons",
            order: [["createdAt", "ASC"]],
          },
          {
            model: EscapeRoomArchiveCounter,
            as: "counters",
            order: [["createdAt", "ASC"]],
          },
          {
            model: EscapeRoomArchiveImage,
            as: "images",
            order: [["createdAt", "ASC"]],
          },
          {
            model: EscapeRoomArchiveVideo,
            as: "videos",
            include: [
              {
                model: Video,
                as: "videoDetails",
              },
            ],
            separate: true,
            order: [["createdAt", "ASC"]],
          },
        ],
      });

      if (!archive) {
        return res.status(404).json({
          success: false,
          message: "Archive not found",
        });
      }

      const googleReviews = await GetRelatedGoogleReviews(
        null,
        "escaperoom",
        "archive",
      );
      const faqs = await GetRelatedFaqs(null, "escaperoom", "archive");

      // Format response
      const formattedArchive = {
        id: archive.id,
        banner_heading: archive.banner_heading,
        banner_description: archive.banner_description,
        banner_video: archive.bannerVideo?.url
    ? baseUrl + archive.bannerVideo.url
    : null,
        banner_cta_label1: archive.banner_cta_label1,
        banner_cta_link1: archive.banner_cta_link1,
        banner_cta_label2: archive.banner_cta_label2,
        banner_cta_link2: archive.banner_cta_link2,
        icon_heading: archive.icon_heading,
        icon_description: archive.icon_description,
        counter_heading: archive.counter_heading,
        counter_rating: archive.counter_rating,
        footer_heading: archive.footer_heading,
        footer_description1: archive.footer_description1,
        footer_description2: archive.footer_description2,
        isActive: archive.isActive,
        icons: archive.icons.map((icon) => ({
          id: icon.id,
          heading: icon.heading,
          image: icon.image ? baseUrl + icon.image : null,
        })),
        counters: archive.counters.map((counter) => ({
          id: counter.id,
          count: counter.count,
          description: counter.description,
          image: counter.image ? baseUrl + counter.image : null,
        })),
        gallery: archive.images.map((image) => ({
          id: image.id,
          image: image.image ? baseUrl + image.image : null,
        })),
        testimonialVideos: archive.videos.map((video) => ({
          id: video.id,
          title: video.title || video.videoDetails?.title,
          video_id: video.video_id,
          thumbnail: video.videoDetails?.thumbnail,
          url: baseUrl + video.videoDetails?.url,
          duration: video.videoDetails?.duration,
        })),
        faqsection: faqs,
        googleReviews: googleReviews,
      };

      res.json({
        success: true,
        data: formattedArchive,
      });
    } catch (error) {
      console.error("Error in archive API:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch archive data",
      });
    }
  },
};

module.exports = escapeRoomArchiveController;
