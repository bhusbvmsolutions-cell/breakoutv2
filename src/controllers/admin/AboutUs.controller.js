const db = require("../../../models");
const fs = require("fs");
const path = require("path");

function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, '../../../');
  if (storedPath.startsWith('/')) {
    return path.join(projectRoot, 'public', storedPath);
  }
  return path.join(projectRoot, storedPath);
}

function groupFilesByFieldname(files) {
  const grouped = {};
  if (files && files.length) {
    files.forEach(file => {
      if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
      grouped[file.fieldname].push(file);
    });
  }
  return grouped;
}

const AboutUsController = {
  async ensureAboutUs() {
    let about = await db.AboutUs.findByPk(1);
    if (!about) {
      about = await db.AboutUs.create({
        banner_heading: '',
        banner_description: '',
        vision_heading1: '',
        vision_description1: '',
        vision_heading2: '',
        vision_description2: '',
        counters_heading: '',
        counters_rating: null,
        content_heading: '',
        content_description: '',
        cards_heading: '',
        our_story_heading: '',
        our_story_description: '',
        founders_heading: 'Our <span>Founder</span>',
        leaders_heading: 'Our <span>Leaders</span>',
        advisors_heading: 'Our <span>Advisors</span>',
      });
    }
    return about;
  },

  index: async (req, res) => {
    try {
      const about = await AboutUsController.ensureAboutUs();
      const fullAbout = await db.AboutUs.findByPk(about.id, {
        include: [
          { model: db.AboutUsCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] },
          { model: db.AboutUsCard, as: 'cards', order: [['sort_order', 'ASC']] },
          { model: db.AboutUsLeader, as: 'leaders', order: [['sort_order', 'ASC']] },
          { model: db.AboutUsAdvisor, as: 'advisors', order: [['sort_order', 'ASC']] },
        ],
      });
      res.render('admin/about/index', {
        title: 'About Us Page',
        about: fullAbout,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load form');
      res.redirect('/admin/dashboard');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const about = await AboutUsController.ensureAboutUs();
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        vision_heading1: body.vision_heading1,
        vision_description1: body.vision_description1,
        vision_heading2: body.vision_heading2,
        vision_description2: body.vision_description2,
        counters_heading: body.counters_heading,
        counters_rating: body.counters_rating,
        content_heading: body.content_heading,
        content_description: body.content_description,
        cards_heading: body.cards_heading,
        our_story_heading: body.our_story_heading,
        our_story_description: body.our_story_description,
        founders_heading: body.founders_heading,
        founders_name: body.founders_name,
        founders_designation: body.founders_designation,
        founders_description: body.founders_description,
        founders_whatsapp: body.founders_whatsapp,
        founders_instagram: body.founders_instagram,
        founders_linkedin: body.founders_linkedin,
        founders_twitter: body.founders_twitter,
        founders_gmail: body.founders_gmail,
        founders_link: body.founders_link,
        leaders_heading: body.leaders_heading,
        advisors_heading: body.advisors_heading,
        isActive: body.isActive === 'on',
      };

      // Handle image uploads
      const imageFields = [
        'banner_image', 'vision_image', 'our_story_image', 'founders_image'
      ];
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          if (about[field]) {
            const oldPath = getImageAbsolutePath(about[field]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[field] = `/uploads/about-us/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[field] = body[field];
        }
      }

      await about.update(updateData, { transaction });

      // Helper to replace child collections
      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { about_id: about.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { about_id: about.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/about-us/${file.filename}`;
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
        db.AboutUsCounterCard,
        body.counter_cards,
        { count: 'count', description: 'description' },
        { prefix: 'counter_cards', field: 'image', dest: 'image' }
      );

      // Cards (repeater)
      await replaceCollection(
        db.AboutUsCard,
        body.cards,
        { heading: 'heading', description: 'description' },
        { prefix: 'cards', field: 'image', dest: 'image' }
      );

      // Leaders
      await replaceCollection(
        db.AboutUsLeader,
        body.leaders,
        {
          name: 'name',
          designation: 'designation',
          description: 'description',
          whatsapp: 'whatsapp',
          instagram: 'instagram',
          linkedin: 'linkedin',
          twitter: 'twitter',
          gmail: 'gmail',
          link: 'link',
        },
        { prefix: 'leaders', field: 'image', dest: 'image' }
      );

      // Advisors
      await replaceCollection(
        db.AboutUsAdvisor,
        body.advisors,
        {
          name: 'name',
          designation: 'designation',
          description: 'description',
          whatsapp: 'whatsapp',
          instagram: 'instagram',
          linkedin: 'linkedin',
          twitter: 'twitter',
          gmail: 'gmail',
          link: 'link',
        },
        { prefix: 'advisors', field: 'image', dest: 'image' }
      );

      await transaction.commit();
      req.flash('success', 'About Us page updated successfully');
      res.redirect('/admin/about');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update About Us page');
      res.redirect('/admin/about');
    }
  },
};

module.exports = AboutUsController;