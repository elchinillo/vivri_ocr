import pytesseract
from PIL import Image
from PIL import ImageFilter

def get_text_from_image(img_file):
    image = Image.open(img_file)
    image.filter(ImageFilter.SHARPEN)
    return pytesseract.image_to_string(image)
