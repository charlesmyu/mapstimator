import React from 'react';
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
    if(this.state.guess_coordinates) {
      console.log('Submitting estimate...');
      const {serverTimestamp} = firebase.firestore.FieldValue;
      this.props.db.collection('user-games').doc(this.state.user_game).update({
        guess_coordinates: this.state.guess_coordinates,
        guess_time: serverTimestamp()
      });
      this.props.updateLocalStatus('spectating');
    } else {
      console.log('No guess found...');
    }
  }s

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
        guess_error: null
      })
    }).then((result) => {
      this.setState({user_game: result.id});
      console.log('Rendering Streetview...');

      // If host, start timer to timeout game when complete
      if(this.props.host) {
        this.props.db.collection('games').doc(this.props.game_id).get().then((value) => {
          var game_length = value.data().game_length;
          var game_timer = setTimeout(() => {
            console.log("Time's up! Ending game...");
            this.endGame();
          }, parseInt(game_length * 1000));

          var unsubscribe = this.props.db.collection('user-games').where('game_id', '==', this.props.game_id).where('guess_coordinates', '==', null).onSnapshot((querySnapshot) => {
            if(querySnapshot.size === 0) {
              console.log('All players done! Wrapping up game...');
              clearTimeout(game_timer);
              this.endGame();
            }
          });

          setTimeout(() => {unsubscribe()}, parseInt(game_length * 1000 + 100));
        });
      }
    });
  };

  endGame() {
    this.props.db.collection('sessions').doc(this.props.session_id).update({
      session_status: 'postgame'
    });
    this.props.updateLocalStatus('postgame');

    this.props.db.collection('games').doc(this.props.game_id).update({
      status: 'complete'
    });

    this.props.db.collection('user-games').where('game_id', '==', this.props.game_id).get().then((querySnapshot) => {
      var arrayQuerySnapshot = [];

      querySnapshot.forEach((doc) => {
        arrayQuerySnapshot.push(doc);
      });

      let calc_results = arrayQuerySnapshot.map((doc) => {
        var target_coordinates = doc.data().target_coordinates;
        var guess_coordinates = doc.data().guess_coordinates;
        var guess_error = null;
        var user_score = 0;

        if(guess_coordinates !== null) {
          guess_error = this.getDistanceFromLatLonInKm(target_coordinates['latitude'], target_coordinates['longitude'], guess_coordinates['latitude'], guess_coordinates['longitude']);
          user_score = parseFloat(1.0/parseFloat(guess_error)) * 100000;
        };

        return this.props.db.collection('user-games').doc(doc.id).update({
          score: user_score,
          guess_error: guess_error
        });
      });

      Promise.all(calc_results).then(() => {
        this.props.db.collection('sessions').doc(this.props.session_id).update({
          session_status: 'results'
        });

        this.props.updateLocalStatus('results');
      });
    });
  }

  getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
  var dLon = this.deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

deg2rad(deg) {
  return deg * (Math.PI/180)
}

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
          enableCloseButton: false,
        }}
        location={{lat: this.state.target_coordinates['latitude'], lng: this.state.target_coordinates['longitude']}}
        updateTargetCoordinates={this.updateTargetCoordinates}
      />
    );
  }

  renderMap() {
    var disabled = true;
    if (this.state.guess_coordinates) {
      disabled = false;
    }

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
            onClick={this.submitEstimate}
            disabled={disabled}>
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

export default Game;
