HEZAMEDIA — news link previews on NETLIFY, deployed by DRAG & DROP

1. Unzip this zip on your computer. You get a folder with index.html, _redirects, netlify/functions/share.js, assets/ ...
2. Netlify > your site > Deploys tab > drag the UNZIPPED FOLDER (not the zip) onto "Drag and drop your site folder here".
   Keep the folder structure exactly as it is. Do not rename _redirects or netlify/functions.
3. Wait for "Published". Then: Netlify > Functions tab should list "share".

TEST
- Open a story link > right-click > View Page Source > og:image should be the cover (res.cloudinary.com/...).
- WhatsApp remembers old previews: test with a story link nobody has shared before.
- Facebook: https://developers.facebook.com/tools/debug/ > Scrape Again.
