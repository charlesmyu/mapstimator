import React from 'react';
import { Nickname } from './common.js';

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
              session_id_length={this.props.session_id_length}
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
    if (event.target.value.length === this.props.session_id_length) {
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
        minLength={this.props.session_id_length.toString()}
        maxLength={this.props.session_id_length.toString()}
        size="10"
        onChange = {this.handleChange}
      />
    );
  };
};

export { SessionSelect };
