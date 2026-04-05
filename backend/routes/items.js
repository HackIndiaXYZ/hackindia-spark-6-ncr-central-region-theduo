const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const itemsFile = path.join(__dirname, "../data/items.json");
const inventoryFile = path.join(__dirname, "../data/inventory.json");

// ✅ GET all items
router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(itemsFile));
  res.json(data);
});

// ✅ ADD ITEM (FIXED VERSION)
router.post("/add", (req, res) => {
  try {
    const { name, price, category, qty } = req.body;

    let items = JSON.parse(fs.readFileSync(itemsFile));
    let inventory = JSON.parse(fs.readFileSync(inventoryFile));

    const newItem = {
      id: Date.now(),
      name,
      price,
      category
    };

    items.push(newItem);

    // 🔥 ADD STOCK ALSO
    inventory[name] = (inventory[name] || 0) + Number(qty || 0);

    fs.writeFileSync(itemsFile, JSON.stringify(items, null, 2));
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));

    console.log("Item Added:", name);

    res.json({ message: "Item added", item: newItem });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;