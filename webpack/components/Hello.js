import React, { Component } from 'react';
import Listplaces from './Listplaces'
import Header from './Header'

class Hello extends Component {
  render() {
    return (
      <div>
        <Header />
        <Listplaces />
      </div>
    )
  }
}
export default Hello;

