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
  // ASSETS kadang mengembalikan redirect (mis. base.html tidak ketemu di
  // deploy). Redirect HARUS diikutin manual di sini, karena kalau respon
  // 3xx diteruskan mentah ke browser = "network error ... not follow".
  try {
    const manual = { redirect: "manual" };
    let res = await context.env.ASSETS.fetch(
      new URL("/p/base.html", url.origin).toString(),
      manual
    );
    let hops = 0;
    while (res && res.status >= 300 && res.status < 400 && hops < 3) {
      const loc = res.headers.get("location");
      if (!loc) break;
      res = await context.env.ASSETS.fetch(
        new URL(loc, url.origin).toString(),
        manual
      );
      hops++;
    }
    if (!res || !res.ok) return context.next();
    return res;
  } catch (e) {
    return context.next();
  }
}
