import './App.css';
import { UserList } from './react/common.js';
import { SessionSelect } from './react/select.js';
import { Pregame, PregameHost } from './react/pregame.js';
import { Game } from './react/game.js';

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
// firebase.firestore().useEmulator("localhost", 8080);

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
                  current_game_user_id: null, // ID of game-user document associated with this game and user
                  local_session_status: 'select', // select, pregame, ingame, postgame, results, disconnected
                  host: false // Whether user is host of session or not
                };

    this.updateUsername = this.updateUsername.bind(this);
    this.updateSessionId = this.updateSessionId.bind(this);
    this.updateGameId = this.updateGameId.bind(this);
    this.updateGameUserId = this.updateGameUserId.bind(this);
    this.createSession = this.createSession.bind(this);
    this.joinSession = this.joinSession.bind(this);
    this.updateLocalStatus = this.updateLocalStatus.bind(this);
  };

  // Updates username. Can be passed as prop to child component
  updateUsername(username) {
    console.log('Session has recieved new username');
    this.setState({username: username});
  };

  // Updates session id. Can be passed as prop to child component
  updateSessionId(session_id) {
    console.log('Session has recieved new session ID');
    this.setState({session_id: session_id.toLowerCase()});
  };

  updateLocalStatus(status) {
    console.log('Changing local status to ' + status);
    this.setState({local_session_status: status});
  };

  updateGameId(game_id) {
    console.log('Current game ID is now ' + game_id.toString());
    this.setState({current_game_id: game_id});
  };

  updateGameUserId(game_user_id) {
    console.log('Current game user ID is now ' + game_user_id.toString());
    this.setState({current_game_user_id: game_user_id});
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
    return id.toLowerCase();
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
        sessions.doc(session_id).set({
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
          } else if (session['users'].split(',').includes(this.state.username)) { // Check if username is unique
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
            console.log('Waiting for game to start!');
            const setLocalStatus = this.updateLocalStatus; // Need to set function ahead of time as setState will not be recognized once function finishes (but subscription continues)
            const setGameId = this.updateGameId;
            var unsubscribe = db.collection('sessions').doc(this.state.session_id).onSnapshot(function(doc) {
              if(doc.data()) {
                if (doc.data().session_status === 'ingame') {
                  console.log('Game starting!');
                  setGameId(doc.data().current_game_id);
                  setLocalStatus('ingame');
                  console.log('Game started!');
                };
              } else {
                // Game no longer exists (maybe host left), send back to homepage
                console.log('Game no longer exists. Reloading...');
                setLocalStatus('disconnected');
              };
            });
          };
        } else { // Session does not exist
          console.log('Session does not exist');
          // TODO: Notify user of issue
        };
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
        session_id_length={SESSION_ID_LENGTH}
      />
    );
  };

  renderPregame() {
    if(this.state.host) {
      return(<PregameHost
              username={this.state.username}
              session_id={this.state.session_id}
              updateLocalStatus={this.updateLocalStatus}
              updateGameId={this.updateGameId}
              db={db}
            />);
    } else {
      return(<Pregame
              username={this.state.username}
              session_id={this.state.session_id}
            />);
    };
  };

  renderUserList() {
    return(<UserList
            db={db}
            session_id={this.state.session_id}
          />);
  }

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
          {this.renderUserList()}
        </div>
      );
    } else if (this.state.local_session_status === 'ingame') {
      return(
        <Game />
      );
    } else if (this.state.local_session_status === 'postgame') {

    } else if (this.state.local_session_status === 'results') {

    } else if (this.state.local_session_status === 'disconnected') {
      return(
        <div className="center-grey-box">
          <h3>lobby was destroyed - refresh to create new lobby</h3>
          <br />
          <button className="main-button" id="start-game"
            type="button"
            name="Reload"
            onClick={() => {window.location.reload();}}>
              reload
          </button>
        </div>
      );
    };
    return(<h1 className='center-grey-box'>something went wrong...</h1>);
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
