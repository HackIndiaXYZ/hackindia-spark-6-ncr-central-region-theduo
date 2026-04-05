const express = require("express");
const fs = require("fs");
const router = express.Router();

const filePath = "./data/items.json";

router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath));
  res.json(data);
});

router.post("/add", (req, res) => {
  const { name, price, category } = req.body;

  let items = JSON.parse(fs.readFileSync(filePath));

  const newItem = {
    id: Date.now(),
    name,
    price,
    category
  };

  items.push(newItem);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2));

  res.json({ message: "Item added", item: newItem });
});

module.exports = router;