import SwiftUI

// MARK: - Auth View with Real Implementation
struct OnboardingAuthView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    
    var body: some View {
        OnboardingAuthFormView()
            .environmentObject(coordinator)
    }
}

// MARK: - Consent View with Real Implementation
struct OnboardingConsentView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    @State private var hasAcceptedPrivacy: Bool = false
    @State private var hasAcceptedTerms: Bool = false
    @State private var hasAcceptedDataProcessing: Bool = false
    @State private var hasAcceptedHealthData: Bool = false
    @State private var showPrivacyPolicy: Bool = false
    @State private var showTermsOfService: Bool = false
    
    var body: some View {
        VStack(spacing: 24) {
            OnboardingProgressBar(
                progress: coordinator.progress,
                currentStep: coordinator.currentStep.rawValue + 1,
                totalSteps: 6
            )
            .padding(.horizontal, 20)
            
            OnboardingHeader(
                title: "Privacy & Consent",
                subtitle: "Your privacy and data security are our top priorities",
                showBackButton: true,
                onBack: { coordinator.previousStep() }
            )
            .padding(.horizontal, 20)
            
            ScrollView {
                VStack(spacing: 20) {
                    // Privacy Notice
                    privacyNoticeSection
                    
                    // Consent Checkboxes
                    consentCheckboxes
                    
                    // Data Usage Explanation
                    dataUsageSection
                }
                .padding(.horizontal, 20)
            }
            
            VStack(spacing: 16) {
                OnboardingPrimaryButton(
                    title: "Accept & Continue",
                    isEnabled: allConsentsAccepted,
                    isLoading: false
                ) {
                    coordinator.nextStep()
                }
                
                Button("Learn more about our privacy practices") {
                    showPrivacyPolicy = true
                }
                .font(.custom("Inter", size: 14))
                .foregroundColor(Color(hex: "#14b8a6"))
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .sheet(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView()
        }
        .sheet(isPresented: $showTermsOfService) {
            TermsOfServiceView()
        }
    }
    
    // MARK: - Privacy Notice Section
    private var privacyNoticeSection: some View {
        VStack(spacing: 16) {
            HStack {
                Image(systemName: "shield.checkerboard")
                    .font(.system(size: 24))
                    .foregroundColor(Color(hex: "#14b8a6"))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Your Data is Protected")
                        .font(.custom("Inter", size: 16))
                        .fontWeight(.semibold)
                        .foregroundColor(.primary)
                    
                    Text("We use industry-standard encryption to protect your health information")
                        .font(.custom("Inter", size: 14))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            .padding(16)
            .background(Color(hex: "#14b8a6").opacity(0.1))
            .cornerRadius(12)
        }
    }
    
    // MARK: - Consent Checkboxes
    private var consentCheckboxes: some View {
        VStack(spacing: 16) {
            ConsentCheckbox(
                isChecked: $hasAcceptedPrivacy,
                title: "Privacy Policy",
                description: "I agree to the Privacy Policy and understand how my data will be used",
                onLearnMore: { showPrivacyPolicy = true }
            )
            
            ConsentCheckbox(
                isChecked: $hasAcceptedTerms,
                title: "Terms of Service",
                description: "I agree to the Terms of Service and app usage conditions",
                onLearnMore: { showTermsOfService = true }
            )
            
            ConsentCheckbox(
                isChecked: $hasAcceptedDataProcessing,
                title: "Data Processing",
                description: "I consent to processing of my personal data for personalized health insights",
                onLearnMore: nil
            )
            
            ConsentCheckbox(
                isChecked: $hasAcceptedHealthData,
                title: "Health Data Collection",
                description: "I consent to collection and analysis of health data for meal planning and recommendations",
                onLearnMore: nil
            )
        }
    }
    
    // MARK: - Data Usage Section
    private var dataUsageSection: some View {
        VStack(spacing: 12) {
            Text("How we use your data:")
                .font(.custom("Inter", size: 16))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 8) {
                DataUsageItem(
                    icon: "brain.head.profile",
                    title: "Personalized AI Recommendations",
                    description: "Create customized meal plans and health insights"
                )
                
                DataUsageItem(
                    icon: "chart.line.uptrend.xyaxis",
                    title: "Progress Tracking",
                    description: "Monitor your health journey and goals"
                )
                
                DataUsageItem(
                    icon: "shield.lefthalf.filled",
                    title: "Secure Storage",
                    description: "All data encrypted and securely stored"
                )
                
                DataUsageItem(
                    icon: "person.crop.circle.badge.xmark",
                    title: "No Data Selling",
                    description: "We never sell your personal information"
                )
            }
        }
        .padding(16)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(12)
    }
    
    // MARK: - Computed Properties
    private var allConsentsAccepted: Bool {
        hasAcceptedPrivacy && hasAcceptedTerms && hasAcceptedDataProcessing && hasAcceptedHealthData
    }
}

// MARK: - Consent Checkbox Component
struct ConsentCheckbox: View {
    @Binding var isChecked: Bool
    let title: String
    let description: String
    let onLearnMore: (() -> Void)?
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Button(action: {
                isChecked.toggle()
            }) {
                Image(systemName: isChecked ? "checkmark.square.fill" : "square")
                    .font(.system(size: 20))
                    .foregroundColor(isChecked ? Color(hex: "#14b8a6") : .gray)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(title)
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    if let onLearnMore = onLearnMore {
                        Button("Learn more") {
                            onLearnMore()
                        }
                        .font(.custom("Inter", size: 12))
                        .foregroundColor(Color(hex: "#14b8a6"))
                    }
                    
                    Spacer()
                }
                
                Text(description)
                    .font(.custom("Inter", size: 12))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
            }
        }
        .padding(12)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
}

