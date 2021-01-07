import React from 'react';

class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      positions: []
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
        <div className='center-grey-box'>
          <h1>results</h1>
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
