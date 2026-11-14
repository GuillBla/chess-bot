import { Fragment } from 'react';

/** Rend un mini-balisage : **gras**, `code` et *italique*. */
export function rich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export default function RichText({ text, as: Tag = 'p' }: { text: string; as?: 'p' | 'span' | 'div' }) {
  return <Tag>{rich(text)}</Tag>;
}
