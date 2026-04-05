const express = require("express");
const fs = require("fs");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const router = express.Router();

const itemsFile = path.join(__dirname, "../data/items.json");
const billsFile = path.join(__dirname, "../data/bills.json");
const inventoryFile = path.join(__dirname, "../data/inventory.json");
const customerFile = path.join(__dirname, "../data/customerBills.json");


router.post("/create", async (req, res) => {
  try {
    const { items, billType } = req.body;

    let allItems = JSON.parse(fs.readFileSync(itemsFile));
    let bills = JSON.parse(fs.readFileSync(billsFile));

    let total = 0;

    let billItems = items.map(i => {
      const found = allItems.find(it => it.name === i.name);

      if (!found) {
        throw new Error(`Item ${i.name} not found`);
      }

      const price = found.price;
      total += price * i.qty;

      return {
        name: i.name,
        qty: i.qty,
        price
      };
    });

    const billId = uuidv4();

    const bill = {
      billId,
      items: billItems,
      total,
      billType,
      paid: false,
      date: new Date()
    };

    bills.push(bill);
    fs.writeFileSync(billsFile, JSON.stringify(bills, null, 2));

    console.log(" Bill Created:", billId);

    const qrData = JSON.stringify({ billId, amount: total });
    const qr = await QRCode.toDataURL(qrData);

    res.json({ bill, qr });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/pay", (req, res) => {
  try {
    const { billId } = req.body;

    let bills = JSON.parse(fs.readFileSync(billsFile));
    let inventory = JSON.parse(fs.readFileSync(inventoryFile));
    let customerBills = JSON.parse(fs.readFileSync(customerFile));

    const bill = bills.find(b => b.billId === billId);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    for (let item of bill.items) {
      if ((inventory[item.name] || 0) < item.qty) {
        return res.json({ error: "Not enough stock" });
      }
    }

    bill.paid = true;

    bill.items.forEach(item => {
      if (bill.billType === "customer_bill") {
        inventory[item.name] = (inventory[item.name] || 0) - item.qty;
        customerBills.push(bill);
      }
    });

    fs.writeFileSync(billsFile, JSON.stringify(bills, null, 2));
    fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));
    fs.writeFileSync(customerFile, JSON.stringify(customerBills, null, 2));

    console.log("💰 Payment Done:", billId);

    res.json({ message: "Payment successful" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/mark-stock", (req, res) => {
  const { billId } = req.body;

  let bills = JSON.parse(fs.readFileSync(billsFile));
  let inventory = JSON.parse(fs.readFileSync(inventoryFile));

  const bill = bills.find(b => b.billId === billId);

  if (!bill) {
    return res.status(404).json({ error: "Bill not found" });
  }

  bill.billType = "stock_bill";

  bill.items.forEach(item => {
    inventory[item.name] = (inventory[item.name] || 0) + item.qty;
  });

  fs.writeFileSync(billsFile, JSON.stringify(bills, null, 2));
  fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2));

  console.log(" Stock Updated");

  res.json({ message: "Marked as stock bill" });
});


router.get("/:billId", (req, res) => {
  const { billId } = req.params;

  let bills = JSON.parse(fs.readFileSync(billsFile));

  const bill = bills.find(b => b.billId === billId);

  if (!bill) return res.status(404).json({ error: "Bill not found" });

  res.json(bill);
});

router.get("/", (req, res) => {
  let bills = JSON.parse(fs.readFileSync(billsFile));
  res.json(bills);
});


module.exports = router;