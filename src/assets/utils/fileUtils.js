export const ensureArray = (value) => {
  if (Array.isArray(value)) return value;

  if (
    typeof value === "string" &&
    (value.startsWith("[") || value.startsWith("{"))
  ) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (keys.length > 0 && keys.every((k) => !isNaN(parseInt(k)))) {
      return Object.values(value);
    }
  }

  return [];
};

export const normalizeFileData = (file) => {
  if (!file) return null;

  return {
    ...file,
    locations: ensureArray(file.locations),
    matchedWords: Array.isArray(file.matchedWords) ? file.matchedWords : [],
    tags: Array.isArray(file.tags) ? file.tags : [],
  };
};
