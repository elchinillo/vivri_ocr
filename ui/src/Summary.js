import React, { Component } from 'react';

class Summary extends Component {
    render() {
        let items = this.props.items;

        let itemList = Object.keys(items).map(sku => <li className="list-group-item"><span className="badge">{items[sku].count}</span>{sku}: {items[sku].label}</li>);

        return <ol className="list-group">{itemList}</ol>
    }
}

export default Summary;
