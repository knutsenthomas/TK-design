import AVFoundation
import AppKit
import CoreGraphics

struct Segment {
    let path: String
    let kind: String
    let duration: Double
    let caption: String
}

let downloads = "/Users/thomasknutsen/Downloads"
let outputPath = "/Users/thomasknutsen/Documents/Nettside/17-mai-feiring-norge.mp4"
let width = 1080
let height = 1920
let fps: Int32 = 30

let segments = [
    Segment(path: "\(downloads)/4f09435f-4833-4d27-84c6-c5211a3a5f14.jpeg", kind: "image", duration: 3.0, caption: "17. mai-feiring i Norge"),
    Segment(path: "\(downloads)/7983a577-7929-4358-9121-4ce4bdb8207f.mp4", kind: "video", duration: 8.0, caption: "Flagg, smil og fellesskap"),
    Segment(path: "\(downloads)/7ec49c99-6fa4-4ecb-8d2a-633d4a84b123.jpeg", kind: "image", duration: 2.7, caption: "Rødt, hvitt og blått på kontoret"),
    Segment(path: "\(downloads)/a5b97a82-8c52-4e54-8320-706d8ef2da33.mp4", kind: "video", duration: 2.7, caption: "Hurra for nasjonaldagen"),
    Segment(path: "\(downloads)/b6ce0495-9a7a-4103-9acd-24d048c1a0ac.mp4", kind: "video", duration: 2.7, caption: "Små øyeblikk blir gode minner"),
    Segment(path: "\(downloads)/b76fba6b-42ae-4d45-8836-0bd87b349964.jpeg", kind: "image", duration: 2.6, caption: "Norsk tradisjon og god stemning"),
    Segment(path: "\(downloads)/c28c98c0-46f1-4309-b720-8a7e979bb03b.mp4", kind: "video", duration: 6.0, caption: "En dag for glede og samhold"),
    Segment(path: "\(downloads)/c21eb210-1081-4a28-81d5-3467ebbfc788.jpeg", kind: "image", duration: 3.0, caption: "Jordbær hører dagen til"),
    Segment(path: "\(downloads)/fcb7b597-04ff-4743-9807-ff002f572c1d.mp4", kind: "video", duration: 5.0, caption: "Gratulerer med dagen!"),
    Segment(path: "\(downloads)/bbe06238-c66d-4eba-a2e9-8f9cd0b4ee4f.jpeg", kind: "image", duration: 3.0, caption: "17. mai  -  Norge i rødt, hvitt og blått")
]

try? FileManager.default.removeItem(atPath: outputPath)

let outputURL = URL(fileURLWithPath: outputPath)
let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 7_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height
    ]
)
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let colorSpace = CGColorSpaceCreateDeviceRGB()
let flags = CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue

func cgImage(for path: String) -> CGImage {
    let image = NSImage(contentsOfFile: path)!
    var rect = CGRect(origin: .zero, size: image.size)
    return image.cgImage(forProposedRect: &rect, context: nil, hints: nil)!
}

func drawAspectFill(_ image: CGImage, in context: CGContext, progress: Double, isStill: Bool) {
    let canvas = CGSize(width: width, height: height)
    let imageSize = CGSize(width: image.width, height: image.height)
    var scale = max(canvas.width / imageSize.width, canvas.height / imageSize.height)
    if isStill {
        scale *= 1.03 + CGFloat(progress) * 0.045
    }
    let drawSize = CGSize(width: imageSize.width * scale, height: imageSize.height * scale)
    let xDrift = isStill ? (CGFloat(progress) - 0.5) * 56 : 0
    let yDrift = isStill ? (0.5 - CGFloat(progress)) * 44 : 0
    let rect = CGRect(
        x: (canvas.width - drawSize.width) / 2 + xDrift,
        y: (canvas.height - drawSize.height) / 2 + yDrift,
        width: drawSize.width,
        height: drawSize.height
    )
    context.draw(image, in: rect)
}