// MARK: - Data Usage Item Component
struct DataUsageItem: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Color(hex: "#14b8a6"))
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.custom("Inter", size: 14))
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Text(description)
                    .font(.custom("Inter", size: 12))
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

// MARK: - Privacy Policy View
struct PrivacyPolicyView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Privacy Policy")
                        .font(.custom("Inter", size: 24))
                        .fontWeight(.bold)
                        .padding(.horizontal)
                    
                    Text("Last updated: \(Date().formatted(date: .abbreviated, time: .omitted))")
                        .font(.custom("Inter", size: 14))
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                    
                    // Privacy policy content would go here
                    Text("Your privacy is important to us. This privacy policy explains how HealthCoachAI collects, uses, and protects your information...")
                        .font(.custom("Inter", size: 14))
                        .padding(.horizontal)
                    
                    Spacer(minLength: 100)
                }
            }
            .navigationBarItems(trailing: Button("Done") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}

// MARK: - Terms of Service View
struct TermsOfServiceView: View {
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Terms of Service")
                        .font(.custom("Inter", size: 24))
                        .fontWeight(.bold)
                        .padding(.horizontal)
                    
                    Text("Last updated: \(Date().formatted(date: .abbreviated, time: .omitted))")
                        .font(.custom("Inter", size: 14))
                        .foregroundColor(.secondary)
                        .padding(.horizontal)
                    
                    // Terms content would go here
                    Text("By using HealthCoachAI, you agree to these terms of service...")
                        .font(.custom("Inter", size: 14))
                        .padding(.horizontal)
                    
                    Spacer(minLength: 100)
                }
            }
            .navigationBarItems(trailing: Button("Done") {
                presentationMode.wrappedValue.dismiss()
            })
        }
    }
}

// MARK: - Lifestyle View with Real Implementation
struct OnboardingLifestyleView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    @State private var selectedActivityLevel: String = "moderately_active"
    @State private var smokingFrequency: Int = 0
    @State private var alcoholFrequency: Int = 0
    @State private var sleepHours: Double = 8.0
    @State private var jobActivityLevel: Int = 3
    @State private var eatingOutFrequency: Int = 3
    @State private var stressLevel: Int = 5
    @State private var waterIntake: Double = 2.5
    
    let activityLevels = [
        ("sedentary", "Sedentary", "Little to no exercise"),
        ("lightly_active", "Lightly Active", "Light exercise 1-3 days/week"),
        ("moderately_active", "Moderately Active", "Moderate exercise 3-5 days/week"),
        ("very_active", "Very Active", "Hard exercise 6-7 days/week"),
        ("extremely_active", "Extremely Active", "Very hard exercise & physical job")
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            OnboardingProgressBar(
                progress: coordinator.progress,
                currentStep: coordinator.currentStep.rawValue + 1,
                totalSteps: 6
            )
            .padding(.horizontal, 20)
            
            OnboardingHeader(
                title: "Your Lifestyle",
                subtitle: "Tell us about your daily habits and routines",
                showBackButton: true,
                onBack: { coordinator.previousStep() }
            )
            .padding(.horizontal, 20)
            
            ScrollView {
                VStack(spacing: 24) {
                    // Activity Level
                    activityLevelSection
                    
                    // Sleep & Rest
                    sleepSection
                    
                    // Habits
                    habitsSection
                    
                    // Daily Wellness
                    wellnessSection
                }
                .padding(.horizontal, 20)
            }
            
            VStack(spacing: 16) {
                OnboardingPrimaryButton(
                    title: "Continue",
                    isEnabled: true,
                    isLoading: coordinator.isLoading
                ) {
                    saveAndContinue()
                }
                
                OnboardingSkipButton {
                    coordinator.skipStep()
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .onAppear {
            loadSavedData()
        }
    }
    
    // MARK: - Activity Level Section
    private var activityLevelSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Activity Level")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("How physically active are you?")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            VStack(spacing: 8) {
                ForEach(activityLevels, id: \.0) { level in
                    ActivityLevelCard(
                        id: level.0,
                        title: level.1,
                        description: level.2,
                        isSelected: selectedActivityLevel == level.0
                    ) {
                        selectedActivityLevel = level.0
                    }
                }
            }
        }
    }
    
    // MARK: - Sleep Section
    private var sleepSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Sleep & Rest")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                SliderCard(
                    title: "Average Sleep Hours",
                    value: $sleepHours,
                    range: 4...12,
                    step: 0.5,
                    unit: "hours",
                    icon: "moon.fill"
                )
                
                RatingCard(
                    title: "Job Activity Level",
                    value: $jobActivityLevel,
                    description: "How physically demanding is your job?",
                    icon: "briefcase.fill",
                    labels: ["Desk", "Light", "Moderate", "Active", "Heavy"]
                )
            }
        }
    }
    
    // MARK: - Habits Section
    private var habitsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Habits")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                RatingCard(
                    title: "Smoking Frequency",
                    value: $smokingFrequency,
                    description: "How often do you smoke?",
                    icon: "lungs.fill",
                    labels: ["Never", "Rarely", "Sometimes", "Often", "Daily"]
                )
                
                RatingCard(
                    title: "Alcohol Consumption",
                    value: $alcoholFrequency,
                    description: "How often do you drink alcohol?",
                    icon: "wineglass.fill",
                    labels: ["Never", "Rarely", "Sometimes", "Often", "Daily"]
                )
                
                RatingCard(
                    title: "Eating Out Frequency",
                    value: $eatingOutFrequency,
                    description: "How often do you eat outside?",
                    icon: "fork.knife",
                    labels: ["Never", "Rarely", "Sometimes", "Often", "Daily"]
                )
            }
        }
    }
    
    // MARK: - Wellness Section
    private var wellnessSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Daily Wellness")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                RatingCard(
                    title: "Stress Level",
                    value: $stressLevel,
                    description: "How would you rate your typical stress level?",
                    icon: "brain.head.profile",
                    labels: ["Very Low", "Low", "Moderate", "High", "Very High"]
                )
                
                SliderCard(
                    title: "Daily Water Intake",
                    value: $waterIntake,
                    range: 1...5,
                    step: 0.5,
                    unit: "liters",
                    icon: "drop.fill"
                )
            }
        }
    }
    
    // MARK: - Helper Methods
    private func loadSavedData() {
        // Load data from coordinator
        selectedActivityLevel = coordinator.onboardingData.activityLevel
        smokingFrequency = coordinator.onboardingData.smokingFrequency
        alcoholFrequency = coordinator.onboardingData.alcoholFrequency
        sleepHours = coordinator.onboardingData.sleepHours
        jobActivityLevel = coordinator.onboardingData.jobActivityLevel
        eatingOutFrequency = coordinator.onboardingData.eatingOutFrequency
        stressLevel = coordinator.onboardingData.stressLevel
        waterIntake = coordinator.onboardingData.waterIntake
    }
    
    private func saveAndContinue() {
        // Save data to coordinator
        coordinator.onboardingData.activityLevel = selectedActivityLevel
        coordinator.onboardingData.smokingFrequency = smokingFrequency
        coordinator.onboardingData.alcoholFrequency = alcoholFrequency
        coordinator.onboardingData.sleepHours = sleepHours
        coordinator.onboardingData.jobActivityLevel = jobActivityLevel
        coordinator.onboardingData.eatingOutFrequency = eatingOutFrequency
        coordinator.onboardingData.stressLevel = stressLevel
        coordinator.onboardingData.waterIntake = waterIntake
        
        // Save to API
        Task {
            await coordinator.saveLifestyle()
        }
    }
}

