import React, { Component } from 'react';

class InputForm extends Component {
    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
    }

    render() {
        return (
            <div className="form-inline">
                <div className="form-group">
                    <input type="file" placeholder="Jane Doe" accept="image/*;capture=camera" onChange={this.onChange} />
                </div>
                <div className="form-group">
                    <button type="button" className="btn btn-xs btn-danger" onClick={this.props.onReset}>Volver a iniciar</button>
                </div>
            </div>
        );
    }

    onChange(e) {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];

        reader.onloadend = (e) => {
            this.props.onImageReady(e.target.result, file.type);
        };

        reader.readAsArrayBuffer(file)
    }
}

export default InputForm;
