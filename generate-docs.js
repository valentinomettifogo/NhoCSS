// generate-docs.js
import fs from "fs";
import path from "path";

const srcDir = path.resolve("./src");
const outputFile = path.resolve("./docs/docs.html");

// Legge tutti i file .scss nella cartella src
const scssFiles = fs.readdirSync(srcDir).filter(f => f.endsWith(".scss"));

const sections = {};
let currentSection = "Uncategorized";

for (const file of scssFiles) {
  const content = fs.readFileSync(path.join(srcDir, file), "utf-8");
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const docsMatch = line.match(/\/\/\s*@docs:\s*(.+)/);
    if (docsMatch) {
      currentSection = docsMatch[1].trim();
      if (!sections[currentSection]) {
        sections[currentSection] = new Set();
      }
      continue;
    }

    // Cerca classi .className nella riga
    const classMatches = Array.from(line.matchAll(/\.([a-zA-Z0-9\-_]+)/g)).map(m => m[1]);
    if (classMatches.length > 0) {
      if (!sections[currentSection]) {
        sections[currentSection] = new Set();
      }
      classMatches.forEach(c => sections[currentSection].add(c));
    }
  }
}

// Converte i Set in array e ordina
for (const key in sections) {
  sections[key] = Array.from(sections[key]).sort();
}

// Genera HTML
const html = `
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nho - Documentation</title>
    <link rel="stylesheet" href="https://valentinomettifogo.github.io/NhoCSS/dist/nho.min.css">
    <link rel="icon" href="https://valentinomettifogo.github.io/NhoCSS/favicon.png" type="image/png">
</head>
<body>

<nav class="flex items-center justify-end py-2 px-4 bg-white">
    <a href="https://github.com/valentinomettifogo/NhoCSS" target="_blank" class="fw-semibold px-4 py-1 text-primary">github.com</a>
    <a href="/NhoCSS" class="fw-semibold px-4 py-1 text-primary">home</a>
</nav>

<div class="container">
    <h1 class="mt-3">Available Classes</h1>
    ${Object.entries(sections).map(([section, classes]) => `
    <h2 class="border-b my-4 text-primary">${section}</h2>
    <ul class="grid">
      ${classes.map(c => `<li class="col-4">${c}</li>`).join("\n")}
    </ul>
  `).join("\n")}
</div>
</body>
</html>
`;

fs.writeFileSync(outputFile, html, "utf-8");
console.log(`✅ Docs generated in ${outputFile}`);