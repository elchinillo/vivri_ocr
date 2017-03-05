const socket = require('socket.io-client')(window.location.origin);

class OcrStore {
    static subscribe(uuid, ocrCallback, doneCallback) {
        socket.on(`/ocr/${uuid}`, ocrCallback);
        socket.on(`/ocr/${uuid}/done`, () => {
            socket.off(`/ocr/${uuid}`, ocrCallback)
            doneCallback();
        });
        socket.emit('/ocr/start', uuid);
    }
}

export default OcrStore
