import SwiftUI

/**
 * ChatView for iOS HealthCoachAI
 * AI Chat interface with domain restrictions
 * Matches Android ChatScreen.kt functionality
 */
struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    @State private var messageText = ""
    @State private var selectedQuestionCategory = "all"
    @FocusState private var isTextFieldFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            headerView
            
            // Content
            if viewModel.isInitializing {
                loadingView
            } else if let error = viewModel.error {
                errorView(error: error)
            } else {
                mainChatView
            }
        }
        .background(Color(.systemBackground))
        .onAppear {
            Task {
                await viewModel.initializeChat()
            }
        }
    }
    
    // MARK: - Header View
    
    private var headerView: some View {
        VStack(spacing: 0) {
            HStack {
                VStack(alignment: .leading) {
                    Text("AI Health Coach")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Your personal nutrition and wellness assistant")
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer()
                
                HStack(spacing: 12) {
                    // Connection status
                    HStack(spacing: 4) {
                        Circle()
                            .fill(viewModel.isConnected ? Color.green : Color.red)
                            .frame(width: 8, height: 8)
                        
                        Text(viewModel.isConnected ? "Connected" : "Connecting...")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.9))
                    }
                    
                    // Thinking indicator
                    if viewModel.isThinking {
                        HStack(spacing: 4) {
                            ProgressView()
                                .scaleEffect(0.7)
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            
                            Text("AI thinking...")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                }
            }
            .padding()
            .background(Color.blue)
        }
    }
    
    // MARK: - Loading View
    
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.5)
                .progressViewStyle(CircularProgressViewStyle(tint: .blue))
            
            Text("Initializing AI Health Assistant...")
                .font(.headline)
                .multilineTextAlignment(.center)
            
            Text("Setting up your personalized chat experience.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
    
    // MARK: - Error View
    
    private func errorView(error: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(.red)
            
            Text("Unable to Start Chat")
                .font(.title2)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            Text(error)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Try Again") {
                Task {
                    await viewModel.retry()
                }
            }
            .buttonStyle(.borderedProminent)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
    }
    
    // MARK: - Main Chat View
    
    private var mainChatView: some View {
        VStack(spacing: 0) {
            // Quick Actions (if no messages)
            if viewModel.messages.isEmpty {
                quickActionsView
            }
            
            // Messages
            messagesView
            
            // Suggested Questions
            if !viewModel.suggestedQuestions.isEmpty {
                suggestedQuestionsView
            }
            
            // Message Input
            messageInputView
        }
    }
    
    // MARK: - Quick Actions View
    
    private var quickActionsView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Quick Actions")
                .font(.headline)
                .fontWeight(.medium)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach([
                        ("Log Food", "🍎"),
                        ("Health Tips", "💡"),
                        ("Meal Ideas", "🍽️"),
                        ("Exercise", "🏃")
                    ], id: \.0) { action, emoji in
                        Button(action: {
                            // TODO: Handle quick action
                        }) {
                            HStack(spacing: 4) {
                                Text(emoji)
                                Text(action)
                                    .font(.subheadline)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color(.systemGray6))
                            .clipShape(Capsule())
                        }
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
    }
    
    // MARK: - Messages View
    
    private var messagesView: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 8) {
                    if viewModel.messages.isEmpty && !viewModel.isThinking {
                        welcomeMessageView
                    }
                    
                    ForEach(viewModel.messages) { message in
                        MessageBubbleView(message: message, viewModel: viewModel)
                            .id(message.id)
                    }
                    
                    if viewModel.isThinking {
                        TypingIndicatorView()
                    }
                }
                .padding()
            }
            .onChange(of: viewModel.messages.count) { _ in
                if let lastMessage = viewModel.messages.last {
                    withAnimation {
                        proxy.scrollTo(lastMessage.id, anchor: .bottom)
                    }
                }
            }
        }
    }
    
    // MARK: - Welcome Message
    
    private var welcomeMessageView: some View {
        VStack(spacing: 8) {
            Text("💡")
                .font(.system(size: 48))
            
            Text("Welcome to AI Health Coach!")
                .font(.headline)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            Text("I'm here to help with your nutrition, fitness, and health questions. Ask me anything about your wellness journey!")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
            
            Text("🔒 This chat is domain-restricted to health, nutrition, and fitness topics only.")
                .font(.caption)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.blue.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - Suggested Questions View
    
    private var suggestedQuestionsView: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Suggested questions:")
                    .font(.headline)
                    .fontWeight(.medium)
                
                Spacer()
                
                // Category filter
                Menu(selectedQuestionCategory.capitalized) {
                    ForEach(["all", "nutrition", "fitness", "health", "meal_planning"], id: \.self) { category in
                        Button(category.capitalized) {
                            selectedQuestionCategory = category
                        }
                    }
                }
                .font(.subheadline)
            }
            
            ScrollView {
                LazyVStack(spacing: 4) {
                    let filteredQuestions = viewModel.suggestedQuestions
                        .filter { selectedQuestionCategory == "all" || $0.category == selectedQuestionCategory }
                        .prefix(6)
                    
                    ForEach(Array(filteredQuestions), id: \.id) { question in
                        SuggestedQuestionView(
                            question: question,
                            isEnabled: !viewModel.isThinking
                        ) {
                            Task {
                                await viewModel.sendMessage(question.question)
                            }
                        }
                    }
                }
            }
            .frame(maxHeight: 120)
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.5))
    }
    
    // MARK: - Message Input View
    
    private var messageInputView: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                // Quick add button
                Button(action: {
                    // TODO: Quick add functionality
                }) {
                    Image(systemName: "plus")
                        .foregroundColor(.secondary)
                }
                
                // Message input field
                TextField("Ask me about nutrition, health, meal planning, or fitness...", text: $messageText, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .focused($isTextFieldFocused)
                    .disabled(viewModel.isThinking)
                    .onSubmit {
                        sendMessage()
                    }
                
                // Voice input button
                Button(action: {
                    // TODO: Voice input
                }) {
                    Image(systemName: "mic")
                        .foregroundColor(.secondary)
                }
                
                // Send button
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.title2)
                        .foregroundColor(canSendMessage ? .blue : .secondary)
                }
                .disabled(!canSendMessage)
            }
            
            // Status and error text
            HStack {
                Text("Press Enter to send")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Text("🔒 Health-focused AI • English, Hindi & Hinglish supported")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Error message
            if let sendError = viewModel.sendError {
                Text("Failed to send message: \(sendError)")
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
        .padding()
        .background(Color(.systemBackground))
    }
    
    // MARK: - Helper Properties
    
    private var canSendMessage: Bool {
        !messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !viewModel.isThinking
    }
    
    // MARK: - Helper Methods
    
    private func sendMessage() {
        let trimmedMessage = messageText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedMessage.isEmpty else { return }
        
        Task {
            await viewModel.sendMessage(trimmedMessage)
        }
        
        messageText = ""
        isTextFieldFocused = false
    }
}

