const { sequelize, Sequelize } = require('../config/database');
const DataTypes = Sequelize.DataTypes;
const fs = require('fs');
const path = require('path');

// Liste des modèles disponibles
const modelFiles = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .map(file => file.replace('.js', ''));

console.log('📁 Available models:', modelFiles);

// Charger dynamiquement tous les modèles
const models = {};
modelFiles.forEach(modelName => {
  try {
    const modelPath = `./${modelName}`;
    models[modelName] = require(modelPath)(sequelize, DataTypes);
    console.log(`✅ Loaded model: ${modelName}`);
  } catch (error) {
    console.error(`❌ Failed to load model ${modelName}:`, error.message);
  }
});

// Si vous voulez des alias spécifiques (optionnel)
const {
  User,
  Site,
  Task,
  Incident,
  Material,
  Photo
  // Project // seulement si le fichier existe
} = models;

// Définir les associations (seulement si les modèles existent)
if (User && Site) {
  User.hasMany(Site, { foreignKey: 'userId', as: 'sites' });
  Site.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}

if (Site && Task) {
  Site.hasMany(Task, { foreignKey: 'siteId', as: 'tasks' });
  Task.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });
}

if (Site && Incident) {
  Site.hasMany(Incident, { foreignKey: 'siteId', as: 'incidents' });
  Incident.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });
}

if (Site && Material) {
  Site.hasMany(Material, { foreignKey: 'siteId', as: 'materials' });
  Material.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });
}

if (Site && Photo) {
  Site.hasMany(Photo, { foreignKey: 'siteId', as: 'photos' });
  Photo.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });
}

if (User && Task) {
  User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
}

// Synchroniser la base de données
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log(`✅ Database synchronized ${force ? '(forced)' : ''}`);
    return true;
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    return false;
  }
};

// Exporter tous les modèles et l'instance sequelize
module.exports = {
  sequelize,
  Sequelize,
  syncDatabase,
  ...models
};