const app = require("./app");
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server is running at port: ${port}`);
  });
}

module.exports = app;
