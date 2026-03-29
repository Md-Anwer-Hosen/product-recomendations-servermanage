const app = require("./app");
const port = process.env.PORT || 5000;

// লোকাল টেস্টের জন্য
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });
}

// Vercel-এর জন্য এক্সপোর্ট
module.exports = app;
