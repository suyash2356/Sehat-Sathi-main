# Sehat Sathi: Your Health Assistant

<p align="center">
  <!-- 🎥 Replace YOUR_VIDEO_ID below with your YouTube video ID -->
 <p align="center">
  <img src="https://github.com/suyash2356/sehat-sathi/blob/main/SehatSathi-ezgif.com-video-to-gif-converter.gif" alt="Sehat Sathi Demo GIF" width="700">
</p>

  <br>
</p>

<p align="center">
  <strong>Your Health Assistant, Anytime, Anywhere.</strong><br/>
  Providing rural India with instant, reliable healthcare guidance and access to government initiatives.
</p>

---

## 🎯 The Problem It Solves

Millions of people in rural communities lack access to timely and reliable medical advice.  
This critical gap — caused by barriers like distance, cost, and a lack of information — often leads to preventable health complications and perpetuates health inequality.

---

## ✨ Our Solution

**Sehat Sathi** is a mobile-friendly web platform designed to break down these barriers.  
It provides instant, accessible, and easy-to-understand health guidance through a suite of powerful, user-friendly tools.  
By leveraging **AI** and supporting **local languages**, we put a **virtual health assistant** in everyone's pocket.

Our mission is to empower individuals in rural communities with the knowledge and tools to make informed decisions about their health, ensuring **no one is left behind**.

---

## 🚀 Key Features

Sehat Sathi is packed with features designed to provide comprehensive healthcare support:

* **🤖 AI Health Chatbot:**  
  Get instant, 24/7 answers to your health queries in your local language (supports English, Hindi, and Marathi).

* **📹 Live Video Consultation (In Progress):**  
  - Connect with healthcare professionals through secure, peer-to-peer WebRTC video calls.  
  - Supports both **instant** and **scheduled** consultations.  
  - Includes full in-call controls for muting, video toggle, and connection status.  
  - Responsive and works smoothly on mobile and desktop.

* **🗺️ Hospital & Services Locator:**  
  Interactive map to find nearby hospitals, clinics, and government health centers.

* **📄 Insurance Document Management:**  
  A secure, personal portal for uploading and managing health insurance documents.

* **🇮🇳 Government Scheme Information:**  
  Provides simple explanations of relevant healthcare schemes and programs.

* **🔐 Secure Authentication:**  
  Easy login with email (Firebase authentication).  
  Future update: OTP-based login for seamless access.

* **🌐 Multilingual Interface:**  
  Available in **English, Hindi, and Marathi**, with more languages to be added soon.

---

## 🛠️ Tech Stack & Architecture

This project is built with a **modern, scalable stack**:

* **Framework:** [Next.js](https://nextjs.org/) (React-based)
* **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Authentication, Cloud Storage)
* **Real-time Communication:** [WebRTC](https://webrtc.org/) (for video calls), Firebase (for signaling)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
* **State Management:** React Hooks & Context API
* **Forms & Validation:** React Hook Form + Zod

---

## ⚙️ Getting Started (Local Setup)

### Prerequisites
* [Node.js](https://nodejs.org/en/) (v18+ recommended)  
* npm, yarn, or pnpm  
* A free [Firebase account](https://firebase.google.com/)

---

### Steps

1. **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/sehat-sathi.git
    cd sehat-sathi
    ```

2. **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set Up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/).  
   - Click **“Add project”** → create a new one.  
   - In **Project Settings → General → Your apps**, click **“</>”** to register your web app.  
   - Copy your Firebase config object.

4. **Create `.env.local`**
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
    NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcde12345
    ```

5. **Enable Firebase Services**
   - **Authentication:** Enable “Email/Password” and “Phone” (optional).  
   - **Firestore:** Create database (start in test mode).  
   - **Storage:** Enable and set to test mode for now.

6. **Run Locally**
    ```bash
    npm run dev
    ```
    Visit [http://localhost:3000](http://localhost:3000)

---

## 📜 Disclaimer

This app is meant to provide **general health guidance and information** only.  
It is **not a substitute for professional medical advice, diagnosis, or treatment**.  
In case of an emergency, please contact a certified doctor or nearby hospital immediately.

---

## 💌 Contact

If you have suggestions, feedback, or collaboration ideas:  
📧 **suyashbabad09@gmail.com**

---
