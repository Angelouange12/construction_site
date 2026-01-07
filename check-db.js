const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, 'backend', 'src', 'database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err.message);
    return;
  }
  console.log('Connecté à la base de données SQLite');
});

// Vérifier les tables existantes
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Erreur lors de la lecture des tables:', err);
    return;
  }
  
  console.log('\nTables dans la base de données:');
  console.table(tables);
  
  // Si la table users existe, afficher son contenu
  if (tables.some(t => t.name === 'users')) {
    db.all("SELECT id, email, role, is_active FROM users", [], (err, users) => {
      if (err) {
        console.error('Erreur lors de la lecture des utilisateurs:', err);
        return;
      }
      
      console.log('\nUtilisateurs dans la base de données:');
      if (users.length > 0) {
        console.table(users);
      } else {
        console.log('Aucun utilisateur trouvé dans la base de données');
      }
      
      db.close();
    });
  } else {
    console.log("La table 'users' n'existe pas");
    db.close();
  }
});
