export function computeDiff(oldData: Record<string, unknown>, newData: Record<string, unknown>, options?: { ignore?: string[] }) {
  const ignore = new Set(options?.ignore || []);
  const changes: { field: string; oldValue?: unknown; newValue?: unknown }[] = [];
  const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  for (const key of keys) {
    if (ignore.has(key)) continue;
    const before = (oldData as any)?.[key];
    const after = (newData as any)?.[key];
    const bothObjects = typeof before === 'object' && before !== null && typeof after === 'object' && after !== null;
    const equal = bothObjects ? JSON.stringify(before) === JSON.stringify(after) : before === after;
    if (!equal) {
      changes.push({ field: key, oldValue: before, newValue: after });
    }
  }
  return changes;
}


