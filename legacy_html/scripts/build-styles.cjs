const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const header =
  "/* Generated from styles/manifest.json. Edit the source stylesheets, then run npm run build:styles. */\n";
function buildStyles() {
  const files = JSON.parse(
    fs.readFileSync(path.join(root, "styles/manifest.json"), "utf8"),
  );
  return (
    header +
    files
      .map((file) => fs.readFileSync(path.join(root, "styles", file), "utf8"))
      .join("")
  );
}
if (require.main === module)
  fs.writeFileSync(path.join(root, "style.css"), buildStyles());
module.exports = { buildStyles };
