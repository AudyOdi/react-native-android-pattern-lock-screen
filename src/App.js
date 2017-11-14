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

const HITSLOP = 15;

type Coordinate = {
  x: number,
  y: number
};

type LineCoordinate = {
  startX: number,
  startY: number,
  endX: number,
  endY: number
};

type State = {
  activeIndex: number,
  initialCoordinate: Coordinate,
  activeCoordinate: Coordinate,
  fixedLine: Array<LineCoordinate>,
  pattern: Array<number>
};

export default class App extends React.Component<void, State> {
  panResponder: Object;
  panAnimation: Animated.ValueXY;
  _lineComponent: ?Object;
  _dots: Array<Coordinate>;

  constructor() {
    super(...arguments);
    this.state = {
      activeIndex: -1,
      initialCoordinate: {
        x: 0,
        y: 0
      },
      activeCoordinate: {
        x: 0,
        y: 0
      },
      fixedLine: [],
      pattern: []
    };

    this.panAnimation = new Animated.ValueXY({x: 0, y: 0});

    this.panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: e => {
        let {locationX, locationY} = e.nativeEvent;
        this.panAnimation.setOffset({x: 0, y: 0});
        this.panAnimation.setValue({x: 0, y: 0});

        let newActiveIndex = this._getIndex(locationX, locationY);
        let newState = {
          activeIndex: newActiveIndex
        };

        if (newActiveIndex > -1) {
          let {x, y} = this._dots[newActiveIndex];
          newState = {
            ...newState,
            initialCoordinate: {
              x,
              y
            },
            activeCoordinate: {
              x,
              y
            }
          };
        }
        this.setState(newState);
      },
      onPanResponderMove: (e, gestureState) => {
        let {dx, dy, x0, y0} = gestureState;
        let {
          fixedLine,
          initialCoordinate,
          activeCoordinate,
          pattern
        } = this.state;
        let endLineX = initialCoordinate.x + dx;
        let endLineY = initialCoordinate.y + dy;

        let hitIndex = this._getIndex(endLineX, endLineY);
        if (hitIndex > -1 && !pattern.includes(hitIndex)) {
          let endDot = this._dots[hitIndex];
          fixedLine.push({
            startX: activeCoordinate.x,
            startY: activeCoordinate.y,
            endX: endDot.x,
            endY: endDot.y
          });
          pattern.push(hitIndex);
          this.setState({
            pattern,
            fixedLine,
            activeCoordinate: {
              x: endDot.x,
              y: endDot.y
            }
          });
        } else {
          this._lineComponent &&
            this._lineComponent.setNativeProps({
              x2: endLineX.toString(),
              y2: endLineY.toString()
            });
        }
      },
      onPanResponderRelease: () => {
        this.setState({
          activeIndex: -1,
          initialCoordinate: {
            x: 0,
            y: 0
          },
          activeCoordinate: {
            x: 0,
            y: 0
          },
          fixedLine: [],
          pattern: []
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
        x: offsetX + svgContainerWidth / 3 / 2,
        y: svgContainerWidth / 3 / 2
      });
    }
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      let offsetY = svgContainerHeight / 3;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row2.push({
        x: offsetX + svgContainerWidth / 3 / 2,
        y: offsetY + svgContainerWidth / 3 / 2
      });
    }
    for (let i = 0; i < 3; i++) {
      let offsetX = 0;
      let offsetY = svgContainerHeight / 3 * 2;
      if (i > 0) {
        offsetX = svgContainerWidth / 3 * i;
      }
      row3.push({
        x: offsetX + svgContainerWidth / 3 / 2,
        y: offsetY + svgContainerWidth / 3 / 2
      });
    }

    this._dots = [...row1, ...row2, ...row3];
  }

  render() {
    let {
      activeIndex,
      initialCoordinate,
      fixedLine,
      activeCoordinate
    } = this.state;
    return (
      <View style={styles.container}>
        <Animated.View {...this.panResponder.panHandlers}>
          <Svg height={svgContainerHeight} width={svgContainerWidth}>
            {this._dots.map((dot, i) => {
              return <Circle key={i} cx={dot.x} cy={dot.y} r="5" fill="red" />;
            })}
            {fixedLine.map((coordinate, index) => {
              let {startX, startY, endX, endY} = coordinate;
              return (
                <Line
                  key={`fixedLine${index}`}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="red"
                  strokeWidth="2"
                />
              );
            })}
            {activeIndex > -1 ? (
              <Line
                ref={component => (this._lineComponent = component)}
                x1={activeCoordinate.x}
                y1={activeCoordinate.y}
                x2={activeCoordinate.x}
                y2={activeCoordinate.y}
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
      let {x: dotX, y: dotY} = this._dots[i];
      if (
        dotX + HITSLOP >= x &&
        dotX - HITSLOP <= x &&
        (dotY + HITSLOP >= y && dotY - HITSLOP <= y)
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
