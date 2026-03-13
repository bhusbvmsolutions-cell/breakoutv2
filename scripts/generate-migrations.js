const fs = require("fs");
const path = require("path");

let migrationCounter = 0;

// Convert Sequelize types to migration types
function getMigrationType(attribute) {
  if (!attribute.type) return "Sequelize.STRING";

  const typeKey = attribute.type.key;

  switch (typeKey) {
    case "STRING":
      return "Sequelize.STRING";
    case "TEXT":
      return "Sequelize.TEXT";
    case "INTEGER":
      return "Sequelize.INTEGER";
    case "BIGINT":
      return "Sequelize.BIGINT";
    case "FLOAT":
      return "Sequelize.FLOAT";
    case "DOUBLE":
      return "Sequelize.DOUBLE";
    case "DECIMAL":
      return "Sequelize.DECIMAL";
    case "DATE":
      return "Sequelize.DATE";
    case "BOOLEAN":
      return "Sequelize.BOOLEAN";
    case "ENUM":
      if (attribute.type.values && attribute.type.values.length) {
        const values = attribute.type.values.map(v => `'${v}'`).join(", ");
        return `Sequelize.ENUM(${values})`;
      }
      return "Sequelize.STRING";
    case "JSON":
    case "JSONB":
      return "Sequelize.JSON";
    case "UUID":
      return "Sequelize.UUID";
    default:
      return "Sequelize.STRING";
  }
}

function formatFieldValue(value) {
    if (value === undefined || value === null) return null;
  
    if (value === "NOW") return "Sequelize.NOW";
  
    if (typeof value === "string") {
      if (value.startsWith("Sequelize.")) return value;
      return `'${value}'`;
    }
  
    if (typeof value === "boolean" || typeof value === "number") return value;
  
    if (value?.key === "NOW") return "Sequelize.NOW";
  
    return value;
  }

function generateMigration(modelName, model) {
  const timestamp = Date.now() + migrationCounter++;
  const tableName = model.options.tableName || modelName.toLowerCase() + "s";
  const attributes = model.rawAttributes;

  const fields = [];

  Object.keys(attributes).forEach(attrName => {
    const attr = attributes[attrName];

    let definition = `      ${attrName}: {\n`;
    definition += `        type: ${getMigrationType(attr)},\n`;

    if (attr.allowNull !== undefined)
      definition += `        allowNull: ${attr.allowNull},\n`;

    if (attr.autoIncrement)
      definition += `        autoIncrement: true,\n`;

    if (attr.primaryKey)
      definition += `        primaryKey: true,\n`;

    if (attr.unique && !attr.primaryKey)
      definition += `        unique: true,\n`;

    if (attr.defaultValue !== undefined) {
        if (attr.defaultValue === "NOW" || attr.defaultValue?.key === "NOW") {
          definition += `        defaultValue: Sequelize.NOW,\n`;
        } else if (attr.defaultValue?.toString?.().includes("NOW")) {
          definition += `        defaultValue: Sequelize.NOW,\n`;
        } else {
          const defaultValue = formatFieldValue(attr.defaultValue);
          definition += `        defaultValue: ${defaultValue},\n`;
        }
      }

    if (attr.references) {
      definition += `        references: {\n`;
      definition += `          model: '${attr.references.model}',\n`;
      definition += `          key: '${attr.references.key}'\n`;
      definition += `        },\n`;

      if (attr.onUpdate)
        definition += `        onUpdate: '${attr.onUpdate}',\n`;

      if (attr.onDelete)
        definition += `        onDelete: '${attr.onDelete}',\n`;
    }

    definition = definition.replace(/,\n$/, "\n");
    definition += "      }";

    fields.push(definition);
  });

  if (model.options.timestamps) {
    if (!attributes.createdAt) {
      fields.push(`      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }`);
    }

    if (!attributes.updatedAt) {
      fields.push(`      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }`);
    }
  }

  let content = `'use strict';\n\n`;

  content += `module.exports = {\n`;
  content += `  up: async (queryInterface, Sequelize) => {\n`;
  content += `    await queryInterface.createTable('${tableName}', {\n`;
  content += fields.join(",\n");
  content += `\n    });\n`;
  content += `  },\n\n`;

  content += `  down: async (queryInterface, Sequelize) => {\n`;
  content += `    await queryInterface.dropTable('${tableName}');\n`;
  content += `  }\n`;

  content += `};\n`;

  const migrationsDir = path.join(__dirname, "../migrations");

  if (!fs.existsSync(migrationsDir))
    fs.mkdirSync(migrationsDir, { recursive: true });

  const fileName = `${timestamp}-create-${tableName}.js`;
  const filePath = path.join(migrationsDir, fileName);

  fs.writeFileSync(filePath, content);

  console.log(`✅ Generated migration: ${fileName}`);
}

async function generateAllMigrations() {
  console.log("🔄 Generating migrations from models...\n");

  try {
    const db = require("../models");

    await db.sequelize.authenticate();
    console.log("✅ Database connection established\n");

    const models = db.sequelize.models;
    const modelNames = Object.keys(models);

    console.log(`📊 Found ${modelNames.length} models:\n`);
    modelNames.forEach(name => console.log(`   - ${name}`));

    console.log("");

    const migrationsDir = path.join(__dirname, "../migrations");

    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir);

      files.forEach(file => {
        if (file.endsWith(".js"))
          fs.unlinkSync(path.join(migrationsDir, file));
      });

      console.log("🧹 Cleared existing migration files\n");
    }

    const migrationOrder = [
      "User",
      "Role",
      "Permission",
      "UserRole",
      "RolePermission"
    ];

    migrationOrder.forEach(modelName => {
      if (models[modelName]) {
        console.log(`📦 Processing model: ${modelName}`);
        generateMigration(modelName, models[modelName]);
      }
    });

    modelNames.forEach(modelName => {
      if (!migrationOrder.includes(modelName)) {
        console.log(`📦 Processing model: ${modelName}`);
        generateMigration(modelName, models[modelName]);
      }
    });

    console.log("\n✨ All migrations generated successfully!");

    const files = fs.readdirSync(migrationsDir);

    console.log("\n📝 Generated migration files:");
    files.sort().forEach(file => {
      if (file.endsWith(".js"))
        console.log(`   - ${file}`);
    });

    console.log("\nNext steps:");
    console.log("1. Review migration files");
    console.log("2. Run: npm run db:migrate");

  } catch (error) {
    console.error("❌ Error generating migrations:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  generateAllMigrations();
}

module.exports = generateAllMigrations;