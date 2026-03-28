const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Stripe = require("stripe");
const admin = require("firebase-admin");
const client = require("./db");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://zapshift-courier-management.firebaseapp.com",
    "https://zapshift-courier-management.web.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

try {
  if (!admin.apps.length) {
    const decoded = Buffer.from(
      process.env.FIREBASE_SERVICE_KEY,
      "base64",
    ).toString("utf8");
    const serviceAccount = JSON.parse(decoded);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin Initialized");
  }
} catch (error) {
  console.error("❌ Firebase Init Error:", error.message);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function run() {
  try {
    await client.connect();

    const db = client.db("zapshiftDB");
    const userCollection = db.collection("users");
    const parcelCollection = db.collection("parcels");
    const paymentCollection = db.collection("payments");
    const riderCollection = db.collection("riders");

    const collections = {
      userCollection,
      parcelCollection,
      paymentCollection,
      riderCollection,
      stripe,
    };
    app.locals.collections = collections;

    // Routes Import
    const userRoutes = require("./routes/userRoutes");
    const parcelRoutes = require("./routes/parcelRoutes");
    const riderRoutes = require("./routes/riderRoutes");
    const paymentRoutes = require("./routes/paymentRoutes");
    const dashboardRoutes = require("./routes/dashboardRoutes");

    // Root Route
    app.get("/", (req, res) => {
      res.send("ZapShift Courier Server Running 🚚");
    });

    // API Endpoints
    app.use(userRoutes);
    app.use(parcelRoutes);
    app.use(riderRoutes);
    app.use(paymentRoutes);
    app.use(dashboardRoutes);

    console.log("✅ MongoDB connected and Routes initialized");
  } catch (error) {
    console.error("❌ Connection error:", error);
  }
}

run().catch(console.dir);

module.exports = app;
