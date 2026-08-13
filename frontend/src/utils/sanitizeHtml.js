const ALLOWED_TAGS = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'DIV',
  'EM',
  'FONT',
  'H2',
  'H3',
  'H4',
  'I',
  'LI',
  'OL',
  'P',
  'SPAN',
  'STRONG',
  'U',
  'UL',
]);

const ALLOWED_FONT_SIZES = new Set(['1', '2', '3', '4', '5', '6', '7']);
const ALLOWED_TEXT_ALIGN = new Set(['left', 'center', 'right', 'justify']);

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const sanitizeStyle = (styleValue) => {
  const safeRules = [];

  styleValue.split(';').forEach((rule) => {
    const [rawProperty, rawValue] = rule.split(':');
    if (!rawProperty || !rawValue) return;

    const property = rawProperty.trim().toLowerCase();
    const value = rawValue.trim().toLowerCase();

    if (property === 'text-align' && ALLOWED_TEXT_ALIGN.has(value)) {
      safeRules.push(`${property}: ${value}`);
    }

    if (
      property === 'margin-left' &&
      /^([0-9]|[1-9][0-9]|1[0-9]{2})(px|rem|em|%)$/.test(value)
    ) {
      safeRules.push(`${property}: ${value}`);
    }
  });

  return safeRules.join('; ');
};

const sanitizeUrl = (url) => {
  const trimmed = url.trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) {
    return trimmed;
  }
  return '';
};

export const sanitizeRichHtml = (value = '') => {
  if (!value.trim()) return '';

  const html = /<[^>]+>/.test(value)
    ? value
    : escapeHtml(value).replace(/\r?\n/g, '<br>');

  const template = document.createElement('template');
  template.innerHTML = html;

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }

    const tagName = node.tagName;
    if (!ALLOWED_TAGS.has(tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }

    Array.from(node.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;

      if (name.startsWith('on')) {
        node.removeAttribute(attribute.name);
        return;
      }

      if (tagName === 'A' && name === 'href') {
        const safeUrl = sanitizeUrl(value);
        if (safeUrl) {
          node.setAttribute('href', safeUrl);
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noreferrer');
        } else {
          node.removeAttribute(attribute.name);
        }
        return;
      }

      if (tagName === 'FONT' && name === 'size' && ALLOWED_FONT_SIZES.has(value)) {
        return;
      }

      if (name === 'align' && ALLOWED_TEXT_ALIGN.has(value.toLowerCase())) {
        node.setAttribute('style', `text-align: ${value.toLowerCase()}`);
        node.removeAttribute('align');
        return;
      }

      if (name === 'style') {
        const safeStyle = sanitizeStyle(value);
        if (safeStyle) {
          node.setAttribute('style', safeStyle);
        } else {
          node.removeAttribute(attribute.name);
        }
        return;
      }

      node.removeAttribute(attribute.name);
    });
  };

  let previousMarkup;
  do {
    previousMarkup = template.innerHTML;
    const nodes = template.content.querySelectorAll('*');
    nodes.forEach(cleanNode);
  } while (previousMarkup !== template.innerHTML);

  return template.innerHTML;
};
