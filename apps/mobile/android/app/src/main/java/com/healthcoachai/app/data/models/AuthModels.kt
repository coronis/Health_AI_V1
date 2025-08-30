package com.healthcoachai.app.data.models

import com.google.gson.annotations.SerializedName

data class AuthResponse(
    val message: String,
    val user: User,
    @SerializedName("accessToken") val accessToken: String,
    @SerializedName("refreshToken") val refreshToken: String,
    @SerializedName("expiresIn") val expiresIn: Int,
    @SerializedName("sessionId") val sessionId: String
)

data class User(
    val id: String,
    val email: String,
    @SerializedName("phoneNumber") val phoneNumber: String?,
    val role: String,
    @SerializedName("emailVerified") val emailVerified: Boolean,
    @SerializedName("phoneVerified") val phoneVerified: Boolean?
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String?,
    val lastName: String?
)

data class OTPRequest(
    @SerializedName("phoneNumber") val phoneNumber: String
)

data class OTPVerifyRequest(
    @SerializedName("phoneNumber") val phoneNumber: String,
    val otp: String
)

data class RefreshTokenRequest(
    @SerializedName("refreshToken") val refreshToken: String
)

data class ApiError(
    val message: String,
    val statusCode: Int?
) : Exception(message)