// Modified from alexus37/react-google-streetview

import React from 'react';
import asyncLoading from 'react-async-loader';
import isEqual from 'lodash.isequal';
import firebase from 'firebase/app';

class GoogleStreetview extends React.Component {
  constructor(props) {
    super(props);
    this.streetView = null;
  }

  componentDidMount() {
    this.initialize(this.node, this.props);
  }

  componentDidUpdate(prevProps) {
    this.initialize(this.node, prevProps);
  }

  componentWillUnmount() {
    if (this.streetView) {
      this.props.googleMaps.event.clearInstanceListeners(this.streetView);
    }
  }

  initialize(canvas, prevProps) {
    if (this.props.googleMaps && this.streetView == null) {
      const service = new this.props.googleMaps.StreetViewService();
      this.streetView = new this.props.googleMaps.StreetViewPanorama(
        canvas,
        this.props.street_view_panorama_options,
      );

      // Not all lat/lng have streetview. Use getPanorama to find nearest valid streetview coordinates
      // Note that using 'outdoor' allows us to skip over photospheres (those are no fun) 
      service.getPanorama({ location: this.props.location, preference: 'nearest', radius: 10000000000, source: 'outdoor' }).then((response) => {
        // When valid streetview coordinates found, set coordinates as new target coordinates
        console.log('Setting valid location...');
        this.streetView.setPano(response.data.location.pano);

        this.props.db.collection('user-games').doc(this.props.user_game).update({
          target_coordinates: new firebase.firestore.GeoPoint(response.data.location.latLng.lat(), response.data.location.latLng.lng())
        });

        this.props.updateTargetCoordinates(new firebase.firestore.GeoPoint(response.data.location.latLng.lat(), response.data.location.latLng.lng()));
      });

      this.streetView.addListener('position_changed', () => {
        console.log('Updating position...');
        this.props.db.collection('user-games').doc(this.props.user_game).update({
          current_coordinates: new firebase.firestore.GeoPoint(this.streetView.getPosition().lat(), this.streetView.getPosition().lng())
        });
      });
    }
    if (
      this.streetView !== null &&
      this.props.street_view_panorama_options &&
      !isEqual(
        this.props.street_view_panorama_options,
        prevProps.street_view_panorama_options,
      )
    ) {
      const {
        zoom,
        pov,
        position,
        ...otherOptions
      } = this.props.street_view_panorama_optionss;
      const {
        zoom: prevZoom,
        pov: prevPov,
        position: prevPos,
        ...prevOtherOptions
      } = prevProps.street_view_panorama_options;
      if (!isEqual(zoom, prevZoom)) {
        this.streetView.setZoom(zoom);
      }
      if (!isEqual(pov, prevPov)) {
        this.streetView.setPov(pov);
      }
      if (!isEqual(position, prevPos)) {
        this.streetView.setPosition(position);
      }
      if (!isEqual(otherOptions, prevOtherOptions)) {
        this.streetView.setOptions(otherOptions);
      }
    }
  }

  render() {
    return <div style={{ height: '100%' }} ref={node => (this.node = node)} />;
  }
}

function mapScriptsToProps({ api_key }) {
  if (!api_key) return {};

  return {
    googleMaps: {
      globalPath: 'google.maps',
      url: `https://maps.googleapis.com/maps/api/js?key=${api_key}&v=beta`,
      jsonp: true,
    },
  };
}

export default asyncLoading(mapScriptsToProps)(GoogleStreetview);
