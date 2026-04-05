const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/items", require("./routes/items"));
app.use("/bill", require("./routes/billing"));
app.use("/inventory", require("./routes/inventory"));
app.use("/ai", require("./routes/ai"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});