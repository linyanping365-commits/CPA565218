import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { ALL_OFFERS } from "./src/lib/offersData.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-memory user data store (for demo purposes)
  // Key: userEmail, Value: { balance: number, clicks: any[] }
  const userStore = new Map<string, { balance: number, clicks: any[] }>();
  // To track processed transaction IDs (idempotency)
  const processedTransactions = new Set<string>();

  const getUserData = (email: string) => {
    if (!userStore.has(email)) {
      userStore.set(email, { balance: 0, clicks: [] });
    }
    return userStore.get(email)!;
  };

  // API routes
  app.use(express.json()); // Enable JSON body parsing

  app.get("/api/offers", (req, res) => {
    res.json(ALL_OFFERS);
  });

  app.get("/api/balance", (req, res) => {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const userData = getUserData(email);
    res.json({ balance: userData.balance });
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

    // 1. Authentication check
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { userId, taskInfo, earnings, transactionId } = req.body;

    // 2. Validate required fields
    if (!userId || !earnings || !transactionId) {
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

  app.get("/api/postback", (req, res) => {
    const { payout, status, click_id, userId } = req.query;
    const targetUser = (userId as string) || "global";
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    
    const clickEntry = {
      id: click_id || `clk_${Math.random().toString(36).substr(2, 9)}`,
      payout: payout || '0.00',
      status: status === 'approved' ? 'Success' : 'Failed',
      timestamp,
      raw: req.query
    };

    const userData = getUserData(targetUser);
    userData.clicks.unshift(clickEntry);
    if (userData.clicks.length > 100) userData.clicks.pop();

    if (status === 'approved' && payout) {
      const amount = parseFloat(payout as string);
      if (!isNaN(amount)) {
        userData.balance += amount;
        console.log(`Postback received for ${targetUser}: +$${amount}. New balance: $${userData.balance}`);
        return res.json({ success: true, newBalance: userData.balance });
      }
    }
    
    res.status(400).json({ success: false, message: "Invalid payout or status", entry: clickEntry });
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
