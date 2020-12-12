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

function App() {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // REMOVE FOR PRODUCTION
  // firebase.firestore().useEmulator("localhost", 8080);

  return (
    <div className="App">
      <header className="App-header">
        <Title value="welcome to mapstimator" />
        <SessionSelect />
      </header>
    </div>
  );
}

class SessionSelect extends React.Component {
  render() {
    return(<div className="main-box left-grey-box">


             <table id="session-table">
              <thead>
                <tr>
                  <td colSpan="3">
                    <Nickname allow_entry={true} />
                  </td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="button-option">
                    <h3 className="option-title">host</h3>
                    <button className="main-button"
                       type="button"
                       name="Create Lobby">create lobby</button>
                  </td>
                  <td className="table-spacer"/>
                  <td className="button-option">
                    <h3 className="option-title">player</h3>
                    <input className="input-box" id="session_id"
                           type="text"
                           placeholder="lobby code"
                           minLength="6"
                           maxLength="6"
                           size="2"
                     />
                     <button className="main-button" id="session-id"
                             type="button"
                             name="Join Lobby">go</button>
                  </td>
                 </tr>
                </tbody>
             </table>
           </div>
    )
  }
}

class Nickname extends React.Component {
  render_static() {
    return(<h2>{this.props.name}</h2>);
  }

  render_input() {
    return(<input className="input-box" id="nickname"
                  type="text"
                  placeholder="nickname"
                  minLength="1"
                  maxLength="10"
           />
    );
  }

  render() {
    if(this.props.allow_entry) {
      return(<div>{this.render_input()}</div>);
    } else {
      return(<div>{this.render_static()}</div>);
    }
  }
}

class Title extends React.Component {
  render() {
    return(<div className="title left-grey-box">
             <h1 className="title-text">{this.props.value}</h1>
           </div>);
  }
}

export default App;
