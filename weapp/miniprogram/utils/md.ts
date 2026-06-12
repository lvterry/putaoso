export interface TextSegment {
  text: string;
  bold: boolean;
}

/** 把含 **加粗** 的字符串切成段，供 wxml 循环渲染，不让原始 markdown 暴露给用户 */
export function parseBold(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    segments.push({ text: text.slice(last), bold: false });
  }

  return segments;
}
