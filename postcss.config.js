module.exports = {
  map: false,
  plugins: {
    "postcss-import": {},
    ...(process.env.HUGO_ENVIRONMENT === "production"
      ? {
          "@fullhuman/postcss-purgecss": {
            content: ["./layouts/**/*.html"],
            safelist: ["highlight", /^language-/, "pre", "code"],
          },
          cssnano: {},
        }
      : {}),
  },
};
