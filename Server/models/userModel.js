import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 8,
      default: null,
    },

    image: {
      type: String,
      default: ""
    },

    /* 🔥 NEW PROFILE FIELDS */

    bio: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      default: ""
    },

    skills: [
      {
        type: [String],
        default: []
      }
    ],

    github: {
      type: String,
      default: ""
    },

    linkedin: {
      type: String,
      default: ""
    },

    portfolio: {
      type: String,
      default: ""
    },

    resume: {
      type: String,
      default: ""
    },

    /* EXISTING */

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    credits: {
      type: Number,
      default: 100,
      min: 0
    },

    plan: {
      type: String,
      enum: ["starter", "pro", "elite"],
      default: "starter"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    otp: {
      type: String,
      default: null
    },

    otpExpire: {
      type: Date,
      default: null,
    },

    resetOtp: {
      type: String,
      default: null
    },

    resetOtpExpire: {
      type: Date,
      default: null
    },

    payments: [
      {
        amount: Number,
        plan: String,
        currency: String,
        credits: Number,
        paymentId: String,
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],
    billing: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },

  },
  {
    timestamps: true
  }
);

/* PASSWORD HASH */

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* PASSWORD COMPARE */

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;