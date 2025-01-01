import Fraction from "fraction.js";
import { RendererObject, Tokens } from "marked";
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

function imageRenderer(root: string): RendererObject {
  return {
    image({ href, title, text }: Tokens.Image): string {
      const cleanHref = cleanUrl(new URL(href, root).href);
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

function ingredientRenderer(multiplier?: number): RendererObject {
  return {
    em({ tokens }: Tokens.Em): string {
      const content = this.parser.parseInline(tokens);
      const isComma = content.includes(",");
      const num = /[0-9.,/]+/.exec(content.replace(",", "."));
      if(num && multiplier) {
        const isFrac = num[0].includes("/");
        const product = new Fraction(num[0]).mul(multiplier);
        return `<em>${content.replace(num[0], isFrac ? product.toFraction() : (isComma ? product.toString(2).replace(".", ",") : product.toString(2)))}</em>`;
      }
      return `<em>${content}</em>`;
    }
  }
}

export {imageRenderer, ingredientRenderer};