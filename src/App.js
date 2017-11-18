// @flow

import React from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';

import backgroundImage from './assets/default_background.jpg';
import {getDayName, getMonthName} from './helpers';

const {width, height} = Dimensions.get('window');

export default class App extends React.Component<void, void> {
  _panResponder: {panHandlers: Object};
  _panCoordinate: Animated.ValueXY;
  constructor() {
    super(...arguments);
    this._panCoordinate = new Animated.ValueXY({x: 0, y: 0});
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: () => {
        this._panCoordinate.setOffset({x: 0, y: 0});
        this._panCoordinate.setValue({x: 0, y: 0});
      },

      onPanResponderMove: (e, gestureState) => {
        let {dx, dy} = gestureState;
        this._panCoordinate.setValue({x: dx, y: dy});
      },

      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.timing(this._panCoordinate.x, {toValue: 0, duration: 200}),
          Animated.timing(this._panCoordinate.y, {toValue: 0, duration: 200})
        ]).start();
      }
    });
  }
  render() {
    let paddingTop = this._panCoordinate.y.interpolate({
      inputRange: [-300, 0],
      outputRange: [170, 200],
      extrapolate: 'clamp'
    });
    let scale = this._panCoordinate.y.interpolate({
      inputRange: [-300, 0, 200],
      outputRange: [0.5, 1, 1.2],
      extrapolate: 'clamp'
    });

    let timeOpacity = this._panCoordinate.y.interpolate({
      inputRange: [-300, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });
    let backgroundOpacity = this._panCoordinate.y.interpolate({
      inputRange: [-300, 0],
      outputRange: [0.2, 1],
      extrapolate: 'clamp'
    });

    let now = new Date();
    let [hour, minute] = now.toTimeString().split(':');
    let dayName = getDayName(now.getDay());
    let monthName = getMonthName(now.getUTCMonth());
    let date = now.getUTCDate();

    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <Animated.Image
          source={backgroundImage}
          resizeMode="cover"
          style={[styles.container, {opacity: backgroundOpacity}]}
          {...this._panResponder.panHandlers}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              alignItems: 'center',
              opacity: timeOpacity,
              paddingTop,
              transform: [{scale}]
            }}
          >
            <Text style={styles.time}>{`${hour}:${minute}`}</Text>
            <Text
              style={styles.date}
            >{`${dayName}, ${monthName} ${date}`}</Text>
          </Animated.View>
        </Animated.Image>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height,
    width
  },
  time: {
    fontSize: 80,
    fontWeight: '300',
    color: '#f2f2f2'
  },
  date: {
    fontSize: 20,
    color: '#f2f2f2'
  }
});
