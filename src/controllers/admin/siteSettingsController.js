// controllers/admin/siteSettingsController.js

const db = require("../../../models");
const path = require("path");
const fs = require("fs");

const SiteSettingsController = {
  editForm: async (req, res) => {
    try {
      const [site_settings, created] = await db.SiteSettings.findOrCreate({
        where: { id: 1 },
        defaults: {
          siteName: "My Website",
          maintenanceMode: 0,
        },
      });

      res.render("admin/settings/index", {
        site_settings,
        success_msg: req.flash("success"),
        error_msg: req.flash("error"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.error("Error loading site settings:", error);
      req.flash("error", "Error loading site settings");
      res.redirect("/admin/dashboard");
    }
  },

  update: async (req, res) => {
    try {
      const site_settings = await db.SiteSettings.findOne({
        where: { id: 1 },
      });

      if (!site_settings) {
        req.flash("error", "Site settings not found");
        return res.redirect("/admin/site/settings");
      }

      // Handle checkbox fields
      let maintenanceMode = req.body.maintenanceMode;
      let maintenanceMessage = req.body.maintenanceMessage; 
      let isActive = req.body.isActive;

      if (maintenanceMode) {
        maintenanceMode = 1;
      } else {
        maintenanceMode = 0;
        maintenanceMessage = null
      }
      if (isActive) {
        isActive = 1;
      } else {
        isActive = 0;
      }
      

      // Update basic fields
      const updateData = {
        siteName: req.body.siteName,
        siteTagline: req.body.siteTagline || null,
        siteDescription: req.body.siteDescription || null,
        contactEmail: req.body.contactEmail || null,
        contactPhone: req.body.contactPhone || null,
        alternatePhone: req.body.alternatePhone || null,
        whatsappNumber: req.body.whatsappNumber || null,
        address: req.body.address || null,
        facebookUrl: req.body.facebookUrl || null,
        twitterUrl: req.body.twitterUrl || null,
        instagramUrl: req.body.instagramUrl || null,
        linkedinUrl: req.body.linkedinUrl || null,
        youtubeUrl: req.body.youtubeUrl || null,
        maintenanceMode,
        maintenanceMessage: maintenanceMessage || null,
        isActive,
      };

      // Handle file uploads
      const files = req.files || {};

      // Process logo upload
      if (files.siteLogo && files.siteLogo[0]) {
        const logoFile = files.siteLogo[0];
        const logoPath = "/uploads/settings/logos/" + logoFile.filename;

        // Remove old logo if exists
        if (site_settings.siteLogo) {
          const oldLogoPath = path.join(
            __dirname,
            "../../../public",
            site_settings.siteLogo
          );
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }

        updateData.siteLogo = logoPath;
      }

      // Process favicon upload
      if (files.siteFavicon && files.siteFavicon[0]) {
        const faviconFile = files.siteFavicon[0];
        const faviconPath =
          "/uploads/settings/favicons/" + faviconFile.filename;

        // Remove old favicon if exists
        if (site_settings.siteFavicon) {
          const oldFaviconPath = path.join(
            __dirname,
            "../../../public",
            site_settings.siteFavicon
          );
          if (fs.existsSync(oldFaviconPath)) {
            fs.unlinkSync(oldFaviconPath);
          }
        }

        updateData.siteFavicon = faviconPath;
      }

      // Handle removal of existing files
      if (req.body.removeSiteLogo === "on" && site_settings.siteLogo) {
        const oldLogoPath = path.join(
          __dirname,
          "../../../public",
          site_settings.siteLogo
        );
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
        updateData.siteLogo = null;
      }

      if (req.body.removeSiteFavicon === "on" && site_settings.siteFavicon) {
        const oldFaviconPath = path.join(
          __dirname,
          "../../../public",
          site_settings.siteFavicon
        );
        if (fs.existsSync(oldFaviconPath)) {
          fs.unlinkSync(oldFaviconPath);
        }
        updateData.siteFavicon = null;
      }

      // Update the record
      await site_settings.update(updateData);

      req.flash("success", "Site settings updated successfully");
      res.redirect("/admin/site/settings");
    } catch (error) {
      console.error("Error updating site settings:", error);
      req.flash("error", "Error updating site settings: " + error.message);
      res.redirect("/admin/site/settings");
    }
  },
};

module.exports = SiteSettingsController;