// MARK: - Activity Level Card Component
struct ActivityLevelCard: View {
    let id: String
    let title: String
    let description: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.custom("Inter", size: 12))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? Color(hex: "#14b8a6") : .gray)
            }
            .padding(12)
            .background(isSelected ? Color(hex: "#14b8a6").opacity(0.1) : Color.gray.opacity(0.05))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color(hex: "#14b8a6") : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Slider Card Component
struct SliderCard: View {
    let title: String
    @Binding var value: Double
    let range: ClosedRange<Double>
    let step: Double
    let unit: String
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(Color(hex: "#14b8a6"))
                
                Text(title)
                    .font(.custom("Inter", size: 14))
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("\(value, specifier: "%.1f") \(unit)")
                    .font(.custom("Inter", size: 14))
                    .fontWeight(.semibold)
                    .foregroundColor(Color(hex: "#14b8a6"))
            }
            
            Slider(value: $value, in: range, step: step)
                .accentColor(Color(hex: "#14b8a6"))
        }
        .padding(12)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
}

// MARK: - Rating Card Component
struct RatingCard: View {
    let title: String
    @Binding var value: Int
    let description: String
    let icon: String
    let labels: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(Color(hex: "#14b8a6"))
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.custom("Inter", size: 12))
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            HStack {
                ForEach(0..<labels.count, id: \.self) { index in
                    Button(action: {
                        value = index
                    }) {
                        VStack(spacing: 4) {
                            Circle()
                                .fill(value == index ? Color(hex: "#14b8a6") : Color.gray.opacity(0.3))
                                .frame(width: 12, height: 12)
                            
                            Text(labels[index])
                                .font(.custom("Inter", size: 10))
                                .foregroundColor(value == index ? Color(hex: "#14b8a6") : .secondary)
                                .multilineTextAlignment(.center)
                        }
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    if index < labels.count - 1 {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 1)
                            .frame(maxWidth: .infinity)
                    }
                }
            }
        }
        .padding(12)
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
}

