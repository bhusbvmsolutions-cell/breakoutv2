const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const { GetRelatedFaqs, GetRelatedGoogleReviews } = require("../../utils/faqHelper");

const HomePageController = {
 
  index: async (req, res) => {
    try {
    //   const home = await db.HomePageController.ensureHomePage();
      const fullHome = await db.HomePage.findByPk(1, {
        include: [
          {
            model: db.HomePageCounterCard,
            as: "counterCards",
            order: [["sort_order", "ASC"]],
          },
        ],
      });

      if (!fullHome) {
        return res
          .status(404)
          .json({ success: false, message: "Home page not found" });
      }

      // Build full URLs for images
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const imageFields = ["banner_image1", "banner_image2", "banner_image3"];
      const images = {};
      imageFields.forEach((field) => {
        if (fullHome[field]) {
          images[field] = baseUrl + fullHome[field];
        } else {
          images[field] = null;
        }
      });

      // Process counter cards to include full image URLs
      const counterCards = (fullHome.counterCards || []).map((card) => ({
        id: card.id,
        count: card.count,
        description: card.description,
        image: card.image ? baseUrl + card.image : null,
        sort_order: card.sort_order,
      }));

      const faqs = await GetRelatedFaqs(null, "home-page", "archive");
      const googleReviews = await GetRelatedGoogleReviews(null, "home-page", "archive");

      // Build response object
      const responseData = {
        success: true,
        data: {
          banner_heading: fullHome.banner_heading,
          banner_description: fullHome.banner_description,
          banner_heading1: fullHome.banner_heading1,
          banner_heading2: fullHome.banner_heading2,
          banner_heading3: fullHome.banner_heading3,
          banner_content: fullHome.banner_content,
          banner_note: fullHome.banner_note,
          counters_heading: fullHome.counters_heading,
          counters_rating: fullHome.counters_rating,
          footer_heading: fullHome.footer_heading,
          footer_description1: fullHome.footer_description1,
          footer_description2: fullHome.footer_description2,
          isActive: fullHome.isActive,
          ...images,
          counterCards,
          faqsection: faqs,
          googleReviews: googleReviews,
        },
      };

      res.status(200).json(responseData);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch home page data" });
    }
  },
};

module.exports = HomePageController;
