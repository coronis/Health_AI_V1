import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Dashboard")
                }
                .tag(0)
            
            MealPlanView()
                .tabItem {
                    Image(systemName: "fork.knife")
                    Text("Meal Plan")
                }
                .tag(1)
            
            ChatView()
                .tabItem {
                    Image(systemName: "message.circle.fill")
                    Text("AI Chat")
                }
                .tag(2)
            
            HealthReportsView()
                .tabItem {
                    Image(systemName: "heart.text.square.fill")
                    Text("Health")
                }
                .tag(3)
            
            LogView()
                .tabItem {
                    Image(systemName: "note.text")
                    Text("Log")
                }
                .tag(4)
            
            FitnessView()
                .tabItem {
                    Image(systemName: "figure.run")
                    Text("Fitness")
                }
                .tag(5)
            
            SettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
                .tag(6)
        }
        .accentColor(Color(hex: "#14b8a6")) // Primary turquoise from design system
        .preferredColorScheme(.automatic) // Support both light and dark mode
    }
}

#Preview {
    ContentView()
}