import SwiftUI

struct LoginView: View {
    @StateObject private var authService = AuthService()
    @State private var email = ""
    @State private var password = ""
    @State private var showingRegister = false
    @State private var showingOTPLogin = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Header
                    VStack(spacing: 8) {
                        Image(systemName: "heart.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.green)
                        
                        Text("HealthCoachAI")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Your AI-Powered Health Coach")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)
                    
                    // Login Form
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.headline)
                                .foregroundColor(.primary)
                            
                            SecureField("Enter your password", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.password)
                        }
                        
                        // Error Message
                        if let errorMessage = authService.errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                        }
                        
                        // Login Button
                        Button(action: {
                            authService.login(email: email, password: password)
                        }) {
                            HStack {
                                if authService.isLoading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Sign In")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.green)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(authService.isLoading || email.isEmpty || password.isEmpty)
                    }
                    .padding(.horizontal, 20)
                    
                    // Alternative Login Options
                    VStack(spacing: 16) {
                        HStack {
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 1)
                            
                            Text("OR")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(.horizontal, 16)
                            
                            Rectangle()
                                .fill(Color.gray.opacity(0.3))
                                .frame(height: 1)
                        }
                        .padding(.horizontal, 20)
                        
                        // Phone/OTP Login
                        Button(action: {
                            showingOTPLogin = true
                        }) {
                            HStack {
                                Image(systemName: "phone.fill")
                                Text("Continue with Phone")
                                    .fontWeight(.medium)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(10)
                        }
                        .padding(.horizontal, 20)
                        
                        // Social Login Buttons (Placeholder)
                        HStack(spacing: 12) {
                            Button(action: {
                                // Google Sign In
                            }) {
                                HStack {
                                    Image(systemName: "globe")
                                    Text("Google")
                                        .font(.caption)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(8)
                            }
                            
                            Button(action: {
                                // Apple Sign In
                            }) {
                                HStack {
                                    Image(systemName: "applelogo")
                                    Text("Apple")
                                        .font(.caption)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color.black.opacity(0.1))
                                .cornerRadius(8)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    
                    // Register Link
                    VStack(spacing: 8) {
                        Button(action: {
                            showingRegister = true
                        }) {
                            HStack {
                                Text("Don't have an account?")
                                    .foregroundColor(.secondary)
                                Text("Sign Up")
                                    .fontWeight(.semibold)
                                    .foregroundColor(.green)
                            }
                        }
                    }
                    .padding(.top, 20)
                    
                    Spacer()
                }
            }
            .navigationBarHidden(true)
        }
        .sheet(isPresented: $showingRegister) {
            RegisterView()
        }
        .sheet(isPresented: $showingOTPLogin) {
            OTPLoginView()
        }
    }
}

struct RegisterView: View {
    @StateObject private var authService = AuthService()
    @Environment(\.presentationMode) var presentationMode
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var agreeToTerms = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 8) {
                        Text("Create Account")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Join HealthCoachAI for personalized health guidance")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    // Registration Form
                    VStack(spacing: 16) {
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("First Name")
                                    .font(.headline)
                                
                                TextField("First name", text: $firstName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.givenName)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Last Name")
                                    .font(.headline)
                                
                                TextField("Last name", text: $lastName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .textContentType(.familyName)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.headline)
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.headline)
                            
                            SecureField("Enter your password", text: $password)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.newPassword)
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirm Password")
                                .font(.headline)
                            
                            SecureField("Confirm your password", text: $confirmPassword)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.newPassword)
                        }
                        
                        // Terms Agreement
                        HStack {
                            Button(action: {
                                agreeToTerms.toggle()
                            }) {
                                Image(systemName: agreeToTerms ? "checkmark.square.fill" : "square")
                                    .foregroundColor(agreeToTerms ? .green : .gray)
                            }
                            
                            Text("I agree to the Terms of Service and Privacy Policy")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            Spacer()
                        }
                        
                        // Error Message
                        if let errorMessage = authService.errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                        }
                        
                        // Register Button
                        Button(action: {
                            guard password == confirmPassword else {
                                // Handle password mismatch
                                return
                            }
                            
                            authService.register(
                                email: email,
                                password: password,
                                firstName: firstName.isEmpty ? nil : firstName,
                                lastName: lastName.isEmpty ? nil : lastName
                            )
                        }) {
                            HStack {
                                if authService.isLoading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Create Account")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(isFormValid ? Color.green : Color.gray)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(!isFormValid || authService.isLoading)
                    }
                    .padding(.horizontal, 20)
                    
                    Spacer()
                }
            }
            .navigationTitle("Sign Up")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                }
            )
        }
    }
    
    private var isFormValid: Bool {
        !email.isEmpty &&
        !password.isEmpty &&
        password == confirmPassword &&
        password.count >= 8 &&
        agreeToTerms
    }
}

