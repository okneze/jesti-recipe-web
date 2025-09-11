import Fraction from "fraction.js";
import { RendererObject, Tokens } from "marked";
import { convertRawGitHubUrlToProxy } from "./Recipedata";
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

function imageRenderer(root: string, author: string, repository: string, branch: string): RendererObject {
  return {
    image({ href, title, text }: Tokens.Image): string {
      let imageUrl: string;
      
      // Check if it's a relative path (doesn't start with http)
      if (!href.startsWith('http')) {
        // Create proxy URL for authenticated image access
        const params = new URLSearchParams({
          author: author,
          repository: repository,
          branch: branch,
          path: href
        });
        imageUrl = `/api/image?${params.toString()}`;
      } else {
        // Check if it's a raw.githubusercontent.com URL that needs proxying
        const proxyUrl = convertRawGitHubUrlToProxy(href);
        if (proxyUrl) {
          imageUrl = proxyUrl;
        } else {
          // For other absolute URLs, use them directly
          const cleanHref = cleanUrl(href);
          if (cleanHref === null) {
            return escape(text);
          }
          imageUrl = cleanHref;
        }
      }

      let out = `<img src="${imageUrl}" alt="${text}" onerror="console.info('Broken image: ${imageUrl}'); this.remove()"`;
      if (title) {
        out += ` title="${escape(title)}"`;
      }
      out += '>';
      return out;
    }
  }
}


function linkRenderer(): RendererObject {
  return {
    link({ href, title, tokens }: Tokens.Link): string {
      const text = this.parser.parseInline(tokens);
      const cleanHref = cleanUrl(href);
      if (cleanHref === null) {
        return text;
      }
      href = cleanHref;
      const url = new URL(href, window.location.href);
      // resolve simple relative paths
      if(url.origin === new URL(window.location.href).origin && url.pathname.endsWith(".md")) {
        href = url.href.replace(".md", "");
      }
      // TODO: resolve absolute paths to other repositories
      let out = '<a href="' + href + '"';
      if (title) {
        out += ' title="' + (escape(title)) + '"';
      }
      out += '>' + text + '</a>';
      return out;
    }
  }
}

function replaceUnicodeFractions(str: string) {
  const mapObj: Record<string, string> = {"¼": "1/4", "½": "1/2", "¾": "3/4", "⅐": "1/7", "⅑": "1/9", "⅒": "1/10", "⅓": "1/3", "⅔": "2/3", "⅕": "1/5", "⅖": "2/5", "⅗": "3/5", "⅘": "4/5", "⅙": "1/6", "⅚": "5/6", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8", "⅟": "1/", "↉": "0/3"};
  const re = new RegExp(Object.keys(mapObj).join("|"),"gi");

  return str.replace(re, function(matched){
      return mapObj[matched.toLowerCase()];
  });
}

function splitAmountList(list: string): string[] {
  return list === "" ? [] : list.replaceAll("–", "-").split(/(?<!\d),|,(?!\d)/);
}

function splitAmountUnit(amount: string): string[] {
  const isComma = amount.includes(",");
  const num = /([0-9.,/]+)\s?[-]?\s?([0-9.,/]*)(.*)/.exec(amount.replace(",", "."));
  if(num) {
    if(num[2] !== "") {
      // second part of range
      const res = `${num[1]}-${num[2]}`;
      return [isComma ? res.replaceAll(".", ",") : res, num[3]];
    }
    return [isComma ? num[1].replace(".", ",") : num[1], num[3]];
  }
  return [amount];
}

function multiplyAmount(amount: string, multiplier: number): string {
  const isComma = amount.includes(",");
  const num = /([0-9.,/]+)[-]?([0-9.,/]*)/.exec(amount.replace(",", "."));

  function calc(input: string): string {
    try {
      const isFrac = input.includes("/");
      const product = new Fraction(input).mul(multiplier);
      const decimals = "" + parseFloat(product.valueOf().toFixed(2));
      return isFrac ? product.toFraction() : (isComma ? decimals.replace(".", ",") : decimals);
    } catch {
      return input;
    }
  }

  if(num) {
    const resultLeft = calc(num[1]);
    if(num[2] !== "") {
      // second part of range
      const resultRight = calc(num[2]);
      return amount.replace(",", ".").replace(num[0], `${resultLeft}-${resultRight}`);
    }
    return amount.replace(",", ".").replace(num[0], resultLeft);
  }
  return amount;

}

function ingredientRenderer(multiplier: number = 1): RendererObject {
  return {
    em({ tokens }: Tokens.Em): string {
      const content = replaceUnicodeFractions(this.parser.parseInline(tokens));
      return `<em>${multiplyAmount(content, multiplier)}</em>`;
    }
  }
}

export {imageRenderer, linkRenderer, ingredientRenderer, splitAmountList, multiplyAmount, splitAmountUnit};