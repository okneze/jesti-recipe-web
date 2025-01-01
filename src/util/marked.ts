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

function ingredientRenderer(multiplier: number = 1): RendererObject {
  return {
    em({ tokens }: Tokens.Em): string {
      const content = this.parser.parseInline(tokens);
      const isComma = content.includes(",");
      const num = /([0-9.,/]+)[-]?([0-9.,/]*)/.exec(content.replace(",", "."));

      function calc(input: string): string {
        const isFrac = input.includes("/");
        const product = new Fraction(input).mul(multiplier);
        return isFrac ? product.toFraction() : (isComma ? product.toString(2).replace(".", ",") : product.toString(2));
      }

      if(num) {
        const resultLeft = calc(num[1]);
        if(num[2] !== "") {
          // second part of range
          const resultRight = calc(num[2]);
          return `<em>${content.replace(",", ".").replace(num[0], `${resultLeft}-${resultRight}`)}</em>`;
        }
        return `<em>${content.replace(",", ".").replace(num[0], resultLeft)}</em>`;
      }
      return `<em>${content}</em>`;
    }
  }
}

export {imageRenderer, ingredientRenderer};