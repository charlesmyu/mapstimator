import './App.css';

import React from 'react';
//import ReactDOM from 'react-dom';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCbSb1BnJBU9NyduA6BrG50PC5vlIK_koc",
  authDomain: "mapstimator.firebaseapp.com",
  projectId: "mapstimator",
  storageBucket: "mapstimator.appspot.com",
  messagingSenderId: "169137768653",
  appId: "1:169137768653:web:54903a41fcdada51428184",
  measurementId: "G-4LTHPF4V9T"
};

let PLAYER_LIMIT = 10; // Max # of players allowed in a session
let SESSION_ID_LENGTH = 6; // # characters used for session ID

// Initialize Firebase & Firestore
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
};

let db = firebase.firestore();

// REMOVE FOR PRODUCTION
firebase.firestore().useEmulator("localhost", 8080);

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Session />
      </header>
    </div>
  );
};

// Session contains the user's entire session, which spans across multiple games.
class Session extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: null, // Username of user (chosen under Nickname)
                  session_id: null,
                  current_game_id: null, // ID of game currently being played or last played
                  local_session_status: 'select', // select, pregame, ingame, postgame
                  host: false // Whether user is host of session or not
                };

    this.updateUsername = this.updateUsername.bind(this);
    this.updateSessionId = this.updateSessionId.bind(this);
    this.createSession = this.createSession.bind(this);
    this.joinSession = this.joinSession.bind(this);
  };

  // Updates username. Can be passed as prop to child component
  updateUsername(username) {
    console.log('Session has recieved new username');
    this.setState({username: username});
  };

  // Updates session id. Can be passed as prop to child component
  updateSessionId(session_id) {
    console.log('Session has recieved new session ID');
    this.setState({session_id: session_id});
  };

  // Obtains new session id, which is a random string with length dictated by id_length
  // Checks id against existing, open ids -- resolves if it does not yet exist, otherwise rejects
  getNewSessionId(sessions, id_length) {
    return new Promise((resolve, reject) => {
      let id = this.getRandomSessionId(id_length);

      // Check existing IDs for duplicates
      sessions.doc(id).get().then((value) => {
        if (value.exists) { // Session exists
          reject('Active matching ID found. Abort session creation');
        } else { // No session exists with this ID
          console.log('Creating session...');
          resolve(id);
          // TODO: Implement recursive loop to try again a couple times if needed
        }
      });
    });
  };

  getRandomSessionId(id_length) {
    let id = '';

    for(let i=0; i<id_length; i++) {
      id += this.getRandomLetter();
    };

    console.log("Session ID is " + id.toString());
    return id;
  };

  getRandomLetter() {
    const alphabet = 'abcdefghijklmnopqrstuvwyz';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  };

  // Creates session, with user being created as host. Can be passed as prop to
  // child component
  createSession() {
    console.log("Attempting to create session...");

    // Validate username format (will not be set if invalid)
    if (this.state.username === null) {
      console.log("Invalid username");
      // TODO: Add user notification this went wrong
    } else {
      var sessions = db.collection('sessions');

      this.getNewSessionId(sessions, SESSION_ID_LENGTH).then((session_id) => {
        // Set new session ID locally first
        this.setState({session_id: session_id});

        // New session id is valid, create session in Firestore
        const {serverTimestamp} = firebase.firestore.FieldValue;
        sessions.doc(session_id.toLowerCase()).set({
          owner: this.state.username,
          opened_datetime: serverTimestamp(),
          session_status: 'pregame',
          current_game_id: null,
          number_games: 0,
          users: this.state.username
        });
      }).then((value) => {
        // New session created. Update local variables to reflect that
        this.setState({
          local_session_status: 'pregame',
          host: true // User created game, so they are host
        });
        console.log('Created session!');
      }).catch((err) => {
        // Something went wrong, reset state and show error
        this.setState({
          session_id: null,
          local_session_status: 'select'
        });
        console.log('Could not create session');
        console.log(err);
        // TODO: Add user facing error message
      });
    };
  };

  joinSession() {
    console.log("Attempting to join session...");
    var sessions = db.collection('sessions');

    // Validate username and session id format (will not be set if invalid)
    if (this.state.username === null) {
      console.log('Username is invalid');
      // TODO: Notify user of this issue
    } else if (this.state.session_id === null) {
      console.log('Session ID is invalid');
      // TODO: Notify user of this issue
    } else {
      // Try and find session in Firestore (sessions collection)
      sessions.doc(this.state.session_id).get().then((value) => {
        var session = value.data();
        if (value.exists) { // Session exists
          if (session['session_status'] !== 'pregame') { // Check if session in game
            console.log('Session has game in progress, cannot join');
            // TODO: Notify user of this issue
          } else if (session['users'].split(',').length >= PLAYER_LIMIT) { // Check if too many people
            console.log('Max players reached in session, cannot join');
            // TODO: Notify user of this issue
          } else if (session['users'].includes(this.state.username)) { // Check if username is unique
            console.log('Username taken, cannot join');
            // TODO: Notify user of this issue
          } else {
            console.log('Found valid session');
            // Update list of users in session
            sessions.doc(this.state.session_id).update({
              users: session['users'] + ',' + this.state.username,
            });

            // Set local variables to reflect session joined
            this.setState({
              local_session_status: 'pregame',
              host: false
            });
            console.log('Joined session!');
          }
        } else { // Session does not exist
          console.log('Session does not exist');
          // TODO: Notify user of issue
        }
      });
    };
  };

  renderSelect() {
    return(
      <SessionSelect
        onUserChange={this.updateUsername}
        onSessionIdChange={this.updateSessionId}
        createSession={this.createSession}
        joinSession={this.joinSession}
      />
    );
  };

  renderPregame() {
    if(this.state.host) {
      return(<PregameHost username={this.state.username} session_id={this.state.session_id} />);
    } else {
      return(<Pregame username={this.state.username} session_id={this.state.session_id} />);
    };
  };

  render() {
    if (this.state.local_session_status === 'select') {
      return(
        <div className='container'>
          <Title value="welcome to mapstimator" />
          {this.renderSelect()}
        </div>
      );
    } else if (this.state.local_session_status === 'pregame') {
      return(
        <div className='container'>
          <Title value="welcome to mapstimator" />
          {this.renderPregame()}
        </div>
      );
    } else if (this.state.local_session_status === 'ingame') {

    } else if (this.state.local_session_status === 'postgame') {

    };
    return(<h1>ah shit</h1>);
  };
};

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

