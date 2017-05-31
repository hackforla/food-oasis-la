import React, { Component } from 'react';
import Listitem from './Listitem';

class Listplaces extends Component {
  render() {
    const sortedList = window.oasis.sortByClosest().slice(0,19);
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