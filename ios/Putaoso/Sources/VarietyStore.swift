import Foundation
import SwiftUI

@Observable
final class VarietyStore {
    private(set) var varieties: [Variety] = []
    private(set) var loadError: String?

    init(bundle: Bundle = .main) {
        do {
            guard let url = bundle.url(forResource: "varieties", withExtension: "json") else {
                loadError = "Missing varieties.json"
                return
            }
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            varieties = try decoder.decode([Variety].self, from: data)
        } catch {
            loadError = error.localizedDescription
        }
    }

    var live: [Variety] {
        varieties.filter { $0.status == .live }.sorted { $0.number < $1.number }
    }

    func variety(slug: String) -> Variety? {
        varieties.first { $0.slug == slug }
    }
}