// MARK: - Health View with Real Implementation  
struct OnboardingHealthView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    @State private var selectedHealthConditions: Set<String> = []
    @State private var bloodPressureSystolic: String = "120"
    @State private var bloodPressureDiastolic: String = "80"
    @State private var fastingBloodSugar: String = "90"
    @State private var emergencyContactName: String = ""
    @State private var emergencyContactPhone: String = ""
    @State private var showHealthConditionsPicker: Bool = false
    
    let healthConditions = [
        "diabetes", "prediabetes", "hypertension", "high_cholesterol",
        "heart_disease", "thyroid_disorder", "kidney_disease", "liver_disease",
        "arthritis", "asthma", "depression", "anxiety", "migraine", "sleep_apnea"
    ]
    
    let healthConditionLabels: [String: String] = [
        "diabetes": "Diabetes",
        "prediabetes": "Pre-diabetes", 
        "hypertension": "High Blood Pressure",
        "high_cholesterol": "High Cholesterol",
        "heart_disease": "Heart Disease",
        "thyroid_disorder": "Thyroid Disorder",
        "kidney_disease": "Kidney Disease",
        "liver_disease": "Liver Disease",
        "arthritis": "Arthritis",
        "asthma": "Asthma",
        "depression": "Depression",
        "anxiety": "Anxiety",
        "migraine": "Migraine",
        "sleep_apnea": "Sleep Apnea"
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            OnboardingProgressBar(
                progress: coordinator.progress,
                currentStep: coordinator.currentStep.rawValue + 1,
                totalSteps: 6
            )
            .padding(.horizontal, 20)
            
            OnboardingHeader(
                title: "Health Information",
                subtitle: "Help us understand your health profile for better recommendations",
                showBackButton: true,
                onBack: { coordinator.previousStep() }
            )
            .padding(.horizontal, 20)
            
            ScrollView {
                VStack(spacing: 24) {
                    // Health Conditions
                    healthConditionsSection
                    
                    // Vital Signs
                    vitalSignsSection
                    
                    // Emergency Contact
                    emergencyContactSection
                }
                .padding(.horizontal, 20)
            }
            
            VStack(spacing: 16) {
                OnboardingPrimaryButton(
                    title: "Continue",
                    isEnabled: true,
                    isLoading: coordinator.isLoading
                ) {
                    saveAndContinue()
                }
                
                OnboardingSkipButton {
                    coordinator.skipStep()
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .onAppear {
            loadSavedData()
        }
        .sheet(isPresented: $showHealthConditionsPicker) {
            HealthConditionsPickerView(
                selectedConditions: $selectedHealthConditions,
                availableConditions: healthConditions,
                labels: healthConditionLabels
            )
        }
    }
    
    // MARK: - Health Conditions Section
    private var healthConditionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Health Conditions")
                    .font(.custom("Inter", size: 18))
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("Optional")
                    .font(.custom("Inter", size: 12))
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(4)
            }
            
            Text("Select any health conditions you have. This helps us provide safer recommendations.")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            Button(action: { showHealthConditionsPicker = true }) {
                HStack {
                    if selectedHealthConditions.isEmpty {
                        Text("Select health conditions")
                            .foregroundColor(.secondary)
                    } else {
                        Text("\(selectedHealthConditions.count) condition(s) selected")
                            .foregroundColor(.primary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .padding(12)
                .background(Color.gray.opacity(0.05))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
            }
            .buttonStyle(PlainButtonStyle())
            
            // Selected conditions display
            if !selectedHealthConditions.isEmpty {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 8) {
                    ForEach(Array(selectedHealthConditions), id: \.self) { condition in
                        Text(healthConditionLabels[condition] ?? condition)
                            .font(.custom("Inter", size: 12))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(hex: "#14b8a6").opacity(0.1))
                            .foregroundColor(Color(hex: "#14b8a6"))
                            .cornerRadius(4)
                    }
                }
            }
        }
    }
    
    // MARK: - Vital Signs Section
    private var vitalSignsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Vital Signs")
                    .font(.custom("Inter", size: 18))
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("Optional")
                    .font(.custom("Inter", size: 12))
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(4)
            }
            
            Text("Recent readings help us provide personalized recommendations.")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            VStack(spacing: 16) {
                // Blood Pressure
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.red)
                        
                        Text("Blood Pressure")
                            .font(.custom("Inter", size: 14))
                            .fontWeight(.medium)
                    }
                    
                    HStack(spacing: 8) {
                        TextField("120", text: $bloodPressureSystolic)
                            .keyboardType(.numberPad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 80)
                        
                        Text("/")
                            .font(.custom("Inter", size: 16))
                            .fontWeight(.semibold)
                        
                        TextField("80", text: $bloodPressureDiastolic)
                            .keyboardType(.numberPad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 80)
                        
                        Text("mmHg")
                            .font(.custom("Inter", size: 14))
                            .foregroundColor(.secondary)
                        
                        Spacer()
                    }
                }
                
                // Blood Sugar
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "drop.fill")
                            .font(.system(size: 16))
                            .foregroundColor(.orange)
                        
                        Text("Fasting Blood Sugar")
                            .font(.custom("Inter", size: 14))
                            .fontWeight(.medium)
                    }
                    
                    HStack {
                        TextField("90", text: $fastingBloodSugar)
                            .keyboardType(.numberPad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 80)
                        
                        Text("mg/dL")
                            .font(.custom("Inter", size: 14))
                            .foregroundColor(.secondary)
                        
                        Spacer()
                    }
                }
            }
            .padding(12)
            .background(Color.gray.opacity(0.05))
            .cornerRadius(8)
        }
    }
    
    // MARK: - Emergency Contact Section
    private var emergencyContactSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Emergency Contact")
                    .font(.custom("Inter", size: 18))
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Text("Optional")
                    .font(.custom("Inter", size: 12))
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(4)
            }
            
            Text("In case of emergency while using our fitness recommendations.")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            VStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Contact Name")
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                    
                    TextField("Enter name", text: $emergencyContactName)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
                
                VStack(alignment: .leading, spacing: 8) {
                    Text("Phone Number")
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                    
                    TextField("Enter phone number", text: $emergencyContactPhone)
                        .keyboardType(.phonePad)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                }
            }
            .padding(12)
            .background(Color.gray.opacity(0.05))
            .cornerRadius(8)
        }
    }
    
    // MARK: - Helper Methods
    private func loadSavedData() {
        selectedHealthConditions = Set(coordinator.onboardingData.healthConditions)
        bloodPressureSystolic = String(coordinator.onboardingData.bloodPressureSystolic)
        bloodPressureDiastolic = String(coordinator.onboardingData.bloodPressureDiastolic)
        fastingBloodSugar = String(coordinator.onboardingData.fastingBloodSugar)
        emergencyContactName = coordinator.onboardingData.emergencyContactName
        emergencyContactPhone = coordinator.onboardingData.emergencyContactPhone
    }
    
    private func saveAndContinue() {
        // Validate and convert inputs
        let systolic = Int(bloodPressureSystolic) ?? 120
        let diastolic = Int(bloodPressureDiastolic) ?? 80
        let bloodSugar = Int(fastingBloodSugar) ?? 90
        
        // Save to coordinator
        coordinator.onboardingData.healthConditions = Array(selectedHealthConditions)
        coordinator.onboardingData.bloodPressureSystolic = systolic
        coordinator.onboardingData.bloodPressureDiastolic = diastolic
        coordinator.onboardingData.fastingBloodSugar = bloodSugar
        coordinator.onboardingData.emergencyContactName = emergencyContactName
        coordinator.onboardingData.emergencyContactPhone = emergencyContactPhone
        
        // Save to API
        Task {
            await coordinator.saveHealth()
        }
    }
}

