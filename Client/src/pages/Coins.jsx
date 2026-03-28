import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCoins,
    FaCheckCircle,
    FaRocket,
    FaBolt
} from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";




const Coins = () => {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const [currency, setCurrency] = useState("INR");
    const [billing, setBilling] = useState("monthly");

    const plans = {

        INR: {
            monthly: [
                { title: "Starter", price: "₹0", credits: "10" },
                { title: "Pro", price: "₹199", credits: "120" },
                { title: "Elite", price: "₹499", credits: "Unlimited" }
            ],

            yearly: [
                { title: "Starter", price: "₹0", credits: "10" },
                { title: "Pro", price: "₹1999", credits: "1500" },
                { title: "Elite", price: "₹4999", credits: "Unlimited" }
            ]
        },

        USD: {
            monthly: [
                { title: "Starter", price: "$0", credits: "10" },
                { title: "Pro", price: "$3", credits: "120" },
                { title: "Elite", price: "$7", credits: "Unlimited" }
            ],

            yearly: [
                { title: "Starter", price: "$0", credits: "10" },
                { title: "Pro", price: "$30", credits: "1500" },
                { title: "Elite", price: "$70", credits: "Unlimited" }
            ]
        }

    };

    const planLimits = {
        monthly: {
            starter: 10,
            pro: 120,
            elite: 999999
        },
        yearly: {
            starter: 10,
            pro: 1500,
            elite: 999999
        }
    };


    const handlePayment = async (amount, plan, currency, billing) => {

        try {

            let finalAmount = amount;

            // 🔥 USD → INR convert
            if (currency === "USD") {
                finalAmount = amount * 83; // approx conversion
            }

            const res = await axios.post(
                "/api/payment/create-order",
                {
                    amount: finalAmount,
                    plan,
                    currency: "INR",
                    billing
                },
                { withCredentials: true }
            );

            const order = res.data.order;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // 🔥 yaha .env wala key_id
                amount: order.amount,
                currency: "INR",
                name: "Interview AI",
                description: `${plan}Plan`,
                order_id: order.id,

                handler: async function (response) {
                    const verifyRes = await axios.post(
                        "/api/payment/verify",
                        {
                            ...response,
                            plan,
                            billing,
                            originalCurrency: currency
                        },
                        { withCredentials: true }
                    );

                    if (verifyRes.data.success) {
                        alert("Payment successful 🎉 Credits Added!");
                        dispatch(setUser(verifyRes.data.user));
                        localStorage.removeItem("lowCreditShown");
                    } else {
                        alert("Payment verification failed");
                    }
                },

                theme: {
                    color: "#6366F1",
                },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.log(err);
        }
    };
    return (

        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center py-24 px-6 relative overflow-hidden">

            {/* glow */}

            <div className="absolute w-[600px] h-[600px] bg-indigo-600/20 blur-[200px] -top-40 -left-40 rounded-full"></div>
            <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[200px] bottom-0 right-0 rounded-full"></div>


            {/* header */}

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >

                <h1 className="text-5xl font-bold flex items-center justify-center gap-3">

                    <FaCoins className="text-yellow-400" />

                    Interview Credits

                </h1>

                <p className="text-gray-400 mt-4 max-w-xl">

                    Unlock more AI mock interviews and detailed feedback to
                    accelerate your interview preparation.

                </p>

            </motion.div>


            {/* currency toggle */}

            <div className="flex gap-4 mb-6 bg-white/10 p-2 rounded-full">

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrency("INR")}
                    className={`px-6 py-2 rounded-full font-semibold transition
${currency === "INR" ? "bg-blue-600" : "text-gray-400"}
`}
                >

                    ₹ INR

                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrency("USD")}
                    className={`px-6 py-2 rounded-full font-semibold transition
                ${currency === "USD" ? "bg-blue-600" : "text-gray-400"}
                `}
                >

                    $ USD

                </motion.button>

            </div>


            {/* billing toggle */}

            <div className="flex gap-4 bg-white/10 p-2 rounded-full mb-16">

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setBilling("monthly")}
                    className={`px-6 py-2 rounded-full
${billing === "monthly" ? "bg-blue-600" : ""}`}
                >

                    Monthly

                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setBilling("yearly")}
                    className={`px-6 py-2 rounded-full
${billing === "yearly" ? "bg-blue-600" : ""}`}
                >

                    Yearly

                </motion.button>

            </div>


            {/* pricing cards */}

            <div className="grid md:grid-cols-3 gap-10 max-w-6xl w-full">

                <AnimatePresence mode="wait">

                    {plans[currency][billing].map((plan) => {
                        const currentLimit = planLimits[billing][plan.title.toLowerCase()];
                        const isCurrentPlan =
                            user?.plan === plan.title.toLowerCase() &&
                            user?.billing === billing;

                        const isUnlimited = plan.title === "Elite";
                        const usedPercentage = isCurrentPlan && !isUnlimited
                            ? Math.max(0, Math.min(((currentLimit - user?.credits) / currentLimit) * 100, 100))
                            : 0;

                        const isDisabled = isCurrentPlan;
                        const highlight = plan.title === "Pro";

                        return (

                            <motion.div
                                key={currency + billing + plan.title}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -40 }}
                                whileHover={{
                                    rotateX: 6,
                                    rotateY: -6,
                                    scale: 1.05
                                }}
                                transition={{ duration: 0.4 }}
                                className={`
relative rounded-2xl p-8 backdrop-blur-xl border shadow-xl flex flex-col

${highlight
                                        ? "bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500 scale-105"
                                        : "bg-white/10 border-white/10"}
`}
                                style={{ transformStyle: "preserve-3d" }}
                            >

                                {/* title */}

                                <h2 className="text-2xl font-bold mb-2">
                                    {plan.title}
                                </h2>


                                {/* price animation */}

                                <motion.p
                                    key={plan.price}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-4xl font-bold mb-4"
                                >

                                    {plan.price}

                                </motion.p>


                                {/* interview badge */}

                                <div className="mb-6">

                                    <span className="bg-blue-600/20 border border-blue-500 px-4 py-1 rounded-full text-sm font-semibold">

                                        {plan.credits} AI Interviews Credit

                                    </span>

                                </div>


                                {/* features */}

                                <ul className="space-y-3 text-gray-300 text-sm flex-1">

                                    <li className="flex gap-2">
                                        <FaCheckCircle className="text-green-400" /> AI Mock Interviews
                                    </li>

                                    <li className="flex gap-2">
                                        <FaCheckCircle className="text-green-400" /> Smart Feedback
                                    </li>

                                    <li className="flex gap-2">
                                        <FaCheckCircle className="text-green-400" /> Interview Analytics
                                    </li>

                                    {plan.title !== "Starter" && (
                                        <li className="flex gap-2">
                                            <FaCheckCircle className="text-green-400" /> Advanced AI Evaluation
                                        </li>
                                    )}

                                </ul>

                                {isCurrentPlan && !isUnlimited && (
                                    <div className="mt-4">

                                        {/* progress bar */}
                                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                                                style={{ width: `${usedPercentage}%` }}
                                            />
                                        </div>

                                        {/* text */}
                                        <p className="text-xs text-gray-400 mt-2">
                                            {usedPercentage === 0
                                                ? "You haven't used any credits yet"
                                                : `You used ${usedPercentage.toFixed(0)}% of your plan`}
                                        </p>

                                        {/* remaining credits */}
                                        <p className="text-xs text-gray-500">
                                            {user?.credits} credits remaining
                                        </p>

                                    </div>
                                )}

                                {/* button */}

                                {isCurrentPlan ? (
                                    <button className="mt-8 py-3 rounded-xl font-semibold bg-green-600 flex items-center justify-center">
                                        Current Plan ✅
                                    </button>
                                ) : plan.title === "Starter" ? (
                                    <button className="mt-8 py-3 rounded-xl font-semibold bg-gray-600 cursor-not-allowed">
                                        Already Active 
                                    </button>
                                ) : (
                                        <button
                                            disabled={isDisabled}
                                            onClick={() => {
                                                if (plan.title === "Starter") return;

                                                const amount =
                                                    currency === "INR"
                                                        ? parseInt(plan.price.replace("₹", ""))
                                                        : parseInt(plan.price.replace("$", ""));

                                                handlePayment(
                                                    amount,
                                                    plan.title.toUpperCase(),
                                                    currency,
                                                    billing
                                                );
                                            }}
                                            className={`mt-8 py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                                        ${isDisabled
                                                    ? "bg-gray-600 cursor-not-allowed"
                                                    : highlight
                                                        ? "bg-blue-600 hover:bg-blue-500"
                                                        : "bg-white/10 hover:bg-white/20"
                                                }`}
                                        >
                                            {isDisabled ? "Already Active 🚫" : (
                                                <>
                                                    <FaRocket /> Upgrade Now
                                                </>
                                            )}
                                        </button>
                                    )}

                            </motion.div>

                        );

                    })}

                </AnimatePresence>

            </div>


            <p className="text-gray-500 mt-16 text-sm">

                Each interview consumes credits depending on interview type and analysis depth.

            </p>

        </div>

    );

};

export default Coins;