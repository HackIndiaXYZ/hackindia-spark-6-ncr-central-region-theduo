const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const inventoryFile = path.join(__dirname, "../data/inventory.json");

// GET INVENTORY
router.get("/", (req, res) => {
  const inventory = JSON.parse(fs.readFileSync(inventoryFile));

  const result = Object.keys(inventory).map(item => {
    let status = "healthy";

    if (inventory[item] === 0) status = "out";
    else if (inventory[item] < 5) status = "low";

    return {
      name: item,
      quantity: inventory[item],
      status
    };
  });

  res.json(result);
});

// UPDATE STOCK
router.post("/update", (req, res) => {
  const { name, quantity } = req.body;

  let inventory = JSON.parse(fs.readFileSync(inventoryFile));

  inventory[name] = quantity;

  fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));

  res.json({ message: "Stock updated" });
});

module.exports = router;