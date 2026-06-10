import Foundation
import SwiftUI

enum VarietyType: String, Codable {
    case red
    case white
    case rose

    var label: String {
        switch self {
        case .red: "红葡萄"
        case .white: "白葡萄"
        case .rose: "桃红"
        }
    }

    var shortLabel: String {
        switch self {
        case .red: "红"
        case .white: "白"
        case .rose: "桃红"
        }
    }

    var tint: Color {
        switch self {
        case .red: PutaosoTheme.grapeDeep
        case .white: PutaosoTheme.leaf
        case .rose: PutaosoTheme.grape
        }
    }
}

enum VarietyStatus: String, Codable {
    case live
    case draft
    case planned
}

struct Variety: Identifiable, Codable, Hashable {
    let slug: String
    let number: Int
    let status: VarietyStatus
    let publishedAt: String?
    let nameEn: String
    let nameCn: String
    let aliases: [String]?
    let type: VarietyType
    let origin: String
    let parents: Parents?
    let heroQuote: String
    let heroScene: String
    let heroSceneCaption: String
    let flavorsProfessional: String
    let flavorsCasual: [String]
    let history: [String]
    let palate: Palate
    let price: Price
    let caveat: String
    let pairingIntro: String
    let pairings: [String]
    let avoid: String
    let regions: [Region]
    let bottles: [Bottle]
    let similar: [Similar]
    let flavorTags: [String]
    let occasionTags: [String]
    let beginnerFriendly: Bool
    let hasChinaPlanting: Bool
    let cardTagline: String
    let cardOriginShort: String

    var id: String { slug }
    var numberText: String { String(format: "N° %03d", number) }

    private enum CodingKeys: String, CodingKey {
        case slug, number, status, publishedAt, aliases, type, origin, parents, palate, price, caveat, pairings, avoid, regions, bottles, similar
        case nameEn = "name_en"
        case nameCn = "name_cn"
        case heroQuote = "hero_quote"
        case heroScene = "hero_scene"
        case heroSceneCaption = "hero_scene_caption"
        case flavorsProfessional = "flavors_professional"
        case flavorsCasual = "flavors_casual"
        case history
        case pairingIntro = "pairing_intro"
        case flavorTags = "flavor_tags"
        case occasionTags = "occasion_tags"
        case beginnerFriendly = "beginner_friendly"
        case hasChinaPlanting = "has_china_planting"
        case cardTagline = "card_tagline"
        case cardOriginShort = "card_origin_short"
    }
}

struct Parents: Codable, Hashable {
    let p1: String?
    let p2: String?
    let note: String?

    var displayText: String? {
        if let p1, let p2 {
            return [p1 + " × " + p2, note].compactMap { $0 }.joined(separator: " · ")
        }
        return note
    }
}

struct Palate: Codable, Hashable {
    let acidity: Int
    let acidityLabel: String
    let tannin: Int?
    let tanninLabel: String?
    let sweetness: Int?
    let sweetnessLabel: String?
    let body: Int
    let bodyLabel: String
    let beginnerDifficulty: Int
    let beginnerDifficultyLabel: String

    private enum CodingKeys: String, CodingKey {
        case acidity, tannin, sweetness, body
        case acidityLabel = "acidity_label"
        case tanninLabel = "tannin_label"
        case sweetnessLabel = "sweetness_label"
        case bodyLabel = "body_label"
        case beginnerDifficulty = "beginner_difficulty"
        case beginnerDifficultyLabel = "beginner_difficulty_label"
    }
}

struct Price: Codable, Hashable {
    let min: Int
    let max: Int
}

struct Region: Codable, Hashable {
    let nameEn: String
    let nameCn: String
    let badge: String
    let body: String
    let coordinate: RegionCoordinate?

    private enum CodingKeys: String, CodingKey {
        case badge, body, coordinate
        case nameEn = "name_en"
        case nameCn = "name_cn"
    }
}

struct RegionCoordinate: Codable, Hashable {
    let latitude: Double
    let longitude: Double
}

struct Bottle: Codable, Hashable {
    let nameEn: String
    let nameCn: String
    let price: Int
    let body: String

    private enum CodingKeys: String, CodingKey {
        case price, body
        case nameEn = "name_en"
        case nameCn = "name_cn"
    }
}

struct Similar: Codable, Hashable {
    let slug: String
    let nameEn: String
    let nameCn: String
    let body: String

    private enum CodingKeys: String, CodingKey {
        case slug, body
        case nameEn = "name_en"
        case nameCn = "name_cn"
    }
}
