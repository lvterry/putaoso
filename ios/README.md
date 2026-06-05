# Putaoso iOS

Native SwiftUI port of the Putaoso grape variety guide.

## Generate Project

```bash
cd ios
xcodegen generate
open Putaoso.xcodeproj
```

## Data

The app reads `Putaoso/Resources/varieties.json`, generated from the Astro markdown frontmatter:

```bash
node scripts/export-ios-data.mjs
```

Xcode also runs this exporter before each app build, so content changes in `src/content/varieties/*.md` flow into the iOS bundle.

## Build From CLI

```bash
cd ios
xcodebuild -project Putaoso.xcodeproj -target Putaoso -sdk iphonesimulator26.5 -configuration Debug CODE_SIGNING_ALLOWED=NO build
```
