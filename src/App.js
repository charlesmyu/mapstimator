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
let SESSION_ID_LENGTH = 6;

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
      sessions.where('session_id', '==', id).where('session_status', '!=', 'closed').get().then((value) => {
        console.log('Found ' + value.size.toString() + ' matches');
        if (value.size === 0) { // No duplicates
          console.log('Creating session...');
          resolve(id);
        } else { // Have duplicates
          reject('Active matching ID found. Abort session creation');
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

      this.getNewSessionId(sessions, SESSION_ID_LENGTH).then((value) => {
        // New session id is valid, create session in Firestore
        const {serverTimestamp} = firebase.firestore.FieldValue;
        sessions.add({
          session_id: value,
          owner: this.state.username,
          opened_datetime: serverTimestamp(),
          closed_datetime: null,
          session_status: 'pregame',
          current_game_id: null,
          num_users: 1
        })
      }).then(() => {
        // New session created. Update local variables to reflect that
        this.setState({
          local_session_status: 'pregame',
          host: true // User created game, so they are host
        });
        console.log('Created session!')
      }).catch((err) => {
        // Something went wrong
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
      sessions.where('session_id', '==', this.state.session_id.toLowerCase()).get().then((value) => {
        let session;
        value.forEach((result) => {
          session = result.data();
        });
        console.log('Found session');

        if (session['session_status'] !== 'pregame') { // Check if session in game
          console.log('Session has game in progress, cannot join');
          // TODO: Notify user of this issue
        } else if (session['num_users'] >= PLAYER_LIMIT) { // Check if too many people
          console.log('Max players reached in session, cannot join');
          // TODO: Notify user of this issue
        } else if (false) { // Check if username is unique
          // TODO: implement this
        } else {
          console.log('Joined session!')
          // TODO: implement this
        }
      });
      // check if session id in pregame, check if username unique, check if too many users, then allow to join
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

  render() {
    return(
      <div className='container'>
        <Title value="welcome to mapstimator" />
        {this.renderSelect()}
      </div>
    );
  };
};

// Class contains components used to prompt user to join or initiate creation of a session
class SessionSelect extends React.Component {
  render() {
    return(
      <div className="main-box left-grey-box">
        <table id="session-table">
          <thead>
            <tr>
              <td colSpan="3">
                <Nickname name={null} onChange={this.props.onUserChange}/>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="button-option">
                <h3 className="option-title">host</h3>
                <button className="main-button"
                  type="button"
                  name="Create Lobby"
                  onClick={this.props.createSession}>
                    create lobby
                </button>
              </td>
              <td className="table-spacer"/>
              <td className="button-option">
                  <h3 className="option-title">
                    player
                  </h3>
                  <SessionId onChange={this.props.onSessionIdChange}/>
                  <button className="main-button" id="session-id"
                    type="button"
                    name="Join Lobby"
                    onClick={this.props.joinSession}>
                      go
                  </button>
              </td>
            </tr>
          </tbody>
        </table>
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
        size="2"
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
      <h2>
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
        <div>
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
      <div className="title left-grey-box">
        <h1 className="title-text">
          {this.props.value}
        </h1>
      </div>
    );
  };
};

export default App;
