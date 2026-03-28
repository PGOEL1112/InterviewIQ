# 🚀 InterviewIQ – AI-Powered Mock Interview Platform

InterviewIQ is an advanced AI-driven platform designed to simulate real-world interview experiences using voice-based interactions, resume-based question generation, and intelligent performance analysis.

---

## 🌟 Core Features

### 🎤 AI Voice-Based Interviews

* Real-time voice interaction
* Speech-to-text processing
* Natural conversation-like interview flow
* Simulates real interviewer behavior

---

### 📄 Resume-Based Question Generation

* Upload your resume
* AI extracts skills & experience
* Generates personalized interview questions
* Tailored for each candidate

---

### 🧠 Smart AI Feedback System

* Deep answer evaluation
* Strengths & weaknesses breakdown
* AI-generated ideal answers
* Communication & clarity analysis

---

### 📊 Performance Analytics Dashboard

* Track interview scores over time
* Visual progress insights
* Identify weak areas
* Improve with data-driven feedback

---

### 💰 Credit-Based SaaS System

* Users get credits to attempt interviews
* Smart plan logic:

  * Cannot rebuy same plan until credits drop
* Plans:

  * Starter (Free)
  * Pro
  * Elite

---

### 💳 Payment Integration (Razorpay)

* Secure payment flow
* INR + USD support
* USD auto-converted to INR
* Payment verification with signature

---

### 👤 User Management System

* Authentication (JWT-based)
* Profile customization
* Resume upload
* Skills & portfolio links

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion (animations)
* Redux Toolkit

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### AI Integration

* OpenAI / AI APIs (for feedback & questions)
* Speech-to-text (voice processing)

### Payments

* Razorpay API

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/interviewiq.git
cd interviewiq
```

---

### 2️⃣ Backend Setup

```bash
cd Server
npm install
```

Create `.env`:

```env
PORT=8000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

Run server:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd Client
npm install
```

Create `.env`:

```env
VITE_RAZORPAY_KEY_ID=your_key
```

Run frontend:

```bash
npm run dev
```

---

## 💳 Payment Flow

1. User selects plan (Pro / Elite)
2. Order created via backend
3. Razorpay checkout opens
4. Payment success → verification API
5. Credits updated in database
6. UI auto-refresh with new credits

---

## 📦 Plans & Credits

| Plan    | Monthly Credits | Yearly Credits |
| ------- | --------------- | -------------- |
| Starter | 10              | 10             |
| Pro     | 120             | 1500           |
| Elite   | Unlimited       | Unlimited      |

---

## 🧠 Business Logic

* Credits decrease after each interview
* Users cannot repurchase same plan unless credits fall below plan limit
* Plan is tracked using:

  * `plan`
  * `billing`

---

## 🔐 Security

* Razorpay signature verification
* JWT authentication
* Protected API routes
* Secure user data handling

---

## 🚀 Future Enhancements

* AI video interview mode
* Company-specific interview prep
* Leaderboard & gamification
* Admin analytics dashboard

---

## 👨‍💻 Author

**Priyanshu Goel**
Full Stack Developer | AI Enthusiast

---

## ⭐ Support

If you found this project useful, please give it a ⭐ on GitHub!