// MARK: - Supporting Views

struct MessageBubbleView: View {
    let message: ChatMessage
    let viewModel: ChatViewModel
    
    var body: some View {
        HStack {
            if message.type == "user" {
                Spacer()
            }
            
            VStack(alignment: message.type == "user" ? .trailing : .leading, spacing: 4) {
                Text(message.message)
                    .padding(12)
                    .background(message.type == "user" ? Color.blue : Color(.systemGray5))
                    .foregroundColor(message.type == "user" ? .white : .primary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                
                Text(viewModel.formatTimestamp(message.timestamp))
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                // Domain restriction warning
                if let metadata = message.metadata,
                   let classification = metadata.domainClassification,
                   !classification.isInScope {
                    Text("⚠️ This question is outside my health expertise. I can only help with nutrition, fitness, and wellness topics.")
                        .font(.caption)
                        .padding(8)
                        .background(Color.yellow.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
            .frame(maxWidth: 280, alignment: message.type == "user" ? .trailing : .leading)
            
            if message.type != "user" {
                Spacer()
            }
        }
    }
}

struct TypingIndicatorView: View {
    @State private var animationCount = 0
    
    var body: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { index in
                    Circle()
                        .fill(Color.secondary)
                        .frame(width: 8, height: 8)
                        .opacity(animationCount == index ? 1.0 : 0.4)
                }
                
                Text("AI is analyzing your question...")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(12)
            .background(Color(.systemGray5))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            
            Spacer()
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
                withAnimation {
                    animationCount = (animationCount + 1) % 3
                }
            }
        }
    }
}

struct SuggestedQuestionView: View {
    let question: SuggestedQuestion
    let isEnabled: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 4) {
                Text(question.category.capitalized)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.blue)
                
                Text(question.question)
                    .font(.subheadline)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color(.systemGray4), lineWidth: 1)
            )
        }
        .disabled(!isEnabled)
        .opacity(isEnabled ? 1.0 : 0.6)
    }
}

// MARK: - Preview

struct ChatView_Previews: PreviewProvider {
    static var previews: some View {
        ChatView()
    }
}