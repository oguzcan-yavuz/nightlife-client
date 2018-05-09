import React, { Component } from 'react';
import Media from 'react-bootstrap/lib/Media';
import './App.css';

const API_URL = "http://127.0.0.1:8080";    // there must be a better practice!

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { location: "", venues: [] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(event) {
    this.setState({ location: event.target.value });
  }

  handleSubmit(event) {
    // get the state.location in here and send a get request to the server. render new component with response.
    const url = API_URL + "/api/search";
    const reqBody = { location: this.state.location };
    const options = {
      method: 'POST',
      body: JSON.stringify(reqBody),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };
    fetch(url, options)
      .then(response => response.json())
      .then(res => {
        this.setState({ venues: res.venues });
        console.log("state:", this.state.venues);
      });
    event.preventDefault();
  }

  render() {
    return (
      <div className="App">
        <div className="header">
          <h2>Planning something fun?</h2>
        </div>
        <div className="search">
          <form onSubmit={ this.handleSubmit }>
            <input type="text"
                   placeholder="What is your location?"
                   value={ this.state.location }
                   onChange={ this.handleChange }
            />
            <input type="submit" value="Search"/>
          </form>
        </div>
        <Venues venues={ this.state.venues } />
      </div>
    );
  }
}

class Venues extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <div>
        { this.props.venues.map(venue => <Venue key={ venue.id } venue={ venue } />) }
      </div>
    )
  };
}


class Venue extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <Media>
        <Media.Left>
          <img src={ this.props.venue.image_url } alt={ this.props.venue.name } width="200" height="100"/>
        </Media.Left>
        <Media.Right>
          <Media.Heading>
            <a href={ this.props.venue.url } target="_blank">{ this.props.venue.name }</a>
          </Media.Heading>
          <p><strong>Rating: </strong>{ this.props.venue.rating }</p>
        </Media.Right>
      </Media>
    );
  }
}

export default App;
