import os
import json
import base64
import re

INPUT_FILE = "db.json"
OUTPUT_FILE = "db_processed.json"
OUTPUT_DIR = "public/db"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_base64(data: str):
    """Удаляет префикс data:image/... и возвращает (mime_type, чистый_base64)"""
    if not data:
        return None, None

    mime_match = re.match(r"^data:(image/[^;]+);base64,(.*)$", data, re.DOTALL)
    if mime_match:
        mime_type = mime_match.group(1)
        b64_data = mime_match.group(2)
    else:
        mime_type = "image/png"
        b64_data = data

    b64_data = b64_data.strip().replace("\n", "").replace("\r", "")
    padding = len(b64_data) % 4
    if padding:
        b64_data += "=" * (4 - padding)

    return mime_type, b64_data

def extension_from_mime(mime_type: str) -> str:
    if mime_type.endswith("jpeg") or mime_type.endswith("jpg"):
        return ".jpg"
    elif mime_type.endswith("webp"):
        return ".webp"
    else:
        return ".png"

def save_base64_image(base64_data, filename_hint, context=""):
    mime_type, base64_data = clean_base64(base64_data)
    if not base64_data:
        print(f"⚠️ Пустое изображение у {context}")
        return None

    ext = extension_from_mime(mime_type)
    filename = f"{filename_hint}{ext}"
    image_path = os.path.join(OUTPUT_DIR, filename)

    try:
        img_bytes = base64.b64decode(base64_data)
        with open(image_path, "wb") as f:
            f.write(img_bytes)
        return f"/db/{filename}"
    except Exception as e:
        print(f"⚠️ Ошибка при декодировании {filename} ({context}): {e}")
        return None

def process_polygon(polygon):
    poly_id = polygon.get("id", "unknown")
    if polygon.get("image"):
        result = save_base64_image(polygon["image"], poly_id, f"полигона {poly_id}")
        if result:
            polygon["image"] = result

    for popup in polygon.get("companies", []):
        popup_id = popup.get("id", "unknown")
        if popup.get("image"):
            result = save_base64_image(popup["image"], popup_id, f"попапа {popup_id} (в полигоне {poly_id})")
            if result:
                popup["image"] = result

    return polygon

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "polygons" in data:
        data["polygons"] = [process_polygon(p) for p in data["polygons"]]
        processed = data
    elif isinstance(data, list):
        processed = [process_polygon(p) for p in data]
    else:
        raise ValueError("Неожиданный формат db.json")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Изображения сохранены в {OUTPUT_DIR}")
    print(f"💾 Обновлённый JSON: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
