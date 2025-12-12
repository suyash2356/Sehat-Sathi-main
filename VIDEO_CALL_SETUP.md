# 🏥 Sehat Sathi - Video Call System Setup Guide

## 🚀 Quick Start (Demo Mode)

The application is now set up with **Demo Mode** enabled, which means you can test all features without needing real API keys!

### ✅ What Works in Demo Mode:

1. **Map Page**: Shows hospital list with booking functionality
2. **Video Call Booking**: Both immediate and scheduled calls
3. **Video Call Interface**: Full UI with camera controls
4. **Form Validation**: Complete form validation
5. **Multi-language Support**: English, Hindi, Marathi

## 🎯 How to Test the Application

### 1. **Start the Development Server**
```bash
cd Hackathon-Project
npm run dev
```

### 2. **Test Map Page**
- Navigate to `/map`
- Fill out the appointment form
- Try both "Call Now" and "Schedule Call" options
- Test hospital booking from the hospital list

### 3. **Test Video Call**
- Select "Call Now" option
- You'll be redirected to the video call page
- Camera/mic permissions will be requested
- Test mute/unmute and camera on/off controls
- Click "End Call" to return to map page

### 4. **Test Scheduled Calls**
- Select a future date and time
- Submit the form
- You'll see a success message
- In production, notifications would appear 5 minutes before the call

## 🔧 Production Setup

To make the application fully functional with real services:

### 1. **Geoapify API Key**
```bash
# Get your free API key from: https://myprojects.geoapify.com/
# Update .env.local:
NEXT_PUBLIC_GEOAPIFY_API_KEY=your_actual_geoapify_api_key
```

### 2. **Firebase Configuration**
```bash
# Create a Firebase project at: https://console.firebase.google.com/
# Update .env.local with your Firebase config:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. **Disable Demo Mode**
```bash
# Remove or set to false:
NEXT_PUBLIC_DEMO_MODE=false
```

## 📱 Features Overview

### **Map Page (`/map`)**
- ✅ Interactive map with Geoapify integration
- ✅ Hospital list with detailed information
- ✅ Appointment booking form
- ✅ Video call scheduling
- ✅ Form validation with Zod
- ✅ Multi-language support

### **Video Call Page (`/video-call`)**
- ✅ WebRTC peer-to-peer video calls
- ✅ Audio/video controls (mute, camera toggle)
- ✅ Real-time connection status
- ✅ Error handling and loading states
- ✅ Responsive design for mobile/desktop

### **Call Scheduling System**
- ✅ Immediate calls (instant connection)
- ✅ Scheduled calls (future date/time)
- ✅ 5-minute advance notifications
- ✅ Browser notification support
- ✅ Firebase integration for persistence

### **Notification System**
- ✅ Real-time call reminders
- ✅ Browser notifications
- ✅ Call status updates
- ✅ Join/dismiss functionality

## 🛠️ Technical Architecture

### **Core Services**
- **WebRTC Service**: Handles peer-to-peer connections
- **Call Scheduler**: Manages call scheduling and notifications
- **Signaling Service**: Manages WebRTC signaling through Firebase
- **Video Call Hook**: Centralized state management

### **Key Components**
- **GoogleMapEmbed**: Interactive map with Geoapify
- **CallNotification**: Real-time call reminders
- **Video Call Page**: Complete video call interface

### **Technologies Used**
- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **WebRTC**: Video communication
- **Firebase**: Real-time database
- **Tailwind CSS**: Styling
- **Zod**: Form validation
- **React Hook Form**: Form management

## 🐛 Troubleshooting

### **Common Issues**

1. **Camera/Mic Not Working**
   - Ensure browser permissions are granted
   - Check if HTTPS is enabled (required for WebRTC)
   - Try refreshing the page

2. **Map Not Loading**
   - Check Geoapify API key in `.env.local`
   - Ensure internet connection
   - Demo mode will show placeholder if no API key

3. **Video Call Not Connecting**
   - Check Firebase configuration
   - Ensure demo mode is properly set
   - Check browser console for errors

4. **Form Validation Errors**
   - Ensure all required fields are filled
   - Check phone number format (10 digits)
   - Verify date/time selection

### **Development Tips**

1. **Check Console Logs**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls

2. **Test Different Browsers**
   - Chrome/Edge: Full WebRTC support
   - Firefox: Good WebRTC support
   - Safari: Limited WebRTC support

3. **Mobile Testing**
   - Test on actual mobile devices
   - Check responsive design
   - Test camera/mic permissions

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure all dependencies are installed (`npm install`)
4. Try clearing browser cache and cookies

## 🎉 Success!

Your healthcare application now has:
- ✅ Complete video call system
- ✅ Interactive map with hospital locations
- ✅ Appointment booking system
- ✅ Real-time notifications
- ✅ Multi-language support
- ✅ Responsive design
- ✅ Demo mode for testing

The application is ready for demonstration and can be easily configured for production use!
