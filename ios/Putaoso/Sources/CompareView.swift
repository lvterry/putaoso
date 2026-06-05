import SwiftUI

struct CompareView: View {
    let varieties: [Variety]
    @Environment(\.dismiss) private var dismiss
    @State private var selectedSlugs: Set<String> = []

    private var selected: [Variety] {
        varieties.filter { selectedSlugs.contains($0.slug) }.sorted { $0.number < $1.number }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                List(varieties) { variety in
                    Button {
                        toggle(variety)
                    } label: {
                        HStack(spacing: 12) {
                            Text(variety.type.shortLabel)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(variety.type.tint)
                                .frame(width: 42)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(variety.nameEn)
                                    .font(.headline)
                                Text(variety.nameCn)
                                    .font(.subheadline)
                                    .foregroundStyle(PutaosoTheme.muted)
                            }
                            Spacer()
                            Image(systemName: selectedSlugs.contains(variety.slug) ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(selectedSlugs.contains(variety.slug) ? variety.type.tint : PutaosoTheme.line)
                        }
                    }
                    .buttonStyle(.plain)
                }
                .frame(maxHeight: selected.isEmpty ? .infinity : 260)

                if selected.isEmpty {
                    ContentUnavailableView("还没有选择品种", systemImage: "rectangle.split.3x1", description: Text("最多选择 4 个品种进行对比"))
                        .background(PutaosoTheme.paper)
                } else {
                    ScrollView(.horizontal) {
                        HStack(alignment: .top, spacing: 12) {
                            ForEach(selected) { variety in
                                CompareColumn(variety: variety)
                                    .frame(width: 220)
                            }
                        }
                        .padding(16)
                    }
                    .background(PutaosoTheme.paper)
                }
            }
            .navigationTitle("品种对比")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("关闭") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Text("已选 \(selectedSlugs.count) 个")
                        .font(.caption)
                        .foregroundStyle(PutaosoTheme.muted)
                }
            }
        }
    }

    private func toggle(_ variety: Variety) {
        if selectedSlugs.contains(variety.slug) {
            selectedSlugs.remove(variety.slug)
        } else if selectedSlugs.count < 4 {
            selectedSlugs.insert(variety.slug)
        }
    }
}

struct CompareColumn: View {
    let variety: Variety

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(variety.nameEn)
                .font(.system(.title3, design: .serif).weight(.semibold))
                .foregroundStyle(PutaosoTheme.ink)
                .lineLimit(3)
                .minimumScaleFactor(0.8)
            Text(variety.nameCn)
                .font(.headline)
                .foregroundStyle(PutaosoTheme.ink)
            CompareField("类型", variety.type.label)
            CompareField("原产地", variety.origin)
            CompareField("风味", extractFlavors(variety.flavorsProfessional).joined(separator: "、"))
            PalateView(variety: variety)
            CompareField("价格区间", "¥\(variety.price.min) – ¥\(variety.price.max)")
            CompareField("配餐推荐", variety.pairings.prefix(2).joined(separator: "\n"))
        }
        .padding(14)
        .background(.white.opacity(0.55), in: RoundedRectangle(cornerRadius: 8))
        .overlay {
            RoundedRectangle(cornerRadius: 8)
                .stroke(PutaosoTheme.line.opacity(0.4), lineWidth: 1)
        }
    }

    private func extractFlavors(_ text: String) -> [String] {
        text
            .components(separatedBy: CharacterSet(charactersIn: "。、，,（）() "))
            .filter { !$0.isEmpty && $0.count <= 8 }
            .prefix(5)
            .map { String($0) }
    }
}

struct CompareField: View {
    let label: String
    let value: String

    init(_ label: String, _ value: String) {
        self.label = label
        self.value = value
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(PutaosoTheme.muted)
            Text(value)
                .font(.callout)
                .foregroundStyle(PutaosoTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
