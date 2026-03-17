module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    "Image",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Original filename
      filename: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      // Unique identifier for storage
      uniqueName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      // File path on server
      path: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      // URL to access the image
      url: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      // Image title/alt text
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // Alt text for accessibility
      altText: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // File size in bytes
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // MIME type (image/jpeg, image/png, etc.)
      mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // Image dimensions
      width: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      height: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "images",
      timestamps: true, // Adds createdAt and updatedAt
    }
  );

  // Helper method to get full URL
  Image.prototype.getUrl = function() {
    return this.url;
  };

  // Check if it's an image
  Image.prototype.isImage = function() {
    return this.mimeType && this.mimeType.startsWith('image/');
  };

  // Get dimensions
  Image.prototype.getDimensions = function() {
    return {
      width: this.width,
      height: this.height,
    };
  };
  return Image;
};