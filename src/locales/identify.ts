export type Language = 'en' | 'hi' | 'mr';

export const identifyStrings: Record<Language, {
  pageTitle: string;
  pageSubtitle: string;
  tabPredict: string;
  tabSkin: string;
  searchPlaceholder: string;
  selectedSymptoms: string;
  noSymptomsSelected: string;
  predictButton: string;
  predicting: string;
  resultTitle: string;
  disease: string;
  confidence: string;
  description: string;
  otherPossible: string;
  probability: string;
  disclaimer: string;
  uploadZoneText: string;
  uploadZoneSubtext: string;
  uploadFormats: string;
  changeImage: string;
  analyseButton: string;
  analysing: string;
  noSymptoms: string;
  noImage: string;
  errorGeneric: string;
  removeSymptom: string;
  clearAll: string;
  detectedDisease: string;
  browseFiles: string;
  imagePreview: string;
  topPrediction: string;
  alternativeDiagnoses: string;
  loadingPatient: string;
}> = {
  en: {
    pageTitle: "Identify Health Issues",
    pageSubtitle: "Use AI-powered tools to predict diseases from symptoms or detect skin conditions from images.",
    tabPredict: "Predict Disease",
    tabSkin: "Skin Disease Detection",
    searchPlaceholder: "Search symptoms...",
    selectedSymptoms: "Selected Symptoms",
    noSymptomsSelected: "No symptoms selected yet. Use the search above to find and add symptoms.",
    predictButton: "Predict Disease",
    predicting: "Analysing symptoms...",
    resultTitle: "Prediction Result",
    disease: "Disease",
    confidence: "Confidence",
    description: "Description",
    otherPossible: "Other Possible Conditions",
    probability: "Probability",
    disclaimer: "⚠️ This is not a substitute for professional medical advice. Please consult a qualified doctor for proper diagnosis and treatment.",
    uploadZoneText: "Drag & drop an image here",
    uploadZoneSubtext: "or click to browse files",
    uploadFormats: "Accepted formats: JPG, PNG, WEBP — Max 5MB",
    changeImage: "Change Image",
    analyseButton: "Analyse Image",
    analysing: "Analysing image...",
    noSymptoms: "Please select at least one symptom to predict.",
    noImage: "Please upload an image first.",
    errorGeneric: "Something went wrong. Please try again.",
    removeSymptom: "Remove",
    clearAll: "Clear All",
    detectedDisease: "Detected Skin Condition",
    browseFiles: "Browse Files",
    imagePreview: "Uploaded image preview",
    topPrediction: "Top Prediction",
    alternativeDiagnoses: "Alternative Diagnoses",
    loadingPatient: "Loading patient data...",
  },
  hi: {
    pageTitle: "स्वास्थ्य समस्याओं की पहचान",
    pageSubtitle: "लक्षणों से रोग की भविष्यवाणी करने या छवियों से त्वचा रोगों का पता लगाने के लिए AI-संचालित उपकरणों का उपयोग करें।",
    tabPredict: "रोग की भविष्यवाणी",
    tabSkin: "त्वचा रोग पहचान",
    searchPlaceholder: "लक्षण खोजें...",
    selectedSymptoms: "चयनित लक्षण",
    noSymptomsSelected: "अभी तक कोई लक्षण चुना नहीं गया। लक्षण खोजने और जोड़ने के लिए ऊपर खोजें।",
    predictButton: "रोग की भविष्यवाणी करें",
    predicting: "लक्षणों का विश्लेषण हो रहा है...",
    resultTitle: "भविष्यवाणी परिणाम",
    disease: "रोग",
    confidence: "विश्वास स्तर",
    description: "विवरण",
    otherPossible: "अन्य संभावित स्थितियां",
    probability: "संभावना",
    disclaimer: "⚠️ यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है। कृपया उचित निदान और उपचार के लिए योग्य डॉक्टर से परामर्श करें।",
    uploadZoneText: "यहाँ एक छवि खींचें और छोड़ें",
    uploadZoneSubtext: "या फ़ाइलें ब्राउज़ करने के लिए क्लिक करें",
    uploadFormats: "स्वीकृत प्रारूप: JPG, PNG, WEBP — अधिकतम 5MB",
    changeImage: "छवि बदलें",
    analyseButton: "छवि का विश्लेषण करें",
    analysing: "छवि का विश्लेषण हो रहा है...",
    noSymptoms: "कृपया भविष्यवाणी के लिए कम से कम एक लक्षण चुनें।",
    noImage: "कृपया पहले एक छवि अपलोड करें।",
    errorGeneric: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
    removeSymptom: "हटाएं",
    clearAll: "सब हटाएं",
    detectedDisease: "पहचानी गई त्वचा स्थिति",
    browseFiles: "फ़ाइलें ब्राउज़ करें",
    imagePreview: "अपलोड की गई छवि पूर्वावलोकन",
    topPrediction: "शीर्ष भविष्यवाणी",
    alternativeDiagnoses: "वैकल्पिक निदान",
    loadingPatient: "रोगी डेटा लोड हो रहा है...",
  },
  mr: {
    pageTitle: "आरोग्य समस्यांची ओळख",
    pageSubtitle: "लक्षणांवरून रोगाचा अंदाज लावण्यासाठी किंवा प्रतिमांवरून त्वचा रोग शोधण्यासाठी AI-समर्थित साधनांचा वापर करा.",
    tabPredict: "रोगाचा अंदाज",
    tabSkin: "त्वचा रोग ओळख",
    searchPlaceholder: "लक्षणे शोधा...",
    selectedSymptoms: "निवडलेली लक्षणे",
    noSymptomsSelected: "अद्याप कोणतीही लक्षणे निवडली नाहीत. लक्षणे शोधण्यासाठी आणि जोडण्यासाठी वरील शोध वापरा.",
    predictButton: "रोगाचा अंदाज लावा",
    predicting: "लक्षणांचे विश्लेषण होत आहे...",
    resultTitle: "अंदाज निकाल",
    disease: "रोग",
    confidence: "विश्वास पातळी",
    description: "वर्णन",
    otherPossible: "इतर संभाव्य स्थिती",
    probability: "संभाव्यता",
    disclaimer: "⚠️ हा व्यावसायिक वैद्यकीय सल्ल्याचा पर्याय नाही. कृपया योग्य निदान आणि उपचारांसाठी पात्र डॉक्टरांचा सल्ला घ्या.",
    uploadZoneText: "येथे एक प्रतिमा ड्रॅग आणि ड्रॉप करा",
    uploadZoneSubtext: "किंवा फाइल ब्राउझ करण्यासाठी क्लिक करा",
    uploadFormats: "स्वीकृत स्वरूप: JPG, PNG, WEBP — कमाल 5MB",
    changeImage: "प्रतिमा बदला",
    analyseButton: "प्रतिमाचे विश्लेषण करा",
    analysing: "प्रतिमाचे विश्लेषण होत आहे...",
    noSymptoms: "कृपया अंदाज लावण्यासाठी किमान एक लक्षण निवडा.",
    noImage: "कृपया प्रथम एक प्रतिमा अपलोड करा.",
    errorGeneric: "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
    removeSymptom: "काढा",
    clearAll: "सर्व काढा",
    detectedDisease: "ओळखलेली त्वचा स्थिती",
    browseFiles: "फाइल ब्राउझ करा",
    imagePreview: "अपलोड केलेली प्रतिमा पूर्वावलोकन",
    topPrediction: "शीर्ष अंदाज",
    alternativeDiagnoses: "पर्यायी निदान",
    loadingPatient: "रुग्ण डेटा लोड होत आहे...",
  },
};
