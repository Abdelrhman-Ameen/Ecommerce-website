const HomepageSetting = require('../models/homepage-setting-model');
const SiteMedia = require('../models/site-media-model');
const Product = require('../models/product-model');
const AppError = require('../utils/app-error');

const DEFAULT_HERO = [
  { image: '/assets/home/fashion-hero-01.webp', alt: 'Model in a sculptural black evening look against a red studio background', background: '#7d1718', accent: '#ee5a46' },
  { image: '/assets/home/fashion-hero-02.webp', alt: 'Model in a monochrome editorial look', background: '#d6d2cc', accent: '#171717' },
  { image: '/assets/home/fashion-hero-03.webp', alt: 'Model wearing a checked coat and white sunglasses', background: '#063b3e', accent: '#ff5a36' },
];
const DEFAULT_EDITORIAL = [
  { image: '/assets/home/fashion-hero-02.webp', alt: 'Black and white editorial fashion portrait' },
  { image: '/assets/home/fashion-hero-03.webp', alt: 'Street fashion portrait with sunglasses' },
];

function serializeSettings(setting) {
  return {
    heroMode: setting?.heroMode || 'default',
    heroProductIds: (setting?.heroProductIds || []).map(String),
    heroImages: setting?.heroImages || [],
    editorialMode: setting?.editorialMode || 'default',
    editorialProductIds: (setting?.editorialProductIds || []).map(String),
    editorialImages: setting?.editorialImages || [],
    updatedAt: setting?.updatedAt || null,
  };
}

async function productImageMap(ids) {
  const validIds = (ids || []).filter(Boolean);
  if (!validIds.length) return new Map();
  const products = await Product.find({ _id: { $in: validIds } }).select('name imageUrl').lean();
  return new Map(products.map((product) => [String(product._id), product]));
}

async function buildHomepage(setting) {
  const serialized = serializeSettings(setting);
  const [heroProducts, editorialProducts] = await Promise.all([
    serialized.heroMode === 'products' ? productImageMap(serialized.heroProductIds) : new Map(),
    serialized.editorialMode === 'products' ? productImageMap(serialized.editorialProductIds) : new Map(),
  ]);

  const heroSlides = DEFAULT_HERO.map((fallback, index) => {
    if (serialized.heroMode === 'custom' && serialized.heroImages[index]) return { ...fallback, image: serialized.heroImages[index], alt: `Vellora campaign image ${index + 1}` };
    if (serialized.heroMode === 'products') {
      const product = heroProducts.get(serialized.heroProductIds[index]);
      if (product) return { ...fallback, image: product.imageUrl, alt: product.name };
    }
    return fallback;
  });

  const editorialImages = DEFAULT_EDITORIAL.map((fallback, index) => {
    if (serialized.editorialMode === 'custom' && serialized.editorialImages[index]) return { image: serialized.editorialImages[index], alt: `Vellora editorial image ${index + 1}` };
    if (serialized.editorialMode === 'products') {
      const product = editorialProducts.get(serialized.editorialProductIds[index]);
      if (product) return { image: product.imageUrl, alt: product.name };
    }
    return fallback;
  });

  return { settings: serialized, heroSlides, editorialImages };
}

async function getHomepage(req, res) {
  const setting = await HomepageSetting.findOne({ key: 'homepage' }).lean();
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'success', data: await buildHomepage(setting) });
}

async function updateHomepage(req, res) {
  const payload = {
    heroMode: req.body.heroMode,
    heroProductIds: (req.body.heroProductIds || []).filter(Boolean).slice(0, 3),
    heroImages: (req.body.heroImages || []).filter(Boolean).slice(0, 3),
    editorialMode: req.body.editorialMode,
    editorialProductIds: (req.body.editorialProductIds || []).filter(Boolean).slice(0, 2),
    editorialImages: (req.body.editorialImages || []).filter(Boolean).slice(0, 2),
    updatedBy: req.user._id,
  };
  const setting = await HomepageSetting.findOneAndUpdate({ key: 'homepage' }, { ...payload, key: 'homepage' }, { upsert: true, returnDocument: 'after', runValidators: true });
  res.status(200).json({ status: 'success', message: 'Homepage settings saved', data: await buildHomepage(setting) });
}

function detectContentType(data) {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg';
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (data.length >= 12 && data.subarray(0, 4).toString() === 'RIFF' && data.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

async function persistMedia(req, res, purpose, maxBytes) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(req.body.dataUrl || '');
  if (!match) throw new AppError('Upload a JPEG, PNG, or WebP image', 400);
  const data = Buffer.from(match[2], 'base64');
  if (!data.length || data.length > maxBytes) throw new AppError(`Optimized image must be ${Math.round(maxBytes / 1000)} KB or smaller`, 400);
  const detected = detectContentType(data);
  if (!detected || detected !== match[1]) throw new AppError('The uploaded file is not a valid image', 400);
  const media = await SiteMedia.create({ data, contentType: detected, byteLength: data.length, purpose, uploadedBy: req.user._id });
  res.status(201).json({ status: 'success', message: 'Image uploaded', data: { imageUrl: `/api/v1/site/media/${media._id}` } });
}

async function uploadMedia(req, res) { return persistMedia(req, res, 'homepage', 180000); }
async function uploadProductMedia(req, res) { return persistMedia(req, res, 'product', 550000); }

async function getMedia(req, res) {
  const media = await SiteMedia.findById(req.params.id).select('data contentType').lean();
  if (!media) throw new AppError('Image not found', 404);
  res.setHeader('Content-Type', media.contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.status(200).send(media.data);
}

module.exports = { getHomepage, updateHomepage, uploadMedia, uploadProductMedia, getMedia };
