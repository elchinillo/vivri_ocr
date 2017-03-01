# -*- coding: utf-8 -*-
from flask import Flask, request, send_from_directory
from io import BytesIO
import os

from ocr import get_text_from_image

app = Flask(__name__, static_folder='../ui/build/static', static_url_path='/static')
app.config['UPLOAD_FOLDER'] = os.path.dirname(__file__)

@app.route('/ocr', methods=['POST'])
def ocr():
    img_file = BytesIO(request.data)
    return (get_text_from_image(img_file), {'Content-Type': 'text/plain'})

@app.route('/<path>')
def root_files(path):
    return send_from_directory('../ui/build', path)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3333, debug=True)
