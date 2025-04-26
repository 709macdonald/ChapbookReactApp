export const getBaseUrlWithEnv = () => {
  if (process.env.NODE_ENV === "production") {
    return "https://chapbookbackend-production.up.railway.app";
  }
  return "http://localhost:5005";
};
