const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static assets from workspace directory
app.use(express.static(path.join(__dirname)));

// Mock Database State (in-memory, syncs with app defaults)
let mockContacts = [
  { id: "C1", name: "Harish Gupta", phone: "+91 98123 45678", segment: "retail", notes: "Bought Immunodoc Ras for health reasons.", status: "customer", agentId: null },
  { id: "C2", name: "Kiran Dev", phone: "+91 95432 10987", segment: "business", notes: "Interested in the matching bonus and income plan.", status: "prospect", agentId: null },
  { id: "C3", name: "Sunita Roy", phone: "+91 91234 56789", segment: "retail", notes: "Prefers Ayurvedic supplements for digestion.", status: "customer", agentId: null }
];

let mockPurchases = [
  { id: "P1", contactId: "C1", productId: "immunodoc-ras", purchaseDate: Date.now() - 5 * 24 * 60 * 60 * 1000, supplyDays: 30 },
  { id: "P2", contactId: "C3", productId: "gynedoc-ras", purchaseDate: Date.now() - 25 * 24 * 60 * 60 * 1000, supplyDays: 30 }
];

let mockReminders = [
  { id: "R1", contactId: "C1", productId: "immunodoc-ras", purchaseDate: Date.now() - 5 * 24 * 60 * 60 * 1000, status: "pending", simulatedDay25: false },
  { id: "R2", contactId: "C3", productId: "gynedoc-ras", purchaseDate: Date.now() - 25 * 24 * 60 * 60 * 1000, status: "pending", simulatedDay25: true }
];

// --- API ROUTES ---

// 1. Authentication Endpoints
app.post('/api/auth/login', (req, res) => {
  const { loginId, password } = req.body;
  if (loginId === 'AWPL99827' && password === 'admin123') {
    return res.json({
      success: true,
      agent: {
        id: "AWPL99827",
        name: "Ramesh Kumar",
        rank: "Emerald Director",
        phone: "+91 98765 43210"
      }
    });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, phone, sponsorId, side } = req.body;
  const newId = "AWPL" + Math.floor(10000 + Math.random() * 90000);
  return res.json({
    success: true,
    agent: {
      id: newId,
      name,
      phone,
      rank: "Distributor"
    },
    message: `Account created. Sponsor: ${sponsorId || 'Independent'}`
  });
});

// 2. MLM Network Downline
app.get('/api/network/downline', (req, res) => {
  res.json({
    success: true,
    networkRoot: {
      id: "AWPL99827",
      name: "Ramesh Kumar",
      rank: "Emerald Director",
      sp: 120,
      status: "active",
      side: "root",
      left: { id: "AWPL77162", name: "Sanjay Sharma", rank: "Gold Director", sp: 80, status: "active", side: "left" },
      right: { id: "AWPL77902", name: "Priya Patel", rank: "Silver Director", sp: 100, status: "active", side: "right" }
    }
  });
});

// 3. Social CRM Contacts
app.get('/api/crm/contacts', (req, res) => {
  res.json({ success: true, contacts: mockContacts });
});

app.post('/api/crm/contacts', (req, res) => {
  const { name, phone, segment, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: "Name and Phone required" });
  }
  const newContact = {
    id: "C" + Math.floor(10000 + Math.random() * 90000),
    name,
    phone,
    segment,
    notes: notes || "",
    status: segment === 'retail' ? 'customer' : 'prospect',
    agentId: null
  };
  mockContacts.unshift(newContact);
  res.json({ success: true, contact: newContact });
});

// 4. Purchases and Day 25 Reminders
app.get('/api/crm/reminders', (req, res) => {
  res.json({ success: true, reminders: mockReminders });
});

app.post('/api/crm/purchase', (req, res) => {
  const { contactId, productId } = req.body;
  const newPurchase = {
    id: "P" + Math.floor(10000 + Math.random() * 90000),
    contactId,
    productId,
    purchaseDate: Date.now(),
    supplyDays: 30
  };
  mockPurchases.push(newPurchase);

  const newReminder = {
    id: "R" + Math.floor(10000 + Math.random() * 90000),
    contactId,
    productId,
    purchaseDate: Date.now(),
    reminderDate: Date.now() + 25 * 24 * 60 * 60 * 1000,
    status: "pending",
    simulatedDay25: false
  };
  mockReminders.unshift(newReminder);

  res.json({ success: true, purchase: newPurchase, reminder: newReminder });
});

app.post('/api/crm/reminders/send', (req, res) => {
  const { reminderId } = req.body;
  const r = mockReminders.find(rem => rem.id === reminderId);
  if (r) {
    r.status = 'sent';
    return res.json({ success: true, reminder: r });
  }
  res.status(404).json({ success: false, message: "Reminder not found" });
});

// Catch-all route to serve the main HTML file (supporting SPAs)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AWPL Agent PWA Server is running on port ${PORT}`);
  console.log(`📂 Serving static files from: ${__dirname}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`=================================================`);
});
