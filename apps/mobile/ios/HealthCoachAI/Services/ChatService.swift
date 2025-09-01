import Foundation
import Combine

// MARK: - Chat Service for iOS

/**
 * ChatService for iOS HealthCoachAI
 * Provides AI chat functionality with domain restrictions
 * Matches Android ChatService.kt capabilities
 */
class ChatService: ObservableObject {
    private let apiService = APIService.shared
    
    // MARK: - Chat Session Management
    
    func createSession(
        userId: String,
        sessionType: String = "general_health",
        context: [String: String] = [:]
    ) async throws -> ChatSession {
        
        let request = CreateSessionRequest(
            userId: userId,
            sessionType: sessionType,
            context: context
        )
        
        let session: ChatSession? = try await apiService.request(
            endpoint: "/chat/sessions",
            method: .POST,
            body: request,
            responseType: ChatSession.self
        )
        
        guard let session = session else {
            throw ChatError.sessionCreationFailed
        }
        
        return session
    }
    
    func getSession(_ sessionId: String) async throws -> ChatSession {
        let session: ChatSession? = try await apiService.request(
            endpoint: "/chat/sessions/\(sessionId)",
            method: .GET,
            responseType: ChatSession.self
        )
        
        guard let session = session else {
            throw ChatError.sessionNotFound
        }
        
        return session
    }
    
    func deleteSession(_ sessionId: String) async throws {
        let _: EmptyResponse? = try await apiService.request(
            endpoint: "/chat/sessions/\(sessionId)",
            method: .DELETE,
            responseType: EmptyResponse.self
        )
    }
    
    // MARK: - Message Management
    
    func sendMessage(_ request: SendMessageRequest) async throws -> SendMessageResponse {
        let response: SendMessageResponse? = try await apiService.request(
            endpoint: "/chat/messages",
            method: .POST,
            body: request,
            responseType: SendMessageResponse.self
        )
        
        guard let response = response else {
            throw ChatError.messageSendFailed
        }
        
        return response
    }
    
    // MARK: - Suggested Questions
    
    func getSuggestedQuestions(
        for userId: String,
        request: SuggestedQuestionsRequest
    ) async throws -> [SuggestedQuestion] {
        let questions: [SuggestedQuestion]? = try await apiService.request(
            endpoint: "/chat/suggested-questions/\(userId)",
            method: .POST,
            body: request,
            responseType: [SuggestedQuestion].self
        )
        
        return questions ?? []
    }
}

// MARK: - Data Models

struct CreateSessionRequest: Codable {
    let userId: String
    let sessionType: String
    let context: [String: String]
}

struct SendMessageRequest: Codable {
    let message: String
    let sessionId: String
    let sessionType: String
    let userPreferences: UserPreferences
}

struct SendMessageResponse: Codable {
    let success: Bool
    let messageId: String?
    let error: String?
}

struct SuggestedQuestionsRequest: Codable {
    let currentPage: String
    let userGoals: [String]
}

struct UserPreferences: Codable {
    let language: String
    let responseStyle: String
}

struct ChatSession: Codable {
    let id: String
    let userId: String
    let sessionType: String
    let context: [String: String]
    let messages: [ChatMessage]
    let createdAt: String
    let updatedAt: String
    let isActive: Bool
}

struct ChatMessage: Codable, Identifiable {
    let id: String
    let type: String // "user" or "assistant"
    let message: String
    let timestamp: String
    let metadata: MessageMetadata?
}

struct MessageMetadata: Codable {
    let domainClassification: DomainClassification?
    let aiModel: String?
    let processingTime: Double?
}

struct DomainClassification: Codable {
    let isInScope: Bool
    let category: String?
    let confidence: Double?
}

struct SuggestedQuestion: Codable, Identifiable {
    let id: String
    let category: String
    let question: String
    let priority: Int
}

struct EmptyResponse: Codable {
    // Empty response for DELETE operations
}

// MARK: - Errors

enum ChatError: Error, LocalizedError {
    case sessionCreationFailed
    case sessionNotFound
    case messageSendFailed
    case invalidResponse
    
    var errorDescription: String? {
        switch self {
        case .sessionCreationFailed:
            return "Failed to create chat session"
        case .sessionNotFound:
            return "Chat session not found"
        case .messageSendFailed:
            return "Failed to send message"
        case .invalidResponse:
            return "Invalid response from server"
        }
    }
}