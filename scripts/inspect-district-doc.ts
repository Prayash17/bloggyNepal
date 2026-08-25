import fs from "fs";
import mammoth from "mammoth";

const DOCX_PATH =
  process.argv[2] ||
  "D:\\District Docs\\Nepal all district detail.docx";

async function main() {
  console.log("");
  console.log("🇳🇵 BloggyNepal DOCX INSPECTOR");
  console.log("================================");
  console.log("");
  console.log(`DOCX: ${DOCX_PATH}`);

  if (!fs.existsSync(DOCX_PATH)) {
    throw new Error(
      `DOCX not found:\n${DOCX_PATH}`
    );
  }

  const result = await mammoth.extractRawText({
    path: DOCX_PATH,
  });

  const text = result.value;

  if (!text.trim()) {
    throw new Error(
      "DOCX contains no readable text."
    );
  }

  const lines = text
    .split(/\r?\n/)
    .map((line, index) => ({
      number: index + 1,
      text: line.replace(/\u00a0/g, " ").trim(),
    }))
    .filter((line) => line.text.length > 0);

  console.log("");
  console.log(
    `Extracted ${lines.length} non-empty lines`
  );

  /*
   * Find Darchula specifically.
   */
  const darchulaIndex = lines.findIndex((line) =>
    line.text
      .toLowerCase()
      .includes("darchula")
  );

  if (darchulaIndex === -1) {
    console.log("");
    console.log(
      "❌ Darchula was not found."
    );
    return;
  }

  /*
   * Print approximately 100 lines around Darchula.
   */
  const start = Math.max(
    0,
    darchulaIndex - 5
  );

  const end = Math.min(
    lines.length,
    darchulaIndex + 100
  );

  console.log("");
  console.log(
    "================================"
  );
  console.log(
    "📍 DARCHULA EXTRACTED CONTENT"
  );
  console.log(
    "================================"
  );
  console.log("");

  for (let i = start; i < end; i++) {
    console.log(
      `${String(lines[i].number).padStart(4, " ")} | ${lines[i].text}`
    );
  }

  /*
   * Also write the entire extracted document
   * to a text file.
   */
  const outputPath =
    "D:\\District Docs\\mammoth-extracted.txt";

  fs.writeFileSync(
    outputPath,
    lines
      .map(
        (line) =>
          `${line.number} | ${line.text}`
      )
      .join("\n"),
    "utf8"
  );

  console.log("");
  console.log(
    `✅ Full extracted text saved to:`
  );
  console.log(outputPath);
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "❌ Inspector failed:"
  );
  console.error(error);
  console.error("");
  process.exit(1);
});