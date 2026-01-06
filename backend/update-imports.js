// This script will update all model files to use the correct sequelize import
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src/models');
const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js') && file !== 'index.js');

modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import statement
    const updatedContent = content.replace(
        /const sequelize = require\('\.\.\/config\/database'\);/,
        "const { sequelize } = require('../config/database');"
    );
    
    // Write the updated content back to the file
    if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated ${file}`);
    } else {
        console.log(`ℹ️ No changes needed for ${file}`);
    }
});

console.log('✅ All model files have been updated');