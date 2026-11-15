// Netlify Function — gives every story link (/?story=ID-slug) its own WhatsApp / Facebook / X preview.
// Crawlers do not run JavaScript, so this reads the story from Firestore and writes the story's title,
// summary and COVER IMAGE into the preview tags of index.html before sending it. Visitors get the same page.
const SITE = "https://www.hezamedia.com/";
const PROJECT = "macoco-4961a", KEY = "AIzaSyDbS-rZ2W18TD1dLfvAiejktpWF2BJXBsU";
const LOGO = SITE + "assets/heza-og-image.png";

const slugify = t => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/, "");
const clip = (t, n) => { t = String(t || "").replace(/\s+/g, " ").trim(); if (t.length <= n) return t;
  let c = t.slice(0, n - 1); const sp = c.lastIndexOf(" "); if (sp > n * 0.6) c = c.slice(0, sp);
  return c.replace(/[,;:.\-–—\s]+$/, "") + "…"; };
const escAttr = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function getDoc(id) {
  try {
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/articles/${encodeURIComponent(id)}?key=${KEY}`);
    if (r.ok) { const j = await r.json(); if (j.fields) return j; }
  } catch (e) {}
  return null;
}
async function findStory(param) {
  const c = []; const m = param.match(/^([A-Za-z0-9]{20})(?:-|$)/); if (m) c.push(m[1]); c.push(param);
  let p = param; for (let i = 0; i < 6 && p.includes("-"); i++) { p = p.slice(0, p.lastIndexOf("-")); c.push(p); }
  for (const id of [...new Set(c)]) { const d = await getDoc(id); if (d) return [id, d]; }
  return [null, null];
}
function setTag(html, id, attr, val) {
  const re = new RegExp('(<(?:meta|link)\\b[^>]*\\bid="' + id + '"[^>]*\\b' + attr + '=")[^"]*(")');
  return html.replace(re, (_, a, b) => a + escAttr(val) + b);
}
const page = (body) => ({ statusCode: 200, body,
  headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "public, max-age=0, must-revalidate" } });

exports.handler = async (event) => {
  const host = (event.headers && (event.headers["x-forwarded-host"] || event.headers.host)) || "www.hezamedia.com";
  const r = await fetch("https://" + host + "/index.html");     // the normal page (static file, not redirected)
  let html = await r.text();
  try {
    const param = (event.queryStringParameters || {}).story;
    if (!param) return page(html);
    const [id, doc] = await findStory(param);
    if (!doc) return page(html);
    const f = doc.fields, s = k => (f[k] && f[k].stringValue) || "";
    const title = s("title"); if (!title) return page(html);
    let desc = s("standfirst");
    if (!desc) for (const b of (f.blocks?.arrayValue?.values || [])) { const bf = b.mapValue?.fields || {};
      if (bf.type?.stringValue === "p" && bf.text?.stringValue) { desc = bf.text.stringValue; break; } }
    if (!desc) desc = f.body?.arrayValue?.values?.[0]?.stringValue || "";
    desc = clip(desc.replace(/<[^>]*>/g, ""), 158);
    const sl = slugify(title), link = SITE + "?story=" + encodeURIComponent(sl ? id + "-" + sl : id);
    let img = s("image"), sized = false;
    if (/^https?:\/\//i.test(img)) {
      img = img.replace(/^http:\/\//i, "https://");
      if (img.includes("/upload/")) { img = img.replace("/upload/", "/upload/f_jpg,q_auto,w_1200,h_630,c_fill,g_auto/"); sized = true; }
    } else { img = LOGO; sized = true; }          // story without a cover -> logo
    const pageT = title + " | Heza Media";
    const set = [["mDesc","content",desc],["lCanon","href",link],["ogType","content","article"],
      ["ogTitle","content",pageT],["twTitle","content",pageT],["ogDesc","content",desc],["twDesc","content",desc],
      ["ogUrl","content",link],["ogImage","content",img],["twImage","content",img],
      ["ogImgW","content",sized ? "1200" : ""],["ogImgH","content",sized ? "630" : ""],["ogImgAlt","content",title]];
    for (const [i, a, v] of set) html = setTag(html, i, a, v);
    html = html.replace(/<title>[\s\S]*?<\/title>/, () => "<title>" + escAttr(pageT) + "</title>");
  } catch (e) {}
  return page(html);
};
