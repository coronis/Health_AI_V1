import Foundation
import UIKit

/**
 * HealthReportsService for iOS HealthCoachAI
 * Manages health report uploads, processing, and physician red-flag alerts
 * Integrates with backend health-reports domain
 */
class HealthReportsService: ObservableObject {
    private let apiService = APIService.shared
    
    // MARK: - Health Reports Management
    
    func getUserHealthReports(userId: String) async throws -> [HealthReport] {
        let reports: [HealthReport]? = try await apiService.request(
            endpoint: "/health-reports/user/\(userId)",
            method: .GET,
            responseType: [HealthReport].self
        )
        
        return reports ?? []
    }
    
    func getHealthReport(reportId: String) async throws -> HealthReport {
        let report: HealthReport? = try await apiService.request(
            endpoint: "/health-reports/\(reportId)",
            method: .GET,
            responseType: HealthReport.self
        )
        
        guard let report = report else {
            throw HealthReportsError.reportNotFound
        }
        
        return report
    }
    
    func uploadHealthReport(
        userId: String,
        reportType: HealthReportType,
        image: UIImage,
        additionalData: [String: Any] = [:]
    ) async throws -> HealthReportUploadResponse {
        
        // Convert image to data
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            throw HealthReportsError.imageProcessingFailed
        }
        
        let uploadRequest = HealthReportUploadRequest(
            userId: userId,
            reportType: reportType.rawValue,
            imageData: imageData.base64EncodedString(),
            additionalData: additionalData
        )
        
        let response: HealthReportUploadResponse? = try await apiService.request(
            endpoint: "/health-reports/upload",
            method: .POST,
            body: uploadRequest,
            responseType: HealthReportUploadResponse.self
        )
        
        guard let response = response else {
            throw HealthReportsError.uploadFailed
        }
        
        return response
    }
    
    func processHealthReport(
        reportId: String,
        options: ProcessHealthReportOptions = ProcessHealthReportOptions()
    ) async throws -> HealthReportProcessingResult {
        
        let request = ProcessHealthReportRequest(
            reportId: reportId,
            options: options
        )
        
        let result: HealthReportProcessingResult? = try await apiService.request(
            endpoint: "/health-reports/\(reportId)/process",
            method: .POST,
            body: request,
            responseType: HealthReportProcessingResult.self
        )
        
        guard let result = result else {
            throw HealthReportsError.processingFailed
        }
        
        return result
    }
    
    func getHealthInsights(
        userId: String,
        reportIds: [String] = [],
        timeRange: TimeRange? = nil
    ) async throws -> HealthInsights {
        
        let request = HealthInsightsRequest(
            userId: userId,
            reportIds: reportIds,
            timeRange: timeRange
        )
        
        let insights: HealthInsights? = try await apiService.request(
            endpoint: "/health-reports/insights",
            method: .POST,
            body: request,
            responseType: HealthInsights.self
        )
        
        guard let insights = insights else {
            throw HealthReportsError.insightsGenerationFailed
        }
        
        return insights
    }
    
    func getRedFlagAlerts(userId: String) async throws -> [RedFlagAlert] {
        let alerts: [RedFlagAlert]? = try await apiService.request(
            endpoint: "/health-reports/red-flags/\(userId)",
            method: .GET,
            responseType: [RedFlagAlert].self
        )
        
        return alerts ?? []
    }
}

// MARK: - Data Models

struct HealthReport: Codable, Identifiable {
    let id: String
    let userId: String
    let reportType: String
    let originalImageUrl: String?
    let processedData: ProcessedHealthData?
    let aiAnalysis: AIHealthAnalysis?
    let uploadedAt: String
    let processedAt: String?
    let status: HealthReportStatus
}

struct ProcessedHealthData: Codable {
    let extractedValues: [String: Any]
    let normalRanges: [String: NormalRange]
    let confidence: Double
    let processingMethod: String
    let ocrResults: OCRResults?
}

struct AIHealthAnalysis: Codable {
    let summary: String
    let keyFindings: [String]
    let recommendations: [String]
    let redFlags: [RedFlagAlert]
    let trends: [HealthTrend]
    let aiModel: String
    let confidence: Double
    let generatedAt: String
}

struct RedFlagAlert: Codable, Identifiable {
    let id: String
    let type: RedFlagType
    let severity: AlertSeverity
    let title: String
    let description: String
    let affectedValues: [String]
    let recommendedAction: String
    let requiresPhysicianAttention: Bool
    let urgencyLevel: UrgencyLevel
    let detectedAt: String
}

struct HealthTrend: Codable {
    let parameter: String
    let direction: TrendDirection
    let changePercentage: Double
    let timeframe: String
    let significance: TrendSignificance
}

struct NormalRange: Codable {
    let min: Double?
    let max: Double?
    let unit: String
    let ageGroup: String?
    let gender: String?
}

struct OCRResults: Codable {
    let rawText: String
    let confidence: Double
    let extractedFields: [String: String]
    let processingTime: Double
}

struct HealthReportUploadRequest: Codable {
    let userId: String
    let reportType: String
    let imageData: String
    let additionalData: [String: Any]
}

struct HealthReportUploadResponse: Codable {
    let success: Bool
    let reportId: String?
    let message: String
    let estimatedProcessingTime: Int?
}

struct ProcessHealthReportRequest: Codable {
    let reportId: String
    let options: ProcessHealthReportOptions
}

struct ProcessHealthReportOptions: Codable {
    let enableAIAnalysis: Bool
    let includeRedFlagDetection: Bool
    let generateRecommendations: Bool
    let compareWithHistory: Bool
    
    init() {
        self.enableAIAnalysis = true
        self.includeRedFlagDetection = true
        self.generateRecommendations = true
        self.compareWithHistory = true
    }
}

struct HealthReportProcessingResult: Codable {
    let success: Bool
    let reportId: String
    let processedData: ProcessedHealthData?
    let aiAnalysis: AIHealthAnalysis?
    let processingTime: Double
    let error: String?
}

struct HealthInsightsRequest: Codable {
    let userId: String
    let reportIds: [String]
    let timeRange: TimeRange?
}

struct HealthInsights: Codable {
    let userId: String
    let timeRange: TimeRange
    let overallHealth: OverallHealthAssessment
    let trends: [HealthTrend]
    let redFlags: [RedFlagAlert]
    let recommendations: [HealthRecommendation]
    let generatedAt: String
}

struct OverallHealthAssessment: Codable {
    let score: Double // 0-100
    let category: HealthCategory
    let summary: String
    let keyMetrics: [String: Double]
}

struct HealthRecommendation: Codable {
    let category: RecommendationCategory
    let title: String
    let description: String
    let priority: RecommendationPriority
    let actionable: Bool
    let estimatedImpact: String
}

struct TimeRange: Codable {
    let startDate: String
    let endDate: String
}

// MARK: - Enums

enum HealthReportType: String, CaseIterable, Codable {
    case bloodTest = "blood_test"
    case urineTest = "urine_test"
    case lipidProfile = "lipid_profile"
    case diabeticPanel = "diabetic_panel"
    case thyroidFunction = "thyroid_function"
    case liverFunction = "liver_function"
    case kidneyFunction = "kidney_function"
    case vitaminDeficiency = "vitamin_deficiency"
    case hormonalProfile = "hormonal_profile"
    case cardiacMarkers = "cardiac_markers"
    case inflammatoryMarkers = "inflammatory_markers"
    case completeBloodCount = "complete_blood_count"
    
    var displayName: String {
        switch self {
        case .bloodTest: return "Blood Test"
        case .urineTest: return "Urine Test"
        case .lipidProfile: return "Lipid Profile"
        case .diabeticPanel: return "Diabetic Panel"
        case .thyroidFunction: return "Thyroid Function"
        case .liverFunction: return "Liver Function"
        case .kidneyFunction: return "Kidney Function"
        case .vitaminDeficiency: return "Vitamin Deficiency"
        case .hormonalProfile: return "Hormonal Profile"
        case .cardiacMarkers: return "Cardiac Markers"
        case .inflammatoryMarkers: return "Inflammatory Markers"
        case .completeBloodCount: return "Complete Blood Count"
        }
    }
}

enum HealthReportStatus: String, Codable {
    case uploaded = "uploaded"
    case processing = "processing"
    case processed = "processed"
    case failed = "failed"
}

enum RedFlagType: String, Codable {
    case criticalValue = "critical_value"
    case abnormalTrend = "abnormal_trend"
    case multipleAbnormalities = "multiple_abnormalities"
    case riskFactors = "risk_factors"
}

enum AlertSeverity: String, Codable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case critical = "critical"
}

enum UrgencyLevel: String, Codable {
    case routine = "routine"
    case priority = "priority"
    case urgent = "urgent"
    case emergency = "emergency"
}

enum TrendDirection: String, Codable {
    case improving = "improving"
    case stable = "stable"
    case worsening = "worsening"
    case fluctuating = "fluctuating"
}

enum TrendSignificance: String, Codable {
    case low = "low"
    case moderate = "moderate"
    case high = "high"
    case critical = "critical"
}

enum HealthCategory: String, Codable {
    case excellent = "excellent"
    case good = "good"
    case fair = "fair"
    case poor = "poor"
    case critical = "critical"
}

enum RecommendationCategory: String, Codable {
    case dietary = "dietary"
    case exercise = "exercise"
    case lifestyle = "lifestyle"
    case medical = "medical"
    case monitoring = "monitoring"
}

enum RecommendationPriority: String, Codable {
    case low = "low"
    case medium = "medium"
    case high = "high"
    case critical = "critical"
}

// MARK: - Errors

enum HealthReportsError: Error, LocalizedError {
    case reportNotFound
    case uploadFailed
    case imageProcessingFailed
    case processingFailed
    case insightsGenerationFailed
    case invalidReportType
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .reportNotFound:
            return "Health report not found"
        case .uploadFailed:
            return "Failed to upload health report"
        case .imageProcessingFailed:
            return "Failed to process image"
        case .processingFailed:
            return "Failed to process health report"
        case .insightsGenerationFailed:
            return "Failed to generate health insights"
        case .invalidReportType:
            return "Invalid report type"
        case .networkError:
            return "Network error occurred"
        }
    }
}