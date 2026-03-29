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






module.exports = { findOrCreatePage, DeleteFaqPage };
