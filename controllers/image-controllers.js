const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");

const analyzeImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "fail", message: "Image is required" });
    const analysis = await getImageAnalysis(req.file.path);
    res.status(200).json({ status: "success", message: analysis.message, data: { filename: req.file.filename, analysis } });
  } catch (error) { res.status(400).json({ status: "error", message: error.message }); }
};

const removeBackground = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "fail", message: "Image is required" });
    const analysis = await getImageAnalysis(req.file.path);
    if (analysis.status === "poor") return res.status(400).json({ status: "fail", message: "Image quality is too low. Upload a sharper, better-lit photo.", data: { analysis } });
    const { removeBackground: remove } = await import("@imgly/background-removal-node");
    const input = await fs.readFile(req.file.path);
    const output = await remove(new Blob([input], { type: req.file.mimetype }));
    const outputName = `no-bg-${path.parse(req.file.filename).name}.png`;
    const outputPath = path.join(__dirname, "..", "uploads", "processed", outputName);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, Buffer.from(await output.arrayBuffer()));
    res.status(200).json({ status: "success", message: "Background removed successfully", data: { imageUrl: outputName, analysis } });
  } catch (error) { res.status(400).json({ status: "error", message: `Image processing failed: ${error.message}` }); }
};

async function getImageAnalysis(filePath) {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  const stats = await image.stats();
  const { data, info } = await image.clone().greyscale().resize({ width: 256, withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true });
  let difference = 0;
  let comparisons = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 1; x < info.width; x += 1) {
      const index = y * info.width + x;
      difference += Math.abs(data[index] - data[index - 1]);
      comparisons += 1;
    }
  }
  const noiseLevel = Number((difference / comparisons).toFixed(2));
  const brightness = Number(stats.channels.slice(0, 3).reduce((sum, channel) => sum + channel.mean, 0) / Math.min(stats.channels.length, 3));
  const megapixels = (metadata.width * metadata.height) / 1000000;
  let score = 100;
  if (megapixels < 1) score -= 30;
  else if (megapixels < 2) score -= 15;
  if (brightness < 45 || brightness > 225) score -= 25;
  if (noiseLevel > 35) score -= 25;
  else if (noiseLevel > 25) score -= 10;
  score = Math.max(score, 0);
  const status = score >= 75 ? "good" : score >= 50 ? "warning" : "poor";
  return {
    width: metadata.width,
    height: metadata.height,
    megapixels: Number(megapixels.toFixed(2)),
    brightness: Number(brightness.toFixed(2)),
    noiseLevel,
    score,
    status,
    message: status === "good" ? "Image is ready for processing" : status === "warning" ? "Image can be used, but better lighting or resolution is recommended" : "Image quality is too low",
  };
}

module.exports = { analyzeImage, removeBackground };
