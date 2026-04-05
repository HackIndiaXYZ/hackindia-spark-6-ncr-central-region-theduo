const express = require("express");
const fs = require("fs");

const router = express.Router();

router.get("/", (req, res) => {
  const inventory = JSON.parse(fs.readFileSync("./data/inventory.json"));

  const result = Object.keys(inventory).map(item => {
    let status = "Good";

    if (inventory[item] === 0) status = "Out of Stock";
    else if (inventory[item] < 5) status = "Low Stock";

    return {
      name: item,
      quantity: inventory[item],
      status
    };
  });

  res.json(result);
});

module.exports = router;