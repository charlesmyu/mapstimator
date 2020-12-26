import React from 'react';

// Contains input box for username
class Nickname extends React.Component {
  constructor(props) {
    super(props);
    this.state = {error: false};

    this.handleChange = this.handleChange.bind(this);
  };

  handleChange(event) {
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

export { Title, Nickname };
