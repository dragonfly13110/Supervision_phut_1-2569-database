import os
import sys

pdf_path = r"C:\Users\drago\.gemini\antigravity-ide\brain\f130d747-30ea-488a-aa67-c2f724bf26ae\media__1783698023251.pdf"
output_dir = r"d:\code\Supervision_phut_1-2569-database\public"

print("Python version:", sys.version)
print("PDF exists:", os.path.exists(pdf_path))

# Let's try importing fitz (PyMuPDF)
try:
    import fitz
    print("fitz is available!")
    doc = fitz.open(pdf_path)
    page = doc.load_page(0)
    
    # Render page to a high-resolution pixmap (300 DPI)
    zoom = 300 / 72  # 300 DPI / 72 points per inch
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "service_solution_model.png")
    pix.save(out_path)
    print("Successfully converted PDF to high-res PNG at", out_path)
    sys.exit(0)
except Exception as e:
    print("fitz failed or not available:", e)

# Try pdf2image
try:
    from pdf2image import convert_from_path
    print("pdf2image is available!")
    images = convert_from_path(pdf_path, dpi=300)
    if images:
        os.makedirs(output_dir, exist_ok=True)
        out_path = os.path.join(output_dir, "service_solution_model.png")
        images[0].save(out_path, "PNG")
        print("Successfully converted PDF to high-res PNG via pdf2image at", out_path)
        sys.exit(0)
except Exception as e:
    print("pdf2image failed or not available:", e)

# Fallback: Copy the existing media__1783698050411.png to public if it exists
existing_png = r"C:\Users\drago\.gemini\antigravity-ide\brain\f130d747-30ea-488a-aa67-c2f724bf26ae\media__1783698050411.png"
if os.path.exists(existing_png):
    import shutil
    os.makedirs(output_dir, exist_ok=True)
    dest_path = os.path.join(output_dir, "service_solution_model.png")
    shutil.copy(existing_png, dest_path)
    print("Fallback: Copied existing screenshot to", dest_path)
    sys.exit(0)

print("Failed to find any PDF rendering or image fallback!")
sys.exit(1)
