import React, { useState, useEffect } from 'react';

// Contains input box for username
class Nickname extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: false};

    this.handleChange = this.handleChange.bind(this);
  };

  handleChange(event) {
    if (event.target.value.length === 0 || event.target.value.includes(',')) {
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


// Lists all players in the game
function UserList(props) {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    function handleUsersChange(users) {
      setUsers(users);
    };

    var unsubscribe = props.db.collection('sessions').doc(props.session_id.toLowerCase()).onSnapshot(function(doc) {
      handleUsersChange(doc.data().users.split(','));
      console.log('Found players: ' + doc.data().users.split(','));
    });

    return unsubscribe;
  });

  function renderUsers() {
    if (users === null) {
      return('loading...')
    } else {
      return users.map((user) => {
        return(<div className="user-entry" key={user}>{user}</div>);
      });
    };
  };

  return(
    <div className="right-grey-box" id="UserList">
      <h2>players</h2>
      {renderUsers()}
    </div>
  );
};

export { Nickname, UserList };
