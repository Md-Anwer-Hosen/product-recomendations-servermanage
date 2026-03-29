const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Stripe = require("stripe");
const admin = require("firebase-admin");
const client = require("./db");

const app = express();

// ✅ CORS config (ONLY frontend URLs)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://zapshift-courier-management.firebaseapp.com",
    "https://zapshift-courier-management.web.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Firebase Admin Init
try {
  if (!admin.apps.length) {
    const rawKey = process.env.FIREBASE_SERVICE_KEY;

    if (rawKey) {
      let serviceAccount;

      if (rawKey.startsWith("{")) {
        serviceAccount = JSON.parse(rawKey);
      } else {
        const decoded = Buffer.from(rawKey, "base64").toString("utf8");
        serviceAccount = JSON.parse(decoded);
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("✅ Firebase Admin Initialized");
    }
  }
} catch (error) {
  console.error("❌ Firebase Init Error:", error.message);
}

// ✅ Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Root route
app.get("/", (req, res) => {
  res.send("ZapShift Courier Server Running 🚚");
});

// ✅ DB connection middleware
app.use(async (req, res, next) => {
  if (!app.locals.collections) {
    try {
      await client.connect();
      const db = client.db("zapshiftDB");

      app.locals.collections = {
        userCollection: db.collection("users"),
        parcelCollection: db.collection("parcels"),
        paymentCollection: db.collection("payments"),
        riderCollection: db.collection("riders"),
        stripe,
      };
    } catch (err) {
      return res.status(500).send("Database connection error");
    }
  }
  next();
});

// ✅ Routes
app.use(require("./routes/userRoutes"));
app.use(require("./routes/parcelRoutes"));
app.use(require("./routes/riderRoutes"));
app.use(require("./routes/paymentRoutes"));
app.use(require("./routes/dashboardRoutes"));

// ✅ DB connect (initial)
async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ DB Connection error:", error);
  }
}
run().catch(console.dir);

module.exports = app;
