const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const locks = new Map();

async function read(name, fallback = {}) {
  try {
    const content = await fs.readFile(path.join(dataDir, name), 'utf8');
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function write(name, data) {
  const previous = locks.get(name) || Promise.resolve();
  const next = previous.then(async () => {
    const file = path.join(dataDir, name);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2));
    await fs.rename(tmp, file);
  });
  locks.set(name, next.catch(() => { }));
  return next;
}

module.exports = { read, write };
