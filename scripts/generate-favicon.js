const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  try {
    const sizes = [16, 32, 48, 64, 128];
    const src = path.join(__dirname, '..', 'public', 'logo.png');
    const tmpDir = path.join(__dirname, '.tmp_fav');
    if (!fs.existsSync(src)) throw new Error('Source logo not found: ' + src);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const files = [];
    for (const s of sizes) {
      const out = path.join(tmpDir, `fav-${s}.png`);
      await sharp(src).resize(s, s, { fit: 'cover' }).png().toFile(out);
      files.push(out);
    }

    const pngToIcoModule = await import('png-to-ico');
    const pngToIco = pngToIcoModule.default || pngToIcoModule;
    const buf = await pngToIco(files);
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), buf);
    console.log('FAVICON_CREATED');
  } catch (err) {
    console.error('FAVICON_ERROR', err);
    process.exit(1);
  }
})();
