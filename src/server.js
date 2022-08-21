const app = require("./");

const port = 3333;
app.listen(port, () => {
  const date = new Date();
  const hour = date.getHours();
  const min = date.getMinutes();
  console.log(
    `TodoAPI on port ${port} - ${date.toLocaleDateString(
      "pt-br"
    )} ${hour}:${min}`
  );
});
