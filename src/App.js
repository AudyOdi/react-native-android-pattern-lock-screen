// @flow

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import {Svg} from 'expo';

const {Line, Circle} = Svg;

const {width, height} = Dimensions.get('window');

let svgContainerHeight = height / 2;
let svgContainerWidth = width;

const HITSLOP = 5;

type State = {
  activeIndex: number,
  initialCoordinate: {
    x: number,
    y: number
  }
};

export default class App extends React.Component<void, State> {
  panResponder: Object;
  panAnimation: Animated.ValueXY;
  _lineComponent: ?Object;
  _axisX: number;
  _axisY: number;
  _dots: Array<Object>;

  constructor() {
    super(...arguments);
    this.state = {
      activeIndex: -1,
      initialCoordinate: {
        x: 0,
        y: 0
      }
    };

    this.panAnimation = new Animated.ValueXY({x: 0, y: 0});
    this._axisX = 0;
    this._axisY = 0;

    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: e => {
        let {locationX, locationY} = e.nativeEvent;
        this.panAnimation.setOffset({
          x: 0,
          y: 0
        });
        this.panAnimation.setValue({x: 0, y: 0});
        let newActiveIndex = this._getIndex(locationX, locationY);
        let newState = {
          activeIndex: newActiveIndex
        };
        if (newActiveIndex > -1) {
          let {x1, y1} = this._dots[newActiveIndex];
          newState = {
            ...newState,
            initialCoordinate: {
              x: x1,
              y: y1
            }
          };
        }
        this.setState(newState);
      },
      onPanResponderMove: (e, gestureState) => {
        let {dx, dy, x0, y0} = gestureState;
        let {initialCoordinate: {x, y}} = this.state;

        this._lineComponent &&
          this._lineComponent.setNativeProps({
            x2: (x + dx).toString(),
            y2: (y + dy).toString()
          });
      },
      onPanResponderRelease: () => {
        this.setState({
          activeIndex: -1,
          initialCoordinate: {
            x: 0,
            y: 0
          }
        });
      }
    });

    let row1 = [];
    let row2 = [];
    let row3 = [];
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row1.push({
        x1: offsetX + svgContainerWidth / 3 / 2,
        y1: svgContainerWidth / 3 / 2
      });
    }
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      let offsetY = svgContainerHeight / 3;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row2.push({
        x1: offsetX + svgContainerWidth / 3 / 2,
        y1: offsetY + svgContainerWidth / 3 / 2
      });
    }
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      let offsetY = svgContainerHeight / 3 * 2;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row3.push({
        x1: offsetX + svgContainerWidth / 3 / 2,
        y1: offsetY + svgContainerWidth / 3 / 2
      });
    }

    this._dots = [...row1, ...row2, ...row3];
  }

  render() {
    let {activeIndex, initialCoordinate} = this.state;
    return (
      <View style={styles.container}>
        <Animated.View {...this.panResponder.panHandlers}>
          <Svg height={svgContainerHeight} width={svgContainerWidth}>
            {this._dots.map((dot, i) => {
              return (
                <Circle key={i} cx={dot.x1} cy={dot.y1} r="5" fill="red" />
              );
            })}
            {this.state.activeIndex > -1 ? (
              <Line
                ref={component => (this._lineComponent = component)}
                x1={initialCoordinate.x}
                y1={initialCoordinate.y}
                x2={initialCoordinate.x}
                y2={initialCoordinate.y}
                stroke="red"
                strokeWidth="2"
              />
            ) : null}
          </Svg>
        </Animated.View>
      </View>
    );
  }
  _getIndex(x: number, y: number) {
    let index = -1;
    for (let i = 0; i < this._dots.length; i++) {
      let {x1, y1} = this._dots[i];
      if (
        x1 + HITSLOP >= x &&
        x1 - HITSLOP <= x &&
        (y1 + HITSLOP >= y && y1 - HITSLOP <= y)
      ) {
        index = i;
        break;
      }
    }
    return index;
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
