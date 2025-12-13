export const locationData = {
    "Maharashtra": {
        "Mumbai": ["Colaba", "Dadar", "Bandra", "Andheri", "Juhu"],
        "Pune": ["Shivajinagar", "Kothrud", "Hadapsar", "Viman Nagar", "Hinjewadi"],
        "Nagpur": ["Sitabuldi", "Dharampeth", "Sadar", "Mahal", "Itwari"],
        "Nashik": ["Panchavati", "Satpur", "Nashik Road", "Indira Nagar"],
        "Aurangabad": ["Cidco", "Garkheda", "Samarth Nagar", "Shahganj"]
    },
    "Delhi": {
        "New Delhi": ["Connaught Place", "Chanakyapuri", "Vasant Kunj", "Hauz Khas"],
        "North Delhi": ["Civil Lines", "Model Town", "Pitampura", "Rohini"],
        "South Delhi": ["Saket", "Kalkaji", "Defence Colony", "Greater Kailash"]
    },
    "Karnataka": {
        "Bangalore Urban": ["Indiranagar", "Koramangala", "Jayanagar", "Whitefield", "Electronic City"],
        "Mysore": ["Gokulam", "Saraswathipuram", "Kuvempunagar", "Siddhartha Layout"],
        "Hubli": ["Vidya Nagar", "Keshwapur", "Gokul Road", "Navanagar"]
    },
    "Uttar Pradesh": {
        "Lucknow": ["Hazratganj", "Gomti Nagar", "Aliganj", "Indira Nagar"],
        "Kanpur": ["Civil Lines", "Swaroop Nagar", "Kakadeo", "Kidwai Nagar"],
        "Varanasi": ["Lanka", "Bhelupur", "Sigra", "Mahmoorganj"]
    }
};

export const governmentHospitals = [
    {
        id: "gov-1",
        name: "AIIMS Delhi",
        specialization: "Multi-specialty",
        hospitalName: "All India Institute of Medical Sciences",
        hospitalAddress: "Ansari Nagar, New Delhi",
        lat: 28.5672,
        lng: 77.2100,
        state: "Delhi",
        district: "New Delhi",
        village: "Ansari Nagar",
        isVerified: true,
        type: "Government"
    },
    {
        id: "gov-2",
        name: "KEM Hospital",
        specialization: "General Medicine",
        hospitalName: "King Edward Memorial Hospital",
        hospitalAddress: "Parel, Mumbai, Maharashtra",
        lat: 19.0025,
        lng: 72.8416,
        state: "Maharashtra",
        district: "Mumbai",
        village: "Parel",
        isVerified: true,
        type: "Government"
    },
    {
        id: "gov-3",
        name: "Sassoon General Hospital",
        specialization: "Multi-specialty",
        hospitalName: "Sassoon General Hospital",
        hospitalAddress: "Pune Station, Pune, Maharashtra",
        lat: 18.5204,
        lng: 73.8567,
        state: "Maharashtra",
        district: "Pune",
        village: "Shivajinagar",
        isVerified: true,
        type: "Government"
    }
];
