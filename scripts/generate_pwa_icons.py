from PIL import Image, ImageDraw, ImageFont
import os

def create_pwa_icon(size, is_maskable=False, output_path=""):
    # Create high-res canvas (2x supersampling for antialiasing)
    scale = 2
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background color (Deep Emerald / Slate Dark)
    bg_color = (9, 9, 11, 255) # #09090b
    corner_radius = 0 if is_maskable else int(canvas_size * 0.22)

    if is_maskable:
        draw.rectangle([0, 0, canvas_size, canvas_size], fill=bg_color)
    else:
        draw.rounded_rectangle([0, 0, canvas_size, canvas_size], radius=corner_radius, fill=bg_color)

    # Accent Emerald Gradient Ring
    margin = int(canvas_size * 0.15) if is_maskable else int(canvas_size * 0.08)
    ring_box = [margin, margin, canvas_size - margin, canvas_size - margin]
    draw.rounded_rectangle(ring_box, radius=int((canvas_size - 2 * margin) * 0.2), outline=(16, 185, 129, 255), width=max(2, int(scale * 4)))

    # Inner decorative badge
    inner_margin = margin + int(scale * 12)
    draw.rounded_rectangle([inner_margin, inner_margin, canvas_size - inner_margin, canvas_size - inner_margin], radius=int((canvas_size - 2 * inner_margin) * 0.18), fill=(16, 185, 129, 25))

    # Text & Icon representation
    # Draw calendar header strip
    strip_top = inner_margin + int(scale * 16)
    strip_height = int(scale * 20)
    draw.rounded_rectangle([inner_margin + int(scale * 16), strip_top, canvas_size - inner_margin - int(scale * 16), strip_top + strip_height], radius=int(scale * 6), fill=(16, 185, 129, 200))

    # Text PSIK
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(canvas_size * 0.20))
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(canvas_size * 0.13))
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw "PSIK"
    text1 = "PSIK"
    bbox1 = draw.textbbox((0, 0), text1, font=font_large)
    w1 = bbox1[2] - bbox1[0]
    h1 = bbox1[3] - bbox1[1]
    x1 = (canvas_size - w1) // 2
    y1 = canvas_size // 2 - int(h1 * 0.8)
    draw.text((x1, y1), text1, font=font_large, fill=(255, 255, 255, 255))

    # Draw "25B" in Emerald
    text2 = "25B"
    bbox2 = draw.textbbox((0, 0), text2, font=font_small)
    w2 = bbox2[2] - bbox2[0]
    x2 = (canvas_size - w2) // 2
    y2 = y1 + h1 + int(scale * 10)
    draw.text((x2, y2), text2, font=font_small, fill=(52, 211, 153, 255))

    # Resize down with Lanczos filter for ultra-crisp output
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_img.save(output_path, "PNG")
    print(f"Generated: {output_path} ({size}x{size})")

create_pwa_icon(192, is_maskable=False, output_path="public/pwa-192x192.png")
create_pwa_icon(512, is_maskable=False, output_path="public/pwa-512x512.png")
create_pwa_icon(512, is_maskable=True, output_path="public/maskable-icon-512x512.png")
create_pwa_icon(180, is_maskable=False, output_path="public/apple-touch-icon.png")
