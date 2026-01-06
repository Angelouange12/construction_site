// server.js
const { exec } = require('child_process');

// Démarrer le serveur
const server = exec('node src/app.js');

// Afficher la sortie du serveur
server.stdout.on('data', (data) => console.log(data.toString()));
server.stderr.on('data', (data) => console.error(data.toString()));

// Garder le processus en vie
setInterval(() => {}, 1000 * 60 * 60 * 24);

// Gérer correctement les signaux d'arrêt
process.on('SIGTERM', () => {
  console.log('Reçu un signal d\'arrêt. Arrêt en cours...');
  process.exit(0);
});