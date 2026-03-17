module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define(
    "Video",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      uniqueName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      path: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      format: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quality: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'processing', 'failed'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: "videos",
      timestamps: true,
      indexes: [
        {
          fields: ['status'],
        },
        {
          fields: ['uniqueName'],
          unique: true,
        },
      ],
    }
  );

  // Helper method to get video URL
  Video.prototype.getUrl = function() {
    return this.url;
  };

  // Helper method to get thumbnail URL
  Video.prototype.getThumbnail = function() {
    return this.thumbnail || '/assets/images/video-placeholder.jpg';
  };

  // Get recent videos
  Video.findRecent = function(limit = 10) {
    return this.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']],
      limit,
    });
  };

  return Video;
};