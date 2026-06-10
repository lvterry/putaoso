import SwiftUI

struct DetailView: View {
    let variety: Variety
    let store: VarietyStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 28) {
                VStack(alignment: .leading, spacing: 10) {
                    Text(variety.numberText)
                        .font(.caption.monospaced())
                        .foregroundStyle(PutaosoTheme.muted)
                    Text(variety.nameEn)
                        .font(.system(size: 44, weight: .semibold, design: .serif))
                        .foregroundStyle(PutaosoTheme.ink)
                        .lineLimit(3)
                        .minimumScaleFactor(0.65)
                    Text(variety.nameCn)
                        .font(.title3.weight(.medium))
                        .foregroundStyle(PutaosoTheme.ink)
                    if let aliases = variety.aliases, !aliases.isEmpty {
                        Text("别名 · \(aliases.joined(separator: " · "))")
                            .font(.footnote)
                            .foregroundStyle(PutaosoTheme.muted)
                    }
                    Text(variety.heroQuote)
                        .font(.body)
                        .foregroundStyle(PutaosoTheme.ink)
                        .padding(.top, 6)
                }

                IllustrationView(slug: variety.slug)
                    .frame(height: 210)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .overlay(alignment: .bottomTrailing) {
                        Text(variety.heroSceneCaption)
                            .font(.caption2)
                            .padding(8)
                            .background(.black.opacity(0.42), in: RoundedRectangle(cornerRadius: 4))
                            .foregroundStyle(.white)
                            .padding(10)
                    }

                SectionBlock("它是谁") {
                    FactRow(label: "类型", value: variety.type.label)
                    FactRow(label: "原产地", value: variety.origin)
                    if let parents = variety.parents?.displayText {
                        FactRow(label: "亲本", value: parents)
                    }
                    FactRow(label: "葡萄科", value: "欧亚种葡萄 Vitis vinifera")
                }

                SectionBlock("喝起来什么样") {
                    Text(variety.flavorsProfessional)
                        .font(.headline)
                        .foregroundStyle(PutaosoTheme.ink)
                    ProseList(paragraphs: variety.flavorsCasual)
                    PalateView(variety: variety)
                }

                SectionBlock("多少钱能喝到合格表现") {
                    Text("¥\(variety.price.min) – \(variety.price.max)")
                        .font(.system(.largeTitle, design: .serif).weight(.semibold))
                        .foregroundStyle(variety.type.tint)
                    Label {
                        Text(variety.caveat.inlineMarkdown)
                    } icon: {
                        Image(systemName: "exclamationmark.triangle")
                    }
                    .font(.callout)
                    .foregroundStyle(PutaosoTheme.ink)
                    .padding(14)
                    .background(variety.type.tint.opacity(0.09), in: RoundedRectangle(cornerRadius: 8))
                }

                SectionBlock("配什么吃") {
                    Text(variety.pairingIntro.inlineMarkdown)
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(variety.pairings, id: \.self) { pairing in
                            Label(pairing, systemImage: "fork.knife")
                        }
                    }
                    .font(.callout)
                    Text(variety.avoid)
                        .font(.footnote)
                        .foregroundStyle(PutaosoTheme.muted)
                }

                CardSection(title: "三个代表产区", items: variety.regions) { region in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(region.nameCn)
                            .font(.headline)
                        Text(region.nameEn)
                            .font(.subheadline)
                            .foregroundStyle(PutaosoTheme.muted)
                        Text(region.body)
                            .font(.callout)
                    }
                }

                CardSection(title: "三款值得一试", items: variety.bottles) { bottle in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(bottle.nameEn)
                            .font(.headline)
                        Text("\(bottle.nameCn) · ≈ ¥\(bottle.price)")
                            .font(.subheadline)
                            .foregroundStyle(PutaosoTheme.muted)
                        Text(bottle.body)
                            .font(.callout)
                    }
                }

                SectionBlock("喜欢\(variety.nameCn)，还可以试试") {
                    ForEach(variety.similar, id: \.slug) { item in
                        if let linked = store.variety(slug: item.slug), linked.status == .live {
                            NavigationLink(value: linked) {
                                SimilarRow(item: item)
                            }
                            .buttonStyle(.plain)
                        } else {
                            SimilarRow(item: item)
                        }
                    }
                }

                SectionBlock("关于这个品种") {
                    ProseList(paragraphs: variety.history)
                }
            }
            .padding(20)
        }
        .background(PutaosoTheme.paper)
        .navigationTitle(variety.nameCn)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar(.visible, for: .navigationBar)
    }
}

struct SectionBlock<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    init(_ title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(PutaosoTheme.ink)
            content
        }
    }
}

struct FactRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(PutaosoTheme.muted)
                .frame(width: 76, alignment: .leading)
            Text(value)
                .foregroundStyle(PutaosoTheme.ink)
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

struct ProseList: View {
    let paragraphs: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ForEach(paragraphs, id: \.self) { paragraph in
                Text(paragraph.inlineMarkdown)
                    .font(.body)
                    .foregroundStyle(PutaosoTheme.ink)
            }
        }
    }
}

struct CardSection<Item: Hashable, Content: View>: View {
    let title: String
    let items: [Item]
    @ViewBuilder let content: (Item) -> Content

    var body: some View {
        SectionBlock(title) {
            VStack(spacing: 12) {
                ForEach(items, id: \.self) { item in
                    content(item)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(14)
                        .background(.white.opacity(0.45), in: RoundedRectangle(cornerRadius: 8))
                        .overlay {
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(PutaosoTheme.line.opacity(0.4), lineWidth: 1)
                        }
                }
            }
        }
    }
}

struct SimilarRow: View {
    let item: Similar

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(item.nameEn)
                    .font(.headline)
                Text(item.nameCn)
                    .font(.subheadline)
                    .foregroundStyle(PutaosoTheme.muted)
            }
            Text(item.body)
                .font(.callout)
                .foregroundStyle(PutaosoTheme.ink)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 6)
    }
}
