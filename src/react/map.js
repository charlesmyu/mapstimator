// Modified from alexus37/react-google-streetview to fit use for maps

import React from 'react';
import isEqual from 'lodash.isequal';
import firebase from 'firebase/app';

class GoogleMaps extends React.Component {
  constructor(props) {
    super(props);
    this.map = null;
    this.marker = null;
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

      this.map.addListener('click', (mapsMouseEvent) => {
        console.log('Click logged');
        var position = mapsMouseEvent.latLng;
        if(this.marker === null) {
          this.marker = new this.props.googleMaps.Marker({
            position: position,
          });
          this.marker.setMap(this.map);
        }

        this.marker.setPosition(position);
        this.props.updateGuessCoordinates(new firebase.firestore.GeoPoint(position.lat(), position.lng()));
      });
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
    return <div id="map" ref={node => (this.node = node)} />;
  }
}

export default GoogleMaps;
