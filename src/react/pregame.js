import React from 'react';
import { Nickname } from './common.js';

class PregameHost extends React.Component {
  startGame() {
    console.log('Starting game...');
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
