import React from 'react';
import firebase from 'firebase/app';
import { Nickname } from './common.js';

class PregameHost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      game_length: 30,
      gamemode: 'same_location'
    };

    this.startGame = this.startGame.bind(this);
  }

  generateRandomPoint() {
    const plus_or_minus = Math.random() < 0.5 ? -1 : 1;
    return Math.random() * 90 * plus_or_minus;
  }

  startGame() {
    const {serverTimestamp} = firebase.firestore.FieldValue;
    const increment = firebase.firestore.FieldValue.increment(1);
    console.log('Attempting to start game...');
    // add gamemode and other variables as required for specified gamemode
    var game = {
      session_id: this.props.session_id,
      start_datetime: serverTimestamp(),
      game_length: this.state.game_length,
      gamemode: this.state.gamemode,
      status: 'ingame'
    }

    // Add gamemodes here
    if (this.state.gamemode === 'same_location') {
      game['target_coordinates'] = new firebase.firestore.GeoPoint(this.generateRandomPoint(), this.generateRandomPoint());
    }

    this.props.db.collection('games').add(game).then((docRef) => {
      this.props.db.collection('sessions').doc(this.props.session_id).update({
        session_status: 'ingame',
        current_game_id: docRef.id,
        number_games: increment
      }).then((result) => {
        this.props.updateGameId(docRef.id);
        this.props.updateLocalStatus('ingame');
        console.log('Game created! Handing off...');
      });
    });
  };

  render() {
    return(
      <div className="left-grey-box" id="pregame-host">
        <Nickname
          name={this.props.username}
        />
        <div className="clearfix" />
        <div className="button-option float-left" id="pregame-options">
          <h3 id='pregame-text'>gamemodes coming soon</h3>
        </div>
        <div className="button-option float-right" id="pregame-host-session-id">
          <h3>lobby code: <i>{this.props.session_id}</i></h3>
        </div>
        <div className="clearfix" />
        <button className="main-button" id="start-game"
          type="button"
          name="Start Game"
          onClick={this.startGame}>
            start
        </button>
      </div>
    );
  };
};

class Pregame extends React.Component {
  render() {
    return(
      <div className="left-grey-box" id="pregame">
        <Nickname
          name={this.props.username}
        />
        <div className="clearfix" />
        <div className="button-option float-left" id="pregame-waiting-for-host">
          <h3 id='pregame-text'>waiting<br/>for host...</h3>
        </div>
        <div className="button-option float-right" id="pregame-session-id">
          <h3>lobby code:<br/><i>{this.props.session_id}</i></h3>
        </div>
        <div className="clearfix" />
      </div>
    );
  };
};

export { Pregame, PregameHost };
