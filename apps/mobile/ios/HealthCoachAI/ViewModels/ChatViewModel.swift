import Foundation
import Combine

/**
 * ChatViewModel for iOS HealthCoachAI
 * Manages AI chat functionality and UI state
 * Matches Android ChatViewModel.kt capabilities
 */
@MainActor
class ChatViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var isInitializing = false
    @Published var isConnected = false
    @Published var isThinking = false
    @Published var currentSession: ChatSession?
    @Published var messages: [ChatMessage] = []
    @Published var suggestedQuestions: [SuggestedQuestion] = []
    @Published var error: String?
    @Published var sendError: String?
    
    // MARK: - Private Properties
    
    private let chatService = ChatService()
    private let userId = "user_123" // Mock user ID - in real app this would come from auth context
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init() {
        Task {
            await initializeChat()
        }
    }
    
    // MARK: - Public Methods
    
    func initializeChat() async {
        isInitializing = true
        error = nil
        
        do {
            // Create chat session
            let session = try await chatService.createSession(
                userId: userId,
                sessionType: "general_health",
                context: [
                    "userGoals": "weight_loss,muscle_gain",
                    "currentPage": "chat"
                ]
            )
            
            currentSession = session
            messages = session.messages
            isConnected = true
            isInitializing = false
            
            // Load suggested questions
            await loadSuggestedQuestions()
            
        } catch {
            self.error = "Failed to initialize chat: \(error.localizedDescription)"
            isConnected = false
            isInitializing = false
        }
    }
    
    func sendMessage(_ messageText: String) async {
        guard let session = currentSession else { return }
        
        // Add user message to UI immediately
        let userMessage = ChatMessage(
            id: "temp_\(Int(Date().timeIntervalSince1970 * 1000))",
            type: "user",
            message: messageText,
            timestamp: getCurrentTimestamp(),
            metadata: nil
        )
        
        messages.append(userMessage)
        isThinking = true
        sendError = nil
        
        do {
            let request = SendMessageRequest(
                message: messageText,
                sessionId: session.id,
                sessionType: "general_health",
                userPreferences: UserPreferences(
                    language: "en",
                    responseStyle: "friendly"
                )
            )
            
            let response = try await chatService.sendMessage(request)
            
            if response.success {
                // Refresh session to get updated messages
                await refreshSession()
            } else {
                sendError = response.error ?? "Unknown error occurred"
                isThinking = false
            }
            
        } catch {
            sendError = "Failed to send message: \(error.localizedDescription)"
            isThinking = false
        }
    }
    
    func refreshSession() async {
        guard let session = currentSession else { return }
        
        do {
            let updatedSession = try await chatService.getSession(session.id)
            currentSession = updatedSession
            messages = updatedSession.messages
            isThinking = false
            sendError = nil
        } catch {
            sendError = "Failed to refresh messages: \(error.localizedDescription)"
            isThinking = false
        }
    }
    
    func loadSuggestedQuestions() async {
        do {
            let request = SuggestedQuestionsRequest(
                currentPage: "chat",
                userGoals: ["weight_loss", "muscle_gain"]
            )
            
            let questions = try await chatService.getSuggestedQuestions(
                for: userId,
                request: request
            )
            
            suggestedQuestions = questions
        } catch {
            // Suggested questions are not critical, so we don't show error
            print("Failed to load suggested questions: \(error.localizedDescription)")
        }
    }
    
    func retry() async {
        error = nil
        await initializeChat()
    }
    
    func clearSendError() {
        sendError = nil
    }
    
    func sendSuggestedQuestion(_ question: String) async {
        await sendMessage(question)
    }
    
    func deleteSession() async {
        guard let session = currentSession else { return }
        
        do {
            try await chatService.deleteSession(session.id)
            // Reinitialize chat
            await initializeChat()
        } catch {
            sendError = "Failed to delete session"
        }
    }
    
    // MARK: - Helper Methods
    
    private func getCurrentTimestamp() -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.string(from: Date())
    }
    
    func formatTimestamp(_ timestamp: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        guard let date = formatter.date(from: timestamp) else {
            return "now"
        }
        
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"
        return timeFormatter.string(from: date)
    }
}