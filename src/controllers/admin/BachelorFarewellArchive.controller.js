const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const  {findOrCreatePage}  = require("../../utils/faqHelper");

function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, "../../../");
  if (storedPath.startsWith("/")) {
    return path.join(projectRoot, "public", storedPath);
  }
  return path.join(projectRoot, storedPath);
}

function groupFilesByFieldname(files) {
  const grouped = {};
  if (files && files.length) {
    files.forEach((file) => {
      if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
      grouped[file.fieldname].push(file);
    });
  }
  return grouped;
}

const BachelorFarewellArchiveController = {
  async ensureArchive(type) {
    let archive = await db.BachelorFarewellArchive.findOne({ where: { type } });
    if (!archive) {
      archive = await db.BachelorFarewellArchive.create({
        type,
        banner_heading: "",
        banner_description: "",
        counters_heading: "",
        counters_content: "",
        banner_video_id: null,
        counters_note: "",
        counters_counter_heading: "",
        counters_rating: null,
        image_card_heading: "",
        party_inclusions_heading: "",
        party_inclusions_note: "",
        slider_heading: "",
        slider_description: "",
        footer_heading: "",
        footer_content: "",
      });
    }
    return archive;
  },

  index: async (req, res) => {
    try {
      const type = req.params.type; // 'bachelor' or 'farewell'
      const archive = await BachelorFarewellArchiveController.ensureArchive(
        type
      );
      const fullArchive = await db.BachelorFarewellArchive.findByPk(
        archive.id,
        {
          include: [
            {
              model: db.BachelorFarewellCounterCard,
              as: "counterCards",
              order: [["sort_order", "ASC"]],
            },
            {
              model: db.BachelorFarewellImageCard,
              as: "imageCards",
              order: [["sort_order", "ASC"]],
            },
            {
              model: db.BachelorFarewellInclusionItem,
              as: "inclusionItems",
              order: [["sort_order", "ASC"]],
            },
            {
              model: db.BachelorFarewellSliderItem,
              as: "sliderItems",
              order: [["sort_order", "ASC"]],
            },
            {
              model: db.BachelorFarewellPackageColumn,
              as: "packageColumns",
              order: [["sort_order", "ASC"]],
            },
            {
              model: db.BachelorFarewellPackageRow,
              as: "packageRows",
              order: [["sort_order", "ASC"]],
            },
            {
              model: db.Video,
              as: "videos",
              through: { attributes: ["custom_title"] },
              order: [["sort_order", "ASC"]],
            },
          ],
        }
      );
      const videos = await db.Video.findAll({
        where: { status: "active" },
        order: [["title", "ASC"]],
      });
      res.render("admin/party/bachelorfarewell/index", {
        title: type === "bachelor" ? "Bachelor Archive" : "Farewell Archive",
        archive: fullArchive,
        videos,
        type,
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load form");
      res.redirect("/admin/dashboard");
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    const type = req.params.type;
    if (!type || (type !== "bachelor" && type !== "farewell")) {
      req.flash("error", "Invalid archive type");
      return res.redirect("/admin/party");
    }
    try {
      const archive = await BachelorFarewellArchiveController.ensureArchive(
        type
      );
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_video_id: body.banner_video_id || null,
        counters_heading: body.counters_heading,
        counters_content: body.counters_content,
        counters_note: body.counters_note,
        counters_counter_heading: body.counters_counter_heading,
        counters_rating: body.counters_rating,
        image_card_heading: body.image_card_heading,
        party_inclusions_heading: body.party_inclusions_heading,
        party_inclusions_note: body.party_inclusions_note,
        slider_heading: body.slider_heading,
        slider_description: body.slider_description,
        footer_heading: body.footer_heading,
        footer_content: body.footer_content,
        isActive: body.isActive === "on",
      };

      // Images 1,2,3
      const imageFields = ["image1", "image2", "image3"];
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          if (archive[field]) {
            const oldPath = getImageAbsolutePath(archive[field]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[
            field
          ] = `/uploads/party/${type}/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[field] = body[field];
        }
      }

      await archive.update(updateData, { transaction });

      // Helper to replace child collections
      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { archive_id: archive.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { archive_id: archive.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/party/${type}/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Counter cards (3 fixed)
      await replaceCollection(
        db.BachelorFarewellCounterCard,
        body.counter_cards,
        { count: "count", description: "description" },
        { prefix: "counter_cards", field: "image", dest: "image" }
      );

      // Image cards (repeater)
      await replaceCollection(
        db.BachelorFarewellImageCard,
        body.image_cards,
        { heading: "heading", link: "link" },
        { prefix: "image_cards", field: "image", dest: "image" }
      );

      // Inclusion items (repeater)
      await replaceCollection(
        db.BachelorFarewellInclusionItem,
        body.inclusion_items,
        { heading: "heading", link: "link" },
        { prefix: "inclusion_items", field: "image", dest: "image" }
      );

      // Slider items (repeater)
      await replaceCollection(
        db.BachelorFarewellSliderItem,
        body.slider_items,
        { heading: "heading", description: "description" },
        { prefix: "slider_items", field: "image", dest: "image" }
      );

      // Pricing columns
      await db.BachelorFarewellPackageColumn.destroy({
        where: { archive_id: archive.id },
        transaction,
      });
      const createdColumns = [];
      if (body.package_columns && Array.isArray(body.package_columns)) {
        for (let i = 0; i < body.package_columns.length; i++) {
          const col = body.package_columns[i];
          const imageFile = files[`package_columns[${i}][image]`]?.[0];
          const column = await db.BachelorFarewellPackageColumn.create(
            {
              archive_id: archive.id,
              sort_order: i,
              title: col.title,
              duration: col.duration,
              image: imageFile
                ? `/uploads/party/${type}/${imageFile.filename}`
                : col.image || null,
            },
            { transaction }
          );
          createdColumns.push(column);
        }
      }

      // Pricing rows & cells
      await db.BachelorFarewellPackageRow.destroy({
        where: { archive_id: archive.id },
        transaction,
      });
      if (body.package_rows && Array.isArray(body.package_rows)) {
        for (let i = 0; i < body.package_rows.length; i++) {
          const row = body.package_rows[i];
          const dbRow = await db.BachelorFarewellPackageRow.create(
            {
              archive_id: archive.id,
              sort_order: i,
              feature: row.feature,
            },
            { transaction }
          );

          for (let j = 0; j < createdColumns.length; j++) {
            const cellValue = row[`col${j}`] || "No";
            await db.BachelorFarewellPackageCell.create(
              {
                row_id: dbRow.id,
                column_id: createdColumns[j].id,
                value: cellValue,
              },
              { transaction }
            );
          }
        }
      }

      // Video testimonials
      await db.BachelorFarewellVideo.destroy({
        where: { archive_id: archive.id },
        transaction,
      });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || "";
          await db.BachelorFarewellVideo.create(
            {
              archive_id: archive.id,
              video_id: videoId,
              custom_title: customTitle,
              sort_order: i,
            },
            { transaction }
          );
        }
      }
      if (type === "bachelor") {
        await findOrCreatePage(null, "Bachelor Archive", "bachelor", "archive");
      } else if (type === "farewell") {
        await findOrCreatePage(null, "Farewell Archive", "farewell", "archive");
      }

      await transaction.commit();
      req.flash(
        "success",
        `${
          type === "bachelor" ? "Bachelor" : "Farewell"
        } archive updated successfully`
      );
      res.redirect(`/admin/party/${req.params.type}/archive`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash("error", error.message || "Failed to update archive");
      res.redirect(`/admin/party/${req.body.type}/archive`);
    }
  },
};

module.exports = BachelorFarewellArchiveController;
