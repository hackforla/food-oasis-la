import React, { Component } from 'react';
import Listitem from './Listitem';
// import store from '../store/store'

class Listplaces extends Component {
  render() {
  console.log('locations:', locations)
    let articlesData = locations.map(obj => {
      return <Listitem address={ obj.address_1 } category={ obj.category } latitude={ obj.latitude } longitude={ obj.longitude } name={ obj.name } uri={  obj.uri } />
    })

    return (
      <div>
        {/*{ articlesData }*/}
        <ul className="location-list">
          { articlesData }
        </ul>
      </div>
    );
  }
}

export default Listplaces;
