import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import Database from "better-sqlite3";
import { ALL_OFFERS } from "./src/lib/offersData.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite Database
const db = new Database(path.join(__dirname, "database.sqlite"));

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    balance REAL DEFAULT 0,
    pendingBalance REAL DEFAULT 0,
    totalEarned REAL DEFAULT 0,
    totalWithdrawals REAL DEFAULT 0,
    clicks TEXT DEFAULT '[]'
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  
  // To track processed transaction IDs (idempotency)
  const processedTransactions = new Set<string>();

  const getUserData = (email: string) => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    let user = stmt.get(email) as any;
    
    if (!user) {
      const insertStmt = db.prepare(`
        INSERT INTO users (email, balance, pendingBalance, totalEarned, totalWithdrawals, clicks)
        VALUES (?, 0, 0, 0, 0, '[]')
      `);
      insertStmt.run(email);
      user = {
        email,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawals: 0,
        clicks: '[]'
      };
    }
    
    // Parse clicks JSON
    if (typeof user.clicks === 'string') {
      try {
        user.clicks = JSON.parse(user.clicks);
      } catch (e) {
        user.clicks = [];
      }
    }
    
    return user;
  };

  const saveUserData = (email: string, data: any) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET balance = ?, pendingBalance = ?, totalEarned = ?, totalWithdrawals = ?, clicks = ?
      WHERE email = ?
    `);
    stmt.run(
      data.balance, 
      data.pendingBalance, 
      data.totalEarned, 
      data.totalWithdrawals, 
      JSON.stringify(data.clicks), 
      email
    );
  };

  // API routes
  app.use(express.json()); // Enable JSON body parsing

  app.get("/api/balance", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const userData = getUserData(email);
    res.json({ 
      balance: userData.balance,
      pendingBalance: userData.pendingBalance,
      totalEarned: userData.totalEarned,
      totalWithdrawals: userData.totalWithdrawals
    });
  });

  app.get("/api/clicks", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const userData = getUserData(email);
    res.json(userData.clicks);
  });

  // New API endpoint for Website A to notify Website B
  app.post("/api/task-completed", (req, res) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.WEBHOOK_TOKEN || "your_secure_token_here";

    console.log('Task Completed Request:', {
      auth: authHeader,
      body: req.body
    });

    // 1. Authentication check
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.log('Auth failed:', { authHeader, expectedToken });
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, taskInfo, earnings, transactionId } = req.body;

    // 2. Validate required fields
    if (!userId || earnings === undefined || !transactionId) {
      console.log('Validation failed:', { userId, earnings, transactionId });
      return res.status(400).json({ success: false, message: "Missing required fields: userId, earnings, transactionId" });
    }

    // 3. Idempotency check (prevent duplicate notifications)
    if (processedTransactions.has(transactionId)) {
      return res.status(200).json({ success: true, message: "Already processed", alreadyProcessed: true });
    }

    const amount = parseFloat(earnings);
    if (isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Invalid earnings value" });
    }

    // 4. Update user data
    const userData = getUserData(userId);
    userData.balance += amount;
    userData.totalEarned += amount;
    
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const clickEntry = {
      id: transactionId,
      payout: amount.toFixed(2),
      status: 'Success',
      timestamp,
      taskInfo: taskInfo || 'External Task',
      type: 'Webhook'
    };

    userData.clicks.unshift(clickEntry);
    if (userData.clicks.length > 100) userData.clicks.pop();

    // Mark transaction as processed
    processedTransactions.add(transactionId);
    saveUserData(userId, userData);

    console.log(`[Webhook] Task completed for ${userId}: +$${amount}. New balance: $${userData.balance}`);
    
    res.json({ 
      success: true, 
      message: "Balance updated successfully",
      newBalance: userData.balance,
      transactionId 
    });
  });

  // Admin API to list all users
  app.get("/api/admin/users", (req, res) => {
    const stmt = db.prepare("SELECT * FROM users");
    const rows = stmt.all() as any[];
    
    const users = rows.map(row => {
      let clicks = [];
      try { clicks = JSON.parse(row.clicks); } catch(e) {}
      return {
        email: row.email,
        balance: row.balance,
        pendingBalance: row.pendingBalance,
        totalEarned: row.totalEarned,
        totalWithdrawals: row.totalWithdrawals,
        clicksCount: clicks.length,
        lastActivity: clicks[0]?.timestamp || 'Never'
      };
    });
    
    console.log(`[Admin] Returning ${users.length} users.`);
    res.json(users);
  });

  // Admin API to add a new user
  app.post("/api/admin/add-user", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const stmt = db.prepare("SELECT email FROM users WHERE email = ?");
    const exists = stmt.get(email);

    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    // getUserData creates the user if they don't exist
    getUserData(email);
    res.json({ success: true, message: "User added successfully" });
  });

  // Admin API to delete a user
  app.post("/api/admin/delete-user", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const stmt = db.prepare("DELETE FROM users WHERE email = ?");
    const result = stmt.run(email);

    if (result.changes > 0) {
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Admin API to update specific user data
  app.post("/api/admin/update-user", (req, res) => {
    const { email, balance, pendingBalance, totalEarned, totalWithdrawals, clicks, taskInfo } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const userData = getUserData(email);
    
    // Check if balance is changing to add a sync record
    if (typeof balance === 'number' && balance !== userData.balance) {
      const diff = balance - userData.balance;
      const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
      userData.clicks.unshift({
        id: `ADJ_${Date.now()}`,
        payout: diff.toFixed(2),
        status: 'Success',
        timestamp,
        taskInfo: taskInfo || (diff > 0 ? '对应的编号记录' : 'Manual Balance Adjustment (Debit)'),
        type: 'Adjustment'
      });
      if (userData.clicks.length > 100) userData.clicks.pop();
    }

    if (typeof balance === 'number') userData.balance = balance;
    if (typeof pendingBalance === 'number') userData.pendingBalance = pendingBalance;
    if (typeof totalEarned === 'number') userData.totalEarned = totalEarned;
    if (typeof totalWithdrawals === 'number') userData.totalWithdrawals = totalWithdrawals;
    if (Array.isArray(clicks)) userData.clicks = clicks;

    saveUserData(email, userData);

    res.json({ 
      success: true, 
      email, 
      balance: userData.balance,
      pendingBalance: userData.pendingBalance,
      totalEarned: userData.totalEarned,
      totalWithdrawals: userData.totalWithdrawals
    });
  });

  // API to handle user withdrawals
  app.post("/api/withdraw", (req, res) => {
    const { email, amount } = req.body;
    if (!email || typeof amount !== 'number') {
      return res.status(400).json({ error: "Email and valid amount required" });
    }

    const userData = getUserData(email);
    if (userData.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    userData.balance -= amount;
    userData.totalWithdrawals += amount;

    // Add a record for the withdrawal in clicks history
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    userData.clicks.unshift({
      id: `WITHDRAW_${Date.now()}`,
      payout: (-amount).toFixed(2),
      status: 'Pending',
      timestamp,
      taskInfo: 'Withdrawal Request',
      type: 'Withdrawal'
    });
    if (userData.clicks.length > 100) userData.clicks.pop();

    saveUserData(email, userData);

    res.json({ 
      success: true, 
      balance: userData.balance,
      totalWithdrawals: userData.totalWithdrawals
    });
  });

  // API to explicitly register/ping a user
  app.post("/api/register", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    
    const stmt = db.prepare("SELECT email FROM users WHERE email = ?");
    const exists = stmt.get(email);
    
    const userData = getUserData(email);
    res.json({ success: true, email: email, isNew: !exists });
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
