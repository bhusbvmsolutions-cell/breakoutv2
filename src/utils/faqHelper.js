const slugify = require("slugify");
const db = require("../../models");

async function findOrCreatePage(id, name, slug, reference) {
  //   const transaction = await db.sequelize.transaction();

  if (!reference || !name) {
    throw new Error(
      "Page reference and name are required to create a new page",
    );
  }
  if (id) {
    reference = `${reference}:${id}`;
    let page = await db.Page.findOne({ where: { reference } });
    if (page) {
      await page.update({ slug, name });
    } else {
      page = await db.Page.create({ reference, slug, name });
    }
  } else {
    const [page] = await db.Page.findOrCreate({
      where: { reference: reference, slug: slug },
      defaults: { name, slug: slug, reference },
      // transaction,
    });
  }
  return null;
}

async function DeleteFaqPage(id, name, slug, reference) {
  if (!reference || !name) {
    throw new Error(
      "Page reference and name are required to create a new page",
    );
  }
  if (id) {
    reference = `${reference}:${id}`;
    let page = await db.Page.findOne({ where: { reference } });
    if (page) {
      await page.destroy();
    }
  }

  return null;
}

async function GetRelatedFaqs(id, slug, reference) {
  if (!reference || !slug) {
    throw new Error("Page reference and slug are required to get related FAQs");
  }
  if (id) {
    reference = `${reference}:${id}`;
    const page = await db.Page.findOne({
      where: { slug: slug, reference: reference },
      include: [
        {
          model: db.Faq,
          as: "faqs",
          required: false,
          attributes: [
            "question",
            "answer",
            "sort_order",
          ],
          where: { isActive: true }, // optional filter
          order: [["sort_order", "ASC"]],
        },
      ],
    });
    if (!page) {
      return null;
    }
    if (page && page.faqs) {
      page.faqs.sort((a, b) => a.sort_order - b.sort_order);
    }
    return page.faqs;
  } else {
    const page = await db.Page.findOne({
      where: { slug: slug, reference: reference },
      include: [
        {
          model: db.Faq,
          as: "faqs",
          required: false,
          attributes: ["question", "answer", "sort_order"],
          where: { isActive: true }, // optional filter
          order: [["sort_order", "ASC"]],
        },
      ],
    });
    if (!page) {
      return null;
    }
    if (page && page.faqs) {
      page.faqs.sort((a, b) => a.sort_order - b.sort_order);
    }
    return page.faqs;
  }

  return null;
}

async function GetRelatedGoogleReviews(id, slug, reference) {
  if (!reference || !slug) {
    throw new Error("Page reference and slug are required to get related FAQs");
  }
  if (id) {
    reference = `${reference}:${id}`;
    const page = await db.Page.findOne({
      where: { slug: slug, reference: reference },
      include: [
        {
          model: db.GoogleReview,
          as: "googleReviews",
          required: false,
          attributes: [
            "reviewer_name",
            "reviewer_image",
            "rating",
            "review_text",
            "review_heading",
            "review_date",
            "sort_order",
          ],
          where: { isActive: true }, // optional filter
          order: [["sort_order", "ASC"]],
        },
      ],
    });
    if (!page) {
      return null;
    }
    if (page && page.googleReviews) {
      page.googleReviews.sort((a, b) => a.sort_order - b.sort_order);
    }
    return page.googleReviews;
  } else {
    const page = await db.Page.findOne({
      where: { slug: slug, reference: reference },
      include: [
        {
          model: db.GoogleReview,
          as: "googleReviews",
          required: false,
          attributes: [
            "reviewer_name",
            "reviewer_image",
            "rating",
            "review_text",
            "review_heading",
            "review_date",
            "sort_order",
          ],
          where: { isActive: true }, // optional filter
          order: [["sort_order", "ASC"]],
        },
      ],
    });
    if (!page) {
      return null;
    }
    if (page && page.googleReviews) {
      page.googleReviews.sort((a, b) => a.sort_order - b.sort_order);
    }
    return page.googleReviews;
  }

  return null;
}

module.exports = {
  findOrCreatePage,
  DeleteFaqPage,
  GetRelatedFaqs,
  GetRelatedGoogleReviews,
};
