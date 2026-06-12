import SwiftUI
import UIKit
import Photos

struct IllustrationView: View {
    let slug: String

    var body: some View {
        Group {
            if let image = IllustrationImageCache.shared.image(named: slug) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFill()
            } else {
                Rectangle()
                    .fill(PutaosoTheme.paperWarm)
                    .overlay {
                        Image(systemName: "photo")
                            .font(.title2)
                            .foregroundStyle(PutaosoTheme.muted)
                    }
            }
        }
    }
}

struct IllustrationPreview: View {
    let image: UIImage
    let title: String

    @Environment(\.dismiss) private var dismiss
    @GestureState private var pinchScale: CGFloat = 1
    @State private var baseScale: CGFloat = 1
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero
    @State private var saveAlert: SaveAlert?
    @StateObject private var imageSaver = IllustrationImageSaver()

    private var currentScale: CGFloat {
        clamp(baseScale * pinchScale, min: 1, max: 5)
    }

    var body: some View {
        ZStack(alignment: .top) {
            Color.black
                .ignoresSafeArea()

            Image(uiImage: image)
                .resizable()
                .scaledToFit()
                .scaleEffect(currentScale)
                .offset(offset)
                .animation(.spring(response: 0.28, dampingFraction: 0.86), value: baseScale)
                .animation(.spring(response: 0.28, dampingFraction: 0.86), value: offset)
                .gesture(pinchGesture)
                .simultaneousGesture(dragGesture)
                .onTapGesture(count: 2, perform: toggleZoom)
                .contextMenu {
                    Button {
                        imageSaver.save(image) { result in
                            saveAlert = result.alert
                        }
                    } label: {
                        Label("保存图片", systemImage: "square.and.arrow.down")
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .accessibilityLabel(title)

            previewChrome
        }
        .statusBarHidden(true)
        .alert(item: $saveAlert) { alert in
            Alert(
                title: Text(alert.title),
                message: Text(alert.message),
                dismissButton: .default(Text("好"))
            )
        }
    }

    private var previewChrome: some View {
        HStack(spacing: 12) {
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(.white.opacity(0.16), in: Circle())
            }
            .accessibilityLabel("关闭大图预览")

            Text(title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.white.opacity(0.9))
                .lineLimit(1)

            Spacer()
        }
        .padding(.horizontal, 18)
        .padding(.top, 18)
    }

    private var pinchGesture: some Gesture {
        MagnifyGesture(minimumScaleDelta: 0.01)
            .updating($pinchScale) { value, state, _ in
                state = value.magnification
            }
            .onEnded { value in
                baseScale = clamp(baseScale * value.magnification, min: 1, max: 5)
                if baseScale == 1 {
                    offset = .zero
                    lastOffset = .zero
                }
            }
    }

    private var dragGesture: some Gesture {
        DragGesture()
            .onChanged { value in
                guard currentScale > 1 else { return }
                offset = CGSize(
                    width: lastOffset.width + value.translation.width,
                    height: lastOffset.height + value.translation.height
                )
            }
            .onEnded { _ in
                guard currentScale > 1 else {
                    offset = .zero
                    lastOffset = .zero
                    return
                }
                lastOffset = offset
            }
    }

    private func toggleZoom() {
        withAnimation(.spring(response: 0.28, dampingFraction: 0.86)) {
            if baseScale > 1 {
                baseScale = 1
                offset = .zero
                lastOffset = .zero
            } else {
                baseScale = 2.4
            }
        }
    }

    private func clamp(_ value: CGFloat, min: CGFloat, max: CGFloat) -> CGFloat {
        Swift.min(Swift.max(value, min), max)
    }
}

@MainActor
final class IllustrationImageSaver: ObservableObject {
    func save(_ image: UIImage, completion: @escaping (SaveResult) -> Void) {
        let status = PHPhotoLibrary.authorizationStatus(for: .addOnly)

        switch status {
        case .authorized, .limited:
            write(image, completion: completion)
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization(for: .addOnly) { [weak self] newStatus in
                Task { @MainActor in
                    guard let self else { return }
                    if newStatus == .authorized || newStatus == .limited {
                        self.write(image, completion: completion)
                    } else {
                        completion(.denied)
                    }
                }
            }
        case .denied, .restricted:
            completion(.denied)
        @unknown default:
            completion(.denied)
        }
    }

    private func write(_ image: UIImage, completion: @escaping (SaveResult) -> Void) {
        PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.creationRequestForAsset(from: image)
        } completionHandler: { success, error in
            Task { @MainActor in
                if success {
                    completion(.saved)
                } else {
                    completion(.failed(error?.localizedDescription))
                }
            }
        }
    }
}

enum SaveResult {
    case saved
    case denied
    case failed(String?)

    var alert: SaveAlert {
        switch self {
        case .saved:
            SaveAlert(title: "已保存", message: "图片已保存到系统照片。")
        case .denied:
            SaveAlert(title: "无法保存", message: "请在系统设置里允许葡萄搜添加照片。")
        case .failed(let message):
            SaveAlert(title: "保存失败", message: message ?? "请稍后再试。")
        }
    }
}

struct SaveAlert: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}

final class IllustrationImageCache {
    static let shared = IllustrationImageCache()

    private let cache = NSCache<NSString, UIImage>()

    private init() {
        cache.countLimit = 6
    }

    func image(named slug: String) -> UIImage? {
        let key = slug as NSString

        if let image = cache.object(forKey: key) {
            return image
        }

        guard
            let url = Bundle.main.url(forResource: slug, withExtension: "jpg", subdirectory: "Illustrations")
                ?? Bundle.main.url(forResource: slug, withExtension: "png", subdirectory: "Illustrations"),
            let image = UIImage(contentsOfFile: url.path)
        else {
            return nil
        }

        let prepared = image.preparingForDisplay() ?? image
        cache.setObject(prepared, forKey: key)
        return prepared
    }
}
