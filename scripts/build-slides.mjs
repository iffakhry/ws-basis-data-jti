import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SLIDES_DIR = path.join(PROJECT_ROOT, "slides");
const DIST_DIR = path.join(PROJECT_ROOT, "dist");

const BASE_PATH = "/ws-basis-data-jti/";

// ========================================
// Helper
// ========================================

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSlideTitle(file) {
  const filePath = path.join(SLIDES_DIR, file);
  const content = fs.readFileSync(filePath, "utf8");

  // Coba ambil title dari frontmatter
  const titleMatch = content.match(/^title:\s*(.+)$/m);

  if (titleMatch) {
    return titleMatch[1].trim().replace(/^['"]|['"]$/g, "");
  }

  // Kalau tidak ada title, gunakan heading pertama
  const headingMatch = content.match(/^#\s+(.+)$/m);

  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Fallback menggunakan nama file
  return file
    .replace(/\.slides\.md$/, "")
    .replace(/^\d+-/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ========================================
// Clean output
// ========================================

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, {
    recursive: true,
    force: true,
  });
}

fs.mkdirSync(DIST_DIR, {
  recursive: true,
});

// ========================================
// Find slides
// ========================================

const files = fs
  .readdirSync(SLIDES_DIR)
  .filter((file) => file.endsWith(".slides.md"))
  .sort();

if (files.length === 0) {
  console.log("Tidak ada file .slides.md di folder slides/");
  process.exit(0);
}

console.log(`Ditemukan ${files.length} slide:\n`);

const slides = [];

// ========================================
// Build slides
// ========================================

for (const file of files) {
  const input = path.join(SLIDES_DIR, file);

  // Contoh:
  // 7-responsive-ui-scrollable-widget-v2.slides.md
  //
  // menjadi:
  // 7-responsive-ui-scrollable-widget-v2
  const slug = file.replace(/\.slides\.md$/, "");

  const output = path.join(DIST_DIR, slug);
  const base = `${BASE_PATH}${slug}/`;

  const title = getSlideTitle(file);

  slides.push({
    file,
    slug,
    title,
  });

  console.log(`Building: ${file}`);
  console.log(`Output : ${output}`);
  console.log(`Base   : ${base}`);

  execFileSync(
    path.join(PROJECT_ROOT, "node_modules", ".bin", "slidev"),
    ["build", input, "--out", output, "--base", base],
    {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
    },
  );

  console.log(`✓ ${slug} selesai\n`);
}

// ========================================
// Generate homepage
// ========================================

const slideCards = slides
  .map(
    (slide, index) => `
      <a
        class="slide-card"
        href="${BASE_PATH}${escapeHtml(slide.slug)}/"
      >
        <div class="slide-number">
          ${String(index + 1).padStart(2, "0")}
        </div>

        <div class="slide-info">
          <h2>${escapeHtml(slide.title)}</h2>
          <p>${escapeHtml(slide.file)}</p>
        </div>

        <div class="arrow">
          →
        </div>
      </a>
    `,
  )
  .join("\n");

const homepage = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>Workshop Basis Data - JTI</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

      background: #f7f7f8;
      color: #18181b;
    }

    .container {
      width: min(100% - 40px, 900px);
      margin: 0 auto;
      padding: 70px 0;
    }

    .header {
      margin-bottom: 40px;
    }

    .eyebrow {
      font-size: 14px;
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }

    h1 {
      margin: 0;
      font-size: clamp(32px, 6vw, 52px);
      line-height: 1.1;
      letter-spacing: -0.04em;
    }

    .description {
      margin-top: 16px;
      max-width: 650px;
      font-size: 18px;
      line-height: 1.6;
      color: #52525b;
    }

    .slides {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .slide-card {
      display: flex;
      align-items: center;
      gap: 20px;

      padding: 20px 22px;

      background: white;
      border: 1px solid #e4e4e7;
      border-radius: 14px;

      text-decoration: none;
      color: inherit;

      transition:
        transform 0.15s ease,
        border-color 0.15s ease,
        box-shadow 0.15s ease;
    }

    .slide-card:hover {
      transform: translateY(-2px);
      border-color: #a1a1aa;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    }

    .slide-number {
      width: 46px;
      height: 46px;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-shrink: 0;

      border-radius: 10px;
      background: #18181b;
      color: white;

      font-size: 14px;
      font-weight: 700;
    }

    .slide-info {
      flex: 1;
      min-width: 0;
    }

    .slide-info h2 {
      margin: 0 0 5px;

      font-size: 18px;
      line-height: 1.4;
    }

    .slide-info p {
      margin: 0;

      font-size: 13px;
      color: #71717a;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .arrow {
      font-size: 24px;
      color: #a1a1aa;
    }

    .footer {
      margin-top: 50px;

      font-size: 14px;
      color: #71717a;
    }

    @media (max-width: 600px) {
      .container {
        width: min(100% - 24px, 900px);
        padding: 40px 0;
      }

      .slide-card {
        padding: 16px;
        gap: 14px;
      }

      .slide-number {
        width: 40px;
        height: 40px;
      }

      .slide-info h2 {
        font-size: 16px;
      }

      .arrow {
        display: none;
      }
    }
  </style>
</head>

<body>

  <main class="container">

    <header class="header">
      <div class="eyebrow">
        JTI · Workshop Basis Data
      </div>

      <h1>
        Workshop Basis Data
      </h1>

      <p class="description">
        Materi praktikum Workshop Basis Data.
        Pilih materi di bawah ini untuk membuka slide presentation.
      </p>
    </header>

    <section class="slides">
      ${slideCards}
    </section>

    <footer class="footer">
      ${slides.length} materi tersedia
    </footer>

  </main>

</body>
</html>
`;

fs.writeFileSync(path.join(DIST_DIR, "index.html"), homepage, "utf8");

console.log("✓ Homepage berhasil dibuat");
console.log(`✓ Total slide: ${slides.length}`);
console.log(`✓ Output: ${path.join(DIST_DIR, "index.html")}`);
console.log("\nSemua slide berhasil di-build.");
