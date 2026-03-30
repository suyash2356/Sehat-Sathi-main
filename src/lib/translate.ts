export type Language = 'en' | 'hi' | 'mr';

// ─── 41 SYMPTOM-BASED DISEASES ───────────────────────────────────
export const diseaseTranslations: Record<string, Record<Language, string>> = {
  "Fungal infection":       { en: "Fungal Infection",        hi: "फंगल संक्रमण",          mr: "बुरशीजन्य संसर्ग" },
  "Allergy":                { en: "Allergy",                 hi: "एलर्जी",               mr: "ॲलर्जी" },
  "GERD":                   { en: "GERD",                    hi: "जीईआरडी (एसिड रिफ्लक्स)", mr: "जीईआरडी (ॲसिड रिफ्लक्स)" },
  "Chronic cholestasis":    { en: "Chronic Cholestasis",     hi: "क्रोनिक कोलेस्टेसिस",   mr: "तीव्र कोलेस्टेसिस" },
  "Drug Reaction":          { en: "Drug Reaction",           hi: "दवा प्रतिक्रिया",       mr: "औषध प्रतिक्रिया" },
  "Peptic ulcer disease":   { en: "Peptic Ulcer Disease",    hi: "पेप्टिक अल्सर रोग",     mr: "पेप्टिक अल्सर रोग" },
  "AIDS":                   { en: "AIDS",                    hi: "एड्स",                  mr: "एड्स" },
  "Diabetes":               { en: "Diabetes",                hi: "मधुमेह",                mr: "मधुमेह" },
  "Gastroenteritis":        { en: "Gastroenteritis",         hi: "आंत्रशोथ",              mr: "जठरांत्रदाह" },
  "Bronchial Asthma":       { en: "Bronchial Asthma",        hi: "ब्रोन्कियल अस्थमा",     mr: "श्वासनलिकांसंबंधी दमा" },
  "Hypertension":           { en: "Hypertension",            hi: "उच्च रक्तचाप",          mr: "उच्च रक्तदाब" },
  "Migraine":               { en: "Migraine",                hi: "माइग्रेन",              mr: "मायग्रेन" },
  "Cervical spondylosis":   { en: "Cervical Spondylosis",    hi: "सर्वाइकल स्पॉन्डिलोसिस", mr: "मानेचा स्पॉन्डिलोसिस" },
  "Paralysis (brain hemorrhage)": { en: "Paralysis (Brain Hemorrhage)", hi: "पक्षाघात (मस्तिष्क रक्तस्राव)", mr: "पक्षाघात (मेंदू रक्तस्राव)" },
  "Jaundice":               { en: "Jaundice",                hi: "पीलिया",                mr: "कावीळ" },
  "Malaria":                { en: "Malaria",                 hi: "मलेरिया",               mr: "मलेरिया" },
  "Chicken pox":            { en: "Chicken Pox",             hi: "चिकन पॉक्स",            mr: "कांजिण्या" },
  "Dengue":                 { en: "Dengue",                  hi: "डेंगू",                 mr: "डेंग्यू" },
  "Typhoid":                { en: "Typhoid",                 hi: "टाइफाइड",               mr: "टायफॉइड" },
  "Hepatitis A":            { en: "Hepatitis A",             hi: "हेपेटाइटिस ए",          mr: "हिपॅटायटीस ए" },
  "Hepatitis B":            { en: "Hepatitis B",             hi: "हेपेटाइटिस बी",         mr: "हिपॅटायटीस बी" },
  "Hepatitis C":            { en: "Hepatitis C",             hi: "हेपेटाइटिस सी",         mr: "हिपॅटायटीस सी" },
  "Hepatitis D":            { en: "Hepatitis D",             hi: "हेपेटाइटिस डी",         mr: "हिपॅटायटीस डी" },
  "Hepatitis E":            { en: "Hepatitis E",             hi: "हेपेटाइटिस ई",          mr: "हिपॅटायटीस ई" },
  "Alcoholic hepatitis":    { en: "Alcoholic Hepatitis",     hi: "अल्कोहलिक हेपेटाइटिस",  mr: "मद्यजन्य हिपॅटायटीस" },
  "Tuberculosis":           { en: "Tuberculosis",            hi: "तपेदिक (टीबी)",          mr: "क्षयरोग (टीबी)" },
  "Common Cold":            { en: "Common Cold",             hi: "सामान्य सर्दी",          mr: "सामान्य सर्दी" },
  "Pneumonia":              { en: "Pneumonia",               hi: "निमोनिया",               mr: "न्यूमोनिया" },
  "Dimorphic hemorrhoids (piles)": { en: "Hemorrhoids (Piles)", hi: "बवासीर",              mr: "मूळव्याध" },
  "Heart attack":           { en: "Heart Attack",            hi: "दिल का दौरा",            mr: "हृदयविकाराचा झटका" },
  "Varicose veins":         { en: "Varicose Veins",          hi: "वैरिकोज़ वेन्स",         mr: "वैरिकोज व्हेन्स" },
  "Hypothyroidism":         { en: "Hypothyroidism",          hi: "हाइपोथायरायडिज्म",       mr: "हायपोथायरॉइडिझम" },
  "Hyperthyroidism":        { en: "Hyperthyroidism",         hi: "हाइपरथायरायडिज्म",       mr: "हायपरथायरॉइडिझम" },
  "Hypoglycemia":           { en: "Hypoglycemia",            hi: "हाइपोग्लाइसीमिया",       mr: "हायपोग्लायसेमिया" },
  "Osteoarthritis":         { en: "Osteoarthritis",          hi: "ऑस्टियोआर्थराइटिस",      mr: "ऑस्टियोआर्थरायटिस" },
  "Arthritis":              { en: "Arthritis",               hi: "गठिया",                 mr: "संधिवात" },
  "Vertigo":                { en: "Vertigo",                 hi: "चक्कर आना",             mr: "चक्कर येणे" },
  "Acne":                   { en: "Acne",                    hi: "मुंहासे",               mr: "मुरुम" },
  "Urinary tract infection": { en: "Urinary Tract Infection", hi: "मूत्र मार्ग संक्रमण",   mr: "मूत्रमार्ग संसर्ग" },
  "Psoriasis":              { en: "Psoriasis",               hi: "सोरायसिस",              mr: "सोरायसिस" },
  "Impetigo":               { en: "Impetigo",                hi: "इम्पेटिगो",             mr: "इम्पेटिगो" },
};

// ─── 5 SKIN DISEASE CLASSES ──────────────────────────────────────
export const skinDiseaseTranslations: Record<string, Record<Language, string>> = {
  "Acne":             { en: "Acne",             hi: "मुंहासे",           mr: "मुरुम" },
  "Fungal infection": { en: "Fungal Infection",  hi: "फंगल संक्रमण",      mr: "बुरशीजन्य संसर्ग" },
  "Eczema":           { en: "Eczema",            hi: "एक्जिमा",          mr: "एक्झिमा" },
  "Psoriasis":        { en: "Psoriasis",         hi: "सोरायसिस",         mr: "सोरायसिस" },
  "Benign_tumors":    { en: "Benign Tumors",     hi: "सौम्य ट्यूमर",      mr: "सौम्य गाठी" },
};

// ─── DISEASE DESCRIPTIONS ────────────────────────────────────────
export const diseaseDescriptions: Record<string, Record<Language, string>> = {
  "Fungal infection":       { en: "A skin infection caused by fungi, leading to itching, redness, and rashes.", hi: "कवक के कारण होने वाला त्वचा संक्रमण, जिससे खुजली, लालिमा और चकत्ते होते हैं।", mr: "बुरशीमुळे होणारा त्वचा संसर्ग, ज्यामुळे खाज, लालसरपणा आणि पुरळ येतात." },
  "Allergy":                { en: "An immune system reaction to substances like pollen, food, or dust causing sneezing, itching, or swelling.", hi: "पराग, भोजन या धूल जैसे पदार्थों के प्रति प्रतिरक्षा प्रणाली की प्रतिक्रिया।", mr: "परागकण, अन्न किंवा धूळ यांसारख्या पदार्थांवर रोगप्रतिकारक प्रणालीची प्रतिक्रिया." },
  "GERD":                   { en: "Gastroesophageal Reflux Disease — chronic acid reflux causing heartburn and discomfort.", hi: "गैस्ट्रोइसोफेजियल रिफ्लक्स रोग — पुरानी एसिड रिफ्लक्स जो सीने में जलन और असुविधा करती है।", mr: "गॅस्ट्रोइसोफेजियल रिफ्लक्स रोग — तीव्र ॲसिड रिफ्लक्समुळे छातीत जळजळ आणि अस्वस्थता." },
  "Chronic cholestasis":    { en: "A condition where bile flow from the liver is reduced or blocked, causing jaundice and itching.", hi: "एक स्थिति जिसमें यकृत से पित्त का प्रवाह कम या अवरुद्ध हो जाता है।", mr: "यकृतातून पित्ताचा प्रवाह कमी किंवा अवरोधित होतो अशी स्थिती." },
  "Drug Reaction":          { en: "An adverse reaction to a medication, which may cause rashes, fever, or organ damage.", hi: "किसी दवा के प्रति प्रतिकूल प्रतिक्रिया, जिससे चकत्ते, बुखार या अंग क्षति हो सकती है।", mr: "औषधाच्या प्रतिकूल प्रतिक्रियेमुळे पुरळ, ताप किंवा अवयवांचे नुकसान होऊ शकते." },
  "Peptic ulcer disease":   { en: "Open sores on the inner lining of the stomach or small intestine, causing burning stomach pain.", hi: "पेट या छोटी आंत की आंतरिक परत पर खुले घाव, जिससे पेट में जलन होती है।", mr: "पोट किंवा लहान आतड्याच्या आतील अस्तरावर उघडे फोड, ज्यामुळे पोटात जळजळ होते." },
  "AIDS":                   { en: "Acquired Immunodeficiency Syndrome — a chronic condition caused by HIV that damages the immune system.", hi: "एक्वायर्ड इम्यूनोडेफिशिएंसी सिंड्रोम — HIV के कारण होने वाली एक पुरानी बीमारी।", mr: "ॲक्वायर्ड इम्यूनोडेफिशिएन्सी सिंड्रोम — HIV मुळे होणारा तीव्र आजार." },
  "Diabetes":               { en: "A metabolic disease causing high blood sugar levels due to insufficient insulin production or response.", hi: "एक चयापचय रोग जो अपर्याप्त इंसुलिन उत्पादन के कारण उच्च रक्त शर्करा का कारण बनता है।", mr: "अपुऱ्या इन्सुलिन निर्मितीमुळे रक्तातील साखर वाढवणारा चयापचय रोग." },
  "Gastroenteritis":        { en: "Inflammation of the stomach and intestines, typically caused by infection, leading to diarrhea and vomiting.", hi: "पेट और आंतों की सूजन, आमतौर पर संक्रमण के कारण, जिससे दस्त और उल्टी होती है।", mr: "संसर्गामुळे पोट आणि आतड्यांना सूज येणे, ज्यामुळे अतिसार आणि उलट्या होतात." },
  "Bronchial Asthma":       { en: "A respiratory condition causing narrowing of airways, leading to wheezing, coughing, and breathlessness.", hi: "श्वसन की स्थिति जिसमें वायुमार्ग संकुचित हो जाते हैं, जिससे घरघराहट और सांस फूलती है।", mr: "श्वसनमार्ग अरुंद होऊन घरघर, खोकला आणि श्वसनक्रिया बंद होण्यासारखी स्थिती." },
  "Hypertension":           { en: "Persistently high blood pressure that increases the risk of heart disease and stroke.", hi: "लगातार उच्च रक्तचाप जो हृदय रोग और स्ट्रोक का खतरा बढ़ाता है।", mr: "सतत उच्च रक्तदाब ज्यामुळे हृदयरोग आणि पक्षाघाताचा धोका वाढतो." },
  "Migraine":               { en: "A neurological condition causing intense, throbbing headaches often accompanied by nausea and sensitivity to light.", hi: "एक न्यूरोलॉजिकल स्थिति जो तीव्र सिरदर्द का कारण बनती है, अक्सर मतली और प्रकाश के प्रति संवेदनशीलता के साथ।", mr: "तीव्र, ठोकणाऱ्या डोकेदुखीस कारणीभूत असलेली न्यूरोलॉजिकल स्थिती." },
  "Cervical spondylosis":   { en: "Age-related wear and tear of spinal discs in the neck causing pain and stiffness.", hi: "गर्दन में स्पाइनल डिस्क की उम्र संबंधी टूट-फूट जिससे दर्द और अकड़न होती है।", mr: "मानेतील पाठीच्या कण्यांची वयोमानानुसार झीज ज्यामुळे वेदना आणि कडकपणा येतो." },
  "Paralysis (brain hemorrhage)": { en: "Loss of muscle function caused by bleeding in the brain, leading to loss of movement.", hi: "मस्तिष्क में रक्तस्राव के कारण मांसपेशियों के कार्य का नुकसान।", mr: "मेंदूतील रक्तस्रावामुळे स्नायूंच्या कार्यक्षमतेचे नुकसान." },
  "Jaundice":               { en: "Yellowing of skin and eyes caused by elevated bilirubin levels, often indicating liver problems.", hi: "बिलीरुबिन के स्तर में वृद्धि के कारण त्वचा और आंखों का पीला पड़ना।", mr: "बिलीरुबिनच्या पातळी वाढल्यामुळे त्वचा आणि डोळे पिवळे होणे." },
  "Malaria":                { en: "A mosquito-borne disease caused by Plasmodium parasites, causing fever, chills, and sweating.", hi: "प्लाज़्मोडियम परजीवी के कारण मच्छर जनित रोग, जिससे बुखार, ठंड लगना और पसीना आता है।", mr: "प्लाझमोडियम परजीवींमुळे होणारा डासांमार्फत पसरणारा आजार." },
  "Chicken pox":            { en: "A highly contagious viral infection causing itchy, blister-like rash all over the body.", hi: "एक अत्यधिक संक्रामक वायरल संक्रमण जो पूरे शरीर पर खुजलीदार छाले पैदा करता है।", mr: "संपूर्ण शरीरावर खाजेचे फोड निर्माण करणारा अत्यंत संसर्गजन्य विषाणू संसर्ग." },
  "Dengue":                 { en: "A viral infection transmitted by Aedes mosquitoes causing high fever, joint pain, and rash.", hi: "एडीज मच्छरों द्वारा प्रसारित वायरल संक्रमण जिससे तेज बुखार, जोड़ों में दर्द और चकत्ते होते हैं।", mr: "एडिस डासांमार्फत प्रसारित होणारा विषाणू संसर्ग." },
  "Typhoid":                { en: "A bacterial infection from contaminated food or water causing prolonged fever and digestive problems.", hi: "दूषित भोजन या पानी से होने वाला जीवाणु संक्रमण जिससे लंबा बुखार और पाचन समस्याएं होती हैं।", mr: "दूषित अन्न किंवा पाण्यातून होणारा जीवाणू संसर्ग." },
  "Hepatitis A":            { en: "A highly contagious liver infection caused by the hepatitis A virus.", hi: "हेपेटाइटिस ए वायरस के कारण एक अत्यधिक संक्रामक यकृत संक्रमण।", mr: "हिपॅटायटीस ए विषाणूमुळे होणारा अत्यंत संसर्गजन्य यकृत संसर्ग." },
  "Hepatitis B":            { en: "A serious liver infection caused by the hepatitis B virus that can become chronic.", hi: "हेपेटाइटिस बी वायरस के कारण गंभीर यकृत संक्रमण जो पुराना हो सकता है।", mr: "हिपॅटायटीस बी विषाणूमुळे होणारा गंभीर यकृत संसर्ग." },
  "Hepatitis C":            { en: "A viral infection that causes liver inflammation, sometimes leading to serious liver damage.", hi: "एक वायरल संक्रमण जो यकृत में सूजन पैदा करता है।", mr: "विषाणू संसर्ग ज्यामुळे यकृताला सूज येते." },
  "Hepatitis D":            { en: "A liver disease caused by the hepatitis D virus, occurring only alongside hepatitis B.", hi: "हेपेटाइटिस डी वायरस के कारण यकृत रोग, केवल हेपेटाइटिस बी के साथ होता है।", mr: "हिपॅटायटीस डी विषाणूमुळे होणारा यकृत रोग, फक्त हिपॅटायटीस बी सोबत होतो." },
  "Hepatitis E":            { en: "A liver infection caused by the hepatitis E virus, usually spread through contaminated water.", hi: "हेपेटाइटिस ई वायरस के कारण यकृत संक्रमण, आमतौर पर दूषित पानी से फैलता है।", mr: "हिपॅटायटीस ई विषाणूमुळे यकृत संसर्ग, सामान्यतः दूषित पाण्यातून पसरतो." },
  "Alcoholic hepatitis":    { en: "Liver inflammation caused by excessive alcohol consumption over a long period.", hi: "लंबे समय तक अत्यधिक शराब सेवन के कारण यकृत में सूजन।", mr: "दीर्घकाळ अत्याधिक मद्यपानामुळे यकृताला सूज येणे." },
  "Tuberculosis":           { en: "A bacterial infection primarily affecting the lungs, causing persistent cough, fever, and weight loss.", hi: "एक जीवाणु संक्रमण जो मुख्य रूप से फेफड़ों को प्रभावित करता है।", mr: "प्रामुख्याने फुप्फुसांवर परिणाम करणारा जीवाणू संसर्ग." },
  "Common Cold":            { en: "A mild viral infection of the nose and throat causing sneezing, runny nose, and sore throat.", hi: "नाक और गले का हल्का वायरल संक्रमण जिससे छींक, नाक बहना और गले में खराश होती है।", mr: "नाक आणि घशाचा सौम्य विषाणू संसर्ग." },
  "Pneumonia":              { en: "An infection that inflames the air sacs in lungs, which may fill with fluid, causing cough and fever.", hi: "एक संक्रमण जो फेफड़ों में वायु थैलियों को सूजन देता है।", mr: "फुप्फुसातील हवेच्या पिशव्यांना सूज आणून खोकला आणि ताप निर्माण करणारा संसर्ग." },
  "Dimorphic hemorrhoids (piles)": { en: "Swollen blood vessels in and around the rectum and anus causing discomfort and bleeding.", hi: "मलाशय और गुदा के अंदर और आसपास सूजी हुई रक्त वाहिकाएं।", mr: "गुदाशय आणि गुदद्वाराच्या आत आणि आजूबाजूच्या सुजलेल्या रक्तवाहिन्या." },
  "Heart attack":           { en: "A medical emergency where blood flow to the heart is suddenly blocked, causing chest pain.", hi: "एक चिकित्सा आपातकाल जिसमें हृदय में रक्त प्रवाह अचानक अवरुद्ध हो जाता है।", mr: "हृदयाला रक्तपुरवठा अचानक खंडित होणारी वैद्यकीय आणीबाणी." },
  "Varicose veins":         { en: "Enlarged, twisted veins visible under the skin, usually in the legs, causing aching and swelling.", hi: "त्वचा के नीचे दिखाई देने वाली बढ़ी हुई, मुड़ी हुई नसें, आमतौर पर पैरों में।", mr: "त्वचेखाली दिसणाऱ्या वाढलेल्या, वळलेल्या शिरा, सामान्यतः पायांमध्ये." },
  "Hypothyroidism":         { en: "A condition where the thyroid gland doesn't produce enough hormones, causing fatigue and weight gain.", hi: "एक स्थिति जिसमें थायरॉइड ग्रंथि पर्याप्त हार्मोन नहीं बनाती।", mr: "थायरॉईड ग्रंथी पुरेसे संप्रेरक तयार करत नाही अशी स्थिती." },
  "Hyperthyroidism":        { en: "A condition where the thyroid produces too much hormone, causing rapid heartbeat and weight loss.", hi: "एक स्थिति जिसमें थायरॉइड बहुत अधिक हार्मोन बनाती है।", mr: "थायरॉईड ग्रंथी जास्त संप्रेरक तयार करते अशी स्थिती." },
  "Hypoglycemia":           { en: "Abnormally low blood sugar levels causing shakiness, sweating, and confusion.", hi: "असामान्य रूप से कम रक्त शर्करा का स्तर जिससे कमजोरी, पसीना और भ्रम होता है।", mr: "रक्तातील साखरेची असामान्यपणे कमी पातळी ज्यामुळे थरथरणे आणि घाम येतो." },
  "Osteoarthritis":         { en: "A degenerative joint disease causing cartilage breakdown, leading to pain and stiffness.", hi: "एक अपक्षयी जोड़ रोग जो उपास्थि के टूटने का कारण बनता है।", mr: "कूर्चा तुटण्यास कारणीभूत अपकर्षक सांधे रोग." },
  "Arthritis":              { en: "Inflammation of one or more joints causing pain, swelling, and reduced range of motion.", hi: "एक या अधिक जोड़ों की सूजन जिससे दर्द और सूजन होती है।", mr: "एक किंवा अधिक सांध्यांना सूज येऊन वेदना आणि हालचाल कमी होणे." },
  "Vertigo":                { en: "A sensation of spinning or dizziness, often caused by inner ear problems.", hi: "घूमने या चक्कर आने की अनुभूति, अक्सर भीतरी कान की समस्याओं के कारण।", mr: "फिरल्यासारखी किंवा चक्कर येण्याची संवेदना, अनेकदा आतल्या कानाच्या समस्यांमुळे." },
  "Acne":                   { en: "A skin condition where hair follicles become clogged with oil and dead skin cells, causing pimples.", hi: "एक त्वचा की स्थिति जिसमें बालों के रोम तेल और मृत कोशिकाओं से बंद हो जाते हैं।", mr: "त्वचेची स्थिती ज्यामध्ये केसांच्या कूपांमध्ये तेल आणि मृत पेशी अडकतात." },
  "Urinary tract infection": { en: "An infection in any part of the urinary system causing burning sensation during urination.", hi: "मूत्र प्रणाली के किसी भी हिस्से में संक्रमण जिससे पेशाब करते समय जलन होती है।", mr: "मूत्र प्रणालीच्या कोणत्याही भागात संसर्ग ज्यामुळे लघवी करताना जळजळ होते." },
  "Psoriasis":              { en: "A chronic autoimmune condition causing rapid skin cell growth resulting in thick, scaly patches.", hi: "एक पुरानी ऑटोइम्यून स्थिति जो तेजी से त्वचा कोशिका वृद्धि का कारण बनती है।", mr: "तीव्र स्वयंप्रतिकारक स्थिती ज्यामुळे त्वचेच्या पेशींची जलद वाढ होते." },
  "Impetigo":               { en: "A highly contagious bacterial skin infection forming red sores, common in children.", hi: "एक अत्यधिक संक्रामक जीवाणु त्वचा संक्रमण जो लाल घावों का निर्माण करता है।", mr: "लाल फोड निर्माण करणारा अत्यंत संसर्गजन्य जीवाणू त्वचा संसर्ग." },
  // Skin-only diseases
  "Eczema":                 { en: "A condition that makes skin red, inflamed, and itchy. It is common in children but can occur at any age.", hi: "एक ऐसी स्थिति जो त्वचा को लाल, सूजी और खुजलीदार बनाती है।", mr: "त्वचा लाल, सुजलेली आणि खाजवणारी करणारी स्थिती." },
  "Benign_tumors":          { en: "Non-cancerous growths that do not spread to other parts of the body. Usually harmless but may need monitoring.", hi: "गैर-कैंसरयुक्त वृद्धि जो शरीर के अन्य भागों में नहीं फैलती।", mr: "कर्करोगरहित गाठी ज्या शरीराच्या इतर भागांमध्ये पसरत नाहीत." },
};

// ─── TRANSLATE DISEASE NAME ──────────────────────────────────────
export function translateDiseaseName(
  englishName: string,
  targetLang: Language,
  modelType: 'symptom' | 'skin' = 'symptom'
): string {
  const map = modelType === 'skin' ? skinDiseaseTranslations : diseaseTranslations;
  return map[englishName]?.[targetLang] ?? englishName;
}

// ─── TRANSLATE DISEASE DESCRIPTION ───────────────────────────────
export function translateDiseaseDescription(
  englishName: string,
  targetLang: Language
): string {
  return diseaseDescriptions[englishName]?.[targetLang] ?? '';
}

// ─── GENERIC TRANSLATE UTILITY (fallback for dynamic text) ───────
export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<string> {
  if (targetLanguage === 'en' || !text) return text;

  // First check if there's a hardcoded translation
  if (diseaseTranslations[text]?.[targetLanguage]) {
    return diseaseTranslations[text][targetLanguage];
  }
  if (skinDiseaseTranslations[text]?.[targetLanguage]) {
    return skinDiseaseTranslations[text][targetLanguage];
  }

  // Fallback: free MyMemory API for any other text
  const langMap: Record<string, string> = { hi: 'hi', mr: 'mr' };
  const targetCode = langMap[targetLanguage] || 'en';

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetCode}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
  } catch (err) {
    console.error('Translation fallback failed:', err);
  }

  return text; // graceful fallback to English
}