// MARK: - Health Conditions Picker View
struct HealthConditionsPickerView: View {
    @Binding var selectedConditions: Set<String>
    let availableConditions: [String]
    let labels: [String: String]
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            List {
                ForEach(availableConditions, id: \.self) { condition in
                    Button(action: {
                        if selectedConditions.contains(condition) {
                            selectedConditions.remove(condition)
                        } else {
                            selectedConditions.insert(condition)
                        }
                    }) {
                        HStack {
                            Text(labels[condition] ?? condition)
                                .foregroundColor(.primary)
                            
                            Spacer()
                            
                            if selectedConditions.contains(condition) {
                                Image(systemName: "checkmark")
                                    .foregroundColor(Color(hex: "#14b8a6"))
                            }
                        }
                    }
                }
            }
            .navigationTitle("Health Conditions")
            .navigationBarItems(
                leading: Button("Clear All") {
                    selectedConditions.removeAll()
                },
                trailing: Button("Done") {
                    presentationMode.wrappedValue.dismiss()
                }
            )
        }
    }
}

// MARK: - Preferences View with Real Implementation
struct OnboardingPreferencesView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    @State private var selectedDietaryPreference: String = "vegetarian"
    @State private var selectedCuisines: Set<String> = []
    @State private var selectedAllergens: Set<String> = []
    @State private var spiceTolerance: String = "medium"
    @State private var favoriteIngredients: Set<String> = []
    @State private var dislikedIngredients: Set<String> = []
    @State private var mealsPerDay: Int = 3
    @State private var cookingSkillLevel: Int = 3
    
    let dietaryPreferences = [
        ("vegetarian", "Vegetarian", "No meat, fish, or poultry"),
        ("vegan", "Vegan", "No animal products"),
        ("non_vegetarian", "Non-Vegetarian", "Includes all foods"),
        ("pescatarian", "Pescatarian", "Vegetarian + fish"),
        ("keto", "Keto", "Low carb, high fat"),
        ("paleo", "Paleo", "Whole foods, no processed")
    ]
    
    let cuisineTypes = [
        "indian", "chinese", "italian", "mexican", "thai", "japanese",
        "mediterranean", "american", "french", "korean", "vietnamese", "greek"
    ]
    
    let commonAllergens = [
        "nuts", "dairy", "eggs", "shellfish", "fish", "soy", "wheat", "sesame"
    ]
    
    let spiceToleranceLevels = [
        ("mild", "Mild", "Very little spice"),
        ("medium", "Medium", "Moderate spice level"),
        ("hot", "Hot", "Spicy food lover"),
        ("very_hot", "Very Hot", "Extra spicy preferred")
    ]
    
    let commonIngredients = [
        "quinoa", "spinach", "broccoli", "chicken", "salmon", "tofu",
        "avocado", "sweet_potato", "brown_rice", "lentils", "chickpeas", "oats"
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            OnboardingProgressBar(
                progress: coordinator.progress,
                currentStep: coordinator.currentStep.rawValue + 1,
                totalSteps: 6
            )
            .padding(.horizontal, 20)
            
            OnboardingHeader(
                title: "Food Preferences",
                subtitle: "Tell us about your dietary preferences and restrictions",
                showBackButton: true,
                onBack: { coordinator.previousStep() }
            )
            .padding(.horizontal, 20)
            
            ScrollView {
                VStack(spacing: 24) {
                    // Dietary Preference
                    dietaryPreferenceSection
                    
                    // Allergies & Restrictions
                    allergiesSection
                    
                    // Cuisine Preferences
                    cuisineSection
                    
                    // Spice Tolerance
                    spiceToleranceSection
                    
                    // Ingredients
                    ingredientsSection
                    
                    // Cooking Preferences
                    cookingSection
                }
                .padding(.horizontal, 20)
            }
            
            VStack(spacing: 16) {
                OnboardingPrimaryButton(
                    title: "Continue",
                    isEnabled: true,
                    isLoading: coordinator.isLoading
                ) {
                    saveAndContinue()
                }
                
                OnboardingSkipButton {
                    coordinator.skipStep()
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .onAppear {
            loadSavedData()
        }
    }
    
    // MARK: - Dietary Preference Section
    private var dietaryPreferenceSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Dietary Preference")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Choose your primary dietary preference")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            VStack(spacing: 8) {
                ForEach(dietaryPreferences, id: \.0) { preference in
                    SelectionCard(
                        id: preference.0,
                        title: preference.1,
                        description: preference.2,
                        isSelected: selectedDietaryPreference == preference.0
                    ) {
                        selectedDietaryPreference = preference.0
                    }
                }
            }
        }
    }
    
    // MARK: - Allergies Section
    private var allergiesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Allergies & Restrictions")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Select any food allergies or restrictions")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 8) {
                ForEach(commonAllergens, id: \.self) { allergen in
                    ToggleChip(
                        title: allergen.capitalized,
                        isSelected: selectedAllergens.contains(allergen)
                    ) {
                        if selectedAllergens.contains(allergen) {
                            selectedAllergens.remove(allergen)
                        } else {
                            selectedAllergens.insert(allergen)
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Cuisine Section
    private var cuisineSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Favorite Cuisines")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Choose cuisines you enjoy (select multiple)")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                ForEach(cuisineTypes, id: \.self) { cuisine in
                    ToggleChip(
                        title: cuisine.capitalized,
                        isSelected: selectedCuisines.contains(cuisine)
                    ) {
                        if selectedCuisines.contains(cuisine) {
                            selectedCuisines.remove(cuisine)
                        } else {
                            selectedCuisines.insert(cuisine)
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Spice Tolerance Section
    private var spiceToleranceSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Spice Tolerance")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("How much spice do you prefer?")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            VStack(spacing: 8) {
                ForEach(spiceToleranceLevels, id: \.0) { level in
                    SelectionCard(
                        id: level.0,
                        title: level.1,
                        description: level.2,
                        isSelected: spiceTolerance == level.0
                    ) {
                        spiceTolerance = level.0
                    }
                }
            }
        }
    }
    
    // MARK: - Ingredients Section
    private var ingredientsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Ingredient Preferences")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Favorite Ingredients")
                    .font(.custom("Inter", size: 14))
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
                
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                    ForEach(commonIngredients, id: \.self) { ingredient in
                        ToggleChip(
                            title: ingredient.replacingOccurrences(of: "_", with: " ").capitalized,
                            isSelected: favoriteIngredients.contains(ingredient)
                        ) {
                            if favoriteIngredients.contains(ingredient) {
                                favoriteIngredients.remove(ingredient)
                            } else {
                                favoriteIngredients.insert(ingredient)
                            }
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Cooking Section
    private var cookingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Cooking Preferences")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                SliderCard(
                    title: "Meals per Day",
                    value: Binding(
                        get: { Double(mealsPerDay) },
                        set: { mealsPerDay = Int($0) }
                    ),
                    range: 2...6,
                    step: 1,
                    unit: "meals",
                    icon: "fork.knife"
                )
                
                RatingCard(
                    title: "Cooking Skill Level",
                    value: $cookingSkillLevel,
                    description: "How would you rate your cooking skills?",
                    icon: "flame.fill",
                    labels: ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"]
                )
            }
        }
    }
    
    // MARK: - Helper Methods
    private func loadSavedData() {
        selectedDietaryPreference = coordinator.onboardingData.dietaryPreference
        selectedCuisines = Set(coordinator.onboardingData.favoriteCuisines)
        selectedAllergens = Set(coordinator.onboardingData.allergens)
        spiceTolerance = coordinator.onboardingData.spiceTolerance
        favoriteIngredients = Set(coordinator.onboardingData.favoriteIngredients)
        dislikedIngredients = Set(coordinator.onboardingData.dislikedIngredients)
        mealsPerDay = coordinator.onboardingData.mealsPerDay
        cookingSkillLevel = coordinator.onboardingData.cookingSkillLevel
    }
    
    private func saveAndContinue() {
        // Save to coordinator
        coordinator.onboardingData.dietaryPreference = selectedDietaryPreference
        coordinator.onboardingData.favoriteCuisines = Array(selectedCuisines)
        coordinator.onboardingData.allergens = Array(selectedAllergens)
        coordinator.onboardingData.spiceTolerance = spiceTolerance
        coordinator.onboardingData.favoriteIngredients = Array(favoriteIngredients)
        coordinator.onboardingData.dislikedIngredients = Array(dislikedIngredients)
        coordinator.onboardingData.mealsPerDay = mealsPerDay
        coordinator.onboardingData.cookingSkillLevel = cookingSkillLevel
        
        // Save to API
        Task {
            await coordinator.savePreferences()
        }
    }
}

