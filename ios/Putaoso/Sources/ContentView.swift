import SwiftUI

struct ContentView: View {
    let store: VarietyStore
    @State private var searchText = ""
    @State private var showingCompare = false

    private var filtered: [Variety] {
        let items = store.varieties.sorted { $0.number < $1.number }
        guard !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return items
        }
        return items.filter {
            $0.nameEn.localizedCaseInsensitiveContains(searchText)
                || $0.nameCn.localizedCaseInsensitiveContains(searchText)
                || $0.origin.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if let loadError = store.loadError {
                    ContentUnavailableView("无法加载品种数据", systemImage: "exclamationmark.triangle", description: Text(loadError))
                } else {
                    ScrollView {
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 156), spacing: 14)], spacing: 14) {
                            ForEach(filtered) { variety in
                                if variety.status == .live {
                                    NavigationLink(value: variety) {
                                        VarietyCard(variety: variety)
                                    }
                                    .buttonStyle(.plain)
                                } else {
                                    VarietyCard(variety: variety)
                                }
                            }
                        }
                        .padding(16)
                    }
                    .background(PutaosoTheme.paper)
                }
            }
            .navigationDestination(for: Variety.self) { variety in
                DetailView(variety: variety, store: store)
            }
            .searchable(text: $searchText, prompt: "搜索品种、中文名、产地")
            .toolbar {
                ToolbarItem(placement: .principal) {
                    HStack(spacing: 8) {
                        Image("logo")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 30, height: 30)
                        Text("葡萄搜")
                            .font(.headline)
                            .foregroundStyle(PutaosoTheme.ink)
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showingCompare = true
                    } label: {
                        Label("品种对比", systemImage: "rectangle.split.3x1")
                    }
                }
            }
            .sheet(isPresented: $showingCompare) {
                CompareView(varieties: store.live)
            }
        }
    }
}

struct VarietyCard: View {
    let variety: Variety

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(variety.numberText)
                    .font(.caption.monospaced())
                    .foregroundStyle(PutaosoTheme.muted)
                Spacer()
                Text(variety.type.shortLabel)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(variety.type.tint)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(variety.type.tint.opacity(0.12), in: Capsule())
            }

            Spacer(minLength: 10)

            VStack(alignment: .leading, spacing: 8) {
                Text(variety.nameEn)
                    .font(.system(.title3, design: .serif).weight(.semibold))
                    .foregroundStyle(PutaosoTheme.ink)
                    .lineLimit(3)
                    .minimumScaleFactor(0.82)
                Text(variety.nameCn)
                    .font(.headline)
                    .foregroundStyle(PutaosoTheme.ink)
                Text(variety.cardTagline)
                    .font(.footnote)
                    .foregroundStyle(PutaosoTheme.muted)
                    .lineLimit(2)
            }

            HStack {
                Text(variety.status == .live ? "产地" : "状态")
                    .font(.caption2)
                    .foregroundStyle(PutaosoTheme.muted)
                Spacer()
                Text(variety.status == .live ? variety.cardOriginShort : "即将推出")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(PutaosoTheme.ink)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 210, alignment: .leading)
        .padding(16)
        .background(.white.opacity(0.64), in: RoundedRectangle(cornerRadius: 8))
        .overlay {
            RoundedRectangle(cornerRadius: 8)
                .stroke(PutaosoTheme.line.opacity(0.45), lineWidth: 1)
        }
    }
}
