import React, { Component } from 'react';

export default class Header extends Component {
  render() {
    // const style = {style="height: 1.5em; width: auto;"}
    // style="font-style: normal;
    return (
      <div>
        <nav className="secondary-nav location-list-nav">
          <ul className="options" id="search-views">
            <li className="filter"><a href="/filters/" id="filters-link">Filter</a></li>
            <li className="search">
              <a href="/search/" id="search-link">
                <img src="/assets/images/icons/search-black.svg" width="50" alt="Search" />
                <span id="search-type">Healthy Food</span> <span id="search-near">near</span> <em id="search-location">Los Angeles</em>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}