func drawOverlay(in context: CGContext, caption: String, frameIndex: Int, totalFrames: Int) {
    let fadeFrames = max(1, min(18, totalFrames / 4))
    let intro = min(1, Double(frameIndex) / Double(fadeFrames))
    let outro = min(1, Double(totalFrames - frameIndex - 1) / Double(fadeFrames))
    let alpha = CGFloat(max(0, min(intro, outro)))

    context.saveGState()
    let top = CGGradient(
        colorsSpace: colorSpace,
        colors: [NSColor.black.withAlphaComponent(0.36).cgColor, NSColor.black.withAlphaComponent(0.0).cgColor] as CFArray,
        locations: [0, 1]
    )!
    context.drawLinearGradient(top, start: CGPoint(x: 0, y: CGFloat(height)), end: CGPoint(x: 0, y: CGFloat(height - 460)), options: [])
    let bottom = CGGradient(
        colorsSpace: colorSpace,
        colors: [NSColor.black.withAlphaComponent(0.0).cgColor, NSColor.black.withAlphaComponent(0.58).cgColor] as CFArray,
        locations: [0, 1]
    )!
    context.drawLinearGradient(bottom, start: CGPoint(x: 0, y: 520), end: CGPoint(x: 0, y: 0), options: [])

    let stripeY: CGFloat = CGFloat(height) - 114
    context.setFillColor(NSColor(red: 0.74, green: 0.05, blue: 0.08, alpha: 0.88 * alpha).cgColor)
    context.fill(CGRect(x: 72, y: stripeY, width: 206, height: 14))
    context.setFillColor(NSColor.white.withAlphaComponent(0.92 * alpha).cgColor)
    context.fill(CGRect(x: 72, y: stripeY - 24, width: 206, height: 10))
    context.setFillColor(NSColor(red: 0.02, green: 0.14, blue: 0.36, alpha: 0.9 * alpha).cgColor)
    context.fill(CGRect(x: 72, y: stripeY - 42, width: 206, height: 14))

    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .center
    let fontSize: CGFloat = caption.count > 30 ? 58 : 66
    let attrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: fontSize, weight: .bold),
        .foregroundColor: NSColor.white.withAlphaComponent(alpha),
        .paragraphStyle: paragraph,
        .strokeColor: NSColor.black.withAlphaComponent(0.45 * alpha),
        .strokeWidth: -2.0
    ]
    let text = NSAttributedString(string: caption, attributes: attrs)
    let textRect = CGRect(x: 84, y: 170, width: CGFloat(width - 168), height: 190)
    text.draw(in: textRect)
    context.restoreGState()
}

func makeGenerator(for segment: Segment) -> AVAssetImageGenerator? {
    guard segment.kind == "video" else { return nil }
    let asset = AVAsset(url: URL(fileURLWithPath: segment.path))
    let generator = AVAssetImageGenerator(asset: asset)
    generator.appliesPreferredTrackTransform = true
    generator.requestedTimeToleranceBefore = CMTime(seconds: 0.05, preferredTimescale: 600)
    generator.requestedTimeToleranceAfter = CMTime(seconds: 0.05, preferredTimescale: 600)
    return generator
}

var frameNumber: Int64 = 0

for segment in segments {
    let totalFrames = Int(round(segment.duration * Double(fps)))
    let still = segment.kind == "image" ? cgImage(for: segment.path) : nil
    let generator = makeGenerator(for: segment)

    for frame in 0..<totalFrames {
        while !input.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.004)
        }

        var pixelBuffer: CVPixelBuffer?
        CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &pixelBuffer)
        guard let buffer = pixelBuffer else { fatalError("Could not create pixel buffer") }
        CVPixelBufferLockBaseAddress(buffer, [])
        let context = CGContext(
            data: CVPixelBufferGetBaseAddress(buffer),
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
            space: colorSpace,
            bitmapInfo: flags
        )!
        context.setFillColor(NSColor(red: 0.02, green: 0.04, blue: 0.08, alpha: 1).cgColor)
        context.fill(CGRect(x: 0, y: 0, width: width, height: height))
        context.interpolationQuality = .high

        let progress = Double(frame) / Double(max(1, totalFrames - 1))
        if let still {
            drawAspectFill(still, in: context, progress: progress, isStill: true)
        } else if let generator {
            let videoTime = CMTime(seconds: min(progress * segment.duration, segment.duration - 0.001), preferredTimescale: 600)
            if let frameImage = try? generator.copyCGImage(at: videoTime, actualTime: nil) {
                drawAspectFill(frameImage, in: context, progress: progress, isStill: false)
            }
        }

        drawOverlay(in: context, caption: segment.caption, frameIndex: frame, totalFrames: totalFrames)

        CVPixelBufferUnlockBaseAddress(buffer, [])
        let presentationTime = CMTime(value: frameNumber, timescale: fps)
        adaptor.append(buffer, withPresentationTime: presentationTime)
        frameNumber += 1
    }
    print("Rendered: \(segment.caption)")
}

input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting {
    semaphore.signal()
}
semaphore.wait()

if writer.status == .completed {
    print(outputPath)
} else {
    print("Failed: \(writer.error?.localizedDescription ?? "unknown error")")
    exit(1)
}
