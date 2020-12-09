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
        <ItemList />
      </header>
    </div>
  );
}

class Title extends React.Component {
  render() {
    return(<div class="title-box">
             <h1 class="top-left">{this.props.value}</h1>
           </div>);
  }
}

class Item extends React.Component {
  render() {
    return(<li>{this.props.value}</li>);
  };
}

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    var list = [];
    this.state = {
      values: list
    };
  }

  componentDidMount() {
    var db = firebase.firestore();
    var list = [];
    db.collection('users').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
        console.log(doc.data());
      });
      console.log(list);
      this.setState({
        values: list
      });
    });
  }

  renderItem(value) {
    return(<Item value={value} />);
  }

  render() {
    var to_render = [];
    this.state.values.forEach((value) => {to_render.push(this.renderItem(value))});
    console.log(to_render);
    var list = (<ul> {to_render} </ul>);
    return(list);
  }
}

export default App;
