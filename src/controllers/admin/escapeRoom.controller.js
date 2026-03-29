const { sequelize, EscapeRoom, EscapeRoomImage, EscapeRoomPricingCard, 
    EscapeRoomLocationMapping, EscapeRoomLocation } = require('../../../models');
const { Op } = require('sequelize');
const fs = require('fs').promises;
const path = require('path');
const slugify = require('slugify');
const { DeleteFaqPage, findOrCreatePage} = require("../../utils/faqHelper");

const escapeRoomController = {
// List all rooms
index: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        
        const where = {};
        
        // Apply filters
        if (req.query.search) {
            where.title = { [Op.like]: `%${req.query.search}%` };
        }
        if (req.query.status !== undefined && req.query.status !== '') {
            where.isActive = req.query.status === '1';
        }
        
        const { count, rows: rooms } = await EscapeRoom.findAndCountAll({
            where,
            include: [
                {
                    model: EscapeRoomLocation,
                    as: 'locations',
                    through: { where: { isActive: true } },
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });
        
        // Apply location filter after include (if needed)
        let filteredRooms = rooms;
        if (req.query.location) {
            filteredRooms = rooms.filter(room => 
                room.locations.some(loc => loc.id === parseInt(req.query.location))
            );
        }
        
        const locations = await EscapeRoomLocation.findAll({
            where: { isActive: true },
            order: [['title', 'ASC']]
        });
        
        res.render('admin/escape/rooms/index', {
            title: 'Escape Rooms',
            rooms: filteredRooms,
            locations,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            query: req.query
        });
    } catch (error) {
        console.error('Error in index:', error);
        res.status(500).send('Server Error');
    }
},

// Show add form
add: async (req, res) => {
    try {
        const locations = await EscapeRoomLocation.findAll({
            where: { isActive: true },
            order: [['title', 'ASC']]
        });
        
        res.render('admin/escape/rooms/create', {
            title: 'Create Escape Room',
            locations
        });
    } catch (error) {
        console.error('Error in add form:', error);
        res.status(500).send('Server Error');
    }
},

// Show edit form
edit: async (req, res) => {
    try {
        const room = await EscapeRoom.findByPk(req.params.id, {
            include: [
                {
                    model: EscapeRoomImage,
                    as: 'images',
                    where: { isActive: true },
                    required: false,
                    order: [['sort_order', 'ASC']]
                },
                {
                    model: EscapeRoomPricingCard,
                    as: 'pricingCards',
                    where: { isActive: true },
                    required: false,
                    order: [['sort_order', 'ASC']]
                },
                {
                    model: EscapeRoomLocation,
                    as: 'locations',
                    through: { where: { isActive: true } },
                    required: false
                }
            ]
        });

        if (!room) {
            return res.status(404).send('Room not found');
        }

        const locations = await EscapeRoomLocation.findAll({
            where: { isActive: true },
            order: [['title', 'ASC']]
        });

        // Format data
        const formattedRoom = {
            ...room.toJSON(),
            locations: room.locations.map(l => l.id)
        };

        res.render('admin/escape/rooms/edit', {
            title: 'Edit Escape Room',
            room: formattedRoom,
            locations
        });
    } catch (error) {
        console.error('Error in edit form:', error);
        res.status(500).send('Server Error');
    }
},

// Show single room
show: async (req, res) => {
    try {
        const room = await EscapeRoom.findByPk(req.params.id, {
            include: [
                {
                    model: EscapeRoomImage,
                    as: 'images',
                    where: { isActive: true },
                    required: false,
                    order: [['sort_order', 'ASC']]
                },
                {
                    model: EscapeRoomPricingCard,
                    as: 'pricingCards',
                    where: { isActive: true },
                    required: false,
                    order: [['sort_order', 'ASC']]
                },
                {
                    model: EscapeRoomLocation,
                    as: 'locations',
                    through: { where: { isActive: true } },
                    required: false
                }
            ]
        });

        if (!room) {
            return res.status(404).send('Room not found');
        }

        res.render('admin/escape/rooms/show', {
            title: room.title,
            room
        });
    } catch (error) {
        console.error('Error in show:', error);
        res.status(500).send('Server Error');
    }
},

// Create room
create: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const files = req.files;
        const body = req.body;
        
        // Generate slug if not provided
        if (!body.slug && body.title) {
            body.slug = slugify(body.title, { lower: true, strict: true });
        }
        
        // Handle banner image
        let bannerImage = null;
        if (files?.banner_image) {
            bannerImage = `/uploads/escaperooms/${files.banner_image[0].filename}`;
        } else if (body.existing_banner_image) {
            bannerImage = body.existing_banner_image;
        }
        
        // Create room
        const room = await EscapeRoom.create({
            title: body.title,
            slug: body.slug,
            tag: body.tags ? (Array.isArray(body.tags) ? body.tags : [body.tags]) : null,
            banner_heading: body.banner_heading,
            banner_image: bannerImage,
            banner_description: body.banner_description,
            banner_success_rate: body.banner_success_rate,
            banner_age_group: body.banner_age_group,
            banner_character: body.banner_character,
            banner_min_team: body.banner_min_team,
            banner_scare_factor: body.banner_scare_factor,
            banner_duration: body.banner_duration,
            banner_cta_label: body.banner_cta_label,
            banner_cta_link: body.banner_cta_link,
            banner_important_note: body.banner_important_note,
            banner_video_trailer: body.banner_video_trailer,
            pricing_note: body.pricing_note,
            pricing_heading: body.pricing_heading,
            isActive: body.isActive === 'on'
        }, { transaction });

        // Create location mappings
        const locations = Array.isArray(body.locations) ? body.locations : [body.locations];
        if (locations && locations.length > 0) {
            await Promise.all(locations.map(locationId =>
                EscapeRoomLocationMapping.create({
                    escape_room_id: room.id,
                    location_id: locationId,
                    isActive: true
                }, { transaction })
            ));
        }

        // Create gallery images
        if (body.gallery && Array.isArray(body.gallery)) {
            await Promise.all(body.gallery.map((imageUrl, index) =>
                EscapeRoomImage.create({
                    escape_room_id: room.id,
                    image_url: imageUrl,
                    sort_order: index,
                    isActive: true
                }, { transaction })
            ));
        }

        // Create pricing cards
        if (body.pricing) {
            const pricingCards = Array.isArray(body.pricing) ? body.pricing : [body.pricing];
            await Promise.all(pricingCards.map((card, index) => {
                // Skip empty cards
                if (!card.day_range && !card.price_2_3 && !card.price_4_6) {
                    return null;
                }
                return EscapeRoomPricingCard.create({
                    escape_room_id: room.id,
                    day_range: card.day_range,
                    price_2_3_players: card.price_2_3,
                    price_4_6_players: card.price_4_6,
                    sort_order: index,
                    isActive: true
                }, { transaction });
            }).filter(Boolean));
        }

        await findOrCreatePage(room.id, room.title, room.slug, 'escaperoom');

        await transaction.commit();

        res.json({
            success: true,
            message: 'Escape room created successfully',
            roomId: room.id
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error in create:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create escape room'
        });
    }
},

// Update room
update: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const room = await EscapeRoom.findByPk(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const files = req.files;
        const body = req.body;
        
        // Generate slug if not provided
        if (!body.slug && body.title) {
            body.slug = slugify(body.title, { lower: true, strict: true });
        }

        // Handle banner image
        let bannerImage = room.banner_image;
        if (files?.banner_image) {
            bannerImage = `/uploads/escaperooms/${files.banner_image[0].filename}`;
        } else if (body.existing_banner_image === '') {
            bannerImage = null;
        } else if (body.existing_banner_image) {
            bannerImage = body.existing_banner_image;
        }

        // Update room
        await room.update({
            title: body.title,
            slug: body.slug,
            tag: body.tags ? (Array.isArray(body.tags) ? body.tags : [body.tags]) : null,
            banner_heading: body.banner_heading,
            banner_image: bannerImage,
            banner_description: body.banner_description,
            banner_success_rate: body.banner_success_rate,
            banner_age_group: body.banner_age_group,
            banner_character: body.banner_character,
            banner_min_team: body.banner_min_team,
            banner_scare_factor: body.banner_scare_factor,
            banner_duration: body.banner_duration,
            banner_cta_label: body.banner_cta_label,
            banner_cta_link: body.banner_cta_link,
            banner_important_note: body.banner_important_note,
            banner_video_trailer: body.banner_video_trailer,
            pricing_note: body.pricing_note,
            pricing_heading: body.pricing_heading,
            isActive: body.isActive === 'on'
        }, { transaction });

        // Update location mappings
        await EscapeRoomLocationMapping.destroy({
            where: { escape_room_id: room.id },
            transaction
        });

        const locations = Array.isArray(body.locations) ? body.locations : [body.locations];
        if (locations && locations.length > 0) {
            await Promise.all(locations.map(locationId =>
                EscapeRoomLocationMapping.create({
                    escape_room_id: room.id,
                    location_id: locationId,
                    isActive: true
                }, { transaction })
            ));
        }

        // Update gallery images
        await EscapeRoomImage.destroy({
            where: { escape_room_id: room.id },
            transaction
        });

        if (body.gallery && Array.isArray(body.gallery)) {
            await Promise.all(body.gallery.map((imageUrl, index) =>
                EscapeRoomImage.create({
                    escape_room_id: room.id,
                    image_url: imageUrl,
                    sort_order: index,
                    isActive: true
                }, { transaction })
            ));
        }

        // Update pricing cards
        await EscapeRoomPricingCard.destroy({
            where: { escape_room_id: room.id },
            transaction
        });

        if (body.pricing) {
            const pricingCards = Array.isArray(body.pricing) ? body.pricing : [body.pricing];
            await Promise.all(pricingCards.map((card, index) => {
                // Skip empty cards
                if (!card.day_range && !card.price_2_3 && !card.price_4_6) {
                    return null;
                }
                return EscapeRoomPricingCard.create({
                    escape_room_id: room.id,
                    day_range: card.day_range,
                    price_2_3_players: card.price_2_3,
                    price_4_6_players: card.price_4_6,
                    sort_order: index,
                    isActive: true
                }, { transaction });
            }).filter(Boolean));
        }

        await findOrCreatePage(room.id, room.title, room.slug, 'escaperoom');

        await transaction.commit();

        res.json({
            success: true,
            message: 'Escape room updated successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error in update:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update escape room'
        });
    }
},

// Delete room (soft delete)
delete: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const room = await EscapeRoom.findByPk(req.params.id);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        // Soft delete related records
        await EscapeRoomLocationMapping.update(
            { isActive: false },
            { where: { escape_room_id: room.id }, transaction }
        );

        await EscapeRoomImage.update(
            { isActive: false },
            { where: { escape_room_id: room.id }, transaction }
        );

        await EscapeRoomPricingCard.update(
            { isActive: false },
            { where: { escape_room_id: room.id }, transaction }
        );

        // Soft delete room
        await room.destroy({ transaction });

        await DeleteFaqPage(room.id, room.title, room.slug, 'escaperoom');

        await transaction.commit();


        res.json({
            success: true,
            message: 'Escape room deleted successfully'
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Error in delete:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete escape room'
        });
    }
},

// Upload image
uploadImage: async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image uploaded' });
        }

        const imageUrl = `/uploads/escaperooms/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error('Error in uploadImage:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
},

// Get recent images
getRecentImages: async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../../public/uploads/escaperooms');
        
        // Check if directory exists
        try {
            await fs.access(uploadDir);
        } catch {
            return res.json([]);
        }
        
        const files = await fs.readdir(uploadDir);
        
        const images = await Promise.all(
            files
                .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
                .sort((a, b) => {
                    // Sort by file creation time (newest first)
                    const aTime = fs.stat(path.join(uploadDir, a)).then(stat => stat.birthtime);
                    const bTime = fs.stat(path.join(uploadDir, b)).then(stat => stat.birthtime);
                    return bTime - aTime;
                })
                .slice(0, 12)
                .map(async (file) => {
                    const stats = await fs.stat(path.join(uploadDir, file));
                    return {
                        filename: file,
                        url: `/uploads/escaperooms/${file}`,
                        uploadedAt: stats.birthtime
                    };
                })
        );

        // Sort by upload time (newest first)
        images.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        res.json(images);

    } catch (error) {
        console.error('Error in getRecentImages:', error);
        res.json([]);
    }
}
};

module.exports = escapeRoomController;