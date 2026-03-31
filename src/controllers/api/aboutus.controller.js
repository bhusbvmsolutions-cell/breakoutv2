const db = require("../../../models");

const AboutUsController = {
  // 🔹 Ensure About Us exists
  async ensureAboutUs() {
    let about = await db.AboutUs.findByPk(1);

    if (!about) {
      about = await db.AboutUs.create({
        banner_heading: "",
        banner_description: "",
        vision_heading1: "",
        vision_description1: "",
        vision_heading2: "",
        vision_description2: "",
        counters_heading: "",
        counters_rating: null,
        content_heading: "",
        content_description: "",
        cards_heading: "",
        our_story_heading: "",
        our_story_description: "",
        founders_heading: "Our <span>Founder</span>",
        leaders_heading: "Our <span>Leaders</span>",
        advisors_heading: "Our <span>Advisors</span>",
        isActive: true,
      });
    }

    return about;
  },

  // 🔹 PUBLIC API
  getAboutUs: async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const about = await AboutUsController.ensureAboutUs();

      const data = await db.AboutUs.findByPk(about.id, {
        include: [
          {
            model: db.AboutUsCounterCard,
            as: "counterCards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.AboutUsCard,
            as: "cards",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.AboutUsLeader,
            as: "leaders",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.AboutUsAdvisor,
            as: "advisors",
            separate: true,
            order: [["sort_order", "ASC"]],
          },
        ],
      });

      if (!data || !data.isActive) {
        return res.status(404).json({
          success: false,
          message: "About Us not found",
        });
      }

      const img = (val) => (val ? baseUrl + val : null);

      // ✅ FORMAT RESPONSE
      const formatted = {
        banner_heading: data.banner_heading,
        banner_description: data.banner_description,
        banner_image: img(data.banner_image),

        vision: {
          heading1: data.vision_heading1,
          description1: data.vision_description1,
          heading2: data.vision_heading2,
          description2: data.vision_description2,
          image: img(data.vision_image),
        },

        counters_heading: data.counters_heading,
        counters_rating: data.counters_rating,

        content: {
          heading: data.content_heading,
          description: data.content_description,
        },

        cards_heading: data.cards_heading,

        our_story: {
          heading: data.our_story_heading,
          description: data.our_story_description,
          image: img(data.our_story_image),
        },

        founder: {
          heading: data.founders_heading,
          name: data.founders_name,
          designation: data.founders_designation,
          description: data.founders_description,
          image: img(data.founders_image),
          social: {
            whatsapp: data.founders_whatsapp,
            instagram: data.founders_instagram,
            linkedin: data.founders_linkedin,
            twitter: data.founders_twitter,
            gmail: data.founders_gmail,
            link: data.founders_link,
          },
        },

        leaders_heading: data.leaders_heading,
        advisors_heading: data.advisors_heading,

        // ✅ Counter Cards
        counter_cards: (data.counterCards || []).map((item) => ({
          count: item.count,
          description: item.description,
          image: img(item.image),
        })),

        // ✅ Cards
        cards: (data.cards || []).map((item) => ({
          heading: item.heading,
          description: item.description,
          image: img(item.image),
        })),

        // ✅ Leaders
        leaders: (data.leaders || []).map((item) => ({
          name: item.name,
          designation: item.designation,
          description: item.description,
          image: img(item.image),
          social: {
            whatsapp: item.whatsapp,
            instagram: item.instagram,
            linkedin: item.linkedin,
            twitter: item.twitter,
            gmail: item.gmail,
            link: item.link,
          },
        })),

        // ✅ Advisors
        advisors: (data.advisors || []).map((item) => ({
          name: item.name,
          designation: item.designation,
          description: item.description,
          image: img(item.image),
          social: {
            whatsapp: item.whatsapp,
            instagram: item.instagram,
            linkedin: item.linkedin,
            twitter: item.twitter,
            gmail: item.gmail,
            link: item.link,
          },
        })),
      };

      return res.json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      console.error("Error fetching About Us:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch About Us",
      });
    }
  },
};

module.exports = AboutUsController;