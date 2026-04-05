const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const { getInsights } = require("../ai/insights");

const customerFile = path.join(__dirname, "../data/customerBills.json");

router.get("/seller-insights", (req, res) => {
  const data = getInsights();
  res.json(data);
});

router.get("/customer-insights", (req, res) => {
  let customerBills = JSON.parse(fs.readFileSync(customerFile));

  let total = 0;
  let count = customerBills.length;

  customerBills.forEach(b => {
    total += b.total;
  });

  res.json({
    totalSpend: total,
    totalPurchases: count,
    avgSpend: count ? total / count : 0
  });
});

module.exports = router;