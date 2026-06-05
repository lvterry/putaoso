import SwiftUI

enum PutaosoTheme {
    static let paper = Color(red: 0.984, green: 0.969, blue: 1.0)
    static let paperWarm = Color(red: 0.937, green: 0.894, blue: 1.0)
    static let ink = Color(red: 0.063, green: 0.031, blue: 0.078)
    static let muted = Color(red: 0.42, green: 0.36, blue: 0.45)
    static let line = Color(red: 0.851, green: 0.776, blue: 0.937)
    static let grape = Color(red: 0.624, green: 0.259, blue: 0.957)
    static let grapeDeep = Color(red: 0.392, green: 0.082, blue: 0.722)
    static let leaf = Color(red: 0.094, green: 0.659, blue: 0.310)
}

extension String {
    var inlineMarkdown: AttributedString {
        let normalized = replacingOccurrences(of: "**", with: "*")
        return (try? AttributedString(markdown: normalized)) ?? AttributedString(self)
    }
}
