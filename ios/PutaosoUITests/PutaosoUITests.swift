import XCTest

final class PutaosoUITests: XCTestCase {
    func testRegionMapCalloutScreenshot() throws {
        let app = XCUIApplication()
        app.launch()

        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 8))
        sleep(2)

        let window = app.windows.firstMatch
        XCTAssertTrue(window.waitForExistence(timeout: 3))

        window.coordinate(withNormalizedOffset: CGVector(dx: 0.42, dy: 0.17)).tap()

        XCTAssertTrue(app.staticTexts["查看详情"].waitForExistence(timeout: 5))

        if let screenshotPath = ProcessInfo.processInfo.environment["PUTAOSO_UI_SCREENSHOT_PATH"] {
            try XCUIScreen.main.screenshot().pngRepresentation.write(
                to: URL(fileURLWithPath: screenshotPath)
            )
        }
    }
}
