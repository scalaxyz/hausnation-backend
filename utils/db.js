const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize JSON files if they don't exist
const initFiles = () => {
  const files = {
    'artists.json': [],
    'releases.json': [],
    'admin.json': {
      username: '',
      password: ''
    }
  };

  Object.keys(files).forEach(filename => {
    const filepath = path.join(dataDir, filename);
    if (!fs.existsSync(filepath)) {
      fs.writeFileSync(filepath, JSON.stringify(files[filename], null, 2));
    }
  });
};

// Read JSON file
const readJSON = (filename) => {
  try {
    const filepath = path.join(dataDir, filename);
    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return filename === 'admin.json' ? {} : [];
  }
};

// Write JSON file
const writeJSON = (filename, data) => {
  try {
    const filepath = path.join(dataDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  initFiles,
  readJSON,
  writeJSON,
  generateId
};
