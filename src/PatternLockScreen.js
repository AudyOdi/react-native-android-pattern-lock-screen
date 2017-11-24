// @flow

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  PanResponder,
  Alert
} from 'react-native';
import {Svg} from 'expo';

import {
  populateDotsCoordinate,
  getPassedDotIndex,
  getAdditionalPassedDotsIndexes
} from './helpers';

type Coordinate = {
  x: number,
  y: number
};

type Props = {
  containerDimension: number,
  containerWidth: number,
  containerHeight: number,
  correctPattern: Array<Coordinate>,
  hint: string,
  onPatternMatch: () => boolean
};

type State = {
  activeDotCoordinate: ?Coordinate,
  initialGestureCoordinate: ?Coordinate,
  pattern: Array<Coordinate>,
  showError: boolean,
  showHint: boolean
};

const {Line, Circle} = Svg;
const DEFAULT_DOT_RADIUS = 5;
const SNAP_DOT_RADIUS = 10;
const SNAP_DURATION = 100;

export default class PatternLockScreen extends React.Component<Props, State> {
  _panResponder: {panHandlers: Object};
  _activeLineComponent: ?Object;
  _dots: Array<Coordinate>;
  _dotsComponent: Array<?Object>;
  _mappedDotsIndex: Array<Coordinate>;

  _snapAnimatedValues: Array<Animated.Value>;

  _resetTimeout: number;

