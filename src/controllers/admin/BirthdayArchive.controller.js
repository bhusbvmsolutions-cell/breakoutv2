// controllers/admin/BirthdayArchiveController.js
const db = require("../../../models");
const fs = require("fs");
const path = require("path");

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

const BirthdayArchiveController = {
  async ensureArchive() {
    let archive = await db.BirthdayArchive.findByPk(1);
    if (!archive) {
      archive = await db.BirthdayArchive.create({
        banner_heading: "",
        banner_description: "",
        banner_content: "",
        banner_note: "",
        banner_video_id: null,
        counters_heading: "",
        counters_rating: null,
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
      const archive = await BirthdayArchiveController.ensureArchive();
      const fullArchive = await db.BirthdayArchive.findByPk(archive.id, {
        include: [
          {
            model: db.BirthdayArchiveCounterCard,
            as: "counterCards",
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayArchiveInclusionItem,
            as: "inclusionItems",
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.BirthdayArchiveSliderItem,
            as: "sliderItems",
            order: [["sort_order", "ASC"]],
          },
          {
            model: db.Video,
            as: "videos",
            through: { attributes: ["custom_title"] },
            order: [["sort_order", "ASC"]],
          },
        ],
      });
      const videos = await db.Video.findAll({
        where: { status: "active" },
        order: [["title", "ASC"]],
      });
      // Updated render path
      res.render("admin/party/birthday/archive/index", {
        title: "Birthday Archive",
        archive: fullArchive,
        videos,
      });
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to load form");
      res.redirect("/admin/dashboard");
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const archive = await BirthdayArchiveController.ensureArchive();
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        banner_note: body.banner_note,
        banner_video_id: body.banner_video_id || null, // new
        counters_heading: body.counters_heading,
        counters_rating: body.counters_rating,
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
          ] = `/uploads/party/birthday/${files[field][0].filename}`;
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
                data[fileMap.dest] = `/uploads/party/birthday/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Counter cards (3 fixed items)
      await replaceCollection(
        db.BirthdayArchiveCounterCard,
        body.counter_cards,
        { count: "count", description: "description" },
        { prefix: "counter_cards", field: "image", dest: "image" }
      );

      // Inclusion items (repeater)
      await replaceCollection(
        db.BirthdayArchiveInclusionItem,
        body.inclusion_items,
        { heading: "heading", link: "link" },
        { prefix: "inclusion_items", field: "image", dest: "image" }
      );

      // Slider items (repeater)
      await replaceCollection(
        db.BirthdayArchiveSliderItem,
        body.slider_items,
        { heading: "heading", description: "description" },
        { prefix: "slider_items", field: "image", dest: "image" }
      );

      // Video testimonials
      await db.BirthdayArchiveVideo.destroy({
        where: { archive_id: archive.id },
        transaction,
      });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || "";
          await db.BirthdayArchiveVideo.create(
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

      await transaction.commit();
      req.flash("success", "Birthday archive updated successfully");
      res.redirect("/admin/party/birthday/archive");
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash("error", error.message || "Failed to update archive");
      res.redirect("/admin/party/birthday/archive");
    }
  },
};

module.exports = BirthdayArchiveController;
