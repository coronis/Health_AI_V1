import Foundation
import UIKit
import Combine

/**
 * HealthReportsViewModel for iOS HealthCoachAI
 * Manages health report state and physician red-flag alerts
 * Integrates with backend health-reports services
 */
@MainActor
class HealthReportsViewModel: ObservableObject {
    
    // MARK: - Published Properties
    
    @Published var healthReports: [HealthReport] = []
    @Published var redFlagAlerts: [RedFlagAlert] = []
    @Published var healthInsights: HealthInsights?
    @Published var isLoading = false
    @Published var isUploading = false
    @Published var isProcessing = false
    @Published var error: String?
    @Published var uploadProgress: Double = 0.0
    
    // MARK: - Private Properties
    
    private let healthReportsService = HealthReportsService()
    private let userId = "user_123" // Mock user ID - in real app this would come from auth context
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init() {
        Task {
            await loadHealthReports()
            await loadRedFlagAlerts()
        }
    }
    
    // MARK: - Public Methods
    
    func loadHealthReports() async {
        isLoading = true
        error = nil
        
        do {
            let reports = try await healthReportsService.getUserHealthReports(userId: userId)
            healthReports = reports.sorted { $0.uploadedAt > $1.uploadedAt }
            
            // Load insights if we have reports
            if !reports.isEmpty {
                await loadHealthInsights()
            }
        } catch {
            self.error = "Failed to load health reports: \(error.localizedDescription)"
        }
        
        isLoading = false
    }
    
    func loadRedFlagAlerts() async {
        do {
            let alerts = try await healthReportsService.getRedFlagAlerts(userId: userId)
            redFlagAlerts = alerts.sorted { alert1, alert2 in
                // Sort by severity and urgency
                if alert1.severity != alert2.severity {
                    return alert1.severity.rawValue > alert2.severity.rawValue
                }
                return alert1.urgencyLevel.rawValue > alert2.urgencyLevel.rawValue
            }
        } catch {
            print("Failed to load red flag alerts: \(error.localizedDescription)")
        }
    }
    
    func loadHealthInsights() async {
        do {
            let reportIds = healthReports.map { $0.id }
            let insights = try await healthReportsService.getHealthInsights(
                userId: userId,
                reportIds: reportIds,
                timeRange: TimeRange(
                    startDate: getDateString(daysAgo: 90),
                    endDate: getDateString(daysAgo: 0)
                )
            )
            healthInsights = insights
        } catch {
            print("Failed to load health insights: \(error.localizedDescription)")
        }
    }
    
    func uploadHealthReport(
        reportType: HealthReportType,
        image: UIImage,
        additionalData: [String: Any] = [:]
    ) async {
        isUploading = true
        uploadProgress = 0.0
        error = nil
        
        do {
            // Simulate upload progress
            for progress in stride(from: 0.0, through: 0.7, by: 0.1) {
                uploadProgress = progress
                try await Task.sleep(nanoseconds: 200_000_000) // 200ms
            }
            
            let response = try await healthReportsService.uploadHealthReport(
                userId: userId,
                reportType: reportType,
                image: image,
                additionalData: additionalData
            )
            
            uploadProgress = 1.0
            
            if response.success, let reportId = response.reportId {
                // Start processing the report
                await processHealthReport(reportId: reportId)
            } else {
                error = response.message
            }
            
        } catch {
            self.error = "Failed to upload health report: \(error.localizedDescription)"
        }
        
        isUploading = false
        uploadProgress = 0.0
    }
    
    func processHealthReport(reportId: String) async {
        isProcessing = true
        
        do {
            let result = try await healthReportsService.processHealthReport(reportId: reportId)
            
            if result.success {
                // Reload reports and alerts to get updated data
                await loadHealthReports()
                await loadRedFlagAlerts()
            } else {
                error = result.error ?? "Processing failed"
            }
        } catch {
            self.error = "Failed to process health report: \(error.localizedDescription)"
        }
        
        isProcessing = false
    }
    
    func getHealthReport(reportId: String) async -> HealthReport? {
        do {
            return try await healthReportsService.getHealthReport(reportId: reportId)
        } catch {
            self.error = "Failed to get health report: \(error.localizedDescription)"
            return nil
        }
    }
    
    func dismissRedFlagAlert(_ alert: RedFlagAlert) {
        redFlagAlerts.removeAll { $0.id == alert.id }
    }
    
    func refreshData() async {
        await loadHealthReports()
        await loadRedFlagAlerts()
    }
    
    func clearError() {
        error = nil
    }
    
    // MARK: - Helper Methods
    
    private func getDateString(daysAgo: Int) -> String {
        let date = Calendar.current.date(byAdding: .day, value: -daysAgo, to: Date()) ?? Date()
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.string(from: date)
    }
    
    // MARK: - Computed Properties
    
    var hasRedFlags: Bool {
        !redFlagAlerts.isEmpty
    }
    
    var criticalAlerts: [RedFlagAlert] {
        redFlagAlerts.filter { $0.severity == .critical || $0.urgencyLevel == .emergency }
    }
    
    var recentReports: [HealthReport] {
        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: Date()) ?? Date()
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        let thirtyDaysAgoString = formatter.string(from: thirtyDaysAgo)
        
        return healthReports.filter { $0.uploadedAt > thirtyDaysAgoString }
    }
    
    var processingReports: [HealthReport] {
        healthReports.filter { $0.status == .processing }
    }
    
    var healthScore: Double {
        healthInsights?.overallHealth.score ?? 0.0
    }
    
    var healthCategory: HealthCategory {
        healthInsights?.overallHealth.category ?? .fair
    }
    
    var healthCategoryColor: UIColor {
        switch healthCategory {
        case .excellent:
            return .systemGreen
        case .good:
            return .systemBlue
        case .fair:
            return .systemOrange
        case .poor:
            return .systemRed
        case .critical:
            return .systemPurple
        }
    }
    
    var healthCategoryEmoji: String {
        switch healthCategory {
        case .excellent:
            return "🎉"
        case .good:
            return "😊"
        case .fair:
            return "😐"
        case .poor:
            return "😟"
        case .critical:
            return "🚨"
        }
    }
}