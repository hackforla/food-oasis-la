import React, { Component } from 'react';
import Listitem from './Listitem';
// import store from '../store/store'

class Listplaces extends Component {
  render() {
    const sortedList = window.oasis.sortByClosest("34.220399", "-118.572512").slice(0,19);
    const articlesData = sortedList.map(obj => {
      return <Listitem address={ obj.address_1 } category={ obj.category } latitude={ obj.latitude } longitude={ obj.longitude } name={ obj.name } uri={ obj.uri } />
    })

    return (
      <div>
        <ul className="location-list">
          { articlesData }
        </ul>
      </div>
    );
  }
}

export default Listplaces;
