import Foundation
import Combine

class AuthService: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:8080"
    private let keychain = KeychainService()
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Authentication State Management
    
    init() {
        loadStoredCredentials()
    }
    
    // MARK: - Email/Password Authentication
    
    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        let loginRequest = LoginRequest(email: email, password: password)
        
        guard let url = URL(string: "\(baseURL)/auth/login/email") else {
            setError("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(loginRequest)
        } catch {
            setError("Failed to encode request")
            return
        }
        
        URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: AuthResponse.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.setError("Login failed: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleAuthSuccess(response)
                }
            )
            .store(in: &cancellables)
    }
    
    func register(email: String, password: String, firstName: String?, lastName: String?) {
        isLoading = true
        errorMessage = nil
        
        let registerRequest = RegisterRequest(
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName
        )
        
        guard let url = URL(string: "\(baseURL)/auth/register/email") else {
            setError("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(registerRequest)
        } catch {
            setError("Failed to encode request")
            return
        }
        
        URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: AuthResponse.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.setError("Registration failed: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleAuthSuccess(response)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Phone/OTP Authentication
    
    func sendOTP(phoneNumber: String, completion: @escaping (Bool) -> Void) {
        isLoading = true
        errorMessage = nil
        
        let otpRequest = OTPRequest(phoneNumber: phoneNumber)
        
        guard let url = URL(string: "\(baseURL)/auth/otp/send") else {
            setError("Invalid URL")
            completion(false)
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(otpRequest)
        } catch {
            setError("Failed to encode request")
            completion(false)
            return
        }
        
        URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] result in
                    self?.isLoading = false
                    if case .failure(let error) = result {
                        self?.setError("Failed to send OTP: \(error.localizedDescription)")
                        completion(false)
                    }
                },
                receiveValue: { _ in
                    completion(true)
                }
            )
            .store(in: &cancellables)
    }
    
    func verifyOTP(phoneNumber: String, otp: String) {
        isLoading = true
        errorMessage = nil
        
        let verifyRequest = OTPVerifyRequest(phoneNumber: phoneNumber, otp: otp)
        
        guard let url = URL(string: "\(baseURL)/auth/otp/verify") else {
            setError("Invalid URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(verifyRequest)
        } catch {
            setError("Failed to encode request")
            return
        }
        
        URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: AuthResponse.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.setError("OTP verification failed: \(error.localizedDescription)")
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleAuthSuccess(response)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Token Management
    
    func refreshToken() {
        guard let refreshToken = keychain.getRefreshToken() else {
            logout()
            return
        }
        
        let refreshRequest = RefreshTokenRequest(refreshToken: refreshToken)
        
        guard let url = URL(string: "\(baseURL)/auth/refresh") else {
            logout()
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        do {
            request.httpBody = try JSONEncoder().encode(refreshRequest)
        } catch {
            logout()
            return
        }
        
        URLSession.shared.dataTaskPublisher(for: request)
            .map(\.data)
            .decode(type: AuthResponse.self, decoder: JSONDecoder())
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure = completion {
                        self?.logout()
                    }
                },
                receiveValue: { [weak self] response in
                    self?.handleAuthSuccess(response)
                }
            )
            .store(in: &cancellables)
    }
    
    // MARK: - Logout
    
    func logout() {
        DispatchQueue.main.async {
            self.isAuthenticated = false
            self.currentUser = nil
            self.errorMessage = nil
            self.keychain.clearTokens()
        }
    }
    
    // MARK: - Private Methods
    
    private func handleAuthSuccess(_ response: AuthResponse) {
        currentUser = response.user
        isAuthenticated = true
        
        // Store tokens securely
        keychain.storeAccessToken(response.accessToken)
        keychain.storeRefreshToken(response.refreshToken)
        
        // Store user data
        if let userData = try? JSONEncoder().encode(response.user) {
            UserDefaults.standard.set(userData, forKey: "currentUser")
        }
    }
    
    private func loadStoredCredentials() {
        // Check if we have stored tokens
        guard keychain.getAccessToken() != nil,
              let userData = UserDefaults.standard.data(forKey: "currentUser"),
              let user = try? JSONDecoder().decode(User.self, from: userData) else {
            return
        }
        
        currentUser = user
        isAuthenticated = true
        
        // Refresh token to ensure it's still valid
        refreshToken()
    }
    
    private func setError(_ message: String) {
        DispatchQueue.main.async {
            self.errorMessage = message
            self.isLoading = false
        }
    }
}

// MARK: - Keychain Service

class KeychainService {
    private let service = "com.healthcoachai.app"
    
    func storeAccessToken(_ token: String) {
        store(token, forKey: "accessToken")
    }
    
    func storeRefreshToken(_ token: String) {
        store(token, forKey: "refreshToken")
    }
    
    func getAccessToken() -> String? {
        return retrieve(forKey: "accessToken")
    }
    
    func getRefreshToken() -> String? {
        return retrieve(forKey: "refreshToken")
    }
    
    func clearTokens() {
        delete(forKey: "accessToken")
        delete(forKey: "refreshToken")
    }
    
    private func store(_ value: String, forKey key: String) {
        let data = value.data(using: .utf8)!
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }
    
    private func retrieve(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return value
    }
    
    private func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
}