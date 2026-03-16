import Foundation
import AppKit

let outputDir = URL(fileURLWithPath: "/Users/misabelakov/Documents/uni-market/miniprogram/assets/tabbar", isDirectory: true)
try? FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

let canvasSize = CGSize(width: 81, height: 81)
let iconPointSize: CGFloat = 34
let normalColor = NSColor(calibratedWhite: 0.72, alpha: 1)
let activeColor = NSColor(calibratedWhite: 0.07, alpha: 1)

let iconMap: [(name: String, symbol: String)] = [
  ("search", "magnifyingglass"),
  ("saved", "heart"),
  ("post", "plus.square"),
  ("listings", "square.grid.2x2"),
  ("profile", "person.circle")
]

func makeIcon(symbolName: String, color: NSColor) -> NSImage? {
  guard let symbol = NSImage(systemSymbolName: symbolName, accessibilityDescription: nil) else {
    return nil
  }

  let configuration = NSImage.SymbolConfiguration(pointSize: iconPointSize, weight: .medium, scale: .large)
  let configured = symbol.withSymbolConfiguration(configuration) ?? symbol
  let tinted = configured.copy() as? NSImage ?? configured
  tinted.isTemplate = true

  let image = NSImage(size: canvasSize)
  image.lockFocus()
  NSColor.clear.set()
  NSRect(origin: .zero, size: canvasSize).fill()

  let targetSize = configured.size
  let targetRect = NSRect(
    x: (canvasSize.width - targetSize.width) / 2,
    y: (canvasSize.height - targetSize.height) / 2 + 2,
    width: targetSize.width,
    height: targetSize.height
  )

  color.set()
  tinted.draw(in: targetRect, from: .zero, operation: .sourceOver, fraction: 1)
  image.unlockFocus()
  return image
}

func writePNG(_ image: NSImage, to url: URL) {
  guard
    let tiff = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiff),
    let png = bitmap.representation(using: .png, properties: [:])
  else {
    return
  }

  try? png.write(to: url)
}

for item in iconMap {
  if let normal = makeIcon(symbolName: item.symbol, color: normalColor) {
    writePNG(normal, to: outputDir.appendingPathComponent("\(item.name)-normal.png"))
  }

  if let active = makeIcon(symbolName: item.symbol, color: activeColor) {
    writePNG(active, to: outputDir.appendingPathComponent("\(item.name)-active.png"))
  }
}

print("tabbar icons regenerated with SF Symbols")