// MARK: - Selection Card Component
struct SelectionCard: View {
    let id: String
    let title: String
    let description: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    Text(description)
                        .font(.custom("Inter", size: 12))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.leading)
                }
                
                Spacer()
                
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundColor(isSelected ? Color(hex: "#14b8a6") : .gray)
            }
            .padding(12)
            .background(isSelected ? Color(hex: "#14b8a6").opacity(0.1) : Color.gray.opacity(0.05))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color(hex: "#14b8a6") : Color.clear, lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Toggle Chip Component
struct ToggleChip: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            Text(title)
                .font(.custom("Inter", size: 12))
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isSelected ? Color(hex: "#14b8a6") : Color.gray.opacity(0.1))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(16)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Goals View with Real Implementation
struct OnboardingGoalsView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    @State private var selectedPrimaryGoal: String = "weight_loss"
    @State private var goalPriority: String = "medium"
    @State private var intensity: String = "moderate"
    @State private var targetWeight: String = "65"
    @State private var targetDate: Date = Calendar.current.date(byAdding: .month, value: 6, to: Date()) ?? Date()
    @State private var dailyCalorieTarget: String = "1800"
    @State private var weeklyExerciseTarget: String = "150"
    @State private var motivation: String = ""
    @State private var showMotivationSheet: Bool = false
    
    let primaryGoals = [
        ("weight_loss", "Weight Loss", "Lose weight and reduce body fat", "minus.circle.fill"),
        ("weight_gain", "Weight Gain", "Gain healthy weight and muscle", "plus.circle.fill"),
        ("muscle_building", "Muscle Building", "Build lean muscle mass", "figure.strengthtraining.traditional"),
        ("fitness_improvement", "Fitness", "Improve overall fitness", "heart.fill"),
        ("health_maintenance", "Maintenance", "Maintain current health", "checkmark.shield.fill"),
        ("disease_management", "Health Management", "Manage health conditions", "cross.circle.fill")
    ]
    
    let priorityLevels = [
        ("low", "Low Priority", "Gradual changes, flexible approach"),
        ("medium", "Medium Priority", "Steady progress with consistency"),
        ("high", "High Priority", "Focused commitment and dedication")
    ]
    
    let intensityLevels = [
        ("gentle", "Gentle", "Light changes, easy to follow"),
        ("moderate", "Moderate", "Balanced approach with regular effort"),
        ("intense", "Intense", "Aggressive changes for faster results")
    ]
    
    var body: some View {
        VStack(spacing: 24) {
            OnboardingProgressBar(
                progress: coordinator.progress,
                currentStep: coordinator.currentStep.rawValue + 1,
                totalSteps: 6
            )
            .padding(.horizontal, 20)
            
            OnboardingHeader(
                title: "Your Goals",
                subtitle: "What would you like to achieve on your health journey?",
                showBackButton: true,
                onBack: { coordinator.previousStep() }
            )
            .padding(.horizontal, 20)
            
            ScrollView {
                VStack(spacing: 24) {
                    // Primary Goal
                    primaryGoalSection
                    
                    // Goal Details
                    goalDetailsSection
                    
                    // Target Settings
                    targetSettingsSection
                    
                    // Exercise Goal
                    exerciseGoalSection
                    
                    // Motivation
                    motivationSection
                }
                .padding(.horizontal, 20)
            }
            
            OnboardingPrimaryButton(
                title: "Complete Setup",
                isEnabled: true,
                isLoading: coordinator.isLoading
            ) {
                saveAndComplete()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .onAppear {
            loadSavedData()
        }
        .sheet(isPresented: $showMotivationSheet) {
            MotivationInputView(motivation: $motivation)
        }
    }
    
    // MARK: - Primary Goal Section
    private var primaryGoalSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Primary Goal")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("Choose your main health goal")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(primaryGoals, id: \.0) { goal in
                    GoalCard(
                        id: goal.0,
                        title: goal.1,
                        description: goal.2,
                        icon: goal.3,
                        isSelected: selectedPrimaryGoal == goal.0
                    ) {
                        selectedPrimaryGoal = goal.0
                    }
                }
            }
        }
    }
    
    // MARK: - Goal Details Section
    private var goalDetailsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Goal Details")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 12) {
                // Priority
                VStack(alignment: .leading, spacing: 8) {
                    Text("Priority Level")
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                    
                    VStack(spacing: 8) {
                        ForEach(priorityLevels, id: \.0) { priority in
                            SelectionCard(
                                id: priority.0,
                                title: priority.1,
                                description: priority.2,
                                isSelected: goalPriority == priority.0
                            ) {
                                goalPriority = priority.0
                            }
                        }
                    }
                }
                
                // Intensity
                VStack(alignment: .leading, spacing: 8) {
                    Text("Intensity Level")
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                    
                    VStack(spacing: 8) {
                        ForEach(intensityLevels, id: \.0) { intensityLevel in
                            SelectionCard(
                                id: intensityLevel.0,
                                title: intensityLevel.1,
                                description: intensityLevel.2,
                                isSelected: intensity == intensityLevel.0
                            ) {
                                intensity = intensityLevel.0
                            }
                        }
                    }
                }
            }
        }
    }
    
    // MARK: - Target Settings Section
    private var targetSettingsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Target Settings")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(spacing: 16) {
                // Target Weight (if applicable)
                if selectedPrimaryGoal == "weight_loss" || selectedPrimaryGoal == "weight_gain" {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Target Weight")
                            .font(.custom("Inter", size: 14))
                            .fontWeight(.medium)
                        
                        HStack {
                            TextField("65", text: $targetWeight)
                                .keyboardType(.decimalPad)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .frame(width: 80)
                            
                            Text("kg")
                                .font(.custom("Inter", size: 14))
                                .foregroundColor(.secondary)
                            
                            Spacer()
                        }
                    }
                }
                
                // Target Date
                VStack(alignment: .leading, spacing: 8) {
                    Text("Target Date")
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                    
                    DatePicker("", selection: $targetDate, in: Date()..., displayedComponents: .date)
                        .datePickerStyle(CompactDatePickerStyle())
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                
                // Daily Calorie Target
                VStack(alignment: .leading, spacing: 8) {
                    Text("Daily Calorie Target")
                        .font(.custom("Inter", size: 14))
                        .fontWeight(.medium)
                    
                    HStack {
                        TextField("1800", text: $dailyCalorieTarget)
                            .keyboardType(.numberPad)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .frame(width: 100)
                        
                        Text("calories")
                            .font(.custom("Inter", size: 14))
                            .foregroundColor(.secondary)
                        
                        Spacer()
                    }
                }
            }
            .padding(12)
            .background(Color.gray.opacity(0.05))
            .cornerRadius(8)
        }
    }
    
    // MARK: - Exercise Goal Section
    private var exerciseGoalSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Exercise Goal")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Weekly Exercise Target")
                    .font(.custom("Inter", size: 14))
                    .fontWeight(.medium)
                
                Text("Recommended: 150 minutes of moderate activity per week")
                    .font(.custom("Inter", size: 12))
                    .foregroundColor(.secondary)
                
                HStack {
                    TextField("150", text: $weeklyExerciseTarget)
                        .keyboardType(.numberPad)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(width: 100)
                    
                    Text("minutes per week")
                        .font(.custom("Inter", size: 14))
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
            }
            .padding(12)
            .background(Color.gray.opacity(0.05))
            .cornerRadius(8)
        }
    }
    
    // MARK: - Motivation Section
    private var motivationSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Motivation")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("What motivates you to achieve this goal? (Optional)")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
            
            Button(action: { showMotivationSheet = true }) {
                HStack {
                    if motivation.isEmpty {
                        Text("Add your motivation...")
                            .foregroundColor(.secondary)
                    } else {
                        Text(motivation)
                            .foregroundColor(.primary)
                            .lineLimit(2)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "pencil")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .padding(12)
                .background(Color.gray.opacity(0.05))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                )
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
    
    // MARK: - Helper Methods
    private func loadSavedData() {
        selectedPrimaryGoal = coordinator.onboardingData.primaryGoal
        goalPriority = coordinator.onboardingData.goalPriority
        intensity = coordinator.onboardingData.intensity
        targetWeight = String(coordinator.onboardingData.targetWeight)
        targetDate = coordinator.onboardingData.targetDate
        dailyCalorieTarget = String(coordinator.onboardingData.dailyCalorieTarget)
        weeklyExerciseTarget = String(coordinator.onboardingData.weeklyExerciseTarget)
        motivation = coordinator.onboardingData.motivation
    }
    
    private func saveAndComplete() {
        // Validate and convert inputs
        let weight = Double(targetWeight) ?? 65.0
        let calorieTarget = Int(dailyCalorieTarget) ?? 1800
        let exerciseTarget = Int(weeklyExerciseTarget) ?? 150
        
        // Save to coordinator
        coordinator.onboardingData.primaryGoal = selectedPrimaryGoal
        coordinator.onboardingData.goalPriority = goalPriority
        coordinator.onboardingData.intensity = intensity
        coordinator.onboardingData.targetWeight = weight
        coordinator.onboardingData.targetDate = targetDate
        coordinator.onboardingData.dailyCalorieTarget = calorieTarget
        coordinator.onboardingData.weeklyExerciseTarget = exerciseTarget
        coordinator.onboardingData.motivation = motivation
        
        // Save to API and complete onboarding
        Task {
            await coordinator.saveGoals()
        }
    }
}

