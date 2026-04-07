import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage
const users: Record<string, any> = {};
const pendingTasks: any[] = [];
const processedTransactions = new Set<string>();

// Insert default admin
const adminEmail = "linyanping365@gmail.com";
users[adminEmail] = {
  email: adminEmail,
  password: "admin123",
  role: "admin",
  balance: 0,
  pendingBalance: 0,
  totalEarned: 0,
  totalWithdrawals: 0,
  clicks: [],
  withdrawals: []
};

const newAdminEmail = "890305@wty.com";
users[newAdminEmail] = {
  email: newAdminEmail,
  password: newAdminEmail,
  role: "admin",
  balance: 0,
  pendingBalance: 0,
  totalEarned: 0,
  totalWithdrawals: 0,
  clicks: [],
  withdrawals: []
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Endpoints ---
  app.post("/api/register", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    if (users[email]) {
      return res.status(400).json({ error: "Email already registered" });
    }

    users[email] = {
      email,
      password,
      role: 'user',
      balance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawals: 0,
      clicks: [],
      withdrawals: []
    };

    res.json({ success: true, email, role: 'user' });
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = users[email];
    
    if (user && user.password === password) {
      res.json({ success: true, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- Admin Endpoints ---
  app.get("/api/admin/users", (req, res) => {
    res.json(Object.values(users));
  });

  app.get("/api/admin/users/:email", (req, res) => {
    const user = users[req.params.email];
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/admin/users", (req, res) => {
    const { email, password, role, balance, totalEarned } = req.body;
    if (users[email]) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    users[email] = {
      email,
      password,
      role: role || 'user',
      balance: balance || 0,
      pendingBalance: 0,
      totalEarned: totalEarned || 0,
      totalWithdrawals: 0,
      clicks: [],
      withdrawals: []
    };
    res.json({ success: true });
  });

  app.put("/api/admin/users/:email", (req, res) => {
    const email = req.params.email;
    const user = users[email];
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, role, balance, pendingBalance, totalEarned, totalWithdrawals, clicks, withdrawals } = req.body;
    
    if (password !== undefined) user.password = password;
    if (role !== undefined) user.role = role;
    if (balance !== undefined) user.balance = balance;
    if (pendingBalance !== undefined) user.pendingBalance = pendingBalance;
    if (totalEarned !== undefined) user.totalEarned = totalEarned;
    if (totalWithdrawals !== undefined) user.totalWithdrawals = totalWithdrawals;
    if (clicks !== undefined) user.clicks = clicks;
    if (withdrawals !== undefined) user.withdrawals = withdrawals;
    
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:email", (req, res) => {
    const email = req.params.email;
    if (users[email]) {
      delete users[email];
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // --- Webhook & Tasks ---
  app.post("/api/task-completed", (req, res) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.WEBHOOK_TOKEN || "your_secure_token_here";

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, taskInfo, earnings, transactionId } = req.body;

    if (!userId || !transactionId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (processedTransactions.has(transactionId)) {
      return res.json({ success: true, message: "Transaction already processed" });
    }

    const amount = parseFloat(earnings) || 0;
    const timestamp = new Date().toISOString();

    pendingTasks.push({
      id: transactionId,
      email: userId,
      amount,
      taskInfo: taskInfo || 'External Task',
      timestamp
    });
    
    processedTransactions.add(transactionId);
    
    console.log(`[Webhook] Task queued for ${userId}: +$${amount}`);
    res.json({ success: true, message: "Task queued successfully", transactionId });
  });

  app.get("/api/pending-tasks", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const tasks = pendingTasks.filter(t => t.email === email);
    res.json(tasks);
  });

  app.post("/api/mark-tasks-synced", (req, res) => {
    const { email, taskIds } = req.body;
    if (!email || !Array.isArray(taskIds)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const idsToRemove = new Set(taskIds);
    for (let i = pendingTasks.length - 1; i >= 0; i--) {
      if (pendingTasks[i].email === email && idsToRemove.has(pendingTasks[i].id)) {
        pendingTasks.splice(i, 1);
      }
    }

    res.json({ success: true });
  });

  // --- Wallet ---
  app.post("/api/withdraw", (req, res) => {
    const { email, amount } = req.body;
    
    const user = users[email];
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.balance -= amount;
    user.pendingBalance += amount;
    
    const newWithdrawal = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount,
      paypalEmail: req.body.paypalEmail || email,
      date: new Date().toISOString(),
      status: 'Pending'
    };
    user.withdrawals.unshift(newWithdrawal);

    user.clicks.unshift({
      offerId: newWithdrawal.id,
      amount: -amount,
      timestamp: new Date().toISOString(),
      taskInfo: 'Withdrawal Request',
      type: 'Withdrawal'
    });

    res.json({ success: true, balance: user.balance });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
