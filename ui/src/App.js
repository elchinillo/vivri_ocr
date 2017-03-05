import React, { Component } from 'react';
import InputForm from './InputForm';
import Summary from './Summary';
import OcrStore from './OcrStore';

class App extends Component {
  constructor() {
      super();

      this.state = {
          loading: false,
          items: {},
          lastOcr: 'No se ha cargado una imagen'
      };

      this.requestOcr = this.requestOcr.bind(this);
      this.parseText = this.parseText.bind(this);
      this.reset = this.reset.bind(this);
      this.onOcrFinish = this.onOcrFinish.bind(this);
  }

  render() {
    let imagePanel;

    if (this.state.loading) {
        imagePanel = (
            <div>
                <img alt="OCR en proceso" className="box-loader" src="/box.gif" /> Subiendo {this.state.docType} al servidor...
            </div>
        );
    }
    else {
        imagePanel = <InputForm onImageReady={this.requestOcr} onReset={this.reset} />;
    }

    return (
      <div className="App container-fluid">
        <div className="row">
          <div className="col-lg-6">
            <br />
            {imagePanel}
            <hr />
            <h2>Cuenta</h2>
            <Summary items={this.state.items} />
          </div>
          <div className="col-lg-6">
            <h2>OCR</h2>
            <pre>{this.state.lastOcr}</pre>
          </div>
        </div>
      </div>
    );
  }

  reset() {
      this.setState({loading: false, items: {}, lastOcr: 'No se ha cargado una imagen'});
  }

  requestOcr(file, contentType) {
    this.setState({
        loading: true,
        lastOcr: 'Esperando OCR desde el servidor...',
        docType: /image/.test(contentType)?'imagen':'documento'
    });

    const uploadRequest = new Request(`${window.location.origin}/ocr`, {
        method: 'POST',
        headers: {
            'Content-Type': contentType
        },
        body: file
    });

    fetch(uploadRequest).then(response => {
        if (response.status!=200) {
            alert('Ooops... algo ha salido mal en el servidor');
            this.reset();
            return;
        }

        response.text().then((uuid) => {
            OcrStore.subscribe(uuid, this.parseText, this.onOcrFinish);
        });
    });
  }

  parseText(ocrText) {
      this.setState({lastOcr: ocrText});

      let lineRegex = /^([^\s]+)\s+(.+?)\s+(\d+)$/;
      let lines = ocrText.split('\n');

      let idx = lines.findIndex(line => /Numero\s+de\s+Producto|Nombre\s+de\s+Producto|Cantidad/.test(line)) + 1;

      let items = Object.assign({}, this.state.items);
      for (let n=lines.length ; idx<n && lines[idx].trim() ; idx++) {
          let initialLine = lines[idx].trim();
          let line;
          let match = lineRegex.exec(initialLine);

          while (!match) {
              line = prompt('Ayudame a entender la siguiente línea:', line || initialLine);
              line = line ? line.trim() : line;
              match = lineRegex.exec(line);
          }

          if (!items[match[1]]) items[match[1]] = {label: match[2], count: 0};
          items[match[1]].count += +match[3];
      }

      this.setState({items: items});
  }

  onOcrFinish() {
      this.setState({loading: false});
  }
}

export default App;
