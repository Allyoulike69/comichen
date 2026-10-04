// Cloudflare Pages Function: pengganti .htaccess untuk pretty URL /p/<id>.
// Hanya rewrite ID cantik (tanpa titik). File asli (*.json, *.js, *.html,
// *.png, *.webmanifest, dll) diteruskan normal agar homepage tidak No data.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const id = (context.params && context.params.id) || "";

  // Ada titik = file asli, jangan dibajak.
  if (id.includes(".")) {
    return context.next();
  }

  // ID cantik: huruf, angka, _ dan - (sama kayak .htaccess).
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return context.next();
  }

  // Sajikan isi /p/base.html dengan URL tetap cantik + status 200.
  // Pakai string (bukan objek URL) + fallback ke next() biar tidak ERR_FAILED.
  try {
    const baseStr = new URL("/p/base.html", url.origin).toString();
    const res = await context.env.ASSETS.fetch(baseStr);
    if (!res || !res.ok) return context.next();
    return res;
  } catch (e) {
    return context.next();
  }
}
