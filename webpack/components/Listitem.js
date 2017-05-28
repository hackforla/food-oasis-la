import React, { Component } from 'react';

class ListItem extends Component {

  render() {
    console.log(this.props)
    
    return (
      <div>
        <li className="community-garden" data-latitude={ this.props.latitude } data-longitude={ this.props.longitude }>
          <a href={ this.props.uri } className="location-summary">
            <img src="/assets/images/home/supermarket.svg" alt="" />
            <h2>{ this.props.name }</h2>
            <p className="address">{ this.props.address }</p>
            <p className="type">{ this.props.category }</p>
            <script type="text/template" className="open-template" data-day="" data-open="" data-close="">
              <p className="open">Open Now</p>
            </script>
            <script type="text/template" className="distance-template">
              <p className="distance"><span></span> <abbr title="miles">m</abbr></p>
            </script>
          </a>
        </li>
      </div>
    );
  }
}

export default ListItem;