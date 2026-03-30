module.exports = (sequelize, DataTypes) => {
    const Logo = sequelize.define(
      "Logo",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        // Type of logo: news or brands
        type: {
          type: DataTypes.ENUM('news', 'brands'),
          allowNull: false,
          defaultValue: 'brands',
        },
        // Logo image filename/path (required)
        image: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        // URL link when clicked (required)
        link: {
          type: DataTypes.STRING(500),
          allowNull: false,
          validate: {
            isUrl: {
              msg: 'Please enter a valid URL',
            },
          },
        },
        // Title/Alt text for the logo
        title: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        // Display order (for sorting)
        order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        // Active status
        status: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        tableName: "logos",
        timestamps: true,
      }
    );
  
    // Helper to get full image URL (image is guaranteed to exist)
    Logo.prototype.getImageUrl = function() {
      return this.image;
    };
  
    return Logo;
  };