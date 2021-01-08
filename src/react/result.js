import React from 'react';

import ResultMap from './result_map.js';

class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positions: [],
      target_coordinates: null,
      guess_coordinates: null,
      guess_error: null
    }

    this.newGame = this.newGame.bind(this);
  }

  componentDidMount() {
    this.props.db.collection('user-games').where('game_id', '==', this.props.game_id).get().then((querySnapshot) => {
      var arrayQuerySnapshot = [];
      var score_results = [];

      querySnapshot.forEach((doc) => {
        arrayQuerySnapshot.push(doc);
      });

      let results = arrayQuerySnapshot.map((doc) => {
        score_results.push({
          username: doc.data().username,
          score: doc.data().score
        });

        if(doc.data().username === this.props.username) {
          this.setState({
            target_coordinates: doc.data().target_coordinates,
            guess_coordinates: doc.data().guess_coordinates,
            guess_error: doc.data().guess_error
          });
        }

        return true;
      });

      Promise.all(results).then(() => {
        score_results.sort((a, b) => {
          if (a.score > b.score) {
            return -100;
          } else {
            return 100;
          }
        });

        this.setState({positions: score_results});
      });
    });
  }

  newGame() {
    this.props.updateLocalStatus('pregame');
  }

  renderDistanceError() {
    if(this.state.guess_error) {
      return(<p>You were {this.state.guess_error.toFixed(2)} km off!</p>);
    } else {
      return(<p>You didn't guess!</p>);
    }
  }

  render() {
    if(this.state.positions === null || this.state.positions.length === 0) {
      return(<h1 className="left-grey-box">loading...</h1>);
    } else {
      var to_render = [];
      var count = 0;

      this.state.positions.forEach((user) => {
        count++;
        to_render.push(<IndividualResult key={user.username} position={count} username={user.username} score={user.score} />);
      })

      return(
        <div id='results-container'>
          <div className='left-grey-box' id='results-table-container'>
            <h1>results</h1>
            {this.renderDistanceError()}
            <table id='results-table'>
              <tbody>
                <tr>
                  <th>#</th>
                  <th>player</th>
                  <th>score</th>
                </tr>
                {to_render}
              </tbody>
            </table>
            <button className="main-button" id="new-game-button"
              type="button"
              name="New Game"
              onClick={this.newGame}>
                new game
            </button>
            <button className="main-button" id="leave-button"
              type="button"
              name="Leave Lobby"
              onClick={() => {window.location.reload();}}>
                leave
            </button>
          </div>
          <div className='right-grey-box' id='results-maps-container'>
            <ResultMap
              googleMaps={this.props.googleMaps}
              map_options={{
                zoom: 1,
                center: { lat: 0, lng: 0 },
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
              }}
              target_coordinates={this.state.target_coordinates}
              guess_coordinates={this.state.guess_coordinates}
            />
          </div>
        </div>
      );
    }
  }
}

class IndividualResult extends React.Component {
  render() {
    return(
      <tr key={this.props.username}>
        <td>{this.props.position}</td>
        <td>{this.props.username}</td>
        <td>{Math.round(this.props.score)}</td>
      </tr>
    );
  }
}

export { Result };
