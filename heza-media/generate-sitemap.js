// Usage: node tools/generate-sitemap.js   (Node 18+)
// Reads all articles from Firestore and writes sitemap.xml (static pages + one URL per story).
// Run it after publishing, or on a schedule (cron / GitHub Action), then upload sitemap.xml.
const fs = require("fs"), path = require("path");
const SITE = "https://www.hezamedia.com/";
const PROJECT = "macoco-4961a", KEY = "AIzaSyDbS-rZ2W18TD1dLfvAiejktpWF2BJXBsU";

// identical to slugify() in index.html so URLs match the site's canonical story URLs
const slugify = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/, "");
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function articles() {
  const out = []; let token = "";
  do {
    const u = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/articles?pageSize=300&key=${KEY}` + (token ? `&pageToken=${token}` : "");
    const r = await fetch(u); if (!r.ok) throw new Error("Firestore " + r.status + " " + await r.text());
    const j = await r.json(); (j.documents || []).forEach(d => out.push(d)); token = j.nextPageToken || "";
  } while (token);
  return out;
}

(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    [SITE, today, "hourly", "1.0"],
    [SITE + "?section=sport", today, "hourly", "0.8"],
    [SITE + "?section=entertainment", today, "hourly", "0.8"],
    [SITE + "?section=politics", today, "hourly", "0.8"],
  ];
  const docs = await articles();
  docs.map(d => {
    const id = d.name.split("/").pop(), f = d.fields || {};
    const title = f.title && f.title.stringValue, ts = f.publishedAt && f.publishedAt.timestampValue;
    if (!title) return null;
    const sl = slugify(title), param = sl ? id + "-" + sl : id;
    return { loc: SITE + "?story=" + encodeURIComponent(param), lm: (ts || d.updateTime || "").slice(0, 10) || today, t: ts ? Date.parse(ts) : 0 };
  }).filter(Boolean).sort((a, b) => b.t - a.t).forEach(a => urls.push([a.loc, a.lm, "weekly", "0.7"]));

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(([l, m, c, p]) => `  <url>\n    <loc>${esc(l)}</loc>\n    <lastmod>${m}</lastmod>\n    <changefreq>${c}</changefreq>\n    <priority>${p}</priority>\n  </url>`).join("\n") + "\n</urlset>\n";
  fs.writeFileSync(path.join(__dirname, "web", "sitemap.xml"), xml);
  console.log(`sitemap.xml written: ${urls.length} URLs (${docs.length} stories)`);
})().catch(e => { console.error(e); process.exit(1); });