// MARK: - Goal Card Component
struct GoalCard: View {
    let id: String
    let title: String
    let description: String
    let icon: String
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundColor(isSelected ? .white : Color(hex: "#14b8a6"))
                
                Text(title)
                    .font(.custom("Inter", size: 14))
                    .fontWeight(.semibold)
                    .foregroundColor(isSelected ? .white : .primary)
                    .multilineTextAlignment(.center)
                
                Text(description)
                    .font(.custom("Inter", size: 11))
                    .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
            }
            .padding(12)
            .frame(maxWidth: .infinity, minHeight: 100)
            .background(isSelected ? Color(hex: "#14b8a6") : Color.gray.opacity(0.05))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color(hex: "#14b8a6") : Color.gray.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - Motivation Input View
struct MotivationInputView: View {
    @Binding var motivation: String
    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        NavigationView {
            VStack(alignment: .leading, spacing: 16) {
                Text("What motivates you?")
                    .font(.custom("Inter", size: 18))
                    .fontWeight(.semibold)
                    .padding(.horizontal)
                
                Text("Share what drives you to achieve your health goals. This will help us provide personalized encouragement.")
                    .font(.custom("Inter", size: 14))
                    .foregroundColor(.secondary)
                    .padding(.horizontal)
                
                TextEditor(text: $motivation)
                    .font(.custom("Inter", size: 14))
                    .padding(12)
                    .background(Color.gray.opacity(0.05))
                    .cornerRadius(8)
                    .padding(.horizontal)
                
                Spacer()
            }
            .navigationTitle("Motivation")
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("Save") {
                    presentationMode.wrappedValue.dismiss()
                }
            )
        }
    }
}

// MARK: - Complete View
struct OnboardingCompleteView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    
    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            // Success animation
            VStack(spacing: 24) {
                ZStack {
                    Circle()
                        .fill(Color(hex: "#14b8a6").opacity(0.1))
                        .frame(width: 120, height: 120)
                    
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 60))
                        .foregroundColor(Color(hex: "#14b8a6"))
                }
                
                VStack(spacing: 12) {
                    Text("Setup Complete!")
                        .font(.custom("Inter", size: 32))
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text("Welcome to your personalized health journey")
                        .font(.custom("Inter", size: 16))
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }
            }
            
            Spacer()
            
            Text("Get ready to discover personalized insights, meal plans, and fitness routines tailored just for you.")
                .font(.custom("Inter", size: 16))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
            
            Spacer()
        }
    }
}