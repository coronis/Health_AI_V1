import SwiftUI

// MARK: - Real Auth View Implementation
struct OnboardingAuthFormView: View {
    @EnvironmentObject var coordinator: OnboardingCoordinator
    @State private var phoneNumber: String = ""
    @State private var otp: String = ""
    @State private var isOTPSent: Bool = false
    @State private var isLoading: Bool = false
    @State private var errorMessage: String = ""
    @State private var countryCode: String = "+91"
    @State private var otpTimer: Int = 30
    @State private var timer: Timer?
    
    var body: some View {
        VStack(spacing: 24) {
            OnboardingProgressBar(
                progress: coordinator.progress,
                currentStep: coordinator.currentStep.rawValue + 1,
                totalSteps: 6
            )
            .padding(.horizontal, 20)
            
            OnboardingHeader(
                title: "Welcome Back",
                subtitle: "Sign in to continue your health journey",
                showBackButton: true,
                onBack: { coordinator.previousStep() }
            )
            .padding(.horizontal, 20)
            
            Spacer()
            
            VStack(spacing: 20) {
                if !isOTPSent {
                    // Phone Number Input
                    phoneNumberSection
                } else {
                    // OTP Input
                    otpSection
                }
                
                if !errorMessage.isEmpty {
                    Text(errorMessage)
                        .font(.custom("Inter", size: 14))
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(.horizontal, 20)
            
            Spacer()
            
            VStack(spacing: 16) {
                OnboardingPrimaryButton(
                    title: isOTPSent ? "Verify OTP" : "Send OTP",
                    isEnabled: isOTPSent ? !otp.isEmpty : isValidPhoneNumber,
                    isLoading: isLoading
                ) {
                    if isOTPSent {
                        verifyOTP()
                    } else {
                        sendOTP()
                    }
                }
                
                if isOTPSent {
                    HStack {
                        Text("Didn't receive OTP?")
                            .font(.custom("Inter", size: 14))
                            .foregroundColor(.secondary)
                        
                        Button(action: resendOTP) {
                            Text(otpTimer > 0 ? "Resend in \(otpTimer)s" : "Resend OTP")
                                .font(.custom("Inter", size: 14))
                                .fontWeight(.medium)
                                .foregroundColor(otpTimer > 0 ? .secondary : Color(hex: "#14b8a6"))
                        }
                        .disabled(otpTimer > 0)
                    }
                }
                
                Button("Skip for now") {
                    coordinator.skipStep()
                }
                .font(.custom("Inter", size: 16))
                .foregroundColor(.secondary)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .onAppear {
            errorMessage = ""
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    // MARK: - Phone Number Section
    private var phoneNumberSection: some View {
        VStack(spacing: 16) {
            Text("Enter your phone number")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("We'll send you a verification code to sign in")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            HStack(spacing: 12) {
                // Country Code Picker
                Button(action: {
                    // TODO: Implement country code picker
                }) {
                    HStack(spacing: 4) {
                        Text("🇮🇳")
                        Text(countryCode)
                            .font(.custom("Inter", size: 16))
                            .foregroundColor(.primary)
                        Image(systemName: "chevron.down")
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                }
                
                // Phone Number Input
                TextField("Phone Number", text: $phoneNumber)
                    .font(.custom("Inter", size: 16))
                    .keyboardType(.phonePad)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
                    .onChange(of: phoneNumber) { newValue in
                        phoneNumber = String(newValue.prefix(10))
                        errorMessage = ""
                    }
            }
        }
    }
    
    // MARK: - OTP Section
    private var otpSection: some View {
        VStack(spacing: 16) {
            Text("Enter verification code")
                .font(.custom("Inter", size: 18))
                .fontWeight(.semibold)
                .foregroundColor(.primary)
            
            Text("We sent a 6-digit code to \(countryCode) \(phoneNumber)")
                .font(.custom("Inter", size: 14))
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            // OTP Input
            HStack(spacing: 8) {
                ForEach(0..<6, id: \.self) { index in
                    OTPDigitView(
                        digit: getOTPDigit(at: index),
                        isActive: otp.count == index
                    )
                }
            }
            .onChange(of: otp) { newValue in
                if newValue.count > 6 {
                    otp = String(newValue.prefix(6))
                }
                errorMessage = ""
            }
            
            // Hidden TextField for OTP input
            TextField("", text: $otp)
                .keyboardType(.numberPad)
                .opacity(0)
                .frame(width: 1, height: 1)
        }
    }
    
    // MARK: - Helper Properties
    private var isValidPhoneNumber: Bool {
        phoneNumber.count == 10 && phoneNumber.allSatisfy { $0.isNumber }
    }
    
    // MARK: - Helper Methods
    private func getOTPDigit(at index: Int) -> String {
        guard index < otp.count else { return "" }
        return String(otp[otp.index(otp.startIndex, offsetBy: index)])
    }
    
    private func sendOTP() {
        guard isValidPhoneNumber else {
            errorMessage = "Please enter a valid 10-digit phone number"
            return
        }
        
        isLoading = true
        errorMessage = ""
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoading = false
            isOTPSent = true
            startOTPTimer()
            
            // In real implementation, call API
            // AuthService.shared.sendOTP(phoneNumber: countryCode + phoneNumber)
        }
    }
    
    private func verifyOTP() {
        guard otp.count == 6 else {
            errorMessage = "Please enter the complete 6-digit code"
            return
        }
        
        isLoading = true
        errorMessage = ""
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isLoading = false
            
            // For demo purposes, accept 123456 as valid OTP
            if otp == "123456" {
                coordinator.nextStep()
            } else {
                errorMessage = "Invalid OTP. Please try again."
                otp = ""
            }
            
            // In real implementation, call API
            // AuthService.shared.verifyOTP(phoneNumber: countryCode + phoneNumber, otp: otp)
        }
    }
    
    private func resendOTP() {
        guard otpTimer == 0 else { return }
        
        otp = ""
        sendOTP()
    }
    
    private func startOTPTimer() {
        otpTimer = 30
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            if otpTimer > 0 {
                otpTimer -= 1
            } else {
                timer?.invalidate()
            }
        }
    }
}

// MARK: - OTP Digit View
struct OTPDigitView: View {
    let digit: String
    let isActive: Bool
    
    var body: some View {
        Text(digit)
            .font(.custom("Inter", size: 24))
            .fontWeight(.semibold)
            .foregroundColor(.primary)
            .frame(width: 40, height: 40)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(
                        isActive ? Color(hex: "#14b8a6") : Color.clear,
                        lineWidth: 2
                    )
            )
    }
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

#Preview {
    OnboardingAuthFormView()
        .environmentObject(OnboardingCoordinator())
}