struct OTPLoginView: View {
    @StateObject private var authService = AuthService()
    @Environment(\.presentationMode) var presentationMode
    
    @State private var phoneNumber = ""
    @State private var otp = ""
    @State private var showingOTPInput = false
    @State private var countdown = 0
    @State private var timer: Timer?
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Header
                VStack(spacing: 8) {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.blue)
                    
                    Text("Phone Verification")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text("We'll send you a verification code")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.top, 40)
                
                if !showingOTPInput {
                    // Phone Number Input
                    VStack(spacing: 16) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Phone Number")
                                .font(.headline)
                            
                            TextField("+91 98765 43210", text: $phoneNumber)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .textContentType(.telephoneNumber)
                                .keyboardType(.phonePad)
                        }
                        
                        // Error Message
                        if let errorMessage = authService.errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                        }
                        
                        Button(action: {
                            authService.sendOTP(phoneNumber: phoneNumber) { success in
                                if success {
                                    showingOTPInput = true
                                    startCountdown()
                                }
                            }
                        }) {
                            HStack {
                                if authService.isLoading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Send OTP")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(phoneNumber.isEmpty ? Color.gray : Color.blue)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(phoneNumber.isEmpty || authService.isLoading)
                    }
                    .padding(.horizontal, 20)
                } else {
                    // OTP Input
                    VStack(spacing: 16) {
                        Text("Enter the 6-digit code sent to")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text(phoneNumber)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        TextField("000000", text: $otp)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .textContentType(.oneTimeCode)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.center)
                            .font(.title2)
                            .padding(.horizontal, 60)
                        
                        // Error Message
                        if let errorMessage = authService.errorMessage {
                            Text(errorMessage)
                                .foregroundColor(.red)
                                .font(.caption)
                        }
                        
                        Button(action: {
                            authService.verifyOTP(phoneNumber: phoneNumber, otp: otp)
                        }) {
                            HStack {
                                if authService.isLoading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                } else {
                                    Text("Verify OTP")
                                        .fontWeight(.semibold)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(otp.count == 6 ? Color.blue : Color.gray)
                            .foregroundColor(.white)
                            .cornerRadius(10)
                        }
                        .disabled(otp.count != 6 || authService.isLoading)
                        
                        // Resend OTP
                        if countdown > 0 {
                            Text("Resend OTP in \(countdown)s")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        } else {
                            Button("Resend OTP") {
                                authService.sendOTP(phoneNumber: phoneNumber) { success in
                                    if success {
                                        startCountdown()
                                    }
                                }
                            }
                            .font(.caption)
                            .foregroundColor(.blue)
                        }
                    }
                    .padding(.horizontal, 20)
                }
                
                Spacer()
            }
            .navigationTitle("Phone Login")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(
                leading: Button("Cancel") {
                    presentationMode.wrappedValue.dismiss()
                }
            )
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private func startCountdown() {
        countdown = 60
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            if countdown > 0 {
                countdown -= 1
            } else {
                timer?.invalidate()
            }
        }
    }
}

#Preview {
    LoginView()
}