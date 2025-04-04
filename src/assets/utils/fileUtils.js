// src/utils/fileUtils.js

/**
 * Ensures a value is an array - useful for normalizing locations data
 * This function handles different scenarios where what should be an array
 * might come back as something else (string, object, etc.)
 *
 * @param {any} value - The value to check/convert
 * @returns {Array} - Either the original array or a new empty array
 */
export const ensureArray = (value) => {
  // Case 1: If it's already an array, simply return it
  if (Array.isArray(value)) return value;

  // Case 2: If it's a string that looks like JSON, try to parse it
  // This handles cases where the array might have been stringified
  // Example: value = "[{\"text\":\"hello\",\"x\":10,\"y\":20}]"
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

  // Case 3: If it's an object that looks like an array but isn't
  // This handles the case where an array-like object is returned
  // Example: value = {0: {text: "hello"}, 1: {text: "world"}}
  if (value && typeof value === "object" && !Array.isArray(value)) {
    // Check if it has numeric keys like {0: item1, 1: item2}
    const keys = Object.keys(value);
    if (keys.length > 0 && keys.every((k) => !isNaN(parseInt(k)))) {
      return Object.values(value);
    }
  }

  // Default case: Return an empty array for null, undefined, or any other value
  return [];
};

/**
 * Helper function to normalize file data from the server
 * This ensures that no matter how the data arrives from the backend,
 * the file object always has a consistent structure when used in components
 *
 * @param {Object} file - The file object from the server
 * @returns {Object} - Normalized file object
 */
export const normalizeFileData = (file) => {
  // If the file is null or undefined, return null
  if (!file) return null;

  // Return a new object with normalized properties
  return {
    ...file, // Keep all original properties

    // Ensure these specific properties are always arrays
    locations: ensureArray(file.locations),

    // For matchedWords and tags, use a simpler check since these are simpler structures
    matchedWords: Array.isArray(file.matchedWords) ? file.matchedWords : [],
    tags: Array.isArray(file.tags) ? file.tags : [],
  };
};
