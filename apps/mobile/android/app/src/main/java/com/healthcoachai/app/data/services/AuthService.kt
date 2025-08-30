package com.healthcoachai.app.data.services

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import com.google.gson.Gson
import com.healthcoachai.app.data.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface AuthApi {
    @POST("auth/login/email")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("auth/register/email")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>
    
    @POST("auth/otp/send")
    suspend fun sendOTP(@Body request: OTPRequest): Response<Map<String, Any>>
    
    @POST("auth/otp/verify")
    suspend fun verifyOTP(@Body request: OTPVerifyRequest): Response<AuthResponse>
    
    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<AuthResponse>
    
    @POST("auth/logout")
    suspend fun logout(@Header("Authorization") token: String): Response<Map<String, String>>
}

class AuthService(private val context: Context) {
    private val baseUrl = "http://10.0.2.2:8080/" // Android emulator localhost
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    private val api = retrofit.create(AuthApi::class.java)
    private val gson = Gson()
    
    private val _authState = MutableStateFlow(AuthState())
    val authState: StateFlow<AuthState> = _authState
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading
    
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage
    
    private val encryptedPrefs: SharedPreferences by lazy {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        EncryptedSharedPreferences.create(
            "auth_prefs",
            masterKeyAlias,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    init {
        loadStoredCredentials()
    }
    
    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            _isLoading.value = true
            _errorMessage.value = null
            
            val response = api.login(LoginRequest(email, password))
            
            if (response.isSuccessful) {
                val authResponse = response.body()!!
                handleAuthSuccess(authResponse)
                Result.success(authResponse)
            } else {
                val error = "Login failed: ${response.message()}"
                _errorMessage.value = error
                Result.failure(ApiError(error, response.code()))
            }
        } catch (e: Exception) {
            val error = "Login failed: ${e.message}"
            _errorMessage.value = error
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    suspend fun register(
        email: String,
        password: String,
        firstName: String?,
        lastName: String?
    ): Result<AuthResponse> {
        return try {
            _isLoading.value = true
            _errorMessage.value = null
            
            val response = api.register(RegisterRequest(email, password, firstName, lastName))
            
            if (response.isSuccessful) {
                val authResponse = response.body()!!
                handleAuthSuccess(authResponse)
                Result.success(authResponse)
            } else {
                val error = "Registration failed: ${response.message()}"
                _errorMessage.value = error
                Result.failure(ApiError(error, response.code()))
            }
        } catch (e: Exception) {
            val error = "Registration failed: ${e.message}"
            _errorMessage.value = error
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    suspend fun sendOTP(phoneNumber: String): Result<Boolean> {
        return try {
            _isLoading.value = true
            _errorMessage.value = null
            
            val response = api.sendOTP(OTPRequest(phoneNumber))
            
            if (response.isSuccessful) {
                Result.success(true)
            } else {
                val error = "Failed to send OTP: ${response.message()}"
                _errorMessage.value = error
                Result.failure(ApiError(error, response.code()))
            }
        } catch (e: Exception) {
            val error = "Failed to send OTP: ${e.message}"
            _errorMessage.value = error
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    suspend fun verifyOTP(phoneNumber: String, otp: String): Result<AuthResponse> {
        return try {
            _isLoading.value = true
            _errorMessage.value = null
            
            val response = api.verifyOTP(OTPVerifyRequest(phoneNumber, otp))
            
            if (response.isSuccessful) {
                val authResponse = response.body()!!
                handleAuthSuccess(authResponse)
                Result.success(authResponse)
            } else {
                val error = "OTP verification failed: ${response.message()}"
                _errorMessage.value = error
                Result.failure(ApiError(error, response.code()))
            }
        } catch (e: Exception) {
            val error = "OTP verification failed: ${e.message}"
            _errorMessage.value = error
            Result.failure(e)
        } finally {
            _isLoading.value = false
        }
    }
    
    suspend fun refreshToken(): Result<AuthResponse> {
        val refreshToken = getRefreshToken()
        
        return if (refreshToken != null) {
            try {
                val response = api.refreshToken(RefreshTokenRequest(refreshToken))
                
                if (response.isSuccessful) {
                    val authResponse = response.body()!!
                    handleAuthSuccess(authResponse)
                    Result.success(authResponse)
                } else {
                    logout()
                    Result.failure(ApiError("Token refresh failed", response.code()))
                }
            } catch (e: Exception) {
                logout()
                Result.failure(e)
            }
        } else {
            logout()
            Result.failure(Exception("No refresh token available"))
        }
    }
    
    fun logout() {
        _authState.value = AuthState()
        clearTokens()
    }
    
    private fun handleAuthSuccess(response: AuthResponse) {
        _authState.value = AuthState(
            isAuthenticated = true,
            user = response.user
        )
        
        // Store tokens securely
        storeAccessToken(response.accessToken)
        storeRefreshToken(response.refreshToken)
        
        // Store user data
        encryptedPrefs.edit()
            .putString("user_data", gson.toJson(response.user))
            .apply()
    }
    
    private fun loadStoredCredentials() {
        val accessToken = getAccessToken()
        val userDataJson = encryptedPrefs.getString("user_data", null)
        
        if (accessToken != null && userDataJson != null) {
            try {
                val user = gson.fromJson(userDataJson, User::class.java)
                _authState.value = AuthState(
                    isAuthenticated = true,
                    user = user
                )
                
                // Refresh token to ensure it's still valid
                // This would be done in a coroutine scope in real implementation
            } catch (e: Exception) {
                // Invalid stored data, clear everything
                logout()
            }
        }
    }
    
    private fun storeAccessToken(token: String) {
        encryptedPrefs.edit()
            .putString("access_token", token)
            .apply()
    }
    
    private fun storeRefreshToken(token: String) {
        encryptedPrefs.edit()
            .putString("refresh_token", token)
            .apply()
    }
    
    private fun getAccessToken(): String? {
        return encryptedPrefs.getString("access_token", null)
    }
    
    private fun getRefreshToken(): String? {
        return encryptedPrefs.getString("refresh_token", null)
    }
    
    private fun clearTokens() {
        encryptedPrefs.edit()
            .remove("access_token")
            .remove("refresh_token")
            .remove("user_data")
            .apply()
    }
}

data class AuthState(
    val isAuthenticated: Boolean = false,
    val user: User? = null
)