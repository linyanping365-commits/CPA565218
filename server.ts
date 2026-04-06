import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { ALL_OFFERS } from "./src/lib/offersData.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  // In-memory user data store (for demo purposes)
  // Key: userEmail, Value: { balance: number, pendingBalance: number, totalEarned: number, totalWithdrawals: number, clicks: any[] }
  const userStore = new Map<string, { 
    balance: number, 
    pendingBalance: number, 
    totalEarned: number, 
    totalWithdrawals: number, 
    clicks: any[] 
  }>();
  // To track processed transaction IDs (idempotency)
  const processedTransactions = new Set<string>();

  const getUserData = (email: string) => {
    if (!userStore.has(email)) {
      userStore.set(email, { 
        balance: 0, 
        pendingBalance: 0, 
        totalEarned: 0, 
        totalWithdrawals: 0, 
        clicks: [] 
      });
    }
    return userStore.get(email)!;
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
    const users = Array.from(userStore.entries()).map(([email, data]) => ({
      email,
      balance: data.balance,
      pendingBalance: data.pendingBalance,
      totalEarned: data.totalEarned,
      totalWithdrawals: data.totalWithdrawals,
      clicksCount: data.clicks.length,
      lastActivity: data.clicks[0]?.timestamp || 'Never'
    }));
    res.json(users);
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

    res.json({ 
      success: true, 
      balance: userData.balance,
      totalWithdrawals: userData.totalWithdrawals
    });
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
