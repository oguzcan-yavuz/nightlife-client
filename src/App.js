import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { location: "", places: [{ id: 1, name: "test" }, { id:2, name: "test2" }] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleChange(event) {
    this.setState({ location: event.target.value });
  }

  handleSubmit(event) {
    // get the state.location in here and send a get request to the server. render new component with response.
    const url = "";
    const reqBody = { location: this.state.location };
    const options = {
      method: "POST",
      body: JSON.stringify(reqBody),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };
    fetch(url, options)
      .then(response => response.json())
      .then(res => {
        console.log(res);
        this.setState({ places: res.body })
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
        <Places places={ this.state.places } />
      </div>
    );
  }
}

class Places extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <div className="places">
        <ul>
          { this.props.places.map(place => <Place key={ place.id } place={ place } />) }
        </ul>
      </div>
    )
  };
}


class Place extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <li>
        <p>{ this.props.place.name }</p>
      </li>
    );
  }
}

export default App;
