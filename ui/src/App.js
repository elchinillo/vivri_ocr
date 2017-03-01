import React, { Component } from 'react';
import InputForm from './InputForm';
import Summary from './Summary';

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
  }

  render() {
    let imagePanel;

    if (this.state.loading) {
        imagePanel = (
            <div>
                <img className="box-loader" src="/box.gif" /> Subiendo imagen al servidor...
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

  requestOcr(file) {
    this.setState({loading: true, lastOcr: 'Esperando OCR desde el servidor...'});

    var uploadRequest = new Request(`${window.location.origin}/ocr`, {method: 'POST', body: file});

    fetch(uploadRequest).then(response => {
        response.text().then(this.parseText);
    });
  }

  parseText(ocrText) {
      this.setState({lastOcr: ocrText});

      let lineRegex = /^([^\s+]+)\s+(.+?)\s+(\d+)$/;
      let lines = ocrText.split('\n');

      let idx = lines.findIndex(line => /Numero\s+de\s+Producto/.test(line)) + 1;

      for (let n=lines.length ; idx<n && lines[idx].trim() ; idx++) {
          let line = lines[idx].trim();
          let match = lineRegex.exec(line);

          while (!match) {
              line = prompt(`"${line}" no es una linea valida. Ayudame`);
              match = lineRegex.exec(line);
          }

          if (!this.state.items[match[1]]) this.state.items[match[1]] = {label: match[2], count: 0};
          this.state.items[match[1]].count += +match[3];
      }

      this.setState({loading: false, items: this.state.items});
  }
}

export default App;
