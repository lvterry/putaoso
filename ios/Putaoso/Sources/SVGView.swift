import SwiftUI
import UIKit

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
