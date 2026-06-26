const fs = require('fs');
const path = require('path');

const TYPES = [
  { folder: 'buttons', collection: 'buttons' },
  { folder: 'selectMenus', collection: 'selectMenus' },
  { folder: 'modals', collection: 'modals' },
];

module.exports = (client) => {
  const base = path.join(__dirname, '..', 'components');
  let total = 0;

  for (const { folder, collection } of TYPES) {
    const dir = path.join(base, folder);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((file) => file.endsWith('.js'));
    for (const file of files) {
      try {
        const component = require(path.join(dir, file));
        if (component.id && component.execute) {
          client[collection].set(component.id, component);
          total++;
        } else {
          console.warn(`[components] Skipping invalid file (missing id/execute): ${folder}/${file}`);
        }
      } catch (error) {
        console.error(`[components] Failed to load ${folder}/${file}:`, error);
      }
    }
  }

  console.log(`[components] Loaded ${total} components.`);
};
