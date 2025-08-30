import Foundation

struct AuthResponse: Codable {
    let message: String
    let user: User
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
    let sessionId: String
}

struct User: Codable {
    let id: String
    let email: String
    let phoneNumber: String?
    let role: String
    let emailVerified: Bool
    let phoneVerified: Bool?
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct OTPRequest: Codable {
    let phoneNumber: String
}

struct OTPVerifyRequest: Codable {
    let phoneNumber: String
    let otp: String
}

struct RegisterRequest: Codable {
    let email: String
    let password: String
    let firstName: String?
    let lastName: String?
}

struct RefreshTokenRequest: Codable {
    let refreshToken: String
}

struct APIError: Codable, Error {
    let message: String
    let statusCode: Int?
}