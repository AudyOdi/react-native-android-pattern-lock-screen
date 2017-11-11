// @flow

import React from 'react';
import {StyleSheet, Text, View, Animated, PanResponder} from 'react-native';
import {Svg} from 'expo';

const {Line} = Svg;

export default class App extends React.Component<void, void> {
  panResponder: Object;
  panAnimation: Animated.ValueXY;
  _lineComponent: ?Object;
  _axisX: number;
  _axisY: number;

  constructor() {
    super(...arguments);

    this.panAnimation = new Animated.ValueXY({x: 0, y: 0});
    this._axisX = 0;
    this._axisY = 0;
    this.panAnimation.x.addListener(event => {
      this._axisX = event.value;
      this._lineComponent &&
        this._lineComponent.setNativeProps({
          x2: event.value.toString()
        });
    });
    this.panAnimation.y.addListener(event => {
      this._axisY = event.value;
      this._lineComponent &&
        this._lineComponent.setNativeProps({
          y2: event.value.toString()
        });
    });

    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: e => {
        this.panAnimation.setOffset({
          x: this._axisX,
          y: this._axisY
        });
        this.panAnimation.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.panAnimation.x,
          dy: this.panAnimation.y
        }
      ]),

      onPanResponderRelease: () => {}
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View
          style={{
            width: 30,
            height: 30,
            backgroundColor: 'red',
            transform: [
              {translateX: this.panAnimation.x},
              {translateY: this.panAnimation.y}
            ]
          }}
          {...this.panResponder.panHandlers}
        />
        <Svg height={100} width={100}>
          <Line
            ref={component => (this._lineComponent = component)}
            x1="50"
            y1="50"
            stroke="red"
            strokeWidth="2"
          />
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
