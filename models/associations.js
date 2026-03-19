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

  

  console.log("✓ All model associations have been established successfully");
};
