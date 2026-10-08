import { img, thumb } from '../utils/img';

describe('Cloudinary image delivery optimizer', () => {
  test('returns non-cloudinary URLs untouched', () => {
    const external = 'https://images.unsplash.com/photo-1234?w=500';
    expect(img(external, 600)).toBe(external);
    expect(thumb(external, 100)).toBe(external);
  });

  test('returns non-string or falsy inputs untouched', () => {
    expect(img(null)).toBeNull();
    expect(img('')).toBe('');
    expect(thumb(undefined)).toBeUndefined();
  });

  test('transforms Cloudinary image with width and auto formats', () => {
    const raw = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
    const transformed = img(raw, 400);
    expect(transformed).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,c_limit,dpr_auto/v1234/sample.jpg'
    );
  });

  test('creates square crop thumbnail with fill mode', () => {
    const raw = 'https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg';
    const transformed = thumb(raw, 150);
    expect(transformed).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_150,h_150,c_fill,g_auto,dpr_auto/v1234/sample.jpg'
    );
  });

  test('does not re-transform already transformed Cloudinary URLs', () => {
    const alreadyTransformed = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400,c_limit,dpr_auto/v1234/sample.jpg';
    expect(img(alreadyTransformed, 600)).toBe(alreadyTransformed);
    expect(thumb(alreadyTransformed, 120)).toBe(alreadyTransformed);
  });
});
