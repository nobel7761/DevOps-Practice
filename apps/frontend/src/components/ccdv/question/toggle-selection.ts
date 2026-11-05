/** Single-answer questions replace the selection; multi-answer ones toggle up to `need` picks. */
export function toggleSelection(
  selected: number[],
  index: number,
  need: number,
): number[] {
  if (need <= 1) return [index];
  if (selected.includes(index)) return selected.filter((i) => i !== index);
  if (selected.length >= need) return selected;
  return [...selected, index].sort((a, b) => a - b);
}
