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

  // In-memory balance and clicks store (for demo purposes)
  let globalBalance = 0;
  let clickHistory: any[] = [];

  // API routes
  app.get("/api/offers", (req, res) => {
    res.json(ALL_OFFERS);
  });

  app.get("/api/balance", (req, res) => {
    res.json({ balance: globalBalance });
  });

  app.get("/api/clicks", (req, res) => {
    res.json(clickHistory);
  });

  app.get("/api/postback", (req, res) => {
    const { payout, status, click_id } = req.query;
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    
    const clickEntry = {
      id: click_id || `clk_${Math.random().toString(36).substr(2, 9)}`,
      payout: payout || '0.00',
      status: status === 'approved' ? 'Success' : 'Failed',
      timestamp,
      raw: req.query
    };

    clickHistory.unshift(clickEntry); // Add to beginning
    if (clickHistory.length > 100) clickHistory.pop(); // Keep last 100

    if (status === 'approved' && payout) {
      const amount = parseFloat(payout as string);
      if (!isNaN(amount)) {
        globalBalance += amount;
        console.log(`Postback received: +$${amount}. New balance: $${globalBalance}`);
        return res.json({ success: true, newBalance: globalBalance });
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
