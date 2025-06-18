const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../posts');
const indexFile = path.join(postsDir, 'index.json');

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};
  const lines = match[1].split('\n');
  const data = {};
  lines.forEach(line => {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) data[key.trim()] = rest.join(':').trim();
  });
  return data;
}

const posts = fs.readdirSync(postsDir)
  .filter(f => f.endsWith('.md'))
  .map(filename => {
    const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    const frontmatter = extractFrontmatter(content);
    return {
      title: frontmatter.title || filename,
      date: frontmatter.date || '',
      file: frontmatter.path
    };
  });

fs.writeFileSync(indexFile, JSON.stringify(posts, null, 2));
console.log('index.json generated.');