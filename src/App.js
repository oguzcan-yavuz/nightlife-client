import React, { Component } from 'react';
import { GoogleLogin } from 'react-google-login';
import Media from 'react-bootstrap/lib/Media';
import './App.css';
import config from './config.json';

const API_URL = config.API_URL;

class App extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.googleResponse = this.googleResponse.bind(this);
    this.onFailure = this.onFailure.bind(this);
    this.state = { location: "", venues: [], isAuthenticated: false, user: null, token: '' };
  }

  handleLocation(location) {
    if(location !== this.state.location) {
      this.setState({ location: location });
      this.handleSubmit();
      console.log("handleLocation:", location);
    }
  }

  componentDidMount() {
    const options = {
      method: 'GET',
      credentials: 'include'
    };
    fetch(API_URL + "/lastSession", options).then(response => response.json())
      .then(res => {
        this.handleLocation(res.session.location || "");
        if(res.session.passport && res.session.token)
          this.setState({ isAuthenticated: true,
            user: { id: res.session.passport.user },
            token: res.session.token
          });
        console.log("last session:", res);
        console.log("state:", this.state);
      });
  }

  onFailure(error) {
    alert(error);
  }

  googleResponse(response) {
    const tokenBlob = new Blob([JSON.stringify({ access_token: response.accessToken }, null, 2)], { type : 'application/json' });
    const options = {
      method: 'POST',
      body: tokenBlob,
      mode: 'cors',
      cache: 'default',
      credentials: 'include'
    };
    fetch(API_URL + '/auth/google', options).then(r => {
      const token = r.headers.get('x-auth-token');
      r.json().then(user => {
        if (token)
          this.setState({ isAuthenticated: true, user, token });
        console.log(this.state);
      });
    });
  };

  handleChange(event) {
    this.setState({ location: event.target.value });
  }

  handleSubmit(event) {
    // get the state.location in here and send a get request to the server. render new component with response.
    if(event)
      event.preventDefault();
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
        console.log("state.venues:", this.state.venues);
      });
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
          <Venues venues={ this.state.venues }
                  onSuccess={ this.googleResponse }
                  onFailure={ this.onFailure }
                  isAuthed={ this.state.isAuthenticated }
                  user={ this.state.user }/>
        </div>
      </div>
    );
  }
}

class Venues extends Component {
  render() {
    return (
      <div>
        { this.props.venues.map(venue =>
          <Venue key={ venue.id } venue={ venue }
                 onSuccess={ this.props.onSuccess }
                 onFailure={ this.props.onFailure }
                 isAuthed={ this.props.isAuthed } user={ this.props.user }/>)
        }
      </div>
    )
  };
}


class Venue extends Component {
  constructor(props) {
    super(props);
    this.updateGoingPeople = this.updateGoingPeople.bind(this);
    this.state = { goingPeople: props.venue.goingPeople };
  }

  updateGoingPeople(venueId) {
    console.log("updating going people!");
    const url = API_URL + "/api/goingPeople";
    const reqBody = { venueId: venueId, userId: this.props.user.id };
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
        this.setState({ goingPeople: res.goingPeopleCount });
      });
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
          { (!!this.props.isAuthed) ? (
            <button onClick={ () => this.updateGoingPeople(this.props.venue.id) }>
              { `${ this.state.goingPeople } Going` }
            </button>
          ) : (
            <GoogleLogin clientId={ config.GOOGLE_CLIENT_ID }
                         buttonText={ `${ this.state.goingPeople } Going` }
                         onSuccess={ this.props.onSuccess }
                         onFailure={ this.props.onFailure }/>
          ) }
        </Media.Body>
      </Media>
    );
  }
}

export default App;
