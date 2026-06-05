import SwiftUI

struct PalateView: View {
    let variety: Variety

    var body: some View {
        VStack(spacing: 12) {
            PalateMetricView(name: "酸度", value: variety.palate.acidity, label: variety.palate.acidityLabel, tint: variety.type.tint)

            if variety.type == .red {
                PalateMetricView(
                    name: "单宁",
                    value: variety.palate.tannin ?? 0,
                    label: variety.palate.tanninLabel ?? "",
                    tint: variety.type.tint
                )
            } else {
                PalateMetricView(
                    name: "甜度",
                    value: variety.palate.sweetness ?? 0,
                    label: variety.palate.sweetnessLabel ?? "",
                    tint: variety.type.tint
                )
            }

            PalateMetricView(name: "酒体", value: variety.palate.body, label: variety.palate.bodyLabel, tint: variety.type.tint)
            PalateMetricView(name: "入门难度", value: variety.palate.beginnerDifficulty, label: variety.palate.beginnerDifficultyLabel, tint: variety.type.tint)
        }
        .padding(16)
        .background(PutaosoTheme.paperWarm.opacity(0.65), in: RoundedRectangle(cornerRadius: 8))
    }
}

struct PalateMetricView: View {
    let name: String
    let value: Int
    let label: String
    let tint: Color

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.caption)
                    .foregroundStyle(PutaosoTheme.muted)
                Text(label)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(PutaosoTheme.ink)
            }
            .frame(width: 78, alignment: .leading)

            HStack(spacing: 6) {
                ForEach(0..<5, id: \.self) { index in
                    Circle()
                        .fill(index < value ? tint : PutaosoTheme.line.opacity(0.35))
                        .frame(width: 10, height: 10)
                }
            }
            Spacer()
        }
    }
}
