import React, { Component } from 'react';
import Media from 'react-bootstrap/lib/Media';
import './App.css';

const API_URL = "http://127.0.0.1:8080";    // there must be a better practice!

class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.goingPeopleHandler = this.goingPeopleHandler.bind(this);
    this.state = { location: "", venues: [] };
  }

  isAuthenticated() {
    return fetch(API_URL + "/isAuthenticated")
      .then(response => response.json())
      .then(res => res.isAuthenticated);
  }

  redirectToLogin() {
    window.location = API_URL + '/auth/twitter';
  };

  updateGoingPeople(venueId) {
    const url = API_URL + "/api/goingPeople";
    const reqBody = { venueId: venueId };
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
        console.log("res:", res);
        this.setState({ venues: res.venues });
      });
  }

  async goingPeopleHandler(venueId) {
    console.log(venueId);
    let authed = await this.isAuthenticated();
    console.log(authed);
    if(authed)
      this.updateGoingPeople(venueId);
    else
      this.redirectToLogin();
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
        <div className="container venues">
          <Venues venues={ this.state.venues } goingPeopleHandler={ this.goingPeopleHandler } />
        </div>
      </div>
    );
  }
}

class Venues extends React.Component {
  render() {
    return (
      <div>
        { this.props.venues.map(venue =>
          <Venue key={ venue.id } venue={ venue } goingPeopleHandler={ this.props.goingPeopleHandler } />)
        }
      </div>
    )
  };
}


class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = { goingPeople: props.venue.goingPeople };
  }

  render() {
    return (
      <Media>
        <Media.Left>
          <img src={ this.props.venue.image_url } alt={ this.props.venue.name } width="200" height="100"/>
        </Media.Left>
        <Media.Body>
          <Media.Heading>
            <a href={ this.props.venue.url } target="_blank">{ this.props.venue.name }</a>
          </Media.Heading>
          <p><strong>Rating: </strong>{ this.props.venue.rating }</p>
          <button onClick={ () => this.props.goingPeopleHandler(this.props.venue.id) }>
            { `${ this.state.goingPeople } Going` }
          </button>
        </Media.Body>
      </Media>
    );
  }
}

export default App;
