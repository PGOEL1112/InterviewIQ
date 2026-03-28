import cron from "node-cron";
import User from "../models/userModel.js";

/* delete unverified users after 24 hours */

cron.schedule("0 * * * *", async () => {
  try {
    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    console.log("🧹 Deleted unverified users:", result.deletedCount);
  } catch (error) {
    console.log("Cleanup error:", error);
  }
});