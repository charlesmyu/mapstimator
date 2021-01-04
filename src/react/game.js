import React from 'react';
import GoogleStreetview from './streetview.js';

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      target_coordinates: null,
      user_game: null
    };
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
        score: null,
        position: null
      })
    }).then((result) => {
      this.setState({user_game: result.id});
    });
  };

  render() {
    if(this.state.target_coordinates !== null) {
      return(
        <div style={{ height: '100vh', width: '100%'}}>
          <GoogleStreetview
            db={this.props.db}
            user_game={this.state.user_game}
            apiKey={'AIzaSyBo8Wc9Dbhzlfl3niaSOli-Jvpp3Dyy9r8'}
            streetViewPanoramaOptions={{
              addressControl: false,
              fullscreenControl: false,
              showRoadLabels: false,
              enableCloseButton: false,
            }}
            location={{lat: this.state.target_coordinates['latitude'], lng: this.state.target_coordinates['longitude']}}
          />
        </div>
      );
    } else {
      return(<h1 className="left-grey-box">loading...</h1>);
    }
  }
}

export { Game };
