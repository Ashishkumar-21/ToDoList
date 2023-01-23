const express = require("express");
const app = express();
const PORT = process.env.PORT || 3006;

// your code

app.listen(PORT, () => {
  console.log("server started on port 3006");
});