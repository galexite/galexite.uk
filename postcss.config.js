module.exports = {
  plugins: {
    "postcss-import": {},
    ...(process.env.HUGO_ENVIRONMENT === "production"
      ? {
          "@fullhuman/postcss-purgecss": {
            content: ["./layouts/**/*.html"],
          },
          cssnano: {},
        }
      : {}),
  },
};
