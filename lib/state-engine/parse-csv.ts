/**
 * 簡易CSVパーサ（ダブルクォート内の改行・カンマに対応）
 */

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (inQuotes) {
      current += c;
    } else if (c === ',') {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * 複数行にまたがるCSVをパース（先頭行をヘッダーとして使用）
 * ダブルクォート内の改行は1セルとして扱う
 */
export function parseCsv(content: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let i = 0;
  let line = '';
  const headers: string[] = [];
  let inQuotes = false;

  while (i < content.length) {
    const c = content[i];
    if (c === '"') {
      if (inQuotes && content[i + 1] === '"') {
        line += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        line += c;
        i++;
      }
      continue;
    }
    if (!inQuotes && (c === '\n' || c === '\r')) {
      if (line.length > 0) {
        const cells = parseCsvRow(line);
        if (headers.length === 0) {
          headers.push(...cells);
        } else {
          rows.push(cells);
        }
        line = '';
      }
      if (c === '\r' && content[i + 1] === '\n') i++;
      i++;
      continue;
    }
    line += c;
    i++;
  }
  if (line.length > 0) {
    const cells = parseCsvRow(line);
    if (headers.length === 0) headers.push(...cells);
    else rows.push(cells);
  }
  return { headers, rows };
}

/** 行をオブジェクトの配列に（ヘッダーをキーに） */
export function csvToObjects<T extends Record<string, string>>(
  content: string,
  mapRow: (row: Record<string, string>) => T
): T[] {
  const { headers, rows } = parseCsv(content);
  return rows.map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = cells[idx] ?? '';
    });
    return mapRow(row);
  });
}
