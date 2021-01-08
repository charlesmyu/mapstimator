// Modified from alexus37/react-google-streetview to fit use for maps

import React from 'react';
import isEqual from 'lodash.isequal';

class ResultMap extends React.Component {
  constructor(props) {
    super(props);
    this.map = null;
  }

  componentDidMount() {
    this.initialize(this.node, this.props);
  }

  componentDidUpdate(prevProps) {
    this.initialize(this.node, prevProps);
  }

  componentWillUnmount() {
    if (this.map) {
      this.props.googleMaps.event.clearInstanceListeners(this.map);
    }
  }

  initialize(canvas, prevProps) {
    if (this.props.googleMaps && this.map == null) {
      this.map = new this.props.googleMaps.Map(
        canvas,
        this.props.map_options,
      );

      if(this.props.target_coordinates) {
        var target_marker = new this.props.googleMaps.Marker({
          position: {lat: this.props.target_coordinates['latitude'], lng: this.props.target_coordinates['longitude']},
          label: 'X'
        });
        target_marker.setMap(this.map);
      }

      var count = 0;
      this.props.guesses.forEach((guess) => {
        count++;
        if(guess.guess_coordinates) {
          var guess_marker = new this.props.googleMaps.Marker({
            position: {lat: guess.guess_coordinates['latitude'], lng: guess.guess_coordinates['longitude']},
            label: count.toString()
          });
          guess_marker.setMap(this.map);
        }
      })
    }

    if (
      this.map !== null &&
      this.props.map_options &&
      !isEqual(
        this.props.map_options,
        prevProps.map_options,
      )
    ) {
      const {
        zoom,
        center,
        ...otherOptions
      } = this.props.map_options;
      const {
        zoom: prevZoom,
        center: prevCenter,
        ...prevOtherOptions
      } = prevProps.map_options;
      if (!isEqual(zoom, prevZoom)) {
        this.map.setZoom(zoom);
      }
      if (!isEqual(center, prevCenter)) {
        this.map.setCenter(center);
      }
      if (!isEqual(otherOptions, prevOtherOptions)) {
        this.map.setOptions(otherOptions);
      }
    }
  }

  render() {
    return <div id="result-map" ref={node => (this.node = node)} />;
  }
}

export default ResultMap;
