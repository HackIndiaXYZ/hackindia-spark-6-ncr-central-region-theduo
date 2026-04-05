const fs = require("fs");
const path = require("path");

const billsFile = path.join(__dirname, "../data/bills.json");
const inventoryFile = path.join(__dirname, "../data/inventory.json");

exports.getInsights = () => {
  const bills = JSON.parse(fs.readFileSync(billsFile));
  const inventory = JSON.parse(fs.readFileSync(inventoryFile));

  let sales = {};
  let totalSales = 0;

  bills.forEach(bill => {
    if (bill.billType === "customer_bill") {
      totalSales += bill.total;

      bill.items.forEach(item => {
        sales[item.name] = (sales[item.name] || 0) + item.qty;
      });
    }
  });

  let topItem = Object.keys(sales).length
    ? Object.keys(sales).reduce((a, b) =>
        sales[a] > sales[b] ? a : b
      )
    : "None";

  let slowItem = Object.keys(sales).length
    ? Object.keys(sales).reduce((a, b) =>
        sales[a] < sales[b] ? a : b
      )
    : "None";

  let lowStock = Object.keys(inventory).filter(i => inventory[i] < 5);

  let restock = lowStock.length
    ? `${lowStock[0]} is low, restock soon`
    : "Stock is sufficient";

  let insights = [];

  if (topItem !== "None") {
    insights.push(`${topItem} is your top selling product`);
  }

  if (slowItem !== "None") {
    insights.push(`${slowItem} is selling slowly`);
  }

  if (lowStock.length) {
    insights.push(`${lowStock[0]} stock is low`);
  }

  insights.push(`Your total sales are ₹${totalSales}`);

  return {
    insights,
    topSellingItem: topItem,
    slowMovingItem: slowItem,
    lowStockItems: lowStock,
    restockSuggestion: restock,
    totalSales
  };
};