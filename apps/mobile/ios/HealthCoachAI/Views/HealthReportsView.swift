import SwiftUI
import PhotosUI

/**
 * HealthReportsView for iOS HealthCoachAI
 * Health report uploads with physician red-flag alerts
 * Integrates with backend health-reports services
 */
struct HealthReportsView: View {
    @StateObject private var viewModel = HealthReportsViewModel()
    @State private var showingImagePicker = false
    @State private var showingReportTypePicker = false
    @State private var selectedReportType: HealthReportType = .bloodTest
    @State private var selectedImage: UIImage?
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Red Flag Alerts Section
                    if viewModel.hasRedFlags {
                        redFlagAlertsSection
                    }
                    
                    // Health Score Overview
                    healthScoreSection
                    
                    // Upload Section
                    uploadSection
                    
                    // Recent Reports
                    recentReportsSection
                    
                    // Health Insights
                    if let insights = viewModel.healthInsights {
                        healthInsightsSection(insights: insights)
                    }
                }
                .padding()
            }
            .navigationTitle("Health Reports")
            .refreshable {
                await viewModel.refreshData()
            }
            .sheet(isPresented: $showingImagePicker) {
                ImagePicker(selectedImage: $selectedImage)
            }
            .actionSheet(isPresented: $showingReportTypePicker) {
                ActionSheet(
                    title: Text("Select Report Type"),
                    buttons: HealthReportType.allCases.map { reportType in
                        .default(Text(reportType.displayName)) {
                            selectedReportType = reportType
                            showingImagePicker = true
                        }
                    } + [.cancel()]
                )
            }
            .alert("Upload Status", isPresented: $showingAlert) {
                Button("OK") { }
            } message: {
                Text(alertMessage)
            }
            .onChange(of: selectedImage) { image in
                if let image = image {
                    Task {
                        await uploadReport(image: image)
                    }
                }
            }
            .onChange(of: viewModel.error) { error in
                if let error = error {
                    alertMessage = error
                    showingAlert = true
                    viewModel.clearError()
                }
            }
        }
    }
    
    // MARK: - Red Flag Alerts Section
    
    private var redFlagAlertsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "exclamationmark.triangle.fill")
                    .foregroundColor(.red)
                Text("Health Alerts")
                    .font(.headline)
                    .fontWeight(.bold)
                Spacer()
                Text("\(viewModel.redFlagAlerts.count)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.red)
                    .foregroundColor(.white)
                    .clipShape(Capsule())
            }
            
            ForEach(viewModel.redFlagAlerts.prefix(3)) { alert in
                RedFlagAlertCard(alert: alert) {
                    viewModel.dismissRedFlagAlert(alert)
                }
            }
            
            if viewModel.redFlagAlerts.count > 3 {
                NavigationLink("View All \(viewModel.redFlagAlerts.count) Alerts") {
                    AllAlertsView(alerts: viewModel.redFlagAlerts)
                }
                .font(.subheadline)
                .foregroundColor(.blue)
            }
        }
        .padding()
        .background(Color.red.opacity(0.05))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - Health Score Section
    
    private var healthScoreSection: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Overall Health Score")
                        .font(.headline)
                        .fontWeight(.bold)
                    
                    Text(viewModel.healthCategory.rawValue.capitalized)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                VStack {
                    Text(viewModel.healthCategoryEmoji)
                        .font(.system(size: 40))
                    
                    Text("\(Int(viewModel.healthScore))")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(Color(viewModel.healthCategoryColor))
                }
            }
            
            ProgressView(value: viewModel.healthScore, total: 100)
                .progressViewStyle(LinearProgressViewStyle(tint: Color(viewModel.healthCategoryColor)))
            
            if let insights = viewModel.healthInsights {
                Text(insights.overallHealth.summary)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.leading)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - Upload Section
    
    private var uploadSection: some View {
        VStack(spacing: 16) {
            HStack {
                Text("Upload Health Report")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                if viewModel.isUploading || viewModel.isProcessing {
                    ProgressView()
                        .scaleEffect(0.8)
                }
            }
            
            if viewModel.isUploading {
                VStack(spacing: 8) {
                    ProgressView(value: viewModel.uploadProgress)
                        .progressViewStyle(LinearProgressViewStyle(tint: .blue))
                    
                    Text("Uploading... \(Int(viewModel.uploadProgress * 100))%")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            } else if viewModel.isProcessing {
                VStack(spacing: 8) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .blue))
                    
                    Text("AI is analyzing your report...")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            } else {
                Button(action: {
                    showingReportTypePicker = true
                }) {
                    HStack {
                        Image(systemName: "camera.fill")
                        Text("Upload Report")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            
            // Supported report types
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(HealthReportType.allCases.prefix(6)), id: \.self) { reportType in
                        Text(reportType.displayName)
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Color(.systemGray5))
                            .clipShape(Capsule())
                    }
                }
                .padding(.horizontal)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color(.systemGray4), lineWidth: 1)
        )
    }
    
    // MARK: - Recent Reports Section
    
    private var recentReportsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Recent Reports")
                    .font(.headline)
                    .fontWeight(.bold)
                
                Spacer()
                
                if !viewModel.healthReports.isEmpty {
                    NavigationLink("View All") {
                        AllReportsView(reports: viewModel.healthReports)
                    }
                    .font(.subheadline)
                    .foregroundColor(.blue)
                }
            }
            
            if viewModel.isLoading {
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Loading reports...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
            } else if viewModel.recentReports.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "doc.text")
                        .font(.system(size: 32))
                        .foregroundColor(.secondary)
                    
                    Text("No recent reports")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Text("Upload your first health report to get AI-powered insights")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding()
            } else {
                ForEach(viewModel.recentReports.prefix(3)) { report in
                    HealthReportCard(report: report)
                }
            }
        }
    }
    
    // MARK: - Health Insights Section
    
    private func healthInsightsSection(insights: HealthInsights) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("AI Health Insights")
                .font(.headline)
                .fontWeight(.bold)
            
            if !insights.recommendations.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recommendations")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(insights.recommendations.prefix(3), id: \.title) { recommendation in
                        HealthRecommendationCard(recommendation: recommendation)
                    }
                }
            }
            
            if !insights.trends.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Health Trends")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    ForEach(insights.trends.prefix(3), id: \.parameter) { trend in
                        HealthTrendCard(trend: trend)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    // MARK: - Helper Methods
    
    private func uploadReport(image: UIImage) async {
        await viewModel.uploadHealthReport(
            reportType: selectedReportType,
            image: image,
            additionalData: [
                "uploadedFrom": "iOS",
                "reportType": selectedReportType.rawValue
            ]
        )
        selectedImage = nil
    }
}

// MARK: - Supporting Views

struct RedFlagAlertCard: View {
    let alert: RedFlagAlert
    let onDismiss: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(alert.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Spacer()
                    
                    Text(alert.severity.rawValue.uppercased())
                        .font(.caption)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(severityColor(alert.severity))
                        .foregroundColor(.white)
                        .clipShape(Capsule())
                }
                
                Text(alert.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                if alert.requiresPhysicianAttention {
                    Text("⚠️ Requires physician attention")
                        .font(.caption)
                        .foregroundColor(.red)
                        .fontWeight(.medium)
                }
            }
            
            Button(action: onDismiss) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(severityColor(alert.severity), lineWidth: 2)
        )
    }
    
    private func severityColor(_ severity: AlertSeverity) -> Color {
        switch severity {
        case .low: return .blue
        case .medium: return .orange
        case .high: return .red
        case .critical: return .purple
        }
    }
}

struct HealthReportCard: View {
    let report: HealthReport
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(reportTypeDisplayName(report.reportType))
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(formatDate(report.uploadedAt))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            statusIndicator(report.status)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    private func reportTypeDisplayName(_ type: String) -> String {
        HealthReportType(rawValue: type)?.displayName ?? type.capitalized
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return dateString }
        
        let displayFormatter = DateFormatter()
        displayFormatter.dateStyle = .medium
        displayFormatter.timeStyle = .short
        return displayFormatter.string(from: date)
    }
    
    private func statusIndicator(_ status: HealthReportStatus) -> some View {
        HStack(spacing: 4) {
            Circle()
                .fill(statusColor(status))
                .frame(width: 8, height: 8)
            
            Text(status.rawValue.capitalized)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
    
    private func statusColor(_ status: HealthReportStatus) -> Color {
        switch status {
        case .uploaded: return .blue
        case .processing: return .orange
        case .processed: return .green
        case .failed: return .red
        }
    }
}

struct HealthRecommendationCard: View {
    let recommendation: HealthRecommendation
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(recommendation.title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(recommendation.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
            }
            
            Spacer()
            
            Text(recommendation.priority.rawValue.uppercased())
                .font(.caption)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(priorityColor(recommendation.priority))
                .foregroundColor(.white)
                .clipShape(Capsule())
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    private func priorityColor(_ priority: RecommendationPriority) -> Color {
        switch priority {
        case .low: return .blue
        case .medium: return .orange
        case .high: return .red
        case .critical: return .purple
        }
    }
}

struct HealthTrendCard: View {
    let trend: HealthTrend
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(trend.parameter.capitalized)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("\(trend.changePercentage > 0 ? "+" : "")\(Int(trend.changePercentage))% over \(trend.timeframe)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Image(systemName: trendIcon(trend.direction))
                .foregroundColor(trendColor(trend.direction))
                .font(.title2)
        }
        .padding(12)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
    
    private func trendIcon(_ direction: TrendDirection) -> String {
        switch direction {
        case .improving: return "arrow.up.circle.fill"
        case .stable: return "minus.circle.fill"
        case .worsening: return "arrow.down.circle.fill"
        case .fluctuating: return "arrow.up.arrow.down.circle.fill"
        }
    }
    
    private func trendColor(_ direction: TrendDirection) -> Color {
        switch direction {
        case .improving: return .green
        case .stable: return .blue
        case .worsening: return .red
        case .fluctuating: return .orange
        }
    }
}

// MARK: - Supporting Views for Navigation

struct AllAlertsView: View {
    let alerts: [RedFlagAlert]
    
    var body: some View {
        List(alerts) { alert in
            RedFlagAlertCard(alert: alert) {
                // Handle dismiss
            }
        }
        .navigationTitle("All Health Alerts")
    }
}

struct AllReportsView: View {
    let reports: [HealthReport]
    
    var body: some View {
        List(reports) { report in
            HealthReportCard(report: report)
        }
        .navigationTitle("All Reports")
    }
}

struct ImagePicker: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage?
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.selectedImage = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

// MARK: - Preview

struct HealthReportsView_Previews: PreviewProvider {
    static var previews: some View {
        HealthReportsView()
    }
}