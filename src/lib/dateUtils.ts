export const getAdjustedDate = (date: Date | string | number) => {
  const d = new Date(date);
  // Adjust time by -8 hours as requested in Header.tsx
  return new Date(d.getTime() - (8 * 60 * 60 * 1000));
};

export const formatPanelDate = (date: string) => {
  const adjusted = getAdjustedDate(date);
  return adjusted.toLocaleDateString();
};

export const formatPanelTime = (date: string) => {
  const adjusted = getAdjustedDate(date);
  return adjusted.toLocaleTimeString();
};
