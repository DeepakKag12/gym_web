/**
 * Cloudinary delivery helper.
 *
 * Every photo in this app is uploaded to Cloudinary and then rendered at its
 * ORIGINAL size — a 3 MB phone photo downloads in full to fill a 400 px card.
 * Inserting a transform into the URL makes Cloudinary do the work instead:
 *
 *   .../upload/v1699/product.jpg
 *   .../upload/f_auto,q_auto,w_400,c_limit,dpr_auto/v1699/product.jpg
 *
 *   f_auto    serve WebP/AVIF when the browser supports it
 *   q_auto    pick a quality that still looks right
 *   w_,c_limit  never send more pixels than the slot needs (never upscales)
 *   dpr_auto  respect retina screens without hard-coding 2x
 *
 * In practice this is a 60–90% cut in image bytes, which on a phone is the
 * difference between a page that appears instantly and one that fills in.
 *
 * Anything that is not a Cloudinary URL is returned untouched.
 */
const CLD = '/upload/';

export function img(url, width = 800) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes(CLD)) return url;
  // Already transformed (someone passed a URL through twice) — leave it alone.
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d)/.test(url)) return url;
  return url.replace(CLD, `${CLD}f_auto,q_auto,w_${width},c_limit,dpr_auto/`);
}

/** Convenience for square thumbnails (avatars, list rows). */
export function thumb(url, size = 120) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes(CLD)) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d)/.test(url)) return url;
  return url.replace(CLD, `${CLD}f_auto,q_auto,w_${size},h_${size},c_fill,g_auto,dpr_auto/`);
}
