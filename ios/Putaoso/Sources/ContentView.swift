import MapKit
import SwiftUI

struct ContentView: View {
    let store: VarietyStore
    @State private var searchText = ""

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
                    GeometryReader { proxy in
                        ScrollView {
                            HomeRegionMapView(varieties: store.live)
                                .frame(height: mapHeight(in: proxy.size.height))
                                .ignoresSafeArea(edges: .top)

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
                        .ignoresSafeArea(edges: .top)
                    }
                }
            }
            .navigationDestination(for: Variety.self) { variety in
                DetailView(variety: variety, store: store)
            }
            .searchable(text: $searchText, prompt: "搜索品种、中文名、产地")
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    private func mapHeight(in height: CGFloat) -> CGFloat {
        min(max(height * 0.54, 360), height * 0.68)
    }
}

struct HomeRegionMapView: View {
    private let markers: [HomeRegionMarker]
    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 22, longitude: 20),
            span: MKCoordinateSpan(latitudeDelta: 138, longitudeDelta: 320)
        )
    )
    @State private var selectedMarkerID: String?

    init(varieties: [Variety]) {
        self.markers = Self.makeMarkers(varieties: varieties)
    }

    private var selectedMarker: HomeRegionMarker? {
        markers.first { $0.id == selectedMarkerID }
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            Map(position: $position, interactionModes: .all, selection: $selectedMarkerID) {
                ForEach(markers) { marker in
                    Marker(marker.region.nameCn, coordinate: marker.coordinate)
                        .tint(marker.variety.type.tint)
                        .tag(marker.id)
                }
            }
            .mapControlVisibility(.visible)
            .mapControls {
                MapCompass()
                MapScaleView()
            }
            .mapStyle(.standard(elevation: .flat, pointsOfInterest: .excludingAll))

            if let selectedMarker {
                RegionMapCallout(marker: selectedMarker) {
                    selectedMarkerID = nil
                }
                .padding(12)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.18), value: selectedMarkerID)
    }

    private static func makeMarkers(varieties: [Variety]) -> [HomeRegionMarker] {
        var buckets: [String: [HomeRegionMarkerSeed]] = [:]

        for variety in varieties.sorted(by: { $0.number < $1.number }) {
            for (regionIndex, region) in variety.regions.enumerated() {
                guard let coordinate = region.coordinate else {
                    continue
                }

                let key = String(format: "%.4f,%.4f", coordinate.latitude, coordinate.longitude)
                let seed = HomeRegionMarkerSeed(
                    id: "\(variety.slug)-\(regionIndex)",
                    variety: variety,
                    region: region,
                    coordinate: coordinate
                )
                buckets[key, default: []].append(seed)
            }
        }

        return buckets.keys.sorted().flatMap { key in
            let seeds = buckets[key] ?? []

            return seeds.enumerated().map { index, seed in
                let adjusted = adjustedCoordinate(seed.coordinate, index: index, count: seeds.count)
                return HomeRegionMarker(
                    id: seed.id,
                    variety: seed.variety,
                    region: seed.region,
                    latitude: adjusted.latitude,
                    longitude: adjusted.longitude
                )
            }
        }
    }

    private static func adjustedCoordinate(
        _ coordinate: RegionCoordinate,
        index: Int,
        count: Int
    ) -> (latitude: Double, longitude: Double) {
        guard count > 1 else {
            return (coordinate.latitude, coordinate.longitude)
        }

        let angle = (Double(index) / Double(count)) * Double.pi * 2
        let ring = Double(index / 8 + 1)
        let radius = 0.08 * ring

        return (
            coordinate.latitude + sin(angle) * radius,
            coordinate.longitude + cos(angle) * radius
        )
    }
}

private struct HomeRegionMarkerSeed {
    let id: String
    let variety: Variety
    let region: Region
    let coordinate: RegionCoordinate
}

private struct HomeRegionMarker: Identifiable {
    let id: String
    let variety: Variety
    let region: Region
    let latitude: Double
    let longitude: Double

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

private struct RegionMapCallout: View {
    let marker: HomeRegionMarker
    let onClose: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Spacer()
                Button {
                    onClose()
                } label: {
                    Image(systemName: "xmark")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(PutaosoTheme.muted)
                        .frame(width: 26, height: 26)
                }
                .buttonStyle(.plain)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(marker.region.nameCn)
                    .font(.headline)
                    .foregroundStyle(PutaosoTheme.ink)
                    .lineLimit(2)
                Text(marker.region.nameEn)
                    .font(.subheadline)
                    .foregroundStyle(PutaosoTheme.muted)
                    .lineLimit(2)
            }

            Divider()

            VStack(alignment: .leading, spacing: 4) {
                Text(marker.variety.nameCn)
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(PutaosoTheme.ink)
                    .lineLimit(2)
                Text(marker.variety.nameEn)
                    .font(.system(.headline, design: .serif).italic())
                    .foregroundStyle(PutaosoTheme.grapeDeep)
                    .lineLimit(2)
            }

            Text(marker.variety.cardTagline)
                .font(.footnote)
                .foregroundStyle(PutaosoTheme.ink)
                .fixedSize(horizontal: false, vertical: true)

            NavigationLink(value: marker.variety) {
                Text("查看详情")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(marker.variety.type.tint, in: RoundedRectangle(cornerRadius: 8))
            }
            .buttonStyle(.plain)
            .padding(.top, 4)
        }
        .padding(16)
        .frame(maxWidth: 330, alignment: .leading)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
        .overlay {
            RoundedRectangle(cornerRadius: 8)
                .stroke(marker.variety.type.tint.opacity(0.28), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.16), radius: 24, x: 0, y: 14)
    }
}

struct VarietyCard: View {
    let variety: Variety

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            IllustrationView(slug: variety.slug)
                .frame(height: 128)
                .frame(maxWidth: .infinity)
                .clipped()

            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 7) {
                    Text(variety.nameEn)
                        .font(.system(.title3, design: .serif).weight(.semibold))
                        .foregroundStyle(PutaosoTheme.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.82)
                    Text(variety.nameCn)
                        .font(.headline)
                        .foregroundStyle(PutaosoTheme.ink)
                    Text(variety.cardTagline)
                        .font(.footnote)
                        .foregroundStyle(PutaosoTheme.muted)
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                HStack {
                    Text(variety.status == .live ? "产地" : "状态")
                        .font(.caption2)
                        .foregroundStyle(PutaosoTheme.muted)
                    Spacer()
                    Text(variety.status == .live ? variety.cardOriginShort : "即将推出")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(PutaosoTheme.ink)
                        .lineLimit(1)
                        .minimumScaleFactor(0.82)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 142, alignment: .leading)
        }
        .frame(maxWidth: .infinity, minHeight: 270, alignment: .leading)
        .background(.white.opacity(0.64), in: RoundedRectangle(cornerRadius: 8))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay {
            RoundedRectangle(cornerRadius: 8)
                .stroke(PutaosoTheme.line.opacity(0.45), lineWidth: 1)
        }
    }
}
