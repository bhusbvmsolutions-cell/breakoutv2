const db = require("../../../models");
const path = require("path");
const fs = require("fs");
const {findOrCreatePage} = require('../../utils/faqHelper');

const escapeRoomArchiveController = {
  // GET /admin/escape/archive
  getArchive: async (req, res) => {
    try {
      // Get or create the single archive record (ID = 1)
      let [archive, created] = await db.EscapeRoomArchive.findOrCreate({
        where: { id: 1 },
        defaults: {
          banner_heading: "Escape Room Experience",
          isActive: true
        }
      });

      // Get all related data
      const icons = await db.EscapeRoomArchiveIcon.findAll({
        where: { archive_id: archive.id },
        order: [['createdAt', 'ASC']]
      });

      const counters = await db.EscapeRoomArchiveCounter.findAll({
        where: { archive_id: archive.id },
        order: [['createdAt', 'ASC']]
      });

      const images = await db.EscapeRoomArchiveImage.findAll({
        where: { archive_id: archive.id },
        order: [['createdAt', 'ASC']]
      });

      const selectedVideos = await db.EscapeRoomArchiveVideo.findAll({
        where: { archive_id: archive.id },
        include: [{
          model: db.Video,
          as: 'videoDetails',
          attributes: ['id', 'title', 'thumbnail', 'url', 'duration']
        }],
        order: [['createdAt', 'ASC']]
      });

      // Get all available videos for selection
      const allVideos = await db.Video.findAll({
        where: { status: 'active' },
        attributes: ['id', 'title', 'thumbnail', 'duration'],
        order: [['title', 'ASC']]
      });

      res.render("admin/escape/archive/index", {
        title: "Escape Room Archive",
        archive,
        icons,
        counters,
        images,
        selectedVideos,
        allVideos,
        success_msg: req.flash("success"),
        error_msg: req.flash("error")
      });
    } catch (error) {
      console.error("Error loading escape room archive:", error);
      req.flash("error", "Failed to load escape room archive");
      res.redirect("/admin/dashboard");
    }
  },

  // POST /admin/escape/archive (Update)
  updateArchive: async (req, res) => {
    try {
      const archive = await db.EscapeRoomArchive.findByPk(1);
      if (!archive) {
        req.flash("error", "Archive not found");
        return res.redirect("/admin/escape/archive");
      }

      // Update main archive fields
      await archive.update({
        banner_heading: req.body.banner_heading,
        banner_description: req.body.banner_description,
        banner_cta_label1: req.body.banner_cta_label1,
        banner_cta_link1: req.body.banner_cta_link1,
        banner_cta_label2: req.body.banner_cta_label2,
        banner_cta_link2: req.body.banner_cta_link2,
        icon_heading: req.body.icon_heading,
        icon_description: req.body.icon_description,
        counter_heading: req.body.counter_heading,
        counter_rating: req.body.counter_rating,
        footer_heading: req.body.footer_heading,
        footer_description1: req.body.footer_description1,
        footer_description2: req.body.footer_description2
      });

      // Handle banner image upload
      if (req.files && req.files['banner_image'] && req.files['banner_image'][0]) {
        const file = req.files['banner_image'][0];
        const imagePath = '/uploads/escaperoomarchive/' + file.filename;
        
        // Delete old image if exists
        if (archive.banner_image) {
          const oldPath = path.join(__dirname, '../../public', archive.banner_image);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        
        await archive.update({ banner_image: imagePath });
      }

      // Handle icons
      if (req.body.icon_headings) {
        // Delete existing icons
        await db.EscapeRoomArchiveIcon.destroy({ where: { archive_id: archive.id } });
        
        const iconHeadings = Array.isArray(req.body.icon_headings) 
          ? req.body.icon_headings 
          : [req.body.icon_headings];
        
        let iconFileIndex = 0;
        for (let i = 0; i < iconHeadings.length; i++) {
          if (iconHeadings[i]?.trim()) {
            let imagePath = null;
            
            // Check for uploaded image
            if (req.files && req.files['icon_images'] && req.files['icon_images'][iconFileIndex]) {
              const file = req.files['icon_images'][iconFileIndex];
              imagePath = '/uploads/escaperoomarchive/' + file.filename;
              iconFileIndex++;
            } else if (req.body[`icon_existing_image_${i}`]) {
              imagePath = req.body[`icon_existing_image_${i}`];
            }
            
            await db.EscapeRoomArchiveIcon.create({
              archive_id: archive.id,
              heading: iconHeadings[i].trim(),
              image: imagePath
            });
          }
        }
      }

      // Handle counters
      if (req.body.counter_counts) {
        // Delete existing counters
        await db.EscapeRoomArchiveCounter.destroy({ where: { archive_id: archive.id } });
        
        const counterCounts = Array.isArray(req.body.counter_counts) 
          ? req.body.counter_counts 
          : [req.body.counter_counts];
        
        const counterDescriptions = req.body.counter_descriptions || [];
        
        let counterFileIndex = 0;
        for (let i = 0; i < counterCounts.length; i++) {
          if (counterCounts[i]?.trim()) {
            let imagePath = null;
            
            if (req.files && req.files['counter_images'] && req.files['counter_images'][counterFileIndex]) {
              const file = req.files['counter_images'][counterFileIndex];
              imagePath = '/uploads/escaperoomarchive/' + file.filename;
              counterFileIndex++;
            } else if (req.body[`counter_existing_image_${i}`]) {
              imagePath = req.body[`counter_existing_image_${i}`];
            }
            
            await db.EscapeRoomArchiveCounter.create({
              archive_id: archive.id,
              image: imagePath,
              count: counterCounts[i].trim(),
              description: counterDescriptions[i]?.trim() || ''
            });
          }
        }
      }

      // Handle gallery images - NEW IMPLEMENTATION
      if (req.body.gallery_images_data) {
        // Parse the gallery images data
        const galleryImagesData = JSON.parse(req.body.gallery_images_data);
        
        // Delete existing images that are marked for removal
        if (galleryImagesData.deleted_ids && galleryImagesData.deleted_ids.length > 0) {
          for (const id of galleryImagesData.deleted_ids) {
            const image = await db.EscapeRoomArchiveImage.findByPk(id);
            if (image) {
              const imagePath = path.join(__dirname, '../../public', image.image);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
              await image.destroy();
            }
          }
        }

        // Update existing images order
        if (galleryImagesData.existing && galleryImagesData.existing.length > 0) {
          for (let i = 0; i < galleryImagesData.existing.length; i++) {
            const item = galleryImagesData.existing[i];
            const image = await db.EscapeRoomArchiveImage.findByPk(item.id);
            if (image) {
              // You can update order here if you add a sortOrder field
              // await image.update({ sortOrder: i });
            }
          }
        }
      }

      // Handle new gallery image uploads
      if (req.files && req.files['gallery_images'] && req.files['gallery_images'].length > 0) {
        const files = req.files['gallery_images'];
        
        for (const file of files) {
          const imagePath = '/uploads/escaperoomarchive/' + file.filename;
          
          await db.EscapeRoomArchiveImage.create({
            archive_id: archive.id,
            image: imagePath
          });
        }
      }

      // Handle video selections
      if (req.body.video_ids) {
        // Delete existing video selections
        await db.EscapeRoomArchiveVideo.destroy({ where: { archive_id: archive.id } });
        
        const videoIds = Array.isArray(req.body.video_ids) 
          ? req.body.video_ids 
          : [req.body.video_ids];
        
        for (const videoId of videoIds) {
          if (videoId) {
            await db.EscapeRoomArchiveVideo.create({
              archive_id: archive.id,
              video_id: videoId,
              title: req.body[`video_title_${videoId}`] || ''
            });
          }
        }
      }
      await findOrCreatePage(null, "EscapeRoom Archive", "escaperoom", "archive");

      req.flash("success", "Escape Room Archive updated successfully!");
      res.redirect("/admin/escape/archive");
    } catch (error) {
      console.error("Error updating escape room archive:", error);
      req.flash("error", "Failed to update: " + error.message);
      res.redirect("/admin/escape/archive");
    }
  },

  // DELETE /admin/escape/archive/image/:id
  deleteImage: async (req, res) => {
    try {
      const { id } = req.params;
      const image = await db.EscapeRoomArchiveImage.findByPk(id);
      
      if (!image) {
        return res.status(404).json({ 
          success: false, 
          message: "Image not found" 
        });
      }

      // Delete physical file
      const imagePath = path.join(__dirname, '../../public', image.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await image.destroy();

      res.json({ 
        success: true, 
        message: "Image deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete image" 
      });
    }
  },

  // DELETE /admin/escape/archive/icon/:id
  deleteIcon: async (req, res) => {
    try {
      const { id } = req.params;
      const icon = await db.EscapeRoomArchiveIcon.findByPk(id);
      
      if (!icon) {
        return res.status(404).json({ 
          success: false, 
          message: "Icon not found" 
        });
      }

      // Delete physical file if exists
      if (icon.image) {
        const imagePath = path.join(__dirname, '../../public', icon.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await icon.destroy();

      res.json({ 
        success: true, 
        message: "Icon deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting icon:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete icon" 
      });
    }
  },

  // DELETE /admin/escape/archive/counter/:id
  deleteCounter: async (req, res) => {
    try {
      const { id } = req.params;
      const counter = await db.EscapeRoomArchiveCounter.findByPk(id);
      
      if (!counter) {
        return res.status(404).json({ 
          success: false, 
          message: "Counter not found" 
        });
      }

      // Delete physical file if exists
      if (counter.image) {
        const imagePath = path.join(__dirname, '../../public', counter.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await counter.destroy();

      res.json({ 
        success: true, 
        message: "Counter deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting counter:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete counter" 
      });
    }
  }
};

module.exports = escapeRoomArchiveController;