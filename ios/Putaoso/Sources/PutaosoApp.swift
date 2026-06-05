import SwiftUI

@main
struct PutaosoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView(store: VarietyStore())
        }
    }
}
