/**
 * Centralized associations file
 * This file handles all model associations after all models are loaded
 */

module.exports = (db) => {
  const { User, Role, Permission, UserRole, RolePermission } = db;

  // ==================== User Associations ====================

  // User ↔ Role (Many-to-Many through UserRole)
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "userId",
    otherKey: "roleId",
    as: "roles",
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "roleId",
    otherKey: "userId",
    as: "users",
  });

  // ==================== Role Associations ====================

  // Role ↔ Permission (Many-to-Many through RolePermission)
  Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "roleId",
    otherKey: "permissionId",
    as: "permissions",
  });

  Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permissionId",
    otherKey: "roleId",
    as: "roles",
  });

  // ==================== Self-Referential Associations ====================

  // UserRole - Who assigned the role
  UserRole.belongsTo(User, {
    as: "assigner",
    foreignKey: "assignedBy",
    constraints: false, // Set to true if you want foreign key constraints
  });

  User.hasMany(UserRole, {
    as: "assignedRoles",
    foreignKey: "assignedBy",
  });

  // RolePermission - Who granted the permission
  RolePermission.belongsTo(User, {
    as: "granter",
    foreignKey: "grantedBy",
    constraints: false,
  });

  User.hasMany(RolePermission, {
    as: "grantedPermissions",
    foreignKey: "grantedBy",
  });

  // Role - Who created the role
  Role.belongsTo(User, {
    as: "creator",
    foreignKey: "createdBy",
    constraints: false,
  });

  User.hasMany(Role, {
    as: "createdRoles",
    foreignKey: "createdBy",
  });

  // ==================== User to UserRole/RolePermission ====================

  // Direct associations for easier querying
  User.hasMany(UserRole, {
    foreignKey: "userId",
    as: "userRoleAssignments",
  });

  UserRole.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  // ==================== Role to UserRole/RolePermission ====================

  Role.hasMany(UserRole, {
    foreignKey: "roleId",
    as: "userAssignments",
  });

  UserRole.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  });

  Role.hasMany(RolePermission, {
    foreignKey: "roleId",
    as: "permissionAssignments",
  });

  RolePermission.belongsTo(Role, {
    foreignKey: "roleId",
    as: "role",
  });

  // ==================== Permission to RolePermission ====================

  Permission.hasMany(RolePermission, {
    foreignKey: "permissionId",
    as: "roleAssignments",
  });

  RolePermission.belongsTo(Permission, {
    foreignKey: "permissionId",
    as: "permission",
  });

  // ==================== Additional Helper Associations ====================

  // For getting all permissions of a user through roles
  // This is a convenience association but requires raw query or multiple includes
  // Better to use the existing many-to-many through roles

  // ==================== Blog CMS Associations ====================

  const { Blog, BlogBlock, BlogBlockItem } = db;

  // Blog → BlogBlocks
  Blog.hasMany(BlogBlock, {
    foreignKey: "blogId",
    as: "blocks",
  });

  BlogBlock.belongsTo(Blog, {
    foreignKey: "blogId",
    as: "blog",
  });

  // BlogBlock → BlogBlockItems
  BlogBlock.hasMany(BlogBlockItem, {
    foreignKey: "blockId",
    as: "items",
  });

  BlogBlockItem.belongsTo(BlogBlock, {
    foreignKey: "blockId",
    as: "block",
  });

  // ==================== EscapeRoomArchive Associations ====================

  const {
    EscapeRoomArchive,
    EscapeRoomArchiveIcon,
    EscapeRoomArchiveCounter,
    EscapeRoomArchiveImage,
    EscapeRoomArchiveVideo,
    Video,
  } = db;

  if (EscapeRoomArchive && EscapeRoomArchiveIcon) {
    EscapeRoomArchive.hasMany(EscapeRoomArchiveIcon, {
      foreignKey: "archive_id",
      as: "icons",
      onDelete: "CASCADE",
    });

    EscapeRoomArchiveIcon.belongsTo(EscapeRoomArchive, {
      foreignKey: "archive_id",
      as: "archive",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoomArchive && EscapeRoomArchiveCounter) {
    EscapeRoomArchive.hasMany(EscapeRoomArchiveCounter, {
      foreignKey: "archive_id",
      as: "counters",
      onDelete: "CASCADE",
    });

    EscapeRoomArchiveCounter.belongsTo(EscapeRoomArchive, {
      foreignKey: "archive_id",
      as: "archive",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoomArchive && EscapeRoomArchiveImage) {
    EscapeRoomArchive.hasMany(EscapeRoomArchiveImage, {
      foreignKey: "archive_id",
      as: "images",
      onDelete: "CASCADE",
    });

    EscapeRoomArchiveImage.belongsTo(EscapeRoomArchive, {
      foreignKey: "archive_id",
      as: "archive",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoomArchive && EscapeRoomArchiveVideo) {
    EscapeRoomArchive.hasMany(EscapeRoomArchiveVideo, {
      foreignKey: "archive_id",
      as: "videos",
      onDelete: "CASCADE",
    });

    EscapeRoomArchiveVideo.belongsTo(EscapeRoomArchive, {
      foreignKey: "archive_id",
      as: "archive",
      onDelete: "CASCADE",
    });
  }

  // Video Associations
  if (Video && EscapeRoomArchiveVideo) {
    Video.hasMany(EscapeRoomArchiveVideo, {
      foreignKey: "video_id",
      as: "archiveVideos",
      onDelete: "CASCADE",
    });

    EscapeRoomArchiveVideo.belongsTo(Video, {
      foreignKey: "video_id",
      as: "videoDetails",
      onDelete: "CASCADE",
    });
  }

  // ==================== EscapeRoomLocations Associations ====================

  const {
    EscapeRoomLocation,
    EscapeRoomLocationPricing,
    EscapeRoomLocationEventSpace,
    EscapeRoomLocationImageCard,
    EscapeRoomLocationVideo,
  } = db;

  if (EscapeRoomLocation && EscapeRoomLocationPricing) {
    EscapeRoomLocation.hasMany(EscapeRoomLocationPricing, {
      foreignKey: "location_id",
      as: "pricings",
      onDelete: "CASCADE",
    });

    EscapeRoomLocationPricing.belongsTo(EscapeRoomLocation, {
      foreignKey: "location_id",
      as: "location",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoomLocation && EscapeRoomLocationEventSpace) {
    EscapeRoomLocation.hasMany(EscapeRoomLocationEventSpace, {
      foreignKey: "location_id",
      as: "eventSpaces",
      onDelete: "CASCADE",
    });

    EscapeRoomLocationEventSpace.belongsTo(EscapeRoomLocation, {
      foreignKey: "location_id",
      as: "location",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoomLocation && EscapeRoomLocationImageCard) {
    EscapeRoomLocation.hasMany(EscapeRoomLocationImageCard, {
      foreignKey: "location_id",
      as: "imageCards",
      onDelete: "CASCADE",
    });

    EscapeRoomLocationImageCard.belongsTo(EscapeRoomLocation, {
      foreignKey: "location_id",
      as: "location",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoomLocation && EscapeRoomLocationVideo) {
    EscapeRoomLocation.hasMany(EscapeRoomLocationVideo, {
      foreignKey: "location_id",
      as: "videos",
      onDelete: "CASCADE",
    });

    EscapeRoomLocationVideo.belongsTo(EscapeRoomLocation, {
      foreignKey: "location_id",
      as: "location",
      onDelete: "CASCADE",
    });
  }

  if (Video && EscapeRoomLocationVideo) {
    Video.hasMany(EscapeRoomLocationVideo, {
      foreignKey: "video_id",
      as: "locationVideos",
      onDelete: "CASCADE",
    });

    EscapeRoomLocationVideo.belongsTo(Video, {
      foreignKey: "video_id",
      as: "videoDetails",
      onDelete: "CASCADE",
    });
  }
  // NEW ASSOCIATION for banner_video_id
  if (EscapeRoomLocation && Video) {
    EscapeRoomLocation.belongsTo(Video, {
      foreignKey: "banner_video_id",
      as: "bannerVideo",
      onDelete: "SET NULL",
    });
  }

  // ==================== EscapeRoom Associations ====================

  const {
    EscapeRoom,
    EscapeRoomLocationMapping, // New junction model
    EscapeRoomPricingCard,
    EscapeRoomImage,
  } = db;

  if (EscapeRoom && EscapeRoomLocation && EscapeRoomLocationMapping) {
    // Many-to-many relationship between EscapeRoom and EscapeRoomLocation
    EscapeRoom.belongsToMany(EscapeRoomLocation, {
      through: EscapeRoomLocationMapping,
      foreignKey: "escape_room_id",
      otherKey: "location_id",
      as: "locations",
    });

    EscapeRoomLocation.belongsToMany(EscapeRoom, {
      through: EscapeRoomLocationMapping,
      foreignKey: "location_id",
      otherKey: "escape_room_id",
      as: "escapeRooms",
    });

    // Direct associations with junction table
    EscapeRoom.hasMany(EscapeRoomLocationMapping, {
      foreignKey: "escape_room_id",
      as: "locationMappings",
      onDelete: "CASCADE",
    });

    EscapeRoomLocation.hasMany(EscapeRoomLocationMapping, {
      foreignKey: "location_id",
      as: "escapeRoomMappings",
      onDelete: "CASCADE",
    });

    EscapeRoomLocationMapping.belongsTo(EscapeRoom, {
      foreignKey: "escape_room_id",
      as: "escapeRoom",
    });

    EscapeRoomLocationMapping.belongsTo(EscapeRoomLocation, {
      foreignKey: "location_id",
      as: "location",
    });
  }

  // Rest of the associations remain the same...
  if (EscapeRoom && EscapeRoomPricingCard) {
    EscapeRoom.hasMany(EscapeRoomPricingCard, {
      foreignKey: "escape_room_id",
      as: "pricingCards",
      onDelete: "CASCADE",
    });

    EscapeRoomPricingCard.belongsTo(EscapeRoom, {
      foreignKey: "escape_room_id",
      as: "escapeRoom",
      onDelete: "CASCADE",
    });
  }

  if (EscapeRoom && EscapeRoomImage) {
    EscapeRoom.hasMany(EscapeRoomImage, {
      foreignKey: "escape_room_id",
      as: "images",
      onDelete: "CASCADE",
    });

    EscapeRoomImage.belongsTo(EscapeRoom, {
      foreignKey: "escape_room_id",
      as: "escapeRoom",
      onDelete: "CASCADE",
    });
  }

  // ==================== Virtual EscapeRoom archive ASSOCIATIONS ======================

  const {
    VirtualArchive,
    VirtualArchiveAddonItem,
    VirtualArchiveCounterCard,
    VirtualArchiveGalleryImage,
    VirtualArchiveIconItem,
    VirtualArchivePackageColumn,
    VirtualArchivePackageRow,
    VirtualArchivePackageCell,
    VirtualArchiveVideo,
  } = db;

  // Archive → CounterCards
  VirtualArchive.hasMany(VirtualArchiveCounterCard, {
    foreignKey: "archive_id",
    as: "counterCards",
  });
  VirtualArchiveCounterCard.belongsTo(VirtualArchive, {
    foreignKey: "archive_id",
  });

  // Archive → IconItems
  VirtualArchive.hasMany(VirtualArchiveIconItem, {
    foreignKey: "archive_id",
    as: "iconItems",
  });
  VirtualArchiveIconItem.belongsTo(VirtualArchive, {
    foreignKey: "archive_id",
  });

  // Archive → AddonItems
  VirtualArchive.hasMany(VirtualArchiveAddonItem, {
    foreignKey: "archive_id",
    as: "addonItems",
  });
  VirtualArchiveAddonItem.belongsTo(VirtualArchive, {
    foreignKey: "archive_id",
  });

  // Archive → GalleryImages
  VirtualArchive.hasMany(VirtualArchiveGalleryImage, {
    foreignKey: "archive_id",
    as: "galleryImages",
  });
  VirtualArchiveGalleryImage.belongsTo(VirtualArchive, {
    foreignKey: "archive_id",
  });

  // Archive → PackageColumns
  VirtualArchive.hasMany(VirtualArchivePackageColumn, {
    foreignKey: "archive_id",
    as: "packageColumns",
  });
  VirtualArchivePackageColumn.belongsTo(VirtualArchive, {
    foreignKey: "archive_id",
  });

  // Archive → PackageRows
  VirtualArchive.hasMany(VirtualArchivePackageRow, {
    foreignKey: "archive_id",
    as: "packageRows",
  });
  VirtualArchivePackageRow.belongsTo(VirtualArchive, {
    foreignKey: "archive_id",
  });

  // PackageRow → PackageCells
  VirtualArchivePackageRow.hasMany(VirtualArchivePackageCell, {
    foreignKey: "row_id",
    as: "cells",
  });
  VirtualArchivePackageCell.belongsTo(VirtualArchivePackageRow, {
    foreignKey: "row_id",
  });
  VirtualArchivePackageColumn.hasMany(VirtualArchivePackageCell, {
    foreignKey: "column_id",
    as: "cells",
  });
  VirtualArchivePackageCell.belongsTo(VirtualArchivePackageColumn, {
    foreignKey: "column_id",
  });

  // Archive ↔ Video (many-to-many)
  VirtualArchive.belongsToMany(Video, {
    through: VirtualArchiveVideo,
    foreignKey: "archive_id",
    otherKey: "video_id",
    as: "videos",
  });
  Video.belongsToMany(VirtualArchive, {
    through: VirtualArchiveVideo,
    foreignKey: "video_id",
    otherKey: "archive_id",
    as: "archives",
  });

  VirtualArchiveVideo.belongsTo(VirtualArchive, { foreignKey: "archive_id" });
  VirtualArchiveVideo.belongsTo(Video, { foreignKey: "video_id" });
  VirtualArchive.belongsTo(db.Video, {
    foreignKey: "banner_video_id",
    as: "bannerVideo",
  });

  // ==================== LANDING PAGE ASSOCIATIONS ====================

  const {
    Landing,
    LandingLocationMapping,
    LandingCounterCard,
    LandingImageCard,
    LandingIdealForItem,
    LandingCardSection,
    LandingVideo,
  } = db;

  if (Landing && EscapeRoomLocation && LandingLocationMapping) {
    // Many-to-many relationship between Landing and EscapeRoomLocation
    Landing.belongsToMany(EscapeRoomLocation, {
      through: LandingLocationMapping,
      foreignKey: "landing_id",
      otherKey: "location_id",
      as: "locations",
    });

    EscapeRoomLocation.belongsToMany(Landing, {
      through: LandingLocationMapping,
      foreignKey: "location_id",
      otherKey: "landing_id",
      as: "landings",
    });

    // Direct associations with junction table
    Landing.hasMany(LandingLocationMapping, {
      foreignKey: "landing_id",
      as: "locationMappings",
      onDelete: "CASCADE",
    });

    EscapeRoomLocation.hasMany(LandingLocationMapping, {
      foreignKey: "location_id",
      as: "landingMappings",
      onDelete: "CASCADE",
    });

    LandingLocationMapping.belongsTo(Landing, {
      foreignKey: "landing_id",
      as: "landing",
    });

    LandingLocationMapping.belongsTo(EscapeRoomLocation, {
      foreignKey: "location_id",
      as: "location",
    });
  }

  // Landing ↔ Counter Cards (One-to-Many)
  if (Landing && LandingCounterCard) {
    Landing.hasMany(LandingCounterCard, {
      foreignKey: "landing_id",
      as: "counterCards",
      onDelete: "CASCADE",
    });

    LandingCounterCard.belongsTo(Landing, {
      foreignKey: "landing_id",
      as: "landing",
    });
  }

  // Landing ↔ Image Cards (One-to-Many)
  if (Landing && LandingImageCard) {
    Landing.hasMany(LandingImageCard, {
      foreignKey: "landing_id",
      as: "imageCards",
      onDelete: "CASCADE",
    });

    LandingImageCard.belongsTo(Landing, {
      foreignKey: "landing_id",
      as: "landing",
    });
  }

  // Landing ↔ Ideal For Items (One-to-Many)
  if (Landing && LandingIdealForItem) {
    Landing.hasMany(LandingIdealForItem, {
      foreignKey: "landing_id",
      as: "idealForItems",
      onDelete: "CASCADE",
    });

    LandingIdealForItem.belongsTo(Landing, {
      foreignKey: "landing_id",
      as: "landing",
    });
  }

  // Landing ↔ Card Sections (One-to-Many)
  if (Landing && LandingCardSection) {
    Landing.hasMany(LandingCardSection, {
      foreignKey: "landing_id",
      as: "cardSections",
      onDelete: "CASCADE",
    });

    LandingCardSection.belongsTo(Landing, {
      foreignKey: "landing_id",
      as: "landing",
    });
  }

  // Landing ↔ Videos (Many-to-Many through LandingVideo)
  if (Landing && Video && LandingVideo) {
    Landing.belongsToMany(Video, {
      through: LandingVideo,
      foreignKey: "landing_id",
      otherKey: "video_id",
      as: "videos",
    });

    Video.belongsToMany(Landing, {
      through: LandingVideo,
      foreignKey: "video_id",
      otherKey: "landing_id",
      as: "landings",
    });

    // Direct associations with junction table
    Landing.hasMany(LandingVideo, {
      foreignKey: "landing_id",
      as: "landingVideos",
      onDelete: "CASCADE",
    });

    Video.hasMany(LandingVideo, {
      foreignKey: "video_id",
      as: "landingVideos",
      onDelete: "CASCADE",
    });

    LandingVideo.belongsTo(Landing, {
      foreignKey: "landing_id",
      as: "landing",
    });

    LandingVideo.belongsTo(Video, {
      foreignKey: "video_id",
      as: "video",
    });
  }

  // ==================== PARTY ARCHIVE ASSOCIATIONS ====================

  const { PartyArchive, PartyArchiveCounterCard } = db;

  // PartyArchive ↔ PartyArchiveCounterCard (one-to-many)
  PartyArchive.hasMany(PartyArchiveCounterCard, {
    foreignKey: "archive_id",
    as: "counterCards",
    onDelete: "CASCADE",
  });
  PartyArchiveCounterCard.belongsTo(PartyArchive, {
    foreignKey: "archive_id",
    as: "archive",
  });

  console.log("✓ All model associations have been established successfully");
};
