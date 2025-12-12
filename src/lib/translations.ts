
export const translations = {
  en: {
    greeting: 'Hello! I am Sehat Sathi. How can I help you today? You can ask me about health issues, book a consultation, or find nearby hospitals.',
    languageSet: 'Language set to English.',
    inputPlaceholder: 'Type your message...',
    online: 'Online',
    appName: 'Sehat Sathi',
    notificationsAriaLabel: 'Notifications',
    menu: {
      english: 'English',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      en: 'English',
      hi: 'हिंदी',
      mr: 'मराठी',
    },
    login: {
        title: 'Login',
        titleLogin: 'Welcome Back',
        titleSignup: 'Create an Account',
        subtitleLogin: 'Sign in to continue to Sehat Sathi.',
        subtitleSignup: 'Join Sehat Sathi to get health guidance.',
        emailLabel: 'Email Address',
        passwordLabel: 'Password',
        passwordPlaceholderSignup: 'At least 6 characters',
        buttonLogin: 'Sign In',
        buttonSignup: 'Sign Up',
        submittingLogin: 'Signing In...',
        submittingSignup: 'Creating Account...',
        googleButton: 'Sign In with Google',
        promptSignup: "Don't have an account?",
        promptLogin: "Already have an account?",
        linkSignup: 'Sign Up',
        linkLogin: 'Sign In',
        googleSignInSuccessTitle: 'Sign-in Successful',
        googleSignInSuccessDescription: 'You have been successfully logged in with Google.',
        googleSignInFailedTitle: 'Google Sign-In Failed',
        googleSignInFailedDescription: 'Could not sign you in with Google. Please try again.',
        signUpSuccessTitle: 'Account Created',
        signUpSuccessDescription: 'Your account has been successfully created. You are now logged in.',
        signUpFailedTitle: 'Sign-Up Failed',
        signUpFailedDescription: 'An unexpected error occurred. Please try again.',
        signUpFailedEmailInUse: 'This email is already in use. Please sign in instead.',
        signInSuccessTitle: 'Sign-In Successful',
        signInSuccessDescription: 'You have been successfully logged in.',
        signInFailedTitle: 'Sign-In Failed',
        signInFailedDescription: 'Invalid email or password. Please check your credentials and try again.',
    },
    logout: {
      title: 'Signed Out',
      description: 'You have been successfully signed out.',
      ariaLabel: 'Sign out',
    },
    emergency: {
      title: 'This could be an emergency!',
      message: 'Please seek immediate medical attention. Go to the nearest hospital or call emergency services.',
      buttonText: 'Emergency',
      formTitle: 'Emergency Ambulance Request',
      formDescription: 'Only use this for genuine medical emergencies. Misuse may lead to penalties.',
      locationLabel: 'Location / Area',
      locationPlaceholder: 'Full address, landmarks, etc.',
      reasonLabel: 'Reason for Emergency',
      reasonPlaceholder: 'e.g., Accident, Chest Pain',
      contactLabel: 'Contact Number',
      contactPlaceholder: 'A 10-digit number to call back',
      submitButton: 'Request Ambulance',
      confirmTitle: 'Confirm Emergency Request?',
      confirmMessage: 'You are about to request an ambulance. Please confirm this is a real emergency. India\'s national emergency number is:',
      emergencyNumberText: 'National Emergency Number',
      confirmSubtext: 'Press "Confirm" to proceed.',
      cancelButton: 'Cancel',
      confirmButton: 'Confirm',
      toastTitle: 'Emergency Request Sent',
      toastDescription: 'Ambulance has been notified of your location. Stay on the line.',
    },
    hospitals: {
      title: 'Here are some nearby hospitals:',
      mapLink: 'View on Map',
    },
    bookingConfirmation: "Your tele-consultation request has been received. You will get an SMS with the doctor's details and appointment time shortly.",
    nav: {
      home: 'Health Guide',
      chatbot: 'Chatbot',
      services: 'Services',
      about: 'About',
      contact: 'Contact',
      map: 'Map',
      profile: 'My Profile',
      insurance: 'Insurance'
    },
    footer: {
      disclaimer: 'Disclaimer: This chatbot provides general health guidance. For emergencies, please visit a certified doctor or hospital.',
      copyright: '© {year} Sehat Sathi. All rights reserved.',
    },
    landing: {
      heroTitle: 'Your Health Assistant, Anytime, Anywhere',
      heroSubtitle: 'Providing rural India with instant, reliable healthcare guidance and access to government initiatives.',
      signIn: 'Sign In with Phone',
      startChatting: 'Use as Guest',
      featuresTitle: 'What We Offer',
      featuresSubtitle: 'Your one-stop solution for accessible rural healthcare.',
      features: [
        {
          title: 'AI Health Chatbot',
          description: 'Get instant answers to your health queries in your local language, 24/7.',
        },
        {
          title: 'Health Information',
          description: 'Access easy-to-understand health tips and government guidelines to stay informed.',
        },
        {
          title: 'Service Locator',
          description: 'Find and book appointments at nearby hospitals and health centers.',
        },
      ],
      ctaTitle: 'Your Journey to Better Health Starts Here',
      ctaSubtitle: 'Explore our comprehensive health guide for tips on staying healthy.',
      ctaButton: 'Explore Health Guide',
    },
    healthGuide: {
      title: 'Your Guide to a Healthy Life',
      subtitle: 'Information and tips from trusted sources to help you and your family stay healthy.',
      precautionsTitle: 'General Health Precautions',
      precautionsSubtitle: 'Follow these simple steps to prevent common illnesses and stay healthy.',
      precautions: [
        {
          title: 'Drink Clean Water',
          description: 'Always drink boiled or filtered water to avoid waterborne diseases like typhoid and cholera.',
          details: [
            {
              title: 'Why is clean water important?',
              content: [
                'Contaminated water contains harmful germs like bacteria, viruses, and parasites.',
                'These germs can cause diseases such as diarrhea, cholera, typhoid, and dysentery, which are major health risks in rural areas.',
                'Clean water is essential for digestion, hydration, and overall body function.'
              ]
            },
            {
              title: 'Simple ways to purify drinking water at home:',
              content: [
                'Boiling: Bring water to a rolling boil for at least 1 minute. This is the most effective method to kill most germs.',
                'Filtering: Use a clean cloth (like a dhoti or sari folded multiple times) to filter out visible impurities before boiling.',
                'Sunlight (SODIS method): Fill clear plastic bottles with water and leave them in direct sunlight for at least 6 hours. The UV rays help kill germs.',
                'Chlorine tablets: Follow the instructions on the package. These are often distributed by health workers.'
              ]
            },
            {
              title: 'Tips for safe water storage:',
              content: [
                'Store purified water in a clean, covered container with a narrow mouth to prevent contamination from hands or utensils.',
                'Use a long-handled ladle to take water out; do not dip your hands or unwashed glasses into the container.',
              ]
            }
          ]
        },
        {
          title: 'Eat Hygienic Food',
          description: 'Consume freshly cooked food. Avoid stale or uncovered food from street vendors.',
          details: [
            {
                title: 'Key Food Safety Practices:',
                content: [
                    'Cook food thoroughly, especially meat, poultry, and eggs, to kill harmful bacteria.',
                    'Always wash fruits and vegetables with clean water before eating or cooking.',
                    'Keep raw and cooked food separate to prevent cross-contamination.',
                    'Reheat cooked food thoroughly until it is steaming hot before eating leftovers.'
                ]
            },
            {
                title: 'Tips for a hygienic kitchen:',
                content: [
                    'Wash your hands with soap and water before, during, and after preparing food.',
                    'Keep your kitchen surfaces, utensils, and cutting boards clean.',
                    'Protect your kitchen and food from insects, pests, and other animals by keeping food covered.',
                ]
            },
            {
                title: 'Caution with Street Food:',
                content: [
                    'If you eat street food, choose vendors that appear clean and cook food fresh in front of you.',
                    'Avoid food that has been sitting out in the open, uncovered, and exposed to flies.',
                ]
            }
          ]
        },
        {
          title: 'Maintain Personal Hygiene',
          description: 'Wash your hands with soap regularly, especially before eating and after using the toilet.',
          details: [
            {
                title: 'The Six Steps of Handwashing:',
                content: [
                    'Wet your hands with clean, running water.',
                    'Apply soap and lather well, covering all surfaces of your hands and wrists.',
                    'Scrub for at least 20 seconds. Remember to clean the back of your hands, between your fingers, and under your nails.',
                    'Rinse your hands thoroughly under clean, running water.',
                    'Dry your hands with a clean cloth or air dry them.',
                    'Handwashing is critical after using the toilet, after coughing or sneezing, before eating, and before and after caring for someone who is sick.'
                ]
            },
            {
                title: 'Other Important Hygiene Habits:',
                content: [
                    'Bathe daily to keep your body clean and free from infections.',
                    'Brush your teeth twice a day to prevent cavities and gum disease.',
                    'Keep your nails trimmed and clean to prevent the spread of germs.',
                    'Always wear clean clothes.'
                ]
            }
          ]
        },
      ],
      healthyHabitsTitle: 'Tips for a Healthy Lifestyle',
      healthyHabitsSubtitle: 'Incorporate these habits into your daily routine for long-term well-being.',
       healthyHabits: [
        {
          title: 'Balanced Diet',
          description: 'Include a mix of fruits, vegetables, grains, and proteins in your daily meals for essential nutrients.',
          details: [
            {
              title: 'What is a Balanced Diet?',
              content: [
                'It means eating a variety of foods from all major food groups in the right proportions.',
                'Carbohydrates (Energy): Roti, rice, bajra, jowar.',
                'Proteins (Body-building): Dal (lentils), beans, chickpeas, eggs, milk, and curd.',
                'Vitamins & Minerals (Protection): All seasonal fruits and vegetables, especially leafy greens like spinach and fenugreek.',
                'Fats (Energy Reserve): Use oil, ghee, and nuts in moderation.'
              ]
            },
            {
              title: 'Practical Tips for a Balanced Diet:',
              content: [
                'Try to have at least three different food groups in each main meal.',
                'Eat seasonal fruits and vegetables as they are fresh, cheap, and nutritious.',
                'Reduce intake of sugar, salt, and processed/fried foods.',
                'Drink plenty of clean water throughout the day to stay hydrated.'
              ]
            }
          ]
        },
        {
          title: 'Regular Exercise',
          description: 'Engage in at least 30 minutes of physical activity like walking, yoga, or cycling every day.',
           details: [
            {
              title: 'Benefits of Regular Physical Activity:',
              content: [
                'Strengthens muscles and bones, reducing the risk of injuries.',
                'Improves heart health and blood circulation.',
                'Helps in maintaining a healthy weight and controlling blood sugar.',
                'Reduces stress and improves mental well-being.'
              ]
            },
            {
              title: 'Simple Activities You Can Do:',
              content: [
                'Brisk Walking: A simple 30-minute walk around your village is a great start.',
                'Yoga and Stretching: Simple asanas can improve flexibility and reduce body aches.',
                'Farming and Household Chores: Daily physical labor is also a good form of exercise.',
                'Cycling: If you have a bicycle, use it for short-distance travel.'
              ]
            }
          ]
        },
        {
          title: 'Adequate Sleep',
          description: 'Ensure you get 7-8 hours of sound sleep every night to keep your body and mind refreshed.',
           details: [
            {
              title: 'Why is Sleep Important?',
              content: [
                'During sleep, your body repairs itself and builds energy for the next day.',
                'Good sleep improves concentration, memory, and decision-making abilities.',
                'Lack of sleep can weaken your immunity, making you more prone to illness.',
              ]
            },
            {
              title: 'Tips for Better Sleep:',
              content: [
                'Try to sleep and wake up at the same time every day to set a routine.',
                'Ensure your sleeping area is dark, quiet, and cool.',
                'Avoid heavy meals, caffeine (tea/coffee), and using mobile phones just before bedtime.',
                'Relaxing activities like listening to soft music or reading can help you fall asleep.',
              ]
            }
          ]
        },
      ],
      govGuidelinesTitle: "Key Government & WHO Health Guidelines",
      govGuidelinesSubtitle: "Important health advisories to protect yourself and your community.",
      govGuidelines: [
        {
            title: 'Control of Communicable Diseases',
            description: 'Isolate individuals with infectious diseases like TB or flu. Follow public health advice during outbreaks.',
            details: [
              {
                title: 'Understanding Communicable Diseases:',
                content: [
                  'These are illnesses that spread from one person to another, such as the common cold, flu, tuberculosis (TB), and COVID-19.',
                  'They can spread through air (coughing, sneezing), direct contact, or contaminated surfaces.',
                ]
              },
              {
                title: 'Key Prevention Measures:',
                content: [
                  'Isolation: If someone is sick, they should stay home and avoid close contact with others to prevent spreading the illness.',
                  'Cover Your Cough/Sneeze: Use a handkerchief or your elbow to cover your mouth and nose.',
                  'Ventilation: Keep windows and doors open to allow fresh air to circulate, reducing the concentration of germs indoors.',
                  'Community Responsibility: Follow all guidelines issued by ASHA workers or local health authorities during disease outbreaks (e.g., during monsoon or flu season).'
                ]
              }
          ]
        },
        {
            title: 'Routine Immunization',
            description: 'Ensure all children and adults get vaccinations as per the National Immunization Schedule.',
             details: [
              {
                title: 'Why Vaccination is a Lifesaver:',
                content: [
                  'Vaccines protect children from serious and life-threatening diseases like polio, measles, tetanus, and diphtheria.',
                  'It is one of the most effective and safest public health interventions.',
                  'Following the immunization schedule is crucial for a child\'s long-term health.',
                ]
              },
              {
                title: 'National Immunization Schedule:',
                content: [
                  'Contact your local Anganwadi or ASHA worker to get the complete and updated immunization chart for your child.',
                  'Vaccines are provided free of cost at government health centers.',
                  'Ensure you keep the immunization card safe and bring it to every health visit.'
                ]
              }
          ]
        },
        {
            title: 'Maternal and Child Health',
            description: 'Pregnant women should have regular check-ups, institutional delivery, and post-natal care.',
             details: [
              {
                title: 'Care During Pregnancy (Antenatal Care):',
                content: [
                  'Register your pregnancy early at the nearest health center.',
                  'Complete at least four antenatal check-ups to monitor your health and the baby\'s growth.',
                  'Take iron and folic acid tablets as advised by the health worker to prevent anemia.',
                  'Eat a nutritious diet and get adequate rest.'
                ]
              },
              {
                title: 'Safe Delivery (Institutional Delivery):',
                content: [
                  'Always plan to deliver your baby at a hospital or primary health center.',
                  'This ensures that a skilled health provider is present to handle any complications, protecting both mother and child.',
                  'Government schemes like Janani Suraksha Yojana (JSY) provide cash assistance for institutional deliveries.'
                ]
              },
              {
                title: 'Care After Delivery (Postnatal Care):',
                content: [
                  'Both mother and newborn should have regular health check-ups after delivery.',
                  'Start breastfeeding within the first hour of birth. Exclusive breastfeeding for the first 6 months is crucial for the baby\'s health.',
                ]
              }
          ]
        },
      ],
      whoLink: 'Visit WHO India Website',
      mohfwLink: "Visit MoHFW Website",
    },
    about: {
      title: 'About Sehat Sathi',
      subtitle: 'Bridging the healthcare gap in rural India with technology.',
      problemTitle: 'The Problem We Address',
      problemShortfall: 'India faces an 80% shortfall of specialists in rural Community Health Centers.',
      problemDescription: 'This critical gap means millions lack access to timely and reliable medical advice, leading to preventable health complications. Distance, cost, and lack of information are major barriers to quality healthcare.',
      solutionTitle: 'Our Solution',
      solutionApp: 'An AI-powered chatbot on a mobile-friendly website.',
      solutionDescription: "Sehat Sathi provides instant, accessible, and easy-to-understand health guidance. By leveraging AI and supporting local languages, we put a virtual health assistant in everyone's pocket, breaking down barriers to information.",
      missionTitle: 'Our Mission',
      missionDescription: 'To empower individuals in rural communities with the knowledge and tools to make informed decisions about their health, ensuring no one is left behind due to a lack of access.',
      visionTitle: 'Our Vision',
      visionDescription: 'A future where every person in rural India has immediate access to primary healthcare guidance, leading to healthier communities and a stronger nation.',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Find answers to common questions about Sehat Sathi.',
      faqs: [
        {
          question: 'Is Sehat Sathi free to use?',
          answer: 'Yes, all the features of Sehat Sathi, including the AI chatbot and tele-consultation booking, are completely free of charge.'
        },
        {
          question: 'Can I use this service for emergencies?',
          answer: 'No. Sehat Sathi is for general health guidance only. In case of a medical emergency, please contact your nearest hospital or a certified doctor immediately.'
        },
        {
          question: 'In which languages is the chatbot available?',
          answer: 'Currently, the chatbot is available in English, Hindi, and Marathi. We are working on adding more regional languages soon.'
        },
        {
          question: 'Is my personal information safe?',
          answer: 'We prioritize your privacy. Your conversations with the chatbot are anonymous. For tele-consultation, we only collect the necessary information to connect you with a doctor, and this data is handled securely.'
        },
        {
          question: 'What kind of health information does Sehat Sathi provide?',
          answer: 'We provide general information on common health conditions, first-aid, preventive care, healthy lifestyle tips, and details about government health schemes. This is not a substitute for a professional medical diagnosis.'
        },
        {
          question: 'How do I find a nearby hospital?',
          answer: 'You can use the "Hospital Locator" feature in our app or simply ask the chatbot to "find nearby hospitals." It will provide a list of facilities in your area.'
        }
      ]
    },
    contact: {
      title: 'Get In Touch',
      subtitle: "Have questions or feedback? We'd love to hear from you.",
      formTitle: 'Report a Problem or Send Feedback',
      formNameLabel: 'Full Name',
      formNamePlaceholder: 'Your Name',
      formEmailLabel: 'Email Address',
      formEmailPlaceholder: 'your.email@example.com',
      formMessageLabel: 'Your Message',
      formMessagePlaceholder: 'Please describe the problem you are facing or share your feedback...',
      sendButton: 'Send Message',
      contactInfoTitle: 'Contact Information',
      contactInfoDescription: 'For direct support, you can reach out to us via email. Please note, for medical emergencies, contact a hospital directly.',
      supportEmail: 'Support Email',
      emergencyHelpline: 'National Emergency Helpline',
      emergencyNumber: '112',
      successToastTitle: 'Message Prepared!',
      successToastDescription: 'Your email client has been opened. Please press send to submit your feedback.',
    },
    services: {
      title: 'Our Services',
      subtitle: 'Accessible healthcare solutions designed for you.',
      initiativesTitle: 'Government Health Initiatives',
      initiativesSubtitle: 'Learn about key programs aimed at improving public health across the nation.',
      initiatives: [
        {
          title: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
          description: "Provides a health cover of Rs. 5 lakhs per family per year for secondary and tertiary care hospitalization to over 10.74 crore poor and vulnerable families.",
          criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
          url: "https://pmjay.gov.in/"
        },
        {
          title: "National Health Mission (NHM)",
          description: "Envisages achievement of universal access to equitable, affordable & quality health care services that are accountable and responsive to people's needs.",
          criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
          url: "https://nhm.gov.in/"
        },
        {
          title: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
          description: "A maternity benefit programme providing partial wage compensation to women for wage-loss during childbirth and childcare.",
          criteria: { minAge: 18, maxAge: 45, applicableGender: 'female' },
          url: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana"
        },
         {
          title: 'Janani Shishu Suraksha Karyakram (JSSK)',
          description: 'Entitles all pregnant women delivering in public health institutions to absolutely free and no expense delivery, including caesarean section.',
          criteria: { minAge: 18, maxAge: 45, applicableGender: 'female' },
          url: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=825&lid=221"
        },
        {
          title: 'Rashtriya Bal Swasthya Karyakram (RBSK)',
          description: 'An initiative for early identification and early intervention for children from birth to 18 years to cover 4 ‘D’s viz. Defects at birth, Deficiencies, Diseases, Development delays including disability.',
          criteria: { minAge: 0, maxAge: 18, applicableGender: 'all' },
          url: "https://rbsk.nhm.gov.in/"
        },
        {
          title: 'National Tobacco Control Programme (NTCP)',
          description: 'Aims to control tobacco consumption and minimize deaths caused by it. It focuses on creating awareness about the harmful effects of tobacco.',
          criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
          url: "https://ntcp.mohfw.gov.in/"
        },
      ],
      aiTitle: 'AI-Powered Health Guidance',
      aiDescription: "Have a health question? Get instant, reliable advice from our AI assistant. It's like having a health expert in your pocket, available 24/7.",
      aiHelpTitle: 'Our chatbot can help with:',
      aiHelpItems: [
        'Understanding symptoms',
        'First-aid for minor injuries',
        'Information about common illnesses'
      ],
      aiButton: 'Ask Our Chatbot',
      bookingTitle: 'Book an Appointment',
      bookingDescription: 'Connect with a certified doctor from the comfort of your home or plan a hospital visit. Fill out the form below to request an appointment.',
      formNameLabel: 'Full Name',
      formNamePlaceholder: 'e.g. Ramesh Kumar',
      formPhoneLabel: 'Phone Number',
      formPhonePlaceholder: '10-digit mobile number',
      formIssueLabel: 'Health Issue',
      formIssuePlaceholder: 'Briefly describe your health concern...',
      formHospitalLabel: 'Selected Hospital',
      formHospitalPlaceholder: 'Select a hospital from the map',
      bookingButton: 'Request Appointment',
      bookingToastTitle: 'Appointment Request Confirmed!',
      bookingToastDescription: "We've received your request. You'll get an SMS shortly.",
      locatorTitle: 'Hospital & Clinic Locator',
      locatorDescription: 'Find government and private healthcare facilities near you in Maharashtra.',
      hospitals: [
        {
          name: 'District General Hospital, Pune',
          address: 'Near Pune Railway Station, Pune, Maharashtra',
          lat: 18.5204,
          lng: 73.8567,
          contact: '020-26123456',
          specialties: 'General Medicine, Surgery, Pediatrics',
          timing: '24/7 Emergency, OPD: 9am - 5pm'
        },
        {
          name: 'Rural Hospital, Manchar',
          address: 'Manchar, Ambegaon Taluka, Pune District, Maharashtra',
          lat: 19.0066,
          lng: 73.9338,
          contact: '02133-223344',
          specialties: 'General Medicine, Maternity',
          timing: '24/7 Emergency, OPD: 9am - 1pm'
        },
        {
          name: 'Primary Health Centre, Khed',
          address: 'Khed, Pune District, Maharashtra',
          lat: 18.8473,
          lng: 73.8760,
          contact: '02135-222233',
          specialties: 'Primary Care, Vaccinations',
          timing: 'OPD: 9am - 5pm'
        },
        {
            name: 'Sub District Hospital, Baramati',
            address: 'Baramati, Pune District, Maharashtra',
            lat: 18.1581,
            lng: 74.5746,
            contact: '02112-224567',
            specialties: 'Orthopedics, General Medicine',
            timing: '24/7 Emergency, OPD: 10am - 4pm'
        },
        {
          name: 'Aundh District Hospital',
          address: 'Aundh, Pune, Maharashtra',
          lat: 18.5619,
          lng: 73.8081,
          contact: '020-25698745',
          specialties: 'Dermatology, ENT',
          timing: 'OPD: 9am - 4pm'
        },
        {
          name: 'Sassoon General Hospital',
          address: 'Station Road, Pune, Maharashtra',
          lat: 18.5232,
          lng: 73.8695,
          contact: '020-26128000',
          specialties: 'Cardiology, Neurology, Oncology',
          timing: '24/7 Emergency and Services'
        }
      ],
      mapButton: 'Book Appointment',
      mapSpecialties: 'Specialties',
      mapTimings: 'Timings',
      mapContact: 'Contact',
      myServicesTitle: 'Find Services for You',
      myServicesDescription: 'Answer a few questions to find out which government health schemes you might be eligible for.',
      myServicesButton: 'Find My Services',
      myServicesFormTitle: 'Tell us about yourself',
      myServicesFormAge: 'Your Age',
      myServicesFormGender: 'Your Gender',
      myServicesFormGenderMale: 'Male',
      myServicesFormGenderFemale: 'Female',
      myServicesFormGenderOther: 'Other',
      myServicesFormState: 'Your State',
      myServicesFormDistrict: 'Your District',
      myServicesFormSubmit: 'Show My Services',
      myServicesResultsTitle: 'Services based on your profile',
      myServicesResetButton: 'Show All Services',
      myServicesNoResults: 'No specific services found based on your profile. Showing all available schemes.',
      formAppointmentTypeLabel: 'Appointment Type',
      formAppointmentTypeHospital: 'Visit Hospital',
      formAppointmentTypeVideo: 'Online Video Call',
      formCallNowLabel: 'Call Now (Urgent)',
      formCallNowDescription: 'Connect immediately. Extra charges apply.',
      formDateLabel: 'Preferred Date',
      formDatePlaceholder: 'Pick a date',
      formTimeLabel: 'Preferred Time',
      formTimePlaceholder: 'Select a time slot',
    },
    profile: {
      title: 'My Profile',
      subtitle: 'Manage your health information, documents, and family details here.',
      documentsTitle: 'My Documents',
      familyHealthDetails: 'Family & Health Details',
      addMemberButton: 'Add Member',
      noProfiles: "You haven't added any profiles yet.",
      uploadDocumentButton: 'Upload Document',
      noDocuments: 'No documents uploaded yet.',
      notProvided: 'Not provided',
      bloodGroup: 'Blood Group',
      allergies: 'Allergies',
      chronicDiseases: 'Chronic Diseases',
      deleteMemberConfirmationTitle: 'Are you sure?',
      deleteMemberConfirmationDescription: 'This will permanently delete {name}\'s profile. This action cannot be undone.',
      cancelButton: 'Cancel',
      deleteButton: 'Delete',
      editYourProfile: 'Edit Your Profile',
      editMemberProfile: "Edit {name}'s Profile",
      addMemberTitle: 'Add a Family Member',
      uploadDocumentTitle: 'Upload a New Document',
      uploadingButton: 'Uploading...',
      uploadButton: 'Upload',
      saveButton: 'Save Changes',
      form: {
          fullName: 'Full Name',
          relationship: 'Relationship',
          relationshipPlaceholder: 'e.g., Spouse, Son, Mother',
          shortBio: 'Short Bio',
          shortBioPlaceholder: 'A little about them',
          bloodGroup: 'Blood Group',
          bloodGroupPlaceholder: 'e.g., A+, O-',
          allergies: 'Allergies',
          allergiesPlaceholder: 'e.g., Peanuts, Pollen',
          chronicDiseases: 'Chronic Diseases',
          chronicDiseasesPlaceholder: 'e.g., Diabetes, Hypertension',
          docTitle: 'Document Title',
          docTitlePlaceholder: 'e.g., Blood Test Report',
          file: 'File',
      },
      accessDeniedTitle: 'Access Denied',
      accessDeniedDescription: 'You must be logged in to view your profile.',
      loginButton: 'Login',
      fetchProfileError: 'Error',
      fetchProfileErrorDescription: 'Could not fetch your profile data.',
      fetchFamilyError: 'Error',
      fetchFamilyErrorDescription: 'Could not fetch family member data.',
      fetchDocumentsError: 'Error',
      fetchDocumentsErrorDescription: 'Could not fetch documents.',
      updateProfileSuccess: 'Profile Updated',
      updateProfileSuccessDescription: "{name}'s details have been saved.",
      addMemberSuccess: 'Member Added',
      addMemberSuccessDescription: "{name} has been added to your family.",
      saveProfileError: 'Save Failed',
      saveProfileErrorDescription: 'Could not save the profile.',
      uploadSuccess: 'Upload Successful',
      uploadSuccessDescription: '{title} has been uploaded.',
      uploadError: 'Upload Failed',
      uploadErrorDescription: 'Could not upload the document.',
      deleteMemberSuccess: 'Member Deleted',
      deleteMemberSuccessDescription: '{name} has been removed.',
      deleteMemberError: 'Delete Failed',
      deleteMemberErrorDescription: 'Could not delete member.',
      deleteDocumentSuccess: 'Document Deleted',
      deleteDocumentSuccessDescription: '{title} has been removed.',
      deleteDocumentError: 'Delete Failed',
      deleteDocumentErrorDescription: 'Could not delete document.',
      deleteDocumentConfirmationTitle: 'Are you sure?',
      deleteDocumentConfirmationDescription: 'This will permanently delete the document "{title}".'
    },
    insurance: {
      title: 'Insurance & Jivan Bima',
      subtitle: 'Upload and manage your insurance documents here.',
      description: 'You can upload and view your insurance documents here. This data is stored securely and is only visible to you.',
      uploadDocument: 'Upload Document',
      viewDocuments: 'My Documents',
      formTitle: 'Upload a New Insurance Document',
      uploadSuccessToastTitle: 'Document Uploaded',
      uploadSuccessToastDescription: '{title} has been successfully uploaded.',
      noDocuments: 'You haven\'t uploaded any insurance documents yet.',
      uploadButton: 'Upload',
      uploadingButton: 'Uploading...',
      cancelButton: 'Cancel',
      deleteButton: 'Delete',
      accessDeniedTitle: 'Access Denied',
      accessDeniedDescription: 'You must be logged in to manage your insurance documents.',
      loginButton: 'Login',
      fetchError: 'Error',
      fetchErrorDescription: 'Could not fetch insurance documents.',
      uploadFailedTitle: 'Upload Failed',
      uploadFailedDescription: 'Could not upload the document.',
      deleteSuccessTitle: 'Document Deleted',
      deleteSuccessDescription: '{title} has been removed.',
      deleteFailedTitle: 'Delete Failed',
      deleteFailedDescription: 'Could not delete document.',
      deleteConfirmationTitle: 'Are you sure?',
      deleteConfirmationDescription: 'This will permanently delete the document "{title}".',
      form: {
        docTitle: 'Document Title',
        docTitlePlaceholder: 'e.g. My Health Insurance Policy',
        file: 'File',
      }
    },
    videoCall: {
        permissionDeniedTitle: 'Camera & Mic Access Denied',
        permissionDeniedDescription: 'Please enable camera and microphone permissions in your browser settings to use video call.',
        callEndedTitle: 'Call Ended',
        callEndedDescription: 'Your consultation has ended.',
        doctorName: 'Dr. Sharma (Cardiologist)',
        cameraRequiredTitle: 'Camera Access Required',
        cameraRequiredDescription: 'Please allow camera and microphone access in your browser to use this feature. You may need to refresh the page after granting permissions.',
    }
  },
  hi: {
    greeting: 'नमस्ते! मैं सेहत साथी हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे स्वास्थ्य संबंधी मुद्दों के बारे में पूछ सकते हैं, परामर्श बुक कर सकते हैं, या आस-पास के अस्पताल ढूंढ सकते हैं।',
    languageSet: 'भाषा हिंदी में बदल दी गई है।',
    inputPlaceholder: 'अपना संदेश लिखें...',
    online: 'ऑनलाइन',
    appName: 'सेहत साथी',
    notificationsAriaLabel: 'सूचनाएं',
    menu: {
      english: 'English',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      en: 'English',
      hi: 'हिंदी',
      mr: 'मराठी',
    },
    login: {
        title: 'लॉग इन करें',
        titleLogin: 'वापसी पर स्वागत है',
        titleSignup: 'खाता बनाएं',
        subtitleLogin: 'सेहत साथी में जारी रखने के लिए साइन इन करें।',
        subtitleSignup: 'स्वास्थ्य मार्गदर्शन प्राप्त करने के लिए सेहत साथी से जुड़ें।',
        emailLabel: 'ईमेल पता',
        passwordLabel: 'पासवर्ड',
        passwordPlaceholderSignup: 'कम से कम 6 अक्षर',
        buttonLogin: 'साइन इन करें',
        buttonSignup: 'साइन अप करें',
        submittingLogin: 'साइन इन हो रहा है...',
        submittingSignup: 'खाता बनाया जा रहा है...',
        googleButton: 'Google से साइन इन करें',
        promptSignup: "खाता नहीं है?",
        promptLogin: "पहले से ही खाता है?",
        linkSignup: 'साइन अप करें',
        linkLogin: 'साइन इन करें',
        googleSignInSuccessTitle: 'साइन-इन सफल',
        googleSignInSuccessDescription: 'आपने Google से सफलतापूर्वक लॉग इन कर लिया है।',
        googleSignInFailedTitle: 'Google साइन-इन विफल',
        googleSignInFailedDescription: 'Google से आपको साइन इन नहीं किया जा सका। कृपया पुनः प्रयास करें।',
        signUpSuccessTitle: 'खाता बन गया',
        signUpSuccessDescription: 'आपका खाता सफलतापूर्वक बन गया है। अब आप लॉग इन हैं।',
        signUpFailedTitle: 'साइन-अप विफल',
        signUpFailedDescription: 'एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।',
        signUpFailedEmailInUse: 'यह ईमेल पहले से उपयोग में है। कृपया इसके बजाय साइन इन करें।',
        signInSuccessTitle: 'साइन-इन सफल',
        signInSuccessDescription: 'आप सफलतापूर्वक लॉग इन हो गए हैं।',
        signInFailedTitle: 'साइन-इन विफल',
        signInFailedDescription: 'अमान्य ईमेल या पासवर्ड। कृपया अपनी साख जांचें और पुनः प्रयास करें।',
    },
    logout: {
      title: 'साइन आउट किया गया',
      description: 'आप सफलतापूर्वक साइन आउट हो गए हैं।',
      ariaLabel: 'साइन आउट',
    },
    emergency: {
      title: 'यह एक आपात स्थिति हो सकती है!',
      message: 'कृपया तत्काल चिकित्सा सहायता लें। नजदीकी अस्पताल जाएं या आपातकालीन सेवाओं को कॉल करें।',
      buttonText: 'आपातकालीन',
      formTitle: 'आपातकालीन एम्बुलेंस अनुरोध',
      formDescription: 'इसका उपयोग केवल वास्तविक चिकित्सा आपात स्थिति के लिए करें। दुरुपयोग करने पर दंड हो सकता है।',
      locationLabel: 'स्थान / क्षेत्र',
      locationPlaceholder: 'पूरा पता, स्थलचिह्न, आदि।',
      reasonLabel: 'आपातकाल का कारण',
      reasonPlaceholder: 'उदा., दुर्घटना, सीने में दर्द',
      contactLabel: 'संपर्क नंबर',
      contactPlaceholder: 'वापस कॉल करने के लिए 10 अंकों का नंबर',
      submitButton: 'एम्बुलेंस का अनुरोध करें',
      confirmTitle: 'आपातकालीन अनुरोध की पुष्टि करें?',
      confirmMessage: 'आप एम्बुलेंस का अनुरोध करने वाले हैं। कृपया पुष्टि करें कि यह एक वास्तविक आपात स्थिति है। भारत का राष्ट्रीय आपातकालीन नंबर है:',
      emergencyNumberText: 'राष्ट्रीय आपातकालीन नंबर',
      confirmSubtext: 'आगे बढ़ने के लिए "पुष्टि करें" दबाएं।',
      cancelButton: 'रद्द करें',
      confirmButton: 'पुष्टि करें',
      toastTitle: 'आपातकालीन अनुरोध भेजा गया',
      toastDescription: 'एम्बुलेंस को आपके स्थान की सूचना दे दी गई है। लाइन पर बने रहें।',
    },
    hospitals: {
      title: 'यहाँ आस-पास के कुछ अस्पताल हैं:',
      mapLink: 'नक्शे पर देखें',
    },
    bookingConfirmation: 'आपका टेली-परामर्श अनुरोध प्राप्त हो गया है। आपको शीघ्र ही डॉक्टर के विवरण और अपॉइंटMENT के समय के साथ एक एसएमएस मिलेगा।',
    nav: {
      home: 'स्वास्थ्य गाइड',
      chatbot: 'चैटबॉट',
      services: 'सेवाएं',
      about: 'हमारे बारे में',
      contact: 'संपर्क',
      map: 'नक्शा',
      profile: 'मेरी प्रोफाइल',
      insurance: 'बीमा'
    },
    footer: {
      disclaimer: 'अस्वीकरण: यह चैटबॉट सामान्य स्वास्थ्य मार्गदर्शन प्रदान करता है। आपात स्थिति के लिए, कृपया किसी प्रमाणित डॉक्टर या अस्पताल में जाएँ।',
      copyright: '© {year} सेहत साथी। सर्वाधिकार सुरक्षित।',
    },
    landing: {
      heroTitle: 'आपका स्वास्थ्य सहायक, कभी भी, कहीं भी',
      heroSubtitle: 'ग्रामीण भारत को तत्काल, विश्वसनीय स्वास्थ्य मार्गदर्शन और सरकारी पहलों तक पहुंच प्रदान करना।',
      signIn: 'फोन से साइन इन करें',
      startChatting: 'अतिथि के रूप में उपयोग करें',
      featuresTitle: 'हम क्या प्रदान करते हैं',
      featuresSubtitle: 'सुलभ ग्रामीण स्वास्थ्य सेवा के लिए आपका वन-स्टॉप समाधान।',
      features: [
        {
          title: 'एआई स्वास्थ्य चैटबॉट',
          description: 'अपनी स्थानीय भाषा में अपने स्वास्थ्य प्रश्नों के त्वरित उत्तर प्राप्त करें, 24/7।',
        },
        {
          title: 'स्वास्थ्य जानकारी',
          description: 'सूचित रहने के लिए आसानी से समझ में आने वाले स्वास्थ्य सुझाव और सरकारी दिशानिर्देश प्राप्त करें।',
        },
        {
          title: 'सेवा लोकेटर',
          description: 'आस-पास के अस्पतालों और स्वास्थ्य केंद्रों पर अपॉइंटमेंट खोजें और बुक करें।',
        },
      ],
      ctaTitle: 'बेहतर स्वास्थ्य की आपकी यात्रा यहाँ से शुरू होती है',
      ctaSubtitle: 'स्वस्थ रहने के सुझावों के लिए हमारे व्यापक स्वास्थ्य गाइड का अन्वेषण करें।',
      ctaButton: 'स्वास्थ्य गाइड देखें',
    },
    healthGuide: {
        title: 'स्वस्थ जीवन के लिए आपका गाइड',
        subtitle: 'आपको और आपके परिवार को स्वस्थ रहने में मदद करने के लिए विश्वसनीय स्रोतों से जानकारी और सुझाव।',
        precautionsTitle: 'सामान्य स्वास्थ्य सावधानियां',
        precautionsSubtitle: 'आम बीमारियों से बचने और स्वस्थ रहने के लिए इन सरल उपायों का पालन करें।',
        precautions: [
            {
              title: 'स्वच्छ पानी पिएं',
              description: 'टाइफाइड और हैजा जैसी जलजनित बीमारियों से बचने के लिए हमेशा उबला हुआ या फिल्टर किया हुआ पानी पिएं।',
              details: [
                {
                  title: 'स्वच्छ पानी क्यों महत्वपूर्ण है?',
                  content: [
                    'दूषित पानी में बैक्टीरिया, वायरस और परजीवी जैसे हानिकारक रोगाणु होते हैं।',
                    'ये रोगाणु दस्त, हैजा, टाइफाइड और पेचिश जैसी बीमारियाँ पैदा कर सकते हैं, जो ग्रामीण क्षेत्रों में प्रमुख स्वास्थ्य जोखिम हैं।',
                    'स्वच्छ पानी पाचन, जलयोजन और शरीर के समग्र कामकाज के लिए आवश्यक है।'
                  ]
                },
                {
                  title: 'घर पर पीने के पानी को शुद्ध करने के सरल तरीके:',
                  content: [
                    'उबालना: पानी को कम से कम 1 मिनट तक उबलने दें। यह अधिकांश कीटाणुओं को मारने का सबसे प्रभावी तरीका है।',
                    'छानना: उबालने से पहले दिखाई देने वाली अशुद्धियों को छानने के लिए एक साफ कपड़े (जैसे धोती या साड़ी को कई बार मोड़कर) का उपयोग करें।',
                    'धूप (SODIS विधि): साफ प्लास्टिक की बोतलों में पानी भरकर कम से कम 6 घंटे के लिए सीधी धूप में रखें। यूवी किरणें कीटाणुओं को मारने में मदद करती हैं।',
                    'क्लोरीन टैबलेट: पैकेज पर दिए गए निर्देशों का पालन करें। ये अक्सर स्वास्थ्य कार्यकर्ताओं द्वारा वितरित किए जाते हैं।'
                  ]
                },
                {
                  title: 'सुरक्षित जल भंडारण के लिए सुझाव:',
                  content: [
                    'शुद्ध पानी को एक साफ, ढके हुए कंटेनर में रखें जिसका मुंह संकरा हो ताकि हाथों या बर्तनों से संदूषण को रोका जा सके।',
                    'पानी निकालने के लिए एक लंबे हैंडल वाले करछुल का उपयोग करें; कंटेनर में अपने हाथ या बिना धोए गिलास न डुबोएं।',
                  ]
                }
              ]
            },
            {
              title: 'स्वच्छ भोजन करें',
              description: 'हमेशा ताजा पका हुआ भोजन करें। सड़क विक्रेताओं से बासी या खुला भोजन करने से बचें।',
              details: [
                {
                    title: 'मुख्य खाद्य सुरक्षा प्रथाएं:',
                    content: [
                        'हानिकारक बैक्टीरिया को मारने के लिए भोजन, विशेष रूप से मांस, मुर्गी और अंडे को अच्छी तरह से पकाएं।',
                        'खाने या पकाने से पहले फलों और सब्जियों को हमेशा साफ पानी से धोएं।',
                        'क्रॉस-संदूषण को रोकने के लिए कच्चे और पके हुए भोजन को अलग रखें।',
                        'बचे हुए भोजन को खाने से पहले अच्छी तरह से गर्म करें जब तक कि वह भाप न बन जाए।'
                    ]
                },
                {
                    title: 'एक स्वच्छ रसोई के लिए सुझाव:',
                    content: [
                        'भोजन तैयार करने से पहले, दौरान और बाद में अपने हाथों को साबुन और पानी से धोएं।',
                        'अपनी रसोई की सतहों, बर्तनों और कटिंग बोर्ड को साफ रखें।',
                        'भोजन को ढककर अपनी रसोई और भोजन को कीड़ों, कीटों और अन्य जानवरों से बचाएं।',
                    ]
                },
                {
                    title: 'स्ट्रीट फूड से सावधानी:',
                    content: [
                        'यदि आप स्ट्रीट फूड खाते हैं, तो ऐसे विक्रेताओं को चुनें जो साफ-सुथरे दिखें और आपके सामने ताजा भोजन पकाएं।',
                        'ऐसे भोजन से बचें जो खुले में, बिना ढके और मक्खियों के संपर्क में हो।',
                    ]
                }
              ]
            },
            {
              title: 'व्यक्तिगत स्वच्छता बनाए रखें',
              description: 'नियमित रूप से साबुन से हाथ धोएं, खासकर खाने से पहले और शौचालय का उपयोग करने के बाद।',
              details: [
                {
                    title: 'हाथ धोने के छह चरण:',
                    content: [
                        'अपने हाथों को साफ, बहते पानी से गीला करें।',
                        'साबुन लगाएं और अच्छी तरह से झाग बनाएं, अपने हाथों और कलाई की सभी सतहों को कवर करें।',
                        'कम से कम 20 सेकंड के लिए रगड़ें। अपने हाथों के पिछले हिस्से, अपनी उंगलियों के बीच और अपने नाखूनों के नीचे साफ करना याद रखें।',
                        'अपने हाथों को साफ, बहते पानी के नीचे अच्छी तरह से धो लें।',
                        'अपने हाथों को एक साफ कपड़े से सुखाएं या हवा में सुखाएं।',
                        'शौचालय का उपयोग करने के बाद, खांसने या छींकने के बाद, खाने से पहले, और किसी बीमार व्यक्ति की देखभाल करने से पहले और बाद में हाथ धोना महत्वपूर्ण है।'
                    ]
                },
                {
                    title: 'अन्य महत्वपूर्ण स्वच्छता की आदतें:',
                    content: [
                        'अपने शरीर को साफ और संक्रमण से मुक्त रखने के लिए रोजाना स्नान करें।',
                        'गुहाओं और मसूड़ों की बीमारी को रोकने के लिए दिन में दो बार अपने दाँत ब्रश करें।',
                        'कीटाणुओं के प्रसार को रोकने के लिए अपने नाखूनों को छोटा और साफ रखें।',
                        'हमेशा साफ कपड़े पहनें।'
                    ]
                }
              ]
            },
        ],
        healthyHabitsTitle: 'स्वस्थ जीवन शैली के लिए सुझाव',
        healthyHabitsSubtitle: 'दीर्घकालिक स्वास्थ्य के लिए इन आदतों को अपनी दिनचर्या में शामिल करें।',
        healthyHabits: [
            {
              title: 'संतुलित आहार',
              description: 'आवश्यक पोषक तत्वों के लिए अपने दैनिक भोजन में फल, सब्जियां, अनाज और प्रोटीन का मिश्रण शामिल करें।',
              details: [
                {
                  title: 'संतुलित आहार क्या है?',
                  content: [
                    'इसका मतलब है कि सभी प्रमुख खाद्य समूहों से विभिन्न प्रकार के खाद्य पदार्थों को सही अनुपात में खाना।',
                    'कार्बोहाइड्रेट (ऊर्जा): रोटी, चावल, बाजरा, ज्वार।',
                    'प्रोटीन (शरीर निर्माण): दाल, बीन्स, छोले, अंडे, दूध और दही।',
                    'विटामिन और खनिज (संरक्षण): सभी मौसमी फल और सब्जियां, विशेष रूप से पालक और मेथी जैसी पत्तेदार सब्जियां।',
                    'वसा (ऊर्जा आरक्षित): तेल, घी और नट्स का संयम से उपयोग करें।'
                  ]
                },
                {
                  title: 'संतुलित आहार के लिए व्यावहारिक सुझाव:',
                  content: [
                    'प्रत्येक मुख्य भोजन में कम से कम तीन अलग-अलग खाद्य समूहों को शामिल करने का प्रयास करें।',
                    'मौसमी फल और सब्जियां खाएं क्योंकि वे ताजे, सस्ते और पौष्टिक होते हैं।',
                    'चीनी, नमक और प्रसंस्कृत/तले हुए खाद्य पदार्थों का सेवन कम करें।',
                    'हाइड्रेटेड रहने के लिए दिन भर में खूब सारा साफ पानी पिएं।'
                  ]
                }
              ]
            },
            {
              title: 'नियमित व्यायाम',
              description: 'हर दिन कम से कम 30 मिनट की शारीरिक गतिविधि जैसे चलना, योग या साइकिल चलाना शामिल करें।',
               details: [
                {
                  title: 'नियमित शारीरिक गतिविधि के लाभ:',
                  content: [
                    'मांसपेशियों और हड्डियों को मजबूत करता है, चोटों के जोखिम को कम करता है।',
                    'हृदय स्वास्थ्य और रक्त परिसंचरण में सुधार करता है।',
                    'स्वस्थ वजन बनाए रखने और रक्त शर्करा को नियंत्रित करने में मदद करता है।',
                    'तनाव कम करता है और मानसिक स्वास्थ्य में सुधार करता है।'
                  ]
                },
                {
                  title: 'सरल गतिविधियाँ जो आप कर सकते हैं:',
                  content: [
                    'तेज चलना: अपने गांव के चारों ओर 30 मिनट की एक साधारण सैर एक बेहतरीन शुरुआत है।',
                    'योग और स्ट्रेचिंग: सरल आसन लचीलेपन में सुधार कर सकते हैं और शरीर के दर्द को कम कर सकते हैं।',
                    'खेती और घरेलू काम: दैनिक शारीरिक श्रम भी व्यायाम का एक अच्छा रूप है।',
                    'साइकिल चलाना: यदि आपके पास साइकिल है, तो इसका उपयोग कम दूरी की यात्रा के लिए करें।'
                  ]
                }
              ]
            },
            {
              title: 'पर्याप्त नींद',
              description: 'अपने शरीर और दिमाग को तरोताजा रखने के लिए हर रात 7-8 घंटे की अच्छी नींद सुनिश्चित करें।',
               details: [
                {
                  title: 'नींद क्यों महत्वपूर्ण है?',
                  content: [
                    'नींद के दौरान, आपका शरीर खुद की मरम्मत करता है और अगले दिन के लिए ऊर्जा बनाता है।',
                    'अच्छी नींद एकाग्रता, स्मृति और निर्णय लेने की क्षमताओं में सुधार करती है।',
                    'नींद की कमी आपकी प्रतिरक्षा को कमजोर कर सकती है, जिससे आप बीमारी के प्रति अधिक संवेदनशील हो जाते हैं।',
                  ]
                },
                {
                  title: 'बेहतर नींद के लिए सुझाव:',
                  content: [
                    'एक दिनचर्या निर्धारित करने के लिए हर दिन एक ही समय पर सोने और जागने की कोशिश करें।',
                    'सुनिश्चित करें कि आपका सोने का क्षेत्र अंधेरा, शांत और ठंडा हो।',
                    'सोने से ठीक पहले भारी भोजन, कैफीन (चाय/कॉफी) और मोबाइल फोन का उपयोग करने से बचें।',
                    'नरम संगीत सुनने या पढ़ने जैसी आराम की गतिविधियाँ आपको सो जाने में मदद कर सकती हैं।',
                  ]
                }
              ]
            },
        ],
        govGuidelinesTitle: "प्रमुख सरकारी और डब्ल्यूएचओ स्वास्थ्य दिशानिर्देश",
        govGuidelinesSubtitle: "स्वयं और अपने समुदाय की सुरक्षा के लिए महत्वपूर्ण स्वास्थ्य सलाह।",
        govGuidelines: [
            {
                title: 'संचारी रोगों का नियंत्रण',
                description: 'टीबी या फ्लू जैसे संक्रामक रोगों वाले व्यक्तियों को अलग करें। प्रकोप के दौरान सार्वजनिक स्वास्थ्य सलाह का पालन करें।',
                details: [
                  {
                    title: 'संचारी रोगों को समझना:',
                    content: [
                      'ये ऐसी बीमारियाँ हैं जो एक व्यक्ति से दूसरे व्यक्ति में फैलती हैं, जैसे कि सामान्य सर्दी, फ्लू, तपेदिक (टीबी), और COVID-19।',
                      'वे हवा (खांसने, छींकने), सीधे संपर्क, या दूषित सतहों के माध्यम से फैल सकते हैं।',
                    ]
                  },
                  {
                    title: 'मुख्य निवारक उपाय:',
                    content: [
                      'अलगाव: यदि कोई बीमार है, तो उसे घर पर रहना चाहिए और बीमारी को फैलने से रोकने के लिए दूसरों के साथ निकट संपर्क से बचना चाहिए।',
                      'अपनी खांसी/छींक को ढकें: अपने मुंह और नाक को ढकने के लिए रूमाल या अपनी कोहनी का उपयोग करें।',
                      'वेंटिलेशन: ताजी हवा को प्रसारित करने के लिए खिड़कियां और दरवाजे खुले रखें, जिससे घर के अंदर कीटाणुओं की सांद्रता कम हो।',
                      'सामुदायिक जिम्मेदारी: रोग के प्रकोप (जैसे, मानसून या फ्लू के मौसम के दौरान) के दौरान आशा कार्यकर्ताओं या स्थानीय स्वास्थ्य अधिकारियों द्वारा जारी किए गए सभी दिशानिर्देशों का पालन करें।'
                    ]
                  }
              ]
            },
            {
                title: 'नियमित टीकाकरण',
                description: 'सुनिश्चित करें कि सभी बच्चों और वयस्कों को राष्ट्रीय टीकाकरण सारणी के अनुसार टीके लगें।',
                 details: [
                  {
                    title: 'टीकाकरण एक जीवन रक्षक क्यों है:',
                    content: [
                      'टीके बच्चों को पोलियो, खसरा, टेटनस और डिप्थीरिया जैसी गंभीर और जानलेवा बीमारियों से बचाते हैं।',
                      'यह सबसे प्रभावी और सबसे सुरक्षित सार्वजनिक स्वास्थ्य हस्तक्षेपों में से एक है।',
                      'एक बच्चे के दीर्घकालिक स्वास्थ्य के लिए टीकाकरण अनुसूची का पालन करना महत्वपूर्ण है।',
                    ]
                  },
                  {
                    title: 'राष्ट्रीय टीकाकरण अनुसूची:',
                    content: [
                      'अपने बच्चे के लिए पूर्ण और अद्यतन टीकाकरण चार्ट प्राप्त करने के लिए अपने स्थानीय आंगनवाड़ी या आशा कार्यकर्ता से संपर्क करें।',
                      'सरकारी स्वास्थ्य केंद्रों पर टीके मुफ्त प्रदान किए जाते हैं।',
                      'सुनिश्चित करें कि आप टीकाकरण कार्ड को सुरक्षित रखें और इसे हर स्वास्थ्य यात्रा पर लाएं।'
                    ]
                  }
              ]
            },
            {
                title: 'मातृ एवं शिशु स्वास्थ्य',
                description: 'गर्भवती महिलाओं को नियमित जांच, संस्थागत प्रसव और प्रसवोत्तर देखभाल करवानी चाहिए।',
                 details: [
                  {
                    title: 'गर्भावस्था के दौरान देखभाल (प्रसवपूर्व देखभाल):',
                    content: [
                      'निकटतम स्वास्थ्य केंद्र में अपनी गर्भावस्था का शीघ्र पंजीकरण कराएं।',
                      'अपने स्वास्थ्य और बच्चे के विकास की निगरानी के लिए कम से कम चार प्रसवपूर्व जांच पूरी करें।',
                      'एनीमिया को रोकने के लिए स्वास्थ्य कार्यकर्ता की सलाह के अनुसार आयरन और फोलिक एसिड की गोलियां लें।',
                      'पौष्टिक आहार लें और पर्याप्त आराम करें।'
                    ]
                  },
                  {
                    title: 'सुरक्षित प्रसव (संस्थागत प्रसव):',
                    content: [
                      'हमेशा अपने बच्चे को अस्पताल या प्राथमिक स्वास्थ्य केंद्र में जन्म देने की योजना बनाएं।',
                      'यह सुनिश्चित करता है कि किसी भी जटिलता से निपटने के लिए एक कुशल स्वास्थ्य प्रदाता मौजूद है, जो मां और बच्चे दोनों की रक्षा करता है।',
                      'जननी सुरक्षा योजना (JSY) जैसी सरकारी योजनाएं संस्थागत प्रसव के लिए नकद सहायता प्रदान करती हैं।'
                    ]
                  },
                  {
                    title: 'प्रसव के बाद देखभाल (प्रसवोत्तर देखभाल):',
                    content: [
                      'प्रसव के बाद मां और नवजात दोनों की नियमित स्वास्थ्य जांच होनी चाहिए।',
                      'जन्म के पहले घंटे के भीतर स्तनपान शुरू करें। पहले 6 महीनों के लिए विशेष स्तनपान बच्चे के स्वास्थ्य के लिए महत्वपूर्ण है।',
                    ]
                  }
              ]
            },
        ],
        whoLink: 'डब्ल्यूएचओ इंडिया वेबसाइट पर जाएं',
        mohfwLink: "MoHFW वेबसाइट पर जाएं",
    },
    about: {
      title: 'सेहत साथी के बारे में',
      subtitle: 'प्रौद्योगिकी के साथ ग्रामीण भारत में स्वास्थ्य सेवा की खाई को पाटना।',
      problemTitle: 'हम जिस समस्या का समाधान करते हैं',
      problemShortfall: 'ग्रामीण सामुदायिक स्वास्थ्य केंद्रों में भारत में 80% विशेषज्ञों की कमी है।',
      problemDescription: 'इस महत्वपूर्ण कमी का मतलब है कि लाखों लोगों को समय पर और विश्वसनीय चिकित्सा सलाह तक पहुंच नहीं है, जिससे रोकी जा सकने वाली स्वास्थ्य जटिलताएं होती हैं। दूरी, लागत और सूचना की कमी गुणवत्तापूर्ण स्वास्थ्य सेवा के लिए प्रमुख बाधाएं हैं।',
      solutionTitle: 'हमारा समाधान',
      solutionApp: 'एक मोबाइल-फ्रेंडली वेबसाइट पर एआई-संचालित चैटबॉट।',
      solutionDescription: 'सेहत साथी तत्काल, सुलभ और आसानी से समझ में आने वाला स्वास्थ्य मार्गदर्शन प्रदान करता है। एआई का लाभ उठाकर और स्थानीय भाषाओं का समर्थन करके, हम सूचना की बाधाओं को तोड़ते हुए, सभी की जेब में एक वर्चुअल स्वास्थ्य सहायक डालते हैं।',
      missionTitle: 'हमारा मिशन',
      missionDescription: 'ग्रामीण समुदायों में व्यक्तियों को उनके स्वास्थ्य के बारे में सूचित निर्णय लेने के लिए ज्ञान और उपकरणों के साथ सशक्त बनाना, यह सुनिश्चित करना कि पहुंच की कमी के कारण कोई भी पीछे न छूटे।',
      visionTitle: 'हमारा दृष्टिकोण',
      visionDescription: 'एक ऐसा भविष्य जहां ग्रामीण भारत में प्रत्येक व्यक्ति को प्राथमिक स्वास्थ्य सेवा मार्गदर्शन तक तत्काल पहुंच हो, जिससे स्वस्थ समुदाय और एक मजबूत राष्ट्र का निर्माण हो।',
      faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
      faqSubtitle: 'सेहत साथी के बारे में सामान्य प्रश्नों के उत्तर पाएं।',
      faqs: [
        {
            question: 'क्या सेहत साथी का उपयोग मुफ्त है?',
            answer: 'हाँ, सेहत साथी की सभी सुविधाएँ, जिसमें एआई चैटबॉट और टेली-परामर्श बुकिंग शामिल है, पूरी तरह से नि:शुल्क हैं।'
        },
        {
            question: 'क्या मैं इस सेवा का उपयोग आपात स्थिति के लिए कर सकता हूँ?',
            answer: 'नहीं। सेहत साथी केवल सामान्य स्वास्थ्य मार्गदर्शन के लिए है। किसी भी चिकित्सा आपात स्थिति में, कृपया अपने नजदीकी अस्पताल या किसी प्रमाणित चिकित्सक से तुरंत संपर्क करें।'
        },
        {
            question: 'चैटबॉट किन भाषाओं में उपलब्ध है?',
            answer: 'वर्तमान में, चैटबॉट अंग्रेजी, हिंदी और मराठी में उपलब्ध है। हम जल्द ही और क्षेत्रीय भाषाओं को जोड़ने पर काम कर रहे हैं।'
        },
        {
            question: 'क्या मेरी व्यक्तिगत जानकारी सुरक्षित है?',
            answer: 'हम आपकी गोपनीयता को प्राथमिकता देते हैं। चैटबॉट के साथ आपकी बातचीत गुमनाम है। टेली-परामर्श के लिए, हम आपको डॉक्टर से जोड़ने के लिए केवल आवश्यक जानकारी एकत्र करते हैं, और यह डेटा सुरक्षित रूप से संभाला जाता है।'
        },
        {
          question: 'सेहत साथी किस प्रकार की स्वास्थ्य जानकारी प्रदान करता है?',
          answer: 'हम सामान्य स्वास्थ्य स्थितियों, प्राथमिक चिकित्सा, निवारक देखभाल, स्वस्थ जीवन शैली युक्तियों और सरकारी स्वास्थ्य योजनाओं के बारे में विवरण पर सामान्य जानकारी प्रदान करते हैं। यह एक पेशेवर चिकित्सा निदान का विकल्प नहीं है।'
        },
        {
          question: 'मैं नजदीकी अस्पताल कैसे ढूंढ सकता हूं?',
          answer: 'आप हमारे ऐप में "अस्पताल लोकेटर" सुविधा का उपयोग कर सकते हैं या बस चैटबॉट से "आस-पास के अस्पताल ढूंढें" पूछ सकते हैं। यह आपके क्षेत्र में सुविधाओं की एक सूची प्रदान करेगा।'
        }
      ]
    },
    contact: {
      title: 'संपर्क करें',
      subtitle: 'कोई प्रश्न या प्रतिक्रिया है? हमें आपसे सुनना अच्छा लगेगा।',
      formTitle: 'समस्या की रिपोर्ट करें या प्रतिक्रिया भेजें',
      formNameLabel: 'पूरा नाम',
      formNamePlaceholder: 'आपका नाम',
      formEmailLabel: 'ईमेल पता',
      formEmailPlaceholder: 'your.email@example.com',
      formMessageLabel: 'आपका संदेश',
      formMessagePlaceholder: 'कृपया उस समस्या का वर्णन करें जिसका आप सामना कर रहे हैं या अपनी प्रतिक्रिया साझा करें...',
      sendButton: 'संदेश भेजें',
      contactInfoTitle: 'संपर्क जानकारी',
      contactInfoDescription: 'सीधे समर्थन के लिए, आप हमें ईमेल के माध्यम से संपर्क कर सकते हैं। कृपया ध्यान दें, चिकित्सा आपात स्थिति के लिए, सीधे अस्पताल से संपर्क करें।',
      supportEmail: 'समर्थन ईमेल',
      emergencyHelpline: 'राष्ट्रीय आपातकालीन हेल्पलाइन',
      emergencyNumber: '112',
      successToastTitle: 'संदेश तैयार!',
      successToastDescription: 'आपका ईमेल क्लाइंट खुल गया है। कृपया अपनी प्रतिक्रिया सबमिट करने के लिए भेजें दबाएं।',
    },
    services: {
      title: 'हमारी सेवाएं',
      subtitle: 'आपके लिए डिज़ाइन किए गए सुलभ स्वास्थ्य समाधान।',
      initiativesTitle: 'सरकारी स्वास्थ्य पहल',
      initiativesSubtitle: 'देश भर में सार्वजनिक स्वास्थ्य में सुधार के उद्देश्य से प्रमुख कार्यक्रमों के बारे में जानें।',
      initiatives: [
        {
            title: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)",
            description: "10.74 करोड़ से अधिक गरीब और कमजोर परिवारों को द्वितीयक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति वर्ष प्रति परिवार 5 लाख रुपये का स्वास्थ्य कवर प्रदान करता है।",
            criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
            url: "https://pmjay.gov.in/"
        },
        {
            title: "राष्ट्रीय स्वास्थ्य मिशन (NHM)",
            description: "लोगों की जरूरतों के प्रति जवाबदेह और उत्तरदायी, समान, परवडणाऱ्या आणि दर्जेदार आरोग्य सेवांमध्ये सार्वत्रिक प्रवेशाची कल्पना करते.",
            criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
            url: "https://nhm.gov.in/"
        },
        {
            title: "प्रधानमंत्री मातृ वंदना योजना (PMMVY)",
            description: "प्रसूति और बच्चे की देखभाल के दौरान मजदूरी-हानि के लिए महिलाओं को आंशिक मजदूरी मुआवजा प्रदान करने वाला एक मातृत्व लाभ कार्यक्रम।",
            criteria: { minAge: 18, maxAge: 45, applicableGender: 'female' },
            url: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana"
        },
        {
            title: 'जननी शिशु सुरक्षा कार्यक्रम (JSSK)',
            description: 'सार्वजनिक स्वास्थ्य संस्थानों में प्रसव कराने वाली सभी गर्भवती महिलाओं को सिजेरियन सेक्शन सहित बिल्कुल मुफ्त और बिना किसी खर्च के प्रसव का अधिकार देता है।',
            criteria: { minAge: 18, maxAge: 45, applicableGender: 'female' },
            url: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=825&lid=221"
        },
        {
            title: 'राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (RBSK)',
            description: 'जन्म से 18 वर्ष तक के बच्चों के लिए 4 ‘डी’ यानी जन्म के समय दोष, कमियों, बीमारियों, विकलांगता सहित विकास में देरी को कवर करने के लिए शीघ्र पहचान और शीघ्र हस्तक्षेप की एक पहल।',
            criteria: { minAge: 0, maxAge: 18, applicableGender: 'all' },
            url: "https://rbsk.nhm.gov.in/"
        },
        {
            title: 'राष्ट्रीय तंबाकू नियंत्रण कार्यक्रम (NTCP)',
            description: 'इसका उद्देश्य तंबाकू की खपत को नियंत्रित करना और इससे होने वाली मौतों को कम करना है। यह तंबाकू के हानिकारक प्रभावों के बारे में जागरूकता पैदा करने पर केंद्रित है।',
            criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
            url: "https://ntcp.mohfw.gov.in/"
        },
      ],
      aiTitle: 'एआय-चालित आरोग्य मार्गदर्शन',
      aiDescription: 'आरोग्यविषयक प्रश्न आहे का? आमच्या एआय सहाय्यकाकडून त्वरित, विश्वसनीय सल्ला मिळवा। हे तुमच्या खिशात आरोग्य तज्ञ असल्यासारखे आहे, २४/७ उपलब्ध।',
      aiHelpTitle: 'आमचा चॅटबॉट मदत करू शकतो:',
      aiHelpItems: [
        'लक्षणे समजून घेणे',
        'किरकोळ दुखापतींसाठी प्रथमोपचार',
        'सामान्य आजारांबद्दल माहिती'
      ],
      aiButton: 'आमच्या चॅटबॉटला विचारा',
      bookingTitle: 'भेट बुक करा',
      bookingDescription: 'तुमच्या घराच्या आरामात प्रमाणित डॉक्टरशी संपर्क साधा किंवा रुग्णालयात भेट देण्याची योजना करा। भेटीची विनंती करण्यासाठी खालील फॉर्म भरा।',
      formNameLabel: 'पूर्ण नाव',
      formNamePlaceholder: 'उदा. रमेश कुमार',
      formPhoneLabel: 'फोन नंबर',
      formPhonePlaceholder: '१०-अंकी मोबाइल नंबर',
      formIssueLabel: 'आरोग्य समस्या',
      formIssuePlaceholder: 'तुमच्या आरोग्य चिंतेचे थोडक्यात वर्णन करा...',
      formHospitalLabel: 'निवडलेले रुग्णालय',
      formHospitalPlaceholder: 'नकाशावरून रुग्णालय निवडा',
      bookingButton: 'भेटीची विनंती करा',
      bookingToastTitle: 'भेटीची विनंती निश्चित झाली!',
      bookingToastDescription: 'आम्हाला तुमची विनंती मिळाली आहे। तुम्हाला लवकरच एक एसएमएस मिळेल।',
      locatorTitle: 'रुग्णालय आणि क्लिनिक लोकेटर',
      locatorDescription: 'महाराष्ट्रामध्ये तुमच्या जवळच्या सरकारी आणि खाजगी आरोग्य सुविधा शोधा।',
      hospitals: [
        {
          name: 'जिल्हा सामान्य रुग्णालय, पुणे',
          address: 'पुणे रेल्वे स्टेशन जवळ, पुणे, महाराष्ट्र',
          lat: 18.5204,
          lng: 73.8567,
          contact: '020-26123456',
          specialties: 'सामान्य औषध, शस्त्रक्रिया, बालरोग',
          timing: '24/7 आपत्कालीन, ओपीडी: सकाळी 9 ते संध्याकाळी 5'
        },
        {
          name: 'ग्रामीण रुग्णालय, मंचर',
          address: 'मंचर, आंबेगाव तालुका, पुणे जिल्हा, महाराष्ट्र',
          lat: 19.0066,
          lng: 73.9338,
          contact: '02133-223344',
          specialties: 'सामान्य औषध, प्रसूती',
          timing: '24/7 आपत्कालीन, ओपीडी: सकाळी 9 ते दुपारी 1'
        },
        {
          name: 'प्राथमिक आरोग्य केंद्र, खेड',
          address: 'खेड, पुणे जिल्हा, महाराष्ट्र',
          lat: 18.8473,
          lng: 73.8760,
          contact: '02135-222233',
          specialties: 'प्राथमिक काळजी, लसीकरण',
          timing: 'ओपीडी: सकाळी 9 ते संध्याकाळी 5'
        },
        {
            name: 'उप जिल्हा रुग्णालय, बारामती',
            address: 'बारामती, पुणे जिल्हा, महाराष्ट्र',
            lat: 18.1581,
            lng: 74.5746,
            contact: '02112-224567',
            specialties: 'ऑर्थोपेडिक्स, सामान्य औषध',
            timing: '24/7 आपत्कालीन, ओपीडी: सकाळी 10 ते दुपारी 4'
        },
        {
          name: 'औंध जिल्हा रुग्णालय',
          address: 'औंध, पुणे, महाराष्ट्र',
          lat: 18.5619,
          lng: 73.8081,
          contact: '020-25698745',
          specialties: 'त्वचारोग, कान-नाक-घसा',
          timing: 'ओपीडी: सकाळी ९ ते दुपारी ४'
        },
        {
          name: 'ससून सर्वोपचार रुग्णालय',
          address: 'स्टेशन रोड, पुणे, महाराष्ट्र',
          lat: 18.5232,
          lng: 73.8695,
          contact: '020-26128000',
          specialties: 'हृदयरोग, न्युरोलॉजी, ऑन्कोलॉजी',
          timing: '२४/७ आपत्कालीन आणि सेवा'
        }
      ],
      mapButton: 'अपॉइंटमेंट बुक करें',
      mapSpecialties: 'विशेषज्ञता',
      mapTimings: 'समय',
      mapContact: 'संपर्क',
      myServicesTitle: 'आपके लिए सेवाएं खोजें',
      myServicesDescription: 'यह जानने के लिए कुछ सवालों के जवाब दें कि आप किन सरकारी स्वास्थ्य योजनाओं के लिए पात्र हो सकते हैं।',
      myServicesButton: 'मेरी सेवाएं खोजें',
      myServicesFormTitle: 'हमें अपने बारे में बताएं',
      myServicesFormAge: 'आपकी उम्र',
      myServicesFormGender: 'आपका लिंग',
      myServicesFormGenderMale: 'पुरुष',
      myServicesFormGenderFemale: 'महिला',
      myServicesFormGenderOther: 'अन्य',
      myServicesFormState: 'आपका राज्य',
      myServicesFormDistrict: 'आपका जिला',
      myServicesFormSubmit: 'मेरी सेवाएं दिखाएं',
      myServicesResultsTitle: 'आपकी प्रोफ़ाइल के आधार पर सेवाएं',
      myServicesResetButton: 'सभी सेवाएं दिखाएं',
      myServicesNoResults: 'आपकी प्रोफ़ाइल के आधार पर कोई विशिष्ट सेवा नहीं मिली। सभी उपलब्ध योजनाएं दिखा रहा है।',
      formAppointmentTypeLabel: 'अपॉइंटमेंट का प्रकार',
      formAppointmentTypeHospital: 'अस्पताल जाएं',
      formAppointmentTypeVideo: 'ऑनलाइन वीडियो कॉल',
      formCallNowLabel: 'अभी कॉल करें (अत्यावश्यक)',
      formCallNowDescription: 'तुरंत जुड़ें। अतिरिक्त शुल्क लागू।',
      formDateLabel: 'पसंदीदा तारीख',
      formDatePlaceholder: 'एक तारीख चुनें',
      formTimeLabel: 'पसंदीदा समय',
      formTimePlaceholder: 'एक समय स्लॉट चुनें',
    },
    profile: {
      title: 'मेरी प्रोफाइल',
      subtitle: 'अपनी स्वास्थ्य जानकारी, दस्तावेज़ और परिवार के विवरण यहाँ प्रबंधित करें।',
      documentsTitle: 'मेरे दस्तावेज़',
      familyHealthDetails: 'परिवार और स्वास्थ्य विवरण',
      addMemberButton: 'सदस्य जोड़ें',
      noProfiles: "आपने अभी तक कोई प्रोफ़ाइल नहीं जोड़ी है।",
      uploadDocumentButton: 'दस्तावेज़ अपलोड करें',
      noDocuments: 'कोई दस्तावेज़ अपलोड नहीं किया गया है।',
      notProvided: 'नहीं दिया गया',
      bloodGroup: 'रक्त समूह',
      allergies: 'एलर्जी',
      chronicDiseases: 'पुरानी बीमारियाँ',
      deleteMemberConfirmationTitle: 'क्या आप निश्चित हैं?',
      deleteMemberConfirmationDescription: 'यह {name} की प्रोफ़ाइल को स्थायी रूप से हटा देगा। यह क्रिया पूर्ववत नहीं की जा सकती।',
      cancelButton: 'रद्द करें',
      deleteButton: 'हटाएं',
      editYourProfile: 'अपनी प्रोफ़ाइल संपादित करें',
      editMemberProfile: "{name} की प्रोफ़ाइल संपादित करें",
      addMemberTitle: 'एक परिवार का सदस्य जोड़ें',
      uploadDocumentTitle: 'एक नया दस्तावेज़ अपलोड करें',
      uploadingButton: 'अपलोड हो रहा है...',
      uploadButton: 'अपलोड करें',
      saveButton: 'बदलाव सहेजें',
      form: {
          fullName: 'पूरा नाम',
          relationship: 'रिश्ता',
          relationshipPlaceholder: 'उदा., पति/पत्नी, बेटा, माँ',
          shortBio: 'संक्षिप्त बायो',
          shortBioPlaceholder: 'उनके बारे में थोड़ा सा',
          bloodGroup: 'रक्त समूह',
          bloodGroupPlaceholder: 'उदा., A+, O-',
          allergies: 'एलर्जी',
          allergiesPlaceholder: 'उदा., मूंगफली, पराग',
          chronicDiseases: 'पुरानी बीमारियाँ',
          chronicDiseasesPlaceholder: 'उदा., मधुमेह, उच्च रक्तचाप',
          docTitle: 'दस्तावेज़ का शीर्षक',
          docTitlePlaceholder: 'उदा., रक्त परीक्षण रिपोर्ट',
          file: 'फ़ाइल',
      },
      accessDeniedTitle: 'प्रवेश निषेध',
      accessDeniedDescription: 'अपनी प्रोफ़ाइल देखने के लिए आपको लॉग इन होना चाहिए।',
      loginButton: 'लॉग इन करें',
      fetchProfileError: 'त्रुटि',
      fetchProfileErrorDescription: 'आपकी प्रोफ़ाइल डेटा प्राप्त नहीं किया जा सका।',
      fetchFamilyError: 'त्रुटि',
      fetchFamilyErrorDescription: 'परिवार के सदस्य का डेटा प्राप्त नहीं किया जा सका।',
      fetchDocumentsError: 'त्रुटि',
      fetchDocumentsErrorDescription: 'दस्तावेज़ प्राप्त नहीं किए जा सके।',
      updateProfileSuccess: 'प्रोफ़ाइल अपडेट की गई',
      updateProfileSuccessDescription: "{name} के विवरण सहेजे गए हैं।",
      addMemberSuccess: 'सदस्य जोड़ा गया',
      addMemberSuccessDescription: "{name} को आपके परिवार में जोड़ा गया है।",
      saveProfileError: 'सहेजने में विफल',
      saveProfileErrorDescription: 'प्रोफ़ाइल सहेजी नहीं जा सकी।',
      uploadSuccess: 'अपलोड सफल',
      uploadSuccessDescription: '{title} अपलोड किया गया है।',
      uploadError: 'अपलोड विफल',
      uploadErrorDescription: 'दस्तावेज़ अपलोड नहीं किया जा सका।',
      deleteMemberSuccess: 'सदस्य हटाया गया',
      deleteMemberSuccessDescription: '{name} को हटा दिया गया है।',
      deleteMemberError: 'हटाने में विफल',
      deleteMemberErrorDescription: 'सदस्य को हटाया नहीं जा सका।',
      deleteDocumentSuccess: 'दस्तावेज़ हटाया गया',
      deleteDocumentSuccessDescription: '{title} को हटा दिया गया है।',
      deleteDocumentError: 'हटाने में विफल',
      deleteDocumentErrorDescription: 'दस्तावेज़ को हटाया नहीं जा सका।',
      deleteDocumentConfirmationTitle: 'क्या आप निश्चित हैं?',
      deleteDocumentConfirmationDescription: 'यह दस्तावेज़ "{title}" को स्थायी रूप से हटा देगा।'
    },
    insurance: {
      title: 'बीमा और जीवन बीमा',
      subtitle: 'अपने बीमा दस्तावेज़ यहां अपलोड और प्रबंधित करें।',
      description: 'आप यहां अपने बीमा दस्तावेज़ अपलोड और देख सकते हैं। यह डेटा सुरक्षित रूप से संग्रहीत है और केवल आपको दिखाई देता है।',
      uploadDocument: 'दस्तावेज़ अपलोड करें',
      viewDocuments: 'मेरे दस्तावेज़',
      formTitle: 'एक नया बीमा दस्तावेज़ अपलोड करें',
      uploadSuccessToastTitle: 'दस्तावेज़ अपलोड किया गया',
      uploadSuccessToastDescription: '{title} सफलतापूर्वक अपलोड किया गया है।',
      noDocuments: 'आपने अभी तक कोई बीमा दस्तावेज़ अपलोड नहीं किया है।',
      uploadButton: 'अपलोड करें',
      uploadingButton: 'अपलोड हो रहा है...',
      cancelButton: 'रद्द करें',
      deleteButton: 'हटाएं',
      accessDeniedTitle: 'प्रवेश निषेध',
      accessDeniedDescription: 'अपने बीमा दस्तावेज़ प्रबंधित करने के लिए आपको लॉग इन होना चाहिए।',
      loginButton: 'लॉग इन करें',
      fetchError: 'त्रुटि',
      fetchErrorDescription: 'बीमा दस्तावेज़ प्राप्त नहीं किए जा सके।',
      uploadFailedTitle: 'अपलोड विफल',
      uploadFailedDescription: 'दस्तावेज़ अपलोड नहीं किया जा सका।',
      deleteSuccessTitle: 'दस्तावेज़ हटाया गया',
      deleteSuccessDescription: '{title} हटा दिया गया है।',
      deleteFailedTitle: 'हटाने में विफल',
      deleteFailedDescription: 'दस्तावेज़ हटाया नहीं जा सका।',
      deleteConfirmationTitle: 'क्या आप निश्चित हैं?',
      deleteConfirmationDescription: 'यह दस्तावेज़ "{title}" को स्थायी रूप से हटा देगा।',
      form: {
        docTitle: 'दस्तावेज़ का शीर्षक',
        docTitlePlaceholder: 'उदा. मेरी स्वास्थ्य बीमा पॉलिसी',
        file: 'फ़ाइल',
      }
    },
    videoCall: {
        permissionDeniedTitle: 'कैमरा और माइक एक्सेस अस्वीकृत',
        permissionDeniedDescription: 'वीडियो कॉल का उपयोग करने के लिए कृपया अपने ब्राउज़र सेटिंग्स में कैमरा और माइक्रोफ़ोन अनुमतियों को सक्षम करें।',
        callEndedTitle: 'कॉल समाप्त',
        callEndedDescription: 'आपका परामर्श समाप्त हो गया है।',
        doctorName: 'डॉ. शर्मा (हृदय रोग विशेषज्ञ)',
        cameraRequiredTitle: 'कैमरा एक्सेस आवश्यक',
        cameraRequiredDescription: 'इस सुविधा का उपयोग करने के लिए कृपया अपने ब्राउज़र में कैमरा और माइक्रोफ़ोन एक्सेस की अनुमति दें। अनुमतियाँ देने के बाद आपको पृष्ठ को रीफ़्रेश करने की आवश्यकता हो सकती है।',
    }
  },
  mr: {
    greeting: 'नमस्कार! मी सेहत साथी आहे. आज मी तुमची कशी मदत करू शकतो? तुम्ही मला आरोग्य समस्यांबद्दल विचारू शकता, सल्लामसलत बुक करू शकता किंवा जवळची रुग्णालये शोधू शकता।',
    languageSet: 'भाषा मराठीत बदलली आहे।',
    inputPlaceholder: 'तुमचा संदेश टाइप करा...',
    online: 'ऑनलाइन',
    appName: 'सेहत साथी',
    notificationsAriaLabel: 'सूचना',
    menu: {
      english: 'English',
      hindi: 'हिंदी',
      marathi: 'मराठी',
      en: 'English',
      hi: 'हिंदी',
      mr: 'मराठी',
    },
    login: {
        title: 'लॉग इन करा',
        titleLogin: 'पुन्हा स्वागत आहे',
        titleSignup: 'खाते तयार करा',
        subtitleLogin: 'सेहत साथीमध्ये सुरू ठेवण्यासाठी साइन इन करा.',
        subtitleSignup: 'आरोग्य मार्गदर्शन मिळविण्यासाठी सेहत साथीमध्ये सामील व्हा.',
        emailLabel: 'ईमेल पत्ता',
        passwordLabel: 'पासवर्ड',
        passwordPlaceholderSignup: 'किमान ६ अक्षरे',
        buttonLogin: 'साइन इन करा',
        buttonSignup: 'साइन अप करा',
        submittingLogin: 'साइन इन करत आहे...',
        submittingSignup: 'खाते तयार करत आहे...',
        googleButton: 'Google ने साइन इन करा',
        promptSignup: "खाते नाही?",
        promptLogin: "आधीच खाते आहे?",
        linkSignup: 'साइन अप करा',
        linkLogin: 'साइन इन करा',
        googleSignInSuccessTitle: 'साइन-इन यशस्वी',
        googleSignInSuccessDescription: 'तुम्ही Google ने यशस्वीरित्या लॉग इन केले आहे.',
        googleSignInFailedTitle: 'Google साइन-इन अयशस्वी',
        googleSignInFailedDescription: 'तुम्हाला Google ने साइन इन करू शकलो नाही. कृपया पुन्हा प्रयत्न करा.',
        signUpSuccessTitle: 'खाते तयार झाले',
        signUpSuccessDescription: 'तुमचे खाते यशस्वीरित्या तयार झाले आहे. तुम्ही आता लॉग इन आहात.',
        signUpFailedTitle: 'साइन-अप अयशस्वी',
        signUpFailedDescription: 'एक अनपेक्षित त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
        signUpFailedEmailInUse: 'हा ईमेल आधीच वापरात आहे. कृपया साइन इन करा.',
        signInSuccessTitle: 'साइन-इन यशस्वी',
        signInSuccessDescription: 'तुम्ही यशस्वीरित्या लॉग इन केले आहे.',
        signInFailedTitle: 'साइन-इन अयशस्वी',
        signInFailedDescription: 'अवैध ईमेल किंवा पासवर्ड. कृपया तुमची क्रेडेन्शियल्स तपासा आणि पुन्हा प्रयत्न करा.',
    },
    logout: {
      title: 'साइन आउट केले',
      description: 'तुम्ही यशस्वीरित्या साइन आउट केले आहे.',
      ariaLabel: 'साइन आउट',
    },
    emergency: {
      title: 'ही एक आणीबाणी असू शकते!',
      message: 'कृपया त्वरित वैद्यकीय मदत घ्या। जवळच्या रुग्णालयात जा किंवा आपत्कालीन सेवांना कॉल करा।',
      buttonText: 'आपत्कालीन',
      formTitle: 'आपत्कालीन रुग्णवाहिका विनंती',
      formDescription: 'याचा वापर फक्त खऱ्या वैद्यकीय आणीबाणीसाठी करा। गैरवापरामुळे दंड होऊ शकतो।',
      locationLabel: 'स्थान / क्षेत्र',
      locationPlaceholder: 'पूर्ण पत्ता, महत्त्वाचे ठिकाण, इ.',
      reasonLabel: 'आणीबाणीचे कारण',
      reasonPlaceholder: 'उदा. अपघात, छातीत दुखणे',
      contactLabel: 'संपर्क क्रमांक',
      contactPlaceholder: 'परत कॉल करण्यासाठी १०-अंकी क्रमांक',
      submitButton: 'रुग्णवाहिकेची विनंती करा',
      confirmTitle: 'आपत्कालीन विनंतीची पुष्टी करायची?',
      confirmMessage: 'तुम्ही रुग्णवाहिकेची विनंती करणार आहात। कृपया पुष्टी करा की ही खरी आणीबाणी आहे। भारताचा राष्ट्रीय आपत्कालीन क्रमांक आहे:',
      emergencyNumberText: 'राष्ट्रीय आपत्कालीन क्रमांक',
      confirmSubtext: 'पुढे जाण्यासाठी "पुष्टी करा" दाबा।',
      cancelButton: 'रद्द करा',
      confirmButton: 'पुष्टी करा',
      toastTitle: 'आपत्कालीन विनंती पाठवली',
      toastDescription: 'रुग्णवाहिकेला तुमच्या स्थानाची सूचना देण्यात आली आहे। लाइनवर रहा।',
    },
    hospitals: {
      title: 'येथे जवळपासची काही रुग्णालये आहेत:',
      mapLink: 'नकाशावर पहा',
    },
    bookingConfirmation: 'तुमची टेली-कन्सल्टेशन विनंती प्राप्त झाली आहे। तुम्हाला लवकरच डॉक्टरचे तपशील आणि भेटीच्या वेळेसह एक एसएमएस मिळेल।',
    nav: {
      home: 'आरोग्य मार्गदर्शक',
      chatbot: 'चॅटबॉट',
      services: 'सेवा',
      about: 'बद्दल',
      contact: 'संपर्क',
      map: 'नकाशा',
      profile: 'माझी प्रोफाइल',
      insurance: 'विमा'
    },
    footer: {
      disclaimer: 'अस्वीकरण: हा चॅटबॉट सामान्य आरोग्य मार्गदर्शन प्रदान करतो। आपत्कालीन परिस्थितीसाठी, कृपया प्रमाणित डॉक्टर किंवा रुग्णालयाला भेट द्या।',
      copyright: '© {year} सेहत साथी। सर्व हक्क राखीव।',
    },
    landing: {
      heroTitle: 'तुमचा आरोग्य सहाय्यक, कधीही, कुठेही',
      heroSubtitle: 'ग्रामीण भारताला त्वरित, विश्वसनीय आरोग्य मार्गदर्शन आणि सरकारी उपक्रमांमध्ये प्रवेश प्रदान करणे।',
      signIn: 'फोनने साइन इन करा',
      startChatting: 'अतिथी म्हणून वापरा',
      featuresTitle: 'आम्ही काय ऑफर करतो',
      featuresSubtitle: 'प्रवेशयोग्य ग्रामीण आरोग्यसेवेसाठी तुमचे वन-स्टॉप समाधान।',
      features: [
        {
          title: 'एआय आरोग्य चॅटबॉट',
          description: 'तुमच्या आरोग्यविषयक प्रश्नांची तुमच्या स्थानिक भाषेत त्वरित उत्तरे मिळवा, २४/७।',
        },
        {
          title: 'आरोग्य माहिती',
          description: 'माहितीपूर्ण राहण्यासाठी समजण्यास सोप्या आरोग्य टिप्स आणि सरकारी मार्गदर्शक तत्त्वे मिळवा।',
        },
        {
          title: 'सेवा शोधक',
          description: 'जवळपासची रुग्णालये आणि आरोग्य केंद्रांवर भेटी शोधा आणि बुक करा।',
        },
      ],
      ctaTitle: 'उत्तम आरोग्यासाठी तुमचा प्रवास इथून सुरू होतो',
      ctaSubtitle: 'निरोगी राहण्याच्या टिप्ससाठी आमचे सर्वसमावेशक आरोग्य मार्गदर्शक एक्सप्लोर करा।',
      ctaButton: 'आरोग्य मार्गदर्शक एक्सप्लोर करा',
    },
    healthGuide: {
      title: 'निरोगी आयुष्यासाठी तुमचे मार्गदर्शक',
      subtitle: 'तुम्ही आणि तुमचे कुटुंब निरोगी राहण्यास मदत करण्यासाठी विश्वसनीय स्त्रोतांकडून माहिती आणि टिप्स।',
      precautionsTitle: 'सामान्य आरोग्यविषयक खबरदारी',
      precautionsSubtitle: 'सामान्य आजार टाळण्यासाठी आणि निरोगी राहण्यासाठी या सोप्या चरणांचे अनुसरण करा।',
      precautions: [
        {
          title: 'स्वच्छ पाणी प्या',
          description: 'टायफॉइड आणि कॉलरासारखे जलजन्य आजार टाळण्यासाठी नेहमी उकळलेले किंवा फिल्टर केलेले पाणी प्या.',
          details: [
            {
              title: 'स्वच्छ पाणी का महत्त्वाचे आहे?',
              content: [
                'दूषित पाण्यात जीवाणू, विषाणू आणि परजीवी यांसारखे हानिकारक जंतू असतात.',
                'हे जंतू अतिसार, कॉलरा, टायफॉइड आणि आमांश यांसारखे आजार पसरवू शकतात, जे ग्रामीण भागात मोठे आरोग्य धोके आहेत.',
                'स्वच्छ पाणी पचन, हायड्रेशन आणि शरीराच्या एकूण कार्यासाठी आवश्यक आहे.'
              ]
            },
            {
              title: 'घरी पिण्याचे पाणी शुद्ध करण्याचे सोपे मार्ग:',
              content: [
                'उकळणे: पाणी किमान १ मिनिटासाठी उकळवा. बहुतेक जंतू मारण्याचा हा सर्वात प्रभावी मार्ग आहे.',
                'गाळणे: उकळण्यापूर्वी दृश्यमान अशुद्धी गाळण्यासाठी स्वच्छ कापड (उदा. धोतर किंवा साडी अनेक वेळा दुमडून) वापरा.',
                'सूर्यप्रकाश (SODIS पद्धत): स्वच्छ प्लास्टिकच्या बाटल्यांमध्ये पाणी भरा आणि त्यांना किमान ६ तास थेट सूर्यप्रकाशात ठेवा. अतिनील किरणे जंतू मारण्यास मदत करतात.',
                'क्लोरीन गोळ्या: पॅकेजवरील सूचनांचे पालन करा. या गोळ्या आरोग्य कर्मचाऱ्यांकडून वितरीत केल्या जातात.'
              ]
            },
            {
              title: 'सुरक्षित पाणी साठवण्यासाठी टिप्स:',
              content: [
                'शुद्ध केलेले पाणी स्वच्छ, झाकण असलेल्या आणि अरुंद तोंडाच्या भांड्यात साठवा जेणेकरून हाताने किंवा भांड्यांद्वारे होणारे प्रदूषण टाळता येईल.',
                'पाणी काढण्यासाठी लांब दांड्याचा चमचा वापरा; आपले हात किंवा न धुतलेले ग्लास भांड्यात बुडवू नका.',
              ]
            }
          ]
        },
        {
          title: 'स्वच्छ अन्न खा',
          description: 'ताजे शिजवलेले अन्न खा. रस्त्यावरील विक्रेत्यांकडून शिळे किंवा उघडे अन्न टाळा.',
           details: [
            {
                title: 'मुख्य अन्न सुरक्षा पद्धती:',
                content: [
                    'हानिकारक जीवाणू मारण्यासाठी अन्न, विशेषतः मांस, कोंबडी आणि अंडी पूर्णपणे शिजवा.',
                    'खाण्यापूर्वी किंवा शिजवण्यापूर्वी फळे आणि भाज्या नेहमी स्वच्छ पाण्याने धुवा.',
                    'क्रॉस-दूषितता टाळण्यासाठी कच्चे आणि शिजवलेले अन्न वेगळे ठेवा.',
                    'उरलेले अन्न खाण्यापूर्वी ते पूर्णपणे गरम होईपर्यंत पुन्हा गरम करा.'
                ]
            },
            {
                title: 'स्वच्छ स्वयंपाकघरासाठी टिप्स:',
                content: [
                    'अन्न तयार करण्यापूर्वी, करताना आणि नंतर आपले हात साबण आणि पाण्याने धुवा.',
                    'तुमच्या स्वयंपाकघरातील पृष्ठभाग, भांडी आणि कटिंग बोर्ड स्वच्छ ठेवा.',
                    'अन्न झाकून ठेवून तुमचे स्वयंपाकघर आणि अन्न कीटक, आणि इतर प्राण्यांपासून वाचवा.',
                ]
            },
            {
                title: 'पथारीच्या खाद्यपदार्थाबाबत खबरदारी:',
                content: [
                    'जर तुम्ही पथारीचे अन्न खात असाल, तर स्वच्छ दिसणार्‍या आणि तुमच्यासमोर ताजे अन्न शिजवणाऱ्या विक्रेत्यांची निवड करा.',
                    'उघड्यावर ठेवलेले, न झाकलेले आणि माश्यांच्या संपर्कात आलेले अन्न टाळा.',
                ]
            }
          ]
        },
        {
          title: 'वैयक्तिक स्वच्छता राखा',
          description: 'नियमितपणे साबणाने हात धुवा, विशेषतः जेवणापूर्वी आणि शौचालयाचा वापर केल्यानंतर.',
          details: [
            {
                title: 'हात धुण्याचे सहा टप्पे:',
                content: [
                    'आपले हात स्वच्छ, वाहत्या पाण्याने ओले करा.',
                    'साबण लावा आणि चांगले फेस करा, आपले हात आणि मनगटाच्या सर्व पृष्ठभागांवर लावा.',
                    'किमान २० सेकंद घासून घ्या. हातांच्या मागील बाजू, बोटांच्यामध्ये आणि नखांच्या खाली स्वच्छ करण्याचे लक्षात ठेवा.',
                    'आपले हात स्वच्छ, वाहत्या पाण्याखाली पूर्णपणे धुवा.',
                    'आपले हात स्वच्छ कापडाने कोरडे करा किंवा हवेत कोरडे होऊ द्या.',
                    'शौचालय वापरल्यानंतर, खोकल्यानंतर किंवा शिंकल्यानंतर, जेवणापूर्वी आणि आजारी व्यक्तीची काळजी घेण्यापूर्वी आणि नंतर हात धुणे महत्त्वाचे आहे.'
                ]
            },
            {
                title: 'इतर महत्त्वाच्या स्वच्छतेच्या सवयी:',
                content: [
                    'आपले शरीर स्वच्छ आणि संक्रमणांपासून मुक्त ठेवण्यासाठी दररोज आंघोळ करा.',
                    'दात किडणे आणि हिरड्यांचे आजार टाळण्यासाठी दिवसातून दोनदा दात घासा.',
                    'जंतूंचा प्रसार रोखण्यासाठी आपली नखे कापलेली आणि स्वच्छ ठेवा.',
                    'नेहमी स्वच्छ कपडे घाला.'
                ]
            }
          ]
        },
      ],
      healthyHabitsTitle: 'निरोगी जीवनशैलीसाठी सूचना',
      healthyHabitsSubtitle: 'दीर्घकालीन आरोग्यासाठी या सवयी तुमच्या दैनंदिन जीवनात समाविष्ट करा।',
      healthyHabits: [
        {
          title: 'संतुलित आहार',
          description: 'आवश्यक पोषक तत्वांचासाठी तुमच्या दैनंदिन जेवणात फळे, भाज्या, धान्य आणि प्रथिनांचे मिश्रण समाविष्ट करा.',
           details: [
            {
              title: 'संतुलित आहार म्हणजे काय?',
              content: [
                'याचा अर्थ सर्व प्रमुख अन्न गटांमधून योग्य प्रमाणात विविध प्रकारचे पदार्थ खाणे.',
                'कर्बोदके (ऊर्जा): पोळी, भात, बाजरी, ज्वारी.',
                'प्रथिने (शरीरबांधणी): डाळी, कडधान्ये, चणे, अंडी, दूध आणि दही.',
                'जीवनसत्त्वे आणि खनिजे (संरक्षण): सर्व हंगामी फळे आणि भाज्या, विशेषतः पालक आणि मेथीसारख्या पालेभाज्या.',
                'चरबी (ऊर्जा साठा): तेल, तूप आणि सुकामेवा यांचा माफक प्रमाणात वापर करा.'
              ]
            },
            {
              title: 'संतुलित आहारासाठी व्यावहारिक टिप्स:',
              content: [
                'प्रत्येक मुख्य जेवणात किमान तीन वेगवेगळे अन्न गट समाविष्ट करण्याचा प्रयत्न करा.',
                'हंगामी फळे आणि भाज्या खा कारण त्या ताज्या, स्वस्त आणि पौष्टिक असतात.',
                'साखर, मीठ आणि प्रक्रिया केलेले/तळलेले पदार्थ यांचे सेवन कमी करा.',
                'हायड्रेटेड राहण्यासाठी दिवसभर भरपूर स्वच्छ पाणी प्या.'
              ]
            }
          ]
        },
        {
          title: 'नियमित व्यायाम',
          description: 'दररोज किमान ३० मिनिटे चालणे, योग किंवा सायकलिंग यासारख्या शारीरिक हालचाली करा.',
          details: [
            {
              title: 'नियमित शारीरिक हालचालींचे फायदे:',
              content: [
                'स्नायू आणि हाडे मजबूत करते, दुखापतींचा धोका कमी करते.',
                'हृदयाचे आरोग्य आणि रक्ताभिसरण सुधारते.',
                'निरोगी वजन राखण्यास आणि रक्तातील साखर नियंत्रित करण्यास मदत करते.',
                'तणाव कमी करते आणि मानसिक आरोग्य सुधारते.'
              ]
            },
            {
              title: 'तुम्ही करू शकता अशा सोप्या क्रिया:',
              content: [
                ' brisk चालणे: तुमच्या गावाभोवती ३० मिनिटांचे सोपे चालणे ही एक उत्तम सुरुवात आहे.',
                'योग आणि स्ट्रेचिंग: सोपी आसने लवचिकता सुधारू शकतात आणि शरीरातील वेदना कमी करू शकतात.',
                'शेती आणि घरगुती कामे: दररोजचे शारीरिक श्रम देखील व्यायामाचा एक चांगला प्रकार आहे.',
                'सायकलिंग: तुमच्याकडे सायकल असल्यास, तिचा वापर कमी अंतराच्या प्रवासासाठी करा.'
              ]
            }
          ]
        },
        {
          title: 'पुरेशी झोप',
          description: 'तुमचे शरीर आणि मन ताजेतवाने ठेवण्यासाठी दररोज रात्री ७-८ तास शांत झोप घ्या.',
          details: [
            {
              title: 'झोप का महत्त्वाची आहे?',
              content: [
                'झोपेच्या वेळी, तुमचे शरीर स्वतःची दुरुस्ती करते आणि दुसऱ्या दिवसासाठी ऊर्जा तयार करते.',
                'चांगली झोप एकाग्रता, स्मरणशक्ती आणि निर्णय घेण्याची क्षमता सुधारते.',
                'झोपेच्या अभावामुळे तुमची रोगप्रतिकारशक्ती कमकुवत होऊ शकते, ज्यामुळे तुम्हाला आजार होण्याची अधिक शक्यता असते.',
              ]
            },
            {
              title: 'चांगल्या झोपेसाठी टिप्स:',
              content: [
                'एक दिनचर्या सेट करण्यासाठी दररोज एकाच वेळी झोपण्याचा आणि उठण्याचा प्रयत्न करा.',
                'तुमची झोपण्याची जागा गडद, शांत आणि थंड असल्याची खात्री करा.',
                'झोपण्यापूर्वी जड जेवण, कॅफिन (चहा/कॉफी) आणि मोबाइल फोन वापरणे टाळा.',
                'हळू संगीत ऐकणे किंवा वाचणे यासारख्या आरामदायी क्रिया तुम्हाला झोपायला मदत करू शकतात.',
              ]
            }
          ]
        },
      ],
      govGuidelinesTitle: "मुख्य सरकारी आणि डब्ल्यूएचओ आरोग्य मार्गदर्शक तत्त्वे",
      govGuidelinesSubtitle: "स्वतःचे आणि आपल्या समुदायाचे संरक्षण करण्यासाठी महत्त्वपूर्ण आरोग्य सूचना.",
      govGuidelines: [
        {
            title: 'संसर्गजन्य रोगांचे नियंत्रण',
            description: 'टीबी किंवा फ्लू सारख्या संसर्गजन्य रोग असलेल्या व्यक्तींना वेगळे करा. प्रादुर्भावाच्या काळात सार्वजनिक आरोग्य सल्ल्याचे पालन करा.',
             details: [
              {
                title: 'संसर्गजन्य रोग समजून घेणे:',
                content: [
                  'हे आजार एका व्यक्तीकडून दुसऱ्या व्यक्तीकडे पसरतात, जसे की सामान्य सर्दी, फ्लू, क्षयरोग (टीबी) आणि COVID-19.',
                  'ते हवेतून (खोकणे, शिंकणे), थेट संपर्कातून किंवा दूषित पृष्ठभागांवरून पसरू शकतात.',
                ]
              },
              {
                title: 'मुख्य प्रतिबंधात्मक उपाय:',
                content: [
                  'विलगीकरण: जर कोणी आजारी असेल, तर त्यांनी घरी राहावे आणि आजार पसरू नये म्हणून इतरांशी जवळचा संपर्क टाळावा.',
                  'आपला खोकला/शिंक झाका: आपले तोंड आणि नाक झाकण्यासाठी रुमाल किंवा आपली कोपर वापरा.',
                  'वायुवीजन: ताजी हवा फिरू देण्यासाठी खिडक्या आणि दारे उघडी ठेवा, ज्यामुळे घरातील जंतूंची एकाग्रता कमी होते.',
                  'सामुदायिक जबाबदारी: रोगाच्या प्रादुर्भावाच्या वेळी (उदा. पावसाळ्यात किंवा फ्लूच्या हंगामात) आशा कार्यकर्त्यांनी किंवा स्थानिक आरोग्य अधिकाऱ्यांनी जारी केलेल्या सर्व मार्गदर्शक तत्त्वांचे पालन करा.'
                ]
              }
          ]
        },
        {
            title: 'नियमित लसीकरण',
            description: 'राष्ट्रीय लसीकरण वेळापत्रकानुसार सर्व मुलांना आणि प्रौढांना लसीकरण मिळेल याची खात्री करा.',
            details: [
              {
                title: 'लसीकरण जीवनरक्षक का आहे:',
                content: [
                  'लस मुलांना पोलिओ, गोवर, धनुर्वात आणि घटसर्प यांसारख्या गंभीर आणि जीवघेण्या आजारांपासून वाचवते.',
                  'हे सर्वात प्रभावी आणि सुरक्षित सार्वजनिक आरोग्य हस्तक्षेपांपैकी एक आहे.',
                  'मुलाच्या दीर्घकालीन आरोग्यासाठी लसीकरण वेळापत्रकाचे पालन करणे महत्त्वाचे आहे.',
                ]
              },
              {
                title: 'राष्ट्रीय लसीकरण वेळापत्रक:',
                content: [
                  'तुमच्या मुलासाठी संपूर्ण आणि अद्ययावत लसीकरण तक्ता मिळवण्यासाठी तुमच्या स्थानिक अंगणवाडी किंवा आशा कार्यकर्त्याशी संपर्क साधा.',
                  'सरकारी आरोग्य केंद्रांवर लस विनामूल्य दिली जाते.',
                  'तुम्ही लसीकरण कार्ड सुरक्षित ठेवा आणि प्रत्येक आरोग्य भेटीला ते सोबत आणा याची खात्री करा.'
                ]
              }
          ]
        },
        {
            title: 'मातृ आणि बाल आरोग्य',
            description: 'गर्भवती महिलांनी नियमित तपासणी, संस्थात्मक प्रसूती आणि प्रसूतीनंतरची काळजी घ्यावी.',
            details: [
              {
                title: 'गरोदरपणात काळजी (प्रसूतीपूर्व काळजी):',
                content: [
                  'जवळच्या आरोग्य केंद्रात तुमच्या गरोदरपणाची लवकर नोंदणी करा.',
                  'तुमचे आरोग्य आणि बाळाच्या वाढीवर लक्ष ठेवण्यासाठी किमान चार प्रसूतीपूर्व तपासण्या पूर्ण करा.',
                  'ॲनिमिया टाळण्यासाठी आरोग्य कार्यकर्त्याच्या सल्ल्यानुसार लोह आणि फॉलिक ॲसिडच्या गोळ्या घ्या.',
                  'पौष्टिक आहार घ्या आणि पुरेशी विश्रांती घ्या.'
                ]
              },
              {
                title: 'सुरक्षित प्रसूती (संस्थात्मक प्रसूती):',
                content: [
                  'तुमच्या बाळाला नेहमी रुग्णालय किंवा प्राथमिक आरोग्य केंद्रात जन्म देण्याची योजना करा.',
                  'हे सुनिश्चित करते की कोणताही गुंतागुंत हाताळण्यासाठी एक कुशल आरोग्य प्रदाता उपस्थित आहे, ज्यामुळे आई आणि बाळ दोघांचेही संरक्षण होते.',
                  'जननी सुरक्षा योजना (JSY) सारख्या सरकारी योजना संस्थात्मक प्रसूतीसाठी आर्थिक सहाय्य प्रदान करतात.'
                ]
              },
              {
                title: 'प्रसूतीनंतरची काळजी (प्रसूतीनंतरची काळजी):',
                content: [
                  'आई आणि नवजात दोघांचीही प्रसूतीनंतर नियमित आरोग्य तपासणी झाली पाहिजे.',
                  'जन्माच्या पहिल्या तासात स्तनपान सुरू करा. पहिल्या ६ महिन्यांसाठी केवळ स्तनपान बाळाच्या आरोग्यासाठी महत्त्वाचे आहे.',
                ]
              }
          ]
        },
      ],
      whoLink: 'डब्ल्यूएचओ इंडिया वेबसाइटला भेट द्या',
      mohfwLink: "MoHFW वेबसाइटला भेट द्या",
    },
    about: {
      title: 'सेहत साथी बद्दल',
      subtitle: 'तंत्रज्ञानाने ग्रामीण भारतातील आरोग्यसेवा दरी कमी करणे।',
      problemTitle: 'आम्ही ज्या समस्येचे निराकरण करतो',
      problemShortfall: 'ग्रामीण सामुदायिक आरोग्य केंद्रांमध्ये भारतात ८०% तज्ञांची कमतरता आहे।',
      problemDescription: 'या गंभीर तफावतीचा अर्थ असा आहे की लाखो लोकांना वेळेवर आणि विश्वासार्ह वैद्यकीय सल्ल्यापर्यंत पोहोच नाही, ज्यामुळे टाळता येण्याजोग्या आरोग्य गुंतागुंत होतात। अंतर, खर्च आणि माहितीचा अभाव हे दर्जेदार आरोग्यसेवेतील प्रमुख अडथळे आहेत।',
      solutionTitle: 'आमचे समाधान',
      solutionApp: 'मोबाइल-अनुकूल वेबसाइटवर एआय-चालित चॅटबॉट।',
      solutionDescription: 'सेहत साथी त्वरित, प्रवेशयोग्य आणि सहज समजण्याजोगे आरोग्य मार्गदर्शन प्रदान करते। एआयचा फायदा घेऊन आणि स्थानिक भाषांना समर्थन देऊन, आम्ही माहितीचे अडथळे दूर करून प्रत्येकाच्या खिशात एक आभासी आरोग्य सहाय्यक ठेवतो।',
      missionTitle: 'आमचे ध्येय',
      missionDescription: 'ग्रामीण समुदायातील व्यक्तींना त्यांच्या आरोग्याविषयी माहितीपूर्ण निर्णय घेण्यासाठी ज्ञान आणि साधनांसह सक्षम करणे, प्रवेशाअभावी कोणीही मागे राहणार नाही याची खात्री करणे।',
      visionTitle: 'आमची दृष्टी',
      visionDescription: 'एक भविष्य जिथे ग्रामीण भारतातील प्रत्येक व्यक्तीला प्राथमिक आरोग्यसेवा मार्गदर्शनासाठी त्वरित प्रवेश मिळेल, ज्यामुळे निरोगी समुदाय आणि एक मजबूत राष्ट्र निर्माण होईल।',
      faqTitle: 'सतत विचारले जाणारे प्रश्न',
      faqSubtitle: 'सेहत साथीबद्दल सामान्य प्रश्नांची उत्तरे मिळवा.',
      faqs: [
        {
            question: 'सेहत साथी वापरण्यासाठी विनामूल्य आहे का?',
            answer: 'होय, सेहत साथीची सर्व वैशिष्ट्ये, ज्यात एआय चॅटबॉट आणि टेली-सल्लामसलत बुकिंग समाविष्ट आहे, पूर्णपणे विनामूल्य आहेत.'
        },
        {
            question: 'मी या सेवेचा आपत्कालीन परिस्थितीत वापर करू शकतो का?',
            answer: 'नाही. सेहत साथी फक्त सामान्य आरोग्य मार्गदर्शनासाठी आहे. वैद्यकीय आणीबाणीच्या परिस्थितीत, कृपया आपल्या जवळच्या रुग्णालयाशी किंवा प्रमाणित डॉक्टरशी त्वरित संपर्क साधा.'
        },
        {
            question: 'चॅटबॉट कोणत्या भाषांमध्ये उपलब्ध आहे?',
            answer: 'सध्या, चॅटबॉट इंग्रजी, हिंदी आणि मराठीमध्ये उपलब्ध आहे. आम्ही लवकरच अधिक प्रादेशिक भाषा जोडण्यावर काम करत आहोत.'
        },
        {
            question: 'माझी वैयक्तिक माहिती सुरक्षित आहे का?',
            answer: 'आम्ही तुमच्या गोपनीयतेला प्राधान्य देतो. चॅटबॉटसोबतचे तुमचे संभाषण निनावी आहे. टेली-सल्लामसलतसाठी, आम्ही तुम्हाला डॉक्टरशी जोडण्यासाठी फक्त आवश्यक माहिती गोळा करतो आणि हा डेटा सुरक्षितपणे हाताळला जातो.'
        },
        {
          question: 'सेहत साथी कोणत्या प्रकारची आरोग्य माहिती पुरवते?',
          answer: 'आम्ही सामान्य आरोग्य स्थिती, प्रथमोपचार, प्रतिबंधात्मक काळजी, निरोगी जीवनशैली टिप्स आणि सरकारी आरोग्य योजनांबद्दल तपशीलवार माहिती प्रदान करतो. हे व्यावसायिक वैद्यकीय निदानाचा पर्याय नाही.'
        },
        {
          question: 'मी जवळचे रुग्णालय कसे शोधू शकेन?',
          answer: 'तुम्ही आमच्या अॅपमधील "हॉस्पिटल लोकेटर" वैशिष्ट्य वापरू शकता किंवा चॅटबॉटला "जवळची रुग्णालये शोधा" असे विचारू शकता. ते तुमच्या क्षेत्रातील सुविधांची यादी देईल.'
        }
      ]
    },
    contact: {
      title: 'संपर्कात रहा',
      subtitle: 'प्रश्न किंवा अभिप्राय आहे? आम्हाला तुमच्याकडून ऐकायला आवडेल।',
      formTitle: 'समस्येची तक्रार करा किंवा अभिप्राय पाठवा',
      formNameLabel: 'पूर्ण नाव',
      formNamePlaceholder: 'तुमचे नाव',
      formEmailLabel: 'ईमेल पत्ता',
      formEmailPlaceholder: 'your.email@example.com',
      formMessageLabel: 'तुमचा संदेश',
      formMessagePlaceholder: 'कृपया तुम्ही सामना करत असलेल्या समस्येचे वर्णन करा किंवा तुमचा अभिप्राय सांगा...',
      sendButton: 'संदेश पाठवा',
      contactInfoTitle: 'संपर्क माहिती',
      contactInfoDescription: 'थेट समर्थनासाठी, तुम्ही आम्हाला ईमेलद्वारे संपर्क साधू शकता। कृपया लक्षात घ्या, वैद्यकीय आणीबाणीसाठी, थेट रुग्णालयाशी संपर्क साधा।',
      supportEmail: 'समर्थन ईमेल',
      emergencyHelpline: 'राष्ट्रीय आपत्कालीन हेल्पलाइन',
      emergencyNumber: '112',
      successToastTitle: 'संदेश तयार!',
      successToastDescription: 'तुमचे ईमेल क्लायंट उघडले आहे. कृपया तुमचा अभिप्राय सबमिट करण्यासाठी पाठवा दाबा.',
    },
    services: {
      title: 'आमच्या सेवा',
      subtitle: 'तुमच्यासाठी डिझाइन केलेली प्रवेशयोग्य आरोग्यसेवा समाधाने।',
      initiativesTitle: 'सरकारी आरोग्य उपक्रम',
      initiativesSubtitle: 'देशभरात सार्वजनिक आरोग्य सुधारण्याच्या उद्देशाने असलेल्या प्रमुख कार्यक्रमांबद्दल जाणून घ्या।',
      initiatives: [
        {
            title: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)",
            description: "10.74 कोटी पेक्षा जास्त गरीब आणि असुरक्षित कुटुंबांना दुय्यम आणि तृतीयक काळजी रुग्णालयात दाखल करण्यासाठी प्रति कुटुंब प्रति वर्ष 5 लाख रुपयांचे आरोग्य संरक्षण प्रदान करते.",
            criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
            url: "https://pmjay.gov.in/"
        },
        {
            title: "राष्ट्रीय आरोग्य अभियान (NHM)",
            description: "लोकांच्या गरजांसाठी जबाबदार आणि प्रतिसाद देणाऱ्या समान, परवडणाऱ्या आणि दर्जेदार आरोग्य सेवांमध्ये सार्वत्रिक प्रवेशाची कल्पना करते.",
            criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
            url: "https://nhm.gov.in/"
        },
        {
            title: "प्रधानमंत्री मातृ वंदना योजना (PMMVY)",
            description: "प्रसूती आणि बाळाच्या संगोपनाच्या काळात मजुरीच्या नुकसानीसाठी महिलांना आंशिक वेतन भरपाई प्रदान करणारा एक प्रसूती लाभ कार्यक्रम.",
            criteria: { minAge: 18, maxAge: 45, applicableGender: 'female' },
            url: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana"
        },
        {
          title: 'जननी शिशु सुरक्षा कार्यक्रम (JSSK)',
          description: 'सार्वजनिक आरोग्य संस्थांमध्ये प्रसूती करणाऱ्या सर्व गर्भवती महिलांना सिझेरियन सेक्शनसह पूर्णपणे विनामूल्य आणि कोणत्याही खर्चाशिवाय प्रसूतीचा हक्क देतो.',
          criteria: { minAge: 18, maxAge: 45, applicableGender: 'female' },
          url: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=825&lid=221"
        },
        {
          title: 'राष्ट्रीय बाल स्वास्थ्य कार्यक्रम (RBSK)',
          description: 'जन्मापासून 18 वर्षांपर्यंतच्या मुलांसाठी 4 ‘डी’ म्हणजेच जन्मातील दोष, कमतरता, रोग, विकासातील विलंब यासह अपंगत्वासाठी लवकर ओळख आणि लवकर हस्तक्षेपासाठी एक उपक्रम.',
          criteria: { minAge: 0, maxAge: 18, applicableGender: 'all' },
          url: "https://rbsk.nhm.gov.in/"
        },
        {
          title: 'राष्ट्रीय तंबाखू नियंत्रण कार्यक्रम (NTCP)',
          description: 'याचा उद्देश तंबाखूच्या सेवनावर नियंत्रण ठेवणे आणि त्यामुळे होणारे मृत्यू कमी करणे आहे. हे तंबाखूच्या हानिकारक परिणामांबद्दल जागरूकता निर्माण करण्यावर लक्ष केंद्रित करते.',
          criteria: { minAge: 0, maxAge: 120, applicableGender: 'all' },
          url: "https://ntcp.mohfw.gov.in/"
        },
      ],
      aiTitle: 'एआय-चालित आरोग्य मार्गदर्शन',
      aiDescription: 'आरोग्यविषयक प्रश्न आहे का? आमच्या एआय सहाय्यकाकडून त्वरित, विश्वसनीय सल्ला मिळवा। हे तुमच्या खिशात आरोग्य तज्ञ असल्यासारखे आहे, २४/७ उपलब्ध।',
      aiHelpTitle: 'आमचा चॅटबॉट मदत करू शकतो:',
      aiHelpItems: [
        'लक्षणे समजून घेणे',
        'किरकोळ दुखापतींसाठी प्रथमोपचार',
        'सामान्य आजारांबद्दल माहिती'
      ],
      aiButton: 'आमच्या चॅटबॉटला विचारा',
      bookingTitle: 'भेट बुक करा',
      bookingDescription: 'तुमच्या घराच्या आरामात प्रमाणित डॉक्टरशी संपर्क साधा किंवा रुग्णालयात भेट देण्याची योजना करा। भेटीची विनंती करण्यासाठी खालील फॉर्म भरा।',
      formNameLabel: 'पूर्ण नाव',
      formNamePlaceholder: 'उदा. रमेश कुमार',
      formPhoneLabel: 'फोन नंबर',
      formPhonePlaceholder: '१०-अंकी मोबाइल नंबर',
      formIssueLabel: 'आरोग्य समस्या',
      formIssuePlaceholder: 'तुमच्या आरोग्य चिंतेचे थोडक्यात वर्णन करा...',
      formHospitalLabel: 'निवडलेले रुग्णालय',
      formHospitalPlaceholder: 'नकाशावरून रुग्णालय निवडा',
      bookingButton: 'भेटीची विनंती करा',
      bookingToastTitle: 'भेटीची विनंती निश्चित झाली!',
      bookingToastDescription: 'आम्हाला तुमची विनंती मिळाली आहे। तुम्हाला लवकरच एक एसएमएस मिळेल।',
      locatorTitle: 'रुग्णालय आणि क्लिनिक लोकेटर',
      locatorDescription: 'महाराष्ट्रामध्ये तुमच्या जवळच्या सरकारी आणि खाजगी आरोग्य सुविधा शोधा।',
      hospitals: [
        {
          name: 'जिल्हा सामान्य रुग्णालय, पुणे',
          address: 'पुणे रेल्वे स्टेशन जवळ, पुणे, महाराष्ट्र',
          lat: 18.5204,
          lng: 73.8567,
          contact: '020-26123456',
          specialties: 'सामान्य औषध, शस्त्रक्रिया, बालरोग',
          timing: '24/7 आपत्कालीन, ओपीडी: सकाळी 9 ते संध्याकाळी 5'
        },
        {
          name: 'ग्रामीण रुग्णालय, मंचर',
          address: 'मंचर, आंबेगाव तालुका, पुणे जिल्हा, महाराष्ट्र',
          lat: 19.0066,
          lng: 73.9338,
          contact: '02133-223344',
          specialties: 'सामान्य औषध, प्रसूती',
          timing: '24/7 आपत्कालीन, ओपीडी: सकाळी 9 ते दुपारी 1'
        },
        {
          name: 'प्राथमिक आरोग्य केंद्र, खेड',
          address: 'खेड, पुणे जिल्हा, महाराष्ट्र',
          lat: 18.8473,
          lng: 73.8760,
          contact: '02135-222233',
          specialties: 'प्राथमिक काळजी, लसीकरण',
          timing: 'ओपीडी: सकाळी 9 ते संध्याकाळी 5'
        },
        {
            name: 'उप जिल्हा रुग्णालय, बारामती',
            address: 'बारामती, पुणे जिल्हा, महाराष्ट्र',
            lat: 18.1581,
            lng: 74.5746,
            contact: '02112-224567',
            specialties: 'ऑर्थोपेडिक्स, सामान्य औषध',
            timing: '24/7 आपत्कालीन, ओपीडी: सकाळी 10 ते दुपारी 4'
        },
        {
          name: 'औंध जिल्हा रुग्णालय',
          address: 'औंध, पुणे, महाराष्ट्र',
          lat: 18.5619,
          lng: 73.8081,
          contact: '020-25698745',
          specialties: 'त्वचारोग, कान-नाक-घसा',
          timing: 'ओपीडी: सकाळी ९ ते दुपारी ४'
        },
        {
          name: 'ससून सर्वोपचार रुग्णालय',
          address: 'स्टेशन रोड, पुणे, महाराष्ट्र',
          lat: 18.5232,
          lng: 73.8695,
          contact: '020-26128000',
          specialties: 'हृदयरोग, न्युरोलॉजी, ऑन्कोलॉजी',
          timing: '२४/७ आपत्कालीन आणि सेवा'
        }
      ],
      mapButton: 'अपॉइंटमेंट बुक करा',
      mapSpecialties: 'विशेषता',
      mapTimings: 'वेळा',
      mapContact: 'संपर्क',
      myServicesTitle: 'तुमच्यासाठी सेवा शोधा',
      myServicesDescription: 'तुम्ही कोणत्या सरकारी आरोग्य योजनांसाठी पात्र आहात हे शोधण्यासाठी काही प्रश्नांची उत्तरे द्या।',
      myServicesButton: 'माझ्या सेवा शोधा',
      myServicesFormTitle: 'आम्हाला तुमच्याबद्दल सांगा',
      myServicesFormAge: 'तुमचे वय',
      myServicesFormGender: 'तुमचे लिंग',
      myServicesFormGenderMale: 'पुरुष',
      myServicesFormGenderFemale: 'स्त्री',
      myServicesFormGenderOther: 'इतर',
      myServicesFormState: 'तुमचे राज्य',
      myServicesFormDistrict: 'तुमचा जिल्हा',
      myServicesFormSubmit: 'माझ्या सेवा दर्शवा',
      myServicesResultsTitle: 'तुमच्या प्रोफाइलवर आधारित सेवा',
      myServicesResetButton: 'सर्व सेवा दर्शवा',
      myServicesNoResults: 'तुमच्या प्रोफाइलवर आधारित कोणतीही विशिष्ट सेवा आढळली नाही. सर्व उपलब्ध योजना दर्शवित आहे.',
      formAppointmentTypeLabel: 'भेटीचा प्रकार',
      formAppointmentTypeHospital: 'रुग्णालयात भेट द्या',
      formAppointmentTypeVideo: 'ऑनलाइन व्हिडिओ कॉल',
      formCallNowLabel: 'आता कॉल करा (तातडीचे)',
      formCallNowDescription: 'त्वरित कनेक्ट व्हा. अतिरिक्त शुल्क लागू.',
      formDateLabel: 'पसंतीची तारीख',
      formDatePlaceholder: 'एक तारीख निवडा',
      formTimeLabel: 'पसंतीची वेळ',
      formTimePlaceholder: 'वेळेची निवड करा',
    },
    profile: {
      title: 'माझी प्रोफाइल',
      subtitle: 'तुमची आरोग्य माहिती, कागदपत्रे आणि कौटुंबिक तपशील येथे व्यवस्थापित करा.',
      documentsTitle: 'माझी कागदपत्रे',
      familyHealthDetails: 'कुटुंब आणि आरोग्य तपशील',
      addMemberButton: 'सदस्य जोडा',
      noProfiles: "तुम्ही अद्याप कोणतीही प्रोफाइल जोडलेली नाही.",
      uploadDocumentButton: 'कागदपत्र अपलोड करा',
      noDocuments: 'कोणतीही कागदपत्रे अपलोड केलेली नाहीत.',
      notProvided: 'दिलेली नाही',
      bloodGroup: 'रक्त गट',
      allergies: 'ऍलर्जी',
      chronicDiseases: 'दीर्घकालीन आजार',
      deleteMemberConfirmationTitle: 'तुम्ही निश्चित आहात का?',
      deleteMemberConfirmationDescription: 'हे {name} यांची प्रोफाइल कायमची हटवेल. ही क्रिया पूर्ववत करता येणार नाही.',
      cancelButton: 'रद्द करा',
      deleteButton: 'हटवा',
      editYourProfile: 'तुमची प्रोफाइल संपादित करा',
      editMemberProfile: "{name} यांची प्रोफाइल संपादित करा",
      addMemberTitle: 'एक कुटुंब सदस्य जोडा',
      uploadDocumentTitle: 'एक नवीन कागदपत्र अपलोड करा',
      uploadingButton: 'अपलोड करत आहे...',
      uploadButton: 'अपलोड करा',
      saveButton: 'बदल जतन करा',
      form: {
          fullName: 'पूर्ण नाव',
          relationship: 'नाते',
          relationshipPlaceholder: 'उदा., पती/पत्नी, मुलगा, आई',
          shortBio: 'संक्षिप्त बायो',
          shortBioPlaceholder: 'त्यांच्याबद्दल थोडेसे',
          bloodGroup: 'रक्त गट',
          bloodGroupPlaceholder: 'उदा., A+, O-',
          allergies: 'ऍलर्जी',
          allergiesPlaceholder: 'उदा., शेंगदाणे, परागकण',
          chronicDiseases: 'दीर्घकालीन आजार',
          chronicDiseasesPlaceholder: 'उदा., मधुमेह, उच्च रक्तदाब',
          docTitle: 'कागदपत्राचे शीर्षक',
          docTitlePlaceholder: 'उदा., रक्त तपासणी अहवाल',
          file: 'फाईल',
      },
      accessDeniedTitle: 'प्रवेश नाकारला',
      accessDeniedDescription: 'तुमची प्रोफाइल पाहण्यासाठी तुम्ही लॉग इन केलेले असणे आवश्यक आहे.',
      loginButton: 'लॉग इन करा',
      fetchProfileError: 'त्रुटी',
      fetchProfileErrorDescription: 'तुमचा प्रोफाइल डेटा आणू शकलो नाही.',
      fetchFamilyError: 'त्रुटी',
      fetchFamilyErrorDescription: 'कुटुंब सदस्याचा डेटा आणू शकलो नाही.',
      fetchDocumentsError: 'त्रुटी',
      fetchDocumentsErrorDescription: 'कागदपत्रे आणू शकलो नाही.',
      updateProfileSuccess: 'प्रोफाइल अपडेट केली',
      updateProfileSuccessDescription: "{name} यांचे तपशील जतन केले आहेत.",
      addMemberSuccess: 'सदस्य जोडला',
      addMemberSuccessDescription: "{name} तुमच्या कुटुंबात जोडले गेले आहे.",
      saveProfileError: 'जतन करण्यात अयशस्वी',
      saveProfileErrorDescription: 'प्रोफाइल जतन करू शकलो नाही.',
      uploadSuccess: 'अपलोड यशस्वी',
      uploadSuccessDescription: '{title} अपलोड केले आहे.',
      uploadError: 'अपलोड अयशस्वी',
      uploadErrorDescription: 'कागदपत्र अपलोड करू शकलो नाही.',
      deleteMemberSuccess: 'सदस्य हटवला',
      deleteMemberSuccessDescription: '{name} यांना काढले आहे.',
      deleteMemberError: 'हटवण्यात अयशस्वी',
      deleteMemberErrorDescription: 'सदस्य हटवू शकलो नाही.',
      deleteDocumentSuccess: 'कागदपत्र हटवले',
      deleteDocumentSuccessDescription: '{title} हटवले आहे.',
      deleteDocumentError: 'हटवण्यात अयशस्वी',
      deleteDocumentErrorDescription: 'कागदपत्र हटवू शकलो नाही.',
      deleteDocumentConfirmationTitle: 'तुम्ही निश्चित आहात का?',
      deleteDocumentConfirmationDescription: 'हे कागदपत्र "{title}" कायमचे हटवेल.'
    },
    insurance: {
      title: 'विमा आणि जीवन विमा',
      subtitle: 'तुमचे विमा दस्तऐवज येथे अपलोड आणि व्यवस्थापित करा.',
      description: 'तुम्ही तुमचे विमा दस्तऐवज येथे अपलोड आणि पाहू शकता. हा डेटा सुरक्षितपणे संग्रहित केला जातो आणि फक्त तुम्हाला दिसतो.',
      uploadDocument: 'दस्तऐवज अपलोड करा',
      viewDocuments: 'माझे दस्तऐवज',
      formTitle: 'एक नवीन विमा दस्तऐवज अपलोड करा',
      uploadSuccessToastTitle: 'दस्तऐवज अपलोड झाला',
      uploadSuccessToastDescription: '{title} यशस्वीरित्या अपलोड झाला आहे.',
      noDocuments: 'तुम्ही अद्याप कोणतेही विमा दस्तऐवज अपलोड केलेले नाहीत.',
      uploadButton: 'अपलोड करा',
      uploadingButton: 'अपलोड करत आहे...',
      cancelButton: 'रद्द करा',
      deleteButton: 'हटवा',
      accessDeniedTitle: 'प्रवेश नाकारला',
      accessDeniedDescription: 'तुमचे विमा दस्तऐवज व्यवस्थापित करण्यासाठी तुम्ही लॉग इन केलेले असणे आवश्यक आहे.',
      loginButton: 'लॉग इन करा',
      fetchError: 'त्रुटी',
      fetchErrorDescription: 'विमा दस्तऐवज आणू शकलो नाही.',
      uploadFailedTitle: 'अपलोड अयशस्वी',
      uploadFailedDescription: 'दस्तऐवज अपलोड करू शकलो नाही.',
      deleteSuccessTitle: 'दस्तऐवज हटवला',
      deleteSuccessDescription: '{title} हटवला आहे.',
      deleteFailedTitle: 'हटवण्यात अयशस्वी',
      deleteFailedDescription: 'दस्तऐवज हटवू शकलो नाही.',
      deleteConfirmationTitle: 'तुम्ही निश्चित आहात का?',
      deleteConfirmationDescription: 'हे दस्तऐवज "{title}" कायमचे हटवेल.',
      form: {
        docTitle: 'दस्तऐवजाचे शीर्षक',
        docTitlePlaceholder: 'उदा. माझी आरोग्य विमा पॉलिसी',
        file: 'फाईल',
      }
    },
    videoCall: {
        permissionDeniedTitle: 'कॅमेरा आणि माइक प्रवेश नाकारला',
        permissionDeniedDescription: 'व्हिडिओ कॉल वापरण्यासाठी कृपया तुमच्या ब्राउझर सेटिंग्जमध्ये कॅमेरा आणि मायक्रोफोन परवानग्या सक्षम करा.',
        callEndedTitle: 'कॉल संपला',
        callEndedDescription: 'तुमची सल्लामसलत संपली आहे.',
        doctorName: 'डॉ. शर्मा (हृदयरोगतज्ज्ञ)',
        cameraRequiredTitle: 'कॅमेरा प्रवेश आवश्यक',
        cameraRequiredDescription: 'हे वैशिष्ट्य वापरण्यासाठी कृपया तुमच्या ब्राउझरमध्ये कॅमेरा आणि मायक्रोफोन प्रवेशास अनुमती द्या. परवानग्या दिल्यानंतर तुम्हाला पृष्ठ रीफ्रेश करण्याची आवश्यकता असू शकते.',
    }
  },
};

    