// Class contains components used to prompt user to join or initiate creation of a session
class SessionSelect extends React.Component {
  render() {
    return(
      <div className="left-grey-box" id="select">
        <Nickname
          name={null}
          onChange={this.props.onUserChange}
        />
        <div className="clearfix" />
        <div className="button-option float-left" id="select-create-lobby">
          <h3 className="option-title">host</h3>
          <button className="main-button"
            type="button"
            name="Create Lobby"
            onClick={this.props.createSession}>
              create lobby
          </button>
        </div>
        <div className="button-option float-right" id="select-join-lobby">
            <h3 className="option-title">
              player
            </h3>
            <SessionId
              onChange={this.props.onSessionIdChange}
            />
            <button className="main-button" id="session-id"
              type="button"
              name="Join Lobby"
              onClick={this.props.joinSession}>
                go
            </button>
          </div>
          <div className="clearfix" />
        </div>
    );
  };
};

// Contains input box for session id
class SessionId extends React.Component {
  constructor(props) {
      super(props);
      this.state = {error: false};

      this.handleChange = this.handleChange.bind(this);
  ;}

  handleChange(event) {
    console.log("Code changed to " + event.target.value);
    if (event.target.value.length === SESSION_ID_LENGTH) {
      this.setState({error: false});
      this.props.onChange(event.target.value);
    } else {
      this.setState({error: true});
    };
  };

  render() {
    var class_name = "input-box"
    if (this.state.error) {
      class_name += " input-error"
    };

    return(
      <input className={class_name} id="session-id"
        type="text"
        placeholder="lobby code"
        minLength={SESSION_ID_LENGTH.toString()}
        maxLength={SESSION_ID_LENGTH.toString()}
        size="10"
        onChange = {this.handleChange}
      />
    );
  };
};

// Contains input box for username
class Nickname extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: false};

    this.handleChange = this.handleChange.bind(this);
  };

  handleChange(event) {
    console.log("Name changed to " + event.target.value);
    if (event.target.value.length === 0) {
      this.setState({error: true});
    } else {
      this.setState({error: false});
      this.props.onChange(event.target.value);
    };
  };

  render_static() {
    return(
      <h2 id="nickname">
        {this.props.name}
      </h2>
    );
  };

  render_input() {
    var class_name = "input-box";
    if (this.state.error) {
      class_name += " input-error";
    }
    return(
      <input className={class_name} id="nickname"
        type="text"
        placeholder="nickname"
        minLength="1"
        maxLength="10"
        onChange={this.handleChange}
      />
    );
  };

  render() {
    if(this.props.name === null) {
      return(
        <div id="nickname-box">
          {this.render_input()}
        </div>
      );
    } else {
      return(
        <div>
          {this.render_static()}
        </div>
      );
    };
  };
};

// Holds title
class Title extends React.Component {
  render() {
    return(
      <div className="title-box left-grey-box">
        <h1 className="title-text">
          {this.props.value}
        </h1>
      </div>
    );
  };
};

export default App;
