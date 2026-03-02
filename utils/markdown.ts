/**
 * Hafif Markdown → HTML dönüştürücü.
 * Yalnızca content-generator.ts'nin ürettiği format desteklenir.
 * (react-markdown bağımlılığına gerek yok)
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function processInline(text: string): string {
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    // Sadece dahili linklere veya http(s) linklere izin ver
    const safe = href.startsWith("/") || href.startsWith("http")
      ? href
      : "#";
    return `<a href="${safe}" class="text-dream hover:underline font-medium">${label}</a>`;
  });
  return text;
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inList = false;
  let inBlockquote = false;

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };
  const closeBlockquote = () => {
    if (inBlockquote) {
      html.push("</blockquote>");
      inBlockquote = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      closeList();
      closeBlockquote();
      continue;
    }

    // H2: ## Başlık
    if (/^## /.test(trimmed)) {
      closeList();
      closeBlockquote();
      const text = processInline(escapeHtml(trimmed.slice(3)));
      html.push(`<h2>${text}</h2>`);
      continue;
    }

    // H3: ### Başlık
    if (/^### /.test(trimmed)) {
      closeList();
      closeBlockquote();
      const text = processInline(escapeHtml(trimmed.slice(4)));
      html.push(`<h3>${text}</h3>`);
      continue;
    }

    // Blockquote: > text
    if (/^> /.test(trimmed)) {
      closeList();
      if (!inBlockquote) {
        html.push('<blockquote>');
        inBlockquote = true;
      }
      html.push(`<p>${processInline(escapeHtml(trimmed.slice(2)))}</p>`);
      continue;
    }

    // Unordered list: - item
    if (/^[-*] /.test(trimmed)) {
      closeBlockquote();
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      const itemText = processInline(escapeHtml(trimmed.slice(2)));
      html.push(`<li>${itemText}</li>`);
      continue;
    }

    // Horizontal rule: ---
    if (/^---+$/.test(trimmed)) {
      closeList();
      closeBlockquote();
      html.push("<hr />");
      continue;
    }

    // Paragraph
    closeList();
    closeBlockquote();
    html.push(`<p>${processInline(escapeHtml(trimmed))}</p>`);
  }

  closeList();
  closeBlockquote();

  return html.join("\n");
}
