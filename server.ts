import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Separate Databases
const userDb = new Database(path.join(__dirname, "users.sqlite"));
const taskDb = new Database(path.join(__dirname, "tasks.sqlite"));

// User Management Table
userDb.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0,
    pendingBalance REAL DEFAULT 0,
    totalEarned REAL DEFAULT 0,
    totalWithdrawals REAL DEFAULT 0,
    clicks TEXT DEFAULT '[]',
    withdrawals TEXT DEFAULT '[]'
  );
`);

// Task Management Tables
taskDb.exec(`
  CREATE TABLE IF NOT EXISTS pending_tasks (
    id TEXT PRIMARY KEY,
    email TEXT,
    amount REAL,
    taskInfo TEXT,
    timestamp TEXT
  );
  CREATE TABLE IF NOT EXISTS processed_transactions (
    id TEXT PRIMARY KEY
  );
`);

// Insert default admins
const adminEmail = "linyanping365@gmail.com";
const adminExists = userDb.prepare("SELECT email FROM users WHERE email = ?").get(adminEmail);
if (!adminExists) {
  userDb.prepare(`
    INSERT INTO users (email, password, role)
    VALUES (?, ?, ?)
  `).run(adminEmail, "admin123", "admin");
}

const secondAdminEmail = "890305@wty.com";
const secondAdminExists = userDb.prepare("SELECT email FROM users WHERE email = ?").get(secondAdminEmail);
if (!secondAdminExists) {
  userDb.prepare(`
    INSERT INTO users (email, password, role)
    VALUES (?, ?, ?)
  `).run(secondAdminEmail, "890305@wty.com", "admin");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Endpoints ---
  app.post("/api/register", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    try {
      userDb.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, password);
      res.json({ success: true, email, role: 'user' });
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        res.status(400).json({ error: "Email already registered" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = userDb.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    
    if (user) {
      res.json({ success: true, email: user.email, role: user.role });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- Admin Endpoints ---
  app.get("/api/admin/users", (req, res) => {
    const users = userDb.prepare("SELECT * FROM users").all() as any[];
    const parsedUsers = users.map(u => ({
      ...u,
      clicks: JSON.parse(u.clicks),
      withdrawals: JSON.parse(u.withdrawals)
    }));
    res.json(parsedUsers);
  });

  app.get("/api/admin/users/:email", (req, res) => {
    const user = userDb.prepare("SELECT * FROM users WHERE email = ?").get(req.params.email) as any;
    if (user) {
      res.json({
        ...user,
        clicks: JSON.parse(user.clicks),
        withdrawals: JSON.parse(user.withdrawals)
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/admin/users", (req, res) => {
    const { email, password, role, balance, totalEarned } = req.body;
    try {
      userDb.prepare(`
        INSERT INTO users (email, password, role, balance, totalEarned)
        VALUES (?, ?, ?, ?, ?)
      `).run(email, password, role || 'user', balance || 0, totalEarned || 0);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to add user" });
    }
  });

  app.put("/api/admin/users/:email", (req, res) => {
    const { password, role, balance, pendingBalance, totalEarned, totalWithdrawals, clicks, withdrawals } = req.body;
    const email = req.params.email;
    
    try {
      const updates = [];
      const values = [];
      
      if (password !== undefined) { updates.push("password = ?"); values.push(password); }
      if (role !== undefined) { updates.push("role = ?"); values.push(role); }
      if (balance !== undefined) { updates.push("balance = ?"); values.push(balance); }
      if (pendingBalance !== undefined) { updates.push("pendingBalance = ?"); values.push(pendingBalance); }
      if (totalEarned !== undefined) { updates.push("totalEarned = ?"); values.push(totalEarned); }
      if (totalWithdrawals !== undefined) { updates.push("totalWithdrawals = ?"); values.push(totalWithdrawals); }
      if (clicks !== undefined) { updates.push("clicks = ?"); values.push(JSON.stringify(clicks)); }
      if (withdrawals !== undefined) { updates.push("withdrawals = ?"); values.push(JSON.stringify(withdrawals)); }
      
      if (updates.length > 0) {
        values.push(email);
        userDb.prepare(`UPDATE users SET ${updates.join(", ")} WHERE email = ?`).run(...values);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:email", (req, res) => {
    try {
      userDb.prepare("DELETE FROM users WHERE email = ?").run(req.params.email);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to delete user" });
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

    const checkTx = taskDb.prepare("SELECT id FROM processed_transactions WHERE id = ?").get(transactionId);
    if (checkTx) {
      return res.json({ success: true, message: "Transaction already processed" });
    }

    const amount = parseFloat(earnings) || 0;
    const timestamp = new Date().toISOString();

    const insertTask = taskDb.prepare(`
      INSERT INTO pending_tasks (id, email, amount, taskInfo, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    try {
      insertTask.run(transactionId, userId, amount, taskInfo || 'External Task', timestamp);
      taskDb.prepare("INSERT INTO processed_transactions (id) VALUES (?)").run(transactionId);
      
      console.log(`[Webhook] Task queued for ${userId}: +$${amount}`);
      res.json({ success: true, message: "Task queued successfully", transactionId });
    } catch (e) {
      console.error("Database error:", e);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/pending-tasks", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const tasks = taskDb.prepare("SELECT * FROM pending_tasks WHERE email = ?").all(email);
    res.json(tasks);
  });

  app.post("/api/mark-tasks-synced", (req, res) => {
    const { email, taskIds } = req.body;
    if (!email || !Array.isArray(taskIds)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const deleteStmt = taskDb.prepare("DELETE FROM pending_tasks WHERE id = ? AND email = ?");
    const transaction = taskDb.transaction((ids) => {
      for (const id of ids) {
        deleteStmt.run(id, email);
      }
    });

    try {
      transaction(taskIds);
      res.json({ success: true });
    } catch (e) {
      console.error("Failed to delete synced tasks:", e);
      res.status(500).json({ error: "Failed to sync" });
    }
  });

  // --- Wallet ---
  app.post("/api/withdraw", (req, res) => {
    const { email, amount } = req.body;
    
    const user = userDb.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    try {
      const newBalance = user.balance - amount;
      const newPendingBalance = user.pendingBalance + amount;
      
      const withdrawals = JSON.parse(user.withdrawals);
      const newWithdrawal = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount,
        paypalEmail: req.body.paypalEmail || email,
        date: new Date().toISOString(),
        status: 'Pending'
      };
      withdrawals.unshift(newWithdrawal);

      const clicks = JSON.parse(user.clicks);
      clicks.unshift({
        offerId: newWithdrawal.id,
        amount: -amount,
        timestamp: new Date().toISOString(),
        taskInfo: 'Withdrawal Request',
        type: 'Withdrawal'
      });

      userDb.prepare(`
        UPDATE users 
        SET balance = ?, pendingBalance = ?, withdrawals = ?, clicks = ?
        WHERE email = ?
      `).run(newBalance, newPendingBalance, JSON.stringify(withdrawals), JSON.stringify(clicks), email);

      res.json({ success: true, balance: newBalance });
    } catch (e) {
      res.status(500).json({ error: "Withdrawal failed" });
    }
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