  constructor() {
    super(...arguments);
    this.state = {
      initialGestureCoordinate: null,
      activeDotCoordinate: null,
      pattern: [],
      showError: false,
      showHint: false
    };

    let {containerDimension, containerWidth, containerHeight} = this.props;

    let {actualDotsCoordinate, mappedDotsIndex} = populateDotsCoordinate(
      containerDimension,
      containerWidth,
      containerHeight
    );
    this._dots = actualDotsCoordinate;
    this._mappedDotsIndex = mappedDotsIndex;
    this._dotsComponent = [];

    this._snapAnimatedValues = this._dots.map(
      () => new Animated.Value(DEFAULT_DOT_RADIUS)
    );
    this._snapAnimatedValues.forEach((animatedValue, index) => {
      animatedValue.addListener(({value}) => {
        let dot = this._dotsComponent[index];
        dot && dot.setNativeProps({r: value.toString()});
      });
    });

    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => !this.state.showError,
      onMoveShouldSetPanResponderCapture: () => !this.state.showError,

      onPanResponderGrant: e => {
        let {locationX, locationY} = e.nativeEvent;

        let activeDotIndex = getPassedDotIndex(
          {x: locationX, y: locationY},
          this._dots
        );

        if (activeDotIndex != null) {
          let activeDotCoordinate = this._dots[activeDotIndex];
          let firstDot = this._mappedDotsIndex[activeDotIndex];
          let dotWillSnap = this._snapAnimatedValues[activeDotIndex];
          this.setState(
            {
              activeDotCoordinate,
              initialGestureCoordinate: activeDotCoordinate,
              pattern: [firstDot]
            },
            () => {
              this._snapDot(dotWillSnap);
            }
          );
        }
      },
      onPanResponderMove: (e, gestureState) => {
        let {dx, dy, x0, y0} = gestureState;
        let {
          initialGestureCoordinate,
          activeDotCoordinate,
          pattern
        } = this.state;

        if (activeDotCoordinate == null || initialGestureCoordinate == null) {
          return;
        }

        let endGestureX = initialGestureCoordinate.x + dx;
        let endGestureY = initialGestureCoordinate.y + dy;

        let matchedDotIndex = getPassedDotIndex(
          {x: endGestureX, y: endGestureY},
          this._dots
        );

        let matchedDot =
          matchedDotIndex != null && this._mappedDotsIndex[matchedDotIndex];

        if (
          matchedDotIndex != null &&
          matchedDot &&
          !this._hasDotGetPassed(matchedDot)
        ) {
          let newPattern = {
            x: matchedDot.x,
            y: matchedDot.y
          };

          let additionalPassedDotIndexes = [];

          if (pattern.length > 0) {
            additionalPassedDotIndexes = getAdditionalPassedDotsIndexes(
              pattern[pattern.length - 1],
              newPattern,
              this._mappedDotsIndex
            );
          }

          let filteredAdditionalDots = additionalPassedDotIndexes.filter(
            index => !this._hasDotGetPassed(this._mappedDotsIndex[index])
          );

          filteredAdditionalDots.forEach(index => {
            let mappedDot = this._mappedDotsIndex[index];
            pattern.push({x: mappedDot.x, y: mappedDot.y});
          });

          pattern.push(newPattern);

          let animateIndexes = [...filteredAdditionalDots, matchedDotIndex];

          this.setState(
            {
              pattern,
              activeDotCoordinate: this._dots[matchedDotIndex]
            },
            () => {
              if (animateIndexes.length) {
                animateIndexes.forEach(index => {
                  this._snapDot(this._snapAnimatedValues[index]);
                });
              }
            }
          );
        } else {
          this._activeLineComponent &&
            this._activeLineComponent.setNativeProps({
              x2: endGestureX.toString(),
              y2: endGestureY.toString()
            });
        }
      },
      onPanResponderRelease: () => {
        let {pattern} = this.state;
        if (pattern.length) {
          if (this._isPatternMatched(pattern)) {
            this.setState(
              {
                initialGestureCoordinate: null,
                activeDotCoordinate: null
              },
              () => {
                Alert.alert(
                  '',
                  'Congratulations unlock success',
                  [{text: 'OK', onPress: this.props.onPatternMatch}],
                  {cancelable: false}
                );
              }
            );
          } else {
            this.setState(
              {
                initialGestureCoordinate: null,
                activeDotCoordinate: null,
                showError: true
              },
              () => {
                this._resetTimeout = setTimeout(() => {
                  this.setState({
                    showHint: true,
                    showError: false,
                    pattern: []
                  });
                }, 2000);
              }
            );
          }
        }
      }
    });
  }

  componentWillUnmount() {
    clearTimeout(this._resetTimeout);
  }

  render() {
    let {containerHeight, containerWidth, hint} = this.props;
    let {
      initialGestureCoordinate,
      activeDotCoordinate,
      pattern,
      showError,
      showHint
    } = this.state;
    let message;
    if (showHint) {
      message = `hint: ${hint}`;
    } else if (showError) {
      message = 'Wrong Pattern';
    }
    return (
      <View style={styles.container}>
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>{message}</Text>
        </View>
        <Animated.View {...this._panResponder.panHandlers}>
          <Svg height={containerHeight} width={containerWidth}>
            {this._dots.map((dot, i) => {
              let mappedDot = this._mappedDotsIndex[i];
              let isIncludedInPattern = pattern.find(
                dot => dot.x === mappedDot.x && dot.y === mappedDot.y
              );
              return (
                <Circle
                  ref={circle => (this._dotsComponent[i] = circle)}
                  key={i}
                  cx={dot.x}
                  cy={dot.y}
                  r={DEFAULT_DOT_RADIUS}
                  fill={(showError && isIncludedInPattern && 'red') || 'white'}
                />
              );
            })}
            {pattern.map((startCoordinate, index) => {
              if (index === pattern.length - 1) {
                return;
              }
              let startIndex = this._mappedDotsIndex.findIndex(dot => {
                return (
                  dot.x === startCoordinate.x && dot.y === startCoordinate.y
                );
              });
              let endCoordinate = pattern[index + 1];
              let endIndex = this._mappedDotsIndex.findIndex(dot => {
                return dot.x === endCoordinate.x && dot.y === endCoordinate.y;
              });

              if (startIndex < 0 || endIndex < 0) {
                return;
              }

              let actualStartDot = this._dots[startIndex];
              let actualEndDot = this._dots[endIndex];

              return (
                <Line
                  key={`fixedLine${index}`}
                  x1={actualStartDot.x}
                  y1={actualStartDot.y}
                  x2={actualEndDot.x}
                  y2={actualEndDot.y}
                  stroke={showError ? 'red' : 'white'}
                  strokeWidth="2"
                />
              );
            })}
            {activeDotCoordinate ? (
              <Line
                ref={component => (this._activeLineComponent = component)}
                x1={activeDotCoordinate.x}
                y1={activeDotCoordinate.y}
                x2={activeDotCoordinate.x}
                y2={activeDotCoordinate.y}
                stroke="white"
                strokeWidth="2"
              />
            ) : null}
          </Svg>
        </Animated.View>
      </View>
    );
  }

  _hasDotGetPassed({x, y}: Coordinate) {
    let {pattern} = this.state;
    return pattern.find(dot => {
      return dot.x === x && dot.y === y;
    }) == null
      ? false
      : true;
  }

  _isPatternMatched(currentPattern: Array<Coordinate>) {
    let {correctPattern} = this.props;
    if (currentPattern.length !== correctPattern.length) {
      return false;
    }
    let matched = true;
    for (let index = 0; index < currentPattern.length; index++) {
      let correctDot = correctPattern[index];
      let currentDot = currentPattern[index];
      if (correctDot.x !== currentDot.x || correctDot.y !== currentDot.y) {
        matched = false;
        break;
      }
    }
    return matched;
  }

  _snapDot(animatedValue: Animated.Value) {
    Animated.timing(animatedValue, {
      toValue: SNAP_DOT_RADIUS,
      duration: SNAP_DURATION
    }).start(() => {
      Animated.timing(animatedValue, {
        toValue: DEFAULT_DOT_RADIUS,
        duration: SNAP_DURATION
      }).start();
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  hintContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    height: 20,
    flexWrap: 'wrap'
  },
  hintText: {
    color: 'white',
    textAlign: 'center'
  }
});
