import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/userModel.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ---------------- CREATE ORDER ---------------- */

router.post("/create-order", isAuth, async (req, res) => {
  try {
    const { amount, plan, currency, billing } = req.body;

    if (!amount || !plan || !currency || !billing) {
      return res.status(400).json({
        success: false,
        message: "Missing Field",
      });
    }

    // 🔥 PLAN LIMITS
    const planLimits = {
      INR: {
        monthly: {
          STARTER: 10,
          PRO: 120,
          ELITE: 999999,
        },
        yearly: {
          STARTER: 10,
          PRO: 1500,
          ELITE: 999999,
        },
      },
    };

    const user = await User.findById(req.user._id);

    const selectedLimit = planLimits[currency]?.[billing]?.[plan];
    const currentLimit =
      planLimits[currency]?.[billing]?.[user.plan.toUpperCase()];

    // ❌ SAME PLAN OR DOWNGRADE BLOCK
    if (user.credits >= selectedLimit) {
      return res.status(400).json({
        success: false,
        message: "You already have enough credits for this plan",
      });
    }

    if (selectedLimit <= currentLimit) {
      return res.status(400).json({
        success: false,
        message: "You can only upgrade to higher plans",
      });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt: "receipt_" + Date.now(),
      notes: {
        plan,
        currency,
        billing,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({ success: true, order });

  } catch (err) {
    console.log("CREATE ORDER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ---------------- VERIFY PAYMENT ---------------- */

router.post("/verify", isAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    // 🔥 PLAN CREDITS
    const planCredits = {
      INR: {
        monthly: {
          STARTER: 10,
          PRO: 120,
          ELITE: 999999,
        },
        yearly: {
          STARTER: 10,
          PRO: 1500,
          ELITE: 999999,
        },
      },
    };

    const order = await razorpay.orders.fetch(razorpay_order_id);

    const plan = order.notes.plan;
    const currency = order.notes.currency;
    const billing = order.notes.billing;

    const creditsToAdd = planCredits[currency]?.[billing]?.[plan];

    if (!creditsToAdd) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // ✅ UPDATE USER (IMPORTANT: new:true)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: { credits: creditsToAdd },
        $set: { 
          plan: plan.toLowerCase(),
        billing : billing
       },
        $push: {
          payments: {
            amount: order.amount / 100,
            plan,
            currency: "INR",
            credits: creditsToAdd,
            paymentId: razorpay_payment_id,
          },
        },
      },
      { returnDocument : "after"
       } // 🔥 IMPORTANT
    );

    res.json({
      success: true,
      message: `${creditsToAdd} credits added`,
      user: updatedUser,
    });

  } catch (err) {
    console.log("VERIFY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
