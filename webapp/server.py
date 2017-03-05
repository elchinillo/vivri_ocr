# -*- coding: utf-8 -*-
from flask import Flask, request, send_from_directory
from flask_socketio import SocketIO, emit
from io import BytesIO
import os
import tempfile
import uuid
from wand.image import Image
from werkzeug.utils import secure_filename

from ocr import get_text_from_image

app = Flask(__name__, static_folder='../ui/build/static', static_url_path='/static')
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'events')
app.config['DEBUG'] = True
app.config['PORT'] = 3333
#app.config['SECRET_KEY'] = str(uuid.uuid5(uuid.NAMESPACE_DNS, 'vivri_ocr_201702'))

socketio = SocketIO(app)

def get_event_dir(event_uuid):
    return os.path.join(app.config['UPLOAD_FOLDER'], event_uuid)

@app.route('/ocr', methods=['POST'])
def save_file():
    event_uuid = str(uuid.uuid1())
    event_path = get_event_dir(event_uuid)

    if request.headers['Content-Type'].startswith('image/'):
        os.makedirs(event_path)

        img_filename = os.path.join(event_path, request.headers['Content-Type'].replace('/', '.'))

        with open(img_filename, 'wb') as img_file:
            img_bytes = BytesIO(request.data)
            img_file.write(img_bytes.read())
    elif request.headers['Content-Type']=='application/pdf':
        os.makedirs(event_path)

        with Image(file=BytesIO(request.data), resolution=900) as pdfdoc:
            with pdfdoc.convert('jpeg') as png_pages:
                print('pages = ', len(png_pages.sequence))
                for idx, png in enumerate(png_pages.sequence):
                    img = Image(png)
                    img.compression_quality = 100

                    img_filename = os.path.join(event_path, 'image{}.jpg'.format(idx+1))
                    print img_filename
                    img.save(filename=img_filename)
    else:
        return 'Not a valid file', 400

    return event_uuid, 200

@app.route('/<path>')
def root_files(path):
    return send_from_directory('../ui/build', path)

@socketio.on('connect')
def connect():
    print 'New client: {}'.format(request.sid)

@socketio.on('/ocr/start')
def ocr(event_uuid):
    event_path = get_event_dir(event_uuid)

    if os.path.exists(event_path):
        print 'Starting {}'.format(event_uuid)

        for entry in os.listdir(event_path):
            entry_path = os.path.join(event_path, entry)

            if os.path.isdir(entry_path):
                continue

            print 'OCR on file {} and send to {}'.format(entry_path, '/ocr/{}'.format(event_uuid))
            emit('/ocr/{}'.format(event_uuid), get_text_from_image(entry_path))

            os.remove(entry_path)

        os.rmdir(event_path)

    emit('/ocr/{}/done'.format(event_uuid))

@socketio.on('disconnect')
def disconnect():
    print 'Disconnected from client {}'.format(request.sid)

if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', port=3333)
