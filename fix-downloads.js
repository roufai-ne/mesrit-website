const fs = require('fs');
const path = require('path');

const base = 'c:/Users/PAES/Desktop/Devs/mesrit-websiteV2/mesrit-website/src/pages/documentation';

// Universal fix: replace `href={doc.url}\n download` pattern in all doc pages
// Strategy: replace the <a> tag pattern with a conditional rendering
const files = [
  { name: 'index.js', oldHref: "href={doc.url}", oldDownload: "download" },
  { name: 'circulaires.js', oldHref: "href={doc.url}", oldDownload: "download" },
  { name: 'lois.js', oldHref: "href={doc.url}", oldDownload: "download" },
  { name: 'rapports.js', oldHref: "href={doc.url}", oldDownload: "download" },
  { name: 'guides.js', oldHref: "href={doc.url}", oldDownload: "download" },
];

for (const { name } of files) {
  const fp = path.join(base, name);
  let src = fs.readFileSync(fp, 'utf8');

  // Replace `href={doc.url}` with `href={doc.url || undefined}`
  if (src.includes('href={doc.url}')) {
    src = src.replaceAll('href={doc.url}', 'href={doc.url || undefined}');
    console.log(`  ✓ href fixed in ${name}`);
  } else {
    console.log(`  - href not found in ${name}`);
  }

  // Replace bare `download` attribute (not `download=`) followed by newline with conditional version
  // Pattern: standalone `download` on its own line inside an <a> tag
  src = src.replace(/(\s+)download(\s*\n)/g, (match, before, after) => {
    return `${before}download={doc.url ? (doc.title || 'document') : undefined}${after}`;
  });

  // Add disabled styling by replacing the className patterns for download buttons
  // Find lines with the download button className and add conditional opacity
  // We look for <a tags that have href={doc.url || undefined} and add disabled state handling
  // Simple approach: replace `pointer-events-none opacity-40` if already added, else skip
  // (already done by href change - browser won't navigate without href)

  fs.writeFileSync(fp, src, 'utf8');
}

console.log('\nAll files updated.');
