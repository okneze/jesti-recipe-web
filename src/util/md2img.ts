import { RendererObject, Tokens } from "marked";
import p from "path-browserify";
// Override function

// HELPERS FROM https://github.com/markedjs/marked/blob/master/src/helpers.ts
function escape(html: string, encode?: boolean) {
  const escapeReplacements: { [index: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  const getEscapeReplacement = (ch: string) => escapeReplacements[ch];
  if (encode) {
    if (/[&<>"']/.test(html)) {
      return html.replace(/[&<>"']/g, getEscapeReplacement);
    }
  } else {
    if (/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/.test(html)) {
      return html.replace(/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, getEscapeReplacement);
    }
  }

  return html;
}
function cleanUrl(href: string) {
  try {
    href = encodeURI(href).replace(/%25/g, '%');
  } catch {
    return null;
  }
  return href;
}

function absolutePath(root: string, path: string) {
  if(path.startsWith("http")) {
    return path;
  } else {
    return p.join(root, path);
  }

}
function imageRenderer(root: string): RendererObject {
  return {
    image({ href, title, text }: Tokens.Image): string {
      const cleanHref = cleanUrl(absolutePath(root, href));
      if (cleanHref === null) {
        return escape(text);
      }
      href = cleanHref;

      let out = `<img src="${href}" alt="${text}"`;
      if (title) {
        out += ` title="${escape(title)}"`;
      }
      out += '>';
      return out;
    }
  }
}

export {absolutePath, imageRenderer};