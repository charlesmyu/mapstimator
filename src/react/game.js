import React from 'react';
import asyncLoading from 'react-async-loader';
import firebase from 'firebase/app';

import GoogleStreetview from './streetview.js';
import GoogleMaps from './map.js';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      target_coordinates: null,
      guess_coordinates: null,
      user_game: null,
      minimized_map: false
    };

    this.updateGuessCoordinates = this.updateGuessCoordinates.bind(this);
    this.updateTargetCoordinates = this.updateTargetCoordinates.bind(this);
    this.toggleMap = this.toggleMap.bind(this);
    this.submitEstimate = this.submitEstimate.bind(this);
  }

  updateTargetCoordinates(target_coordinates) {
    this.setState({target_coordinates: target_coordinates});
  }

  updateGuessCoordinates(guess_coordinates) {
    this.setState({guess_coordinates: guess_coordinates});
  }

  submitEstimate() {
    console.log('Submitting estimate...');
    const {serverTimestamp} = firebase.firestore.FieldValue;
    this.props.db.collection('user-games').doc(this.state.user_game).update({
      guess_coordinates: this.state.guess_coordinates,
      guess_time: serverTimestamp()
    });
    this.props.updateLocalStatus('spectating');
  }

  toggleMap() {
    console.log('Toggling map...');
    this.setState({minimized_map: !this.state.minimized_map});
  }

  componentDidMount() {
    // Obtain initial target coordinates
    // This will be based on gamemode later
    this.props.db.collection('games').doc(this.props.game_id).get().then((doc) => {
      return doc.data();
    }).then((doc) => {
      // Create user game based on gamemode
      var target_coordinates;

      // Add gamemodes here
      if(doc.gamemode === 'same_location') {
        target_coordinates = doc.target_coordinates;
      }

      this.setState({target_coordinates: target_coordinates});

      return this.props.db.collection('user-games').add({
        game_id: this.props.game_id,
        username: this.props.username,
        target_coordinates: target_coordinates,
        current_coordinates: null,
        guess_coordinates: null,
        guess_time: null,
        score: null,
        position: null
      })
    }).then((result) => {
      this.setState({user_game: result.id});
      console.log('Rendering Streetview...')

      // If host, start timer to timeout game when complete
      if(this.props.host) {
        this.props.db.collection('games').doc(this.props.game_id).get().then((value) => {
          var game_length = value.data().game_length;
          setTimeout(() => {
            console.log("Time's up! Ending game...");
            

          }, parseInt(game_length * 1000));
        });
      }
    });
  };

  renderStreetview() {
    return(
      <GoogleStreetview
        db={this.props.db}
        user_game={this.state.user_game}
        googleMaps = {this.props.googleMaps}
        street_view_panorama_options={{
          addressControl: false,
          fullscreenControl: false,
          showRoadLabels: false,
          enableCloseButton: false
        }}
        location={{lat: this.state.target_coordinates['latitude'], lng: this.state.target_coordinates['longitude']}}
        updateTargetCoordinates={this.updateTargetCoordinates}
      />
    );
  }

  renderMap() {
    if(this.state.minimized_map) {
      return(
        <button className="main-button" id="maximize-map-button"
          type="button"
          name="Maximize Map"
          onClick={this.toggleMap}>
            +
        </button>
      );
    } else {
      return(
        <div className="map-container">
          <button className="main-button" id="minimize-map-button"
            type="button"
            name="Minimize Map"
            onClick={this.toggleMap}>
              -
          </button>
          <GoogleMaps
            db={this.props.db}
            user_game={this.state.user_game}
            googleMaps={this.props.googleMaps}
            map_options={{
              zoom: 1,
              center: { lat: 0, lng: 0 },
              mapTypeControl: false,
              fullscreenControl: false,
              streetViewControl: false
            }}
            updateGuessCoordinates={this.updateGuessCoordinates}
          />
          <button className="main-button" id="submit-estimate-button"
            type="button"
            name="Submit Estimate"
            onClick={this.submitEstimate}>
              submit estimate
          </button>
        </div>
      );
    }
  }

  render() {
    if(this.state.target_coordinates !== null && this.state.user_game !== null) {
      return(
        <div style={{ height: '100vh', width: '100%'}}>
          {this.renderStreetview()}
          {this.renderMap()}
        </div>
      );
    } else {
      return(<h1 className="left-grey-box">loading...</h1>);
    }
  }
}

function mapScriptsToProps({ api_key }) {
  if (!api_key) return {};

  return {
    googleMaps: {
      globalPath: 'google.maps',
      url: `https://maps.googleapis.com/maps/api/js?key=${api_key}&v=beta`,
      jsonp: true,
    },
  };
}

export default asyncLoading (mapScriptsToProps)(Game);
