// @flow

import React from 'react';
import autobind from 'class-autobind';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  BackHandler
} from 'react-native';
import {Icon} from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

import PatternLockScreen from './PatternLockScreen';
import backgroundImage from './assets/default_background.jpg';
import {getDayName, getMonthName} from './helpers';

const {width, height} = Dimensions.get('window');
const PATTERN_CONTAINER_HEIGHT = height / 2;
const PATTERN_CONTAINER_WIDTH = width;
const PATTERN_DIMENSION = 3;
const CORRECT_UNLOCK_PATTERN = [
  {x: 0, y: 0},
  {x: 1, y: 0},
  {x: 2, y: 0},
  {x: 1, y: 1},
  {x: 0, y: 2},
  {x: 1, y: 2},
  {x: 2, y: 2}
];
const HINT_DELAY = 3000;

type State = {
  showPatternLock: boolean,
  currentDateTime: {
    hour: string,
    minute: string,
    dayName: string,
    monthName: string,
    date: number
  }
};

export default class App extends React.Component<void, State> {
  _panResponder: {panHandlers: Object};
  _panYCoordinate: Animated.Value;
  _patternContainerOpacity: Animated.Value;
  _value: number;

  _updateClockInterval: number;

  constructor() {
    super(...arguments);
    autobind(this);
    this._panYCoordinate = new Animated.Value(0);
    this._patternContainerOpacity = new Animated.Value(0);
    this._value = 0;
    this._panYCoordinate.addListener(({value}) => (this._value = value));
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => !this.state.showPatternLock,
      onMoveShouldSetPanResponderCapture: () => !this.state.showPatternLock,

      onPanResponderGrant: () => {
        this._panYCoordinate.setValue(0);
      },

      onPanResponderMove: (e, gestureState) => {
        let {dy} = gestureState;
        this._panYCoordinate.setValue(dy);
      },

      onPanResponderRelease: () => {
        if (this._value < -200) {
          this.setState({showPatternLock: true});
          Animated.parallel([
            Animated.timing(this._panYCoordinate, {
              toValue: -500,
              duration: 300
            }),
            Animated.timing(this._patternContainerOpacity, {
              toValue: 1,
              duration: 400
            })
          ]).start();
        } else {
          this._resetAnimation();
        }
      }
    });
    this.state = {
      showPatternLock: false,
      currentDateTime: this._updateClock()
    };
  }

  componentDidMount() {
    this._updateClockInterval = setInterval(() => {
      let currentDateTime = this._updateClock();
      this.setState({currentDateTime});
    }, 1000);

    BackHandler.addEventListener('hardwareBackPress', this._onBackPress);
  }

  componentWillUnmount() {
    clearInterval(this._updateClockInterval);
    BackHandler.removeEventListener('hardwareBackPress', this._onBackPress);
  }

  render() {
    let {
      showPatternLock,
      currentDateTime: {hour, minute, dayName, monthName, date}
    } = this.state;

    let paddingTop = this._panYCoordinate.interpolate({
      inputRange: [-250, 0],
      outputRange: [170, 150],
      extrapolate: 'clamp'
    });

    let scale = this._panYCoordinate.interpolate({
      inputRange: [-250, 0, 200],
      outputRange: [0.5, 1, 1.2],
      extrapolate: 'clamp'
    });

    let timeOpacity = this._panYCoordinate.interpolate({
      inputRange: [-250, 0],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    let backgroundOpacity = this._panYCoordinate.interpolate({
      inputRange: [-250, 0],
      outputRange: [0.2, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={styles.root}>
        <Animated.Image
          source={backgroundImage}
          resizeMode="cover"
          style={[styles.backgroundContainer, {opacity: backgroundOpacity}]}
        >
          <Animated.View
            style={[
              styles.dateContainer,
              {
                paddingTop,
                opacity: timeOpacity,
                transform: [{scale}]
              }
            ]}
            {...this._panResponder.panHandlers}
          >
            <Text style={styles.time}>{`${hour}:${minute}`}</Text>
            <Text
              style={styles.date}
            >{`${dayName}, ${monthName} ${date}`}</Text>
          </Animated.View>
          <View style={{alignItems: 'center', paddingBottom: 20}}>
            <Animatable.Text
              delay={HINT_DELAY}
              animation="slideInUp"
              iterationCount="infinite"
              direction="alternate"
              easing="ease-out"
              duration={1500}
              style={[styles.hint, {opacity: timeOpacity}]}
            >
              Swipe up to unlock
            </Animatable.Text>
          </View>
        </Animated.Image>
        {showPatternLock ? (
          <Animated.View
            style={[
              styles.patternContainer,
              {opacity: this._patternContainerOpacity}
            ]}
          >
            <PatternLockScreen
              containerDimension={PATTERN_DIMENSION}
              containerWidth={PATTERN_CONTAINER_WIDTH}
              containerHeight={PATTERN_CONTAINER_HEIGHT}
              correctPattern={CORRECT_UNLOCK_PATTERN}
              hint="Draw letter 'Z' from top left to bottom right"
              onPatternMatch={this._onBackPress}
            />
            {Platform.OS === 'ios' && (
              <View style={styles.backButtonContainer}>
                <Icon
                  component={TouchableOpacity}
                  onPress={this._onBackPress}
                  name="chevron-left"
                  color="white"
                  size={45}
                />
              </View>
            )}
          </Animated.View>
        ) : null}
      </View>
    );
  }

  _onBackPress() {
    let {showPatternLock} = this.state;
    if (showPatternLock) {
      this.setState({showPatternLock: false});
      this._patternContainerOpacity.setValue(0);
      this._resetAnimation();
      return true;
    } else {
      BackHandler.exitApp();
      return false;
    }
  }

  _resetAnimation() {
    Animated.timing(this._panYCoordinate, {
      toValue: 0,
      duration: 200
    }).start();
  }

  _updateClock() {
    let now = new Date();
    let [hour, minute] = now.toTimeString().split(':');
    let dayName = getDayName(now.getDay());
    let monthName = getMonthName(now.getUTCMonth());
    let date = now.getUTCDate();
    return {
      hour,
      minute,
      dayName,
      monthName,
      date
    };
  }
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black'
  },
  backgroundContainer: {
    flex: 1,
    alignItems: 'center',
    height,
    width
  },
  dateContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  time: {
    fontSize: 80,
    fontWeight: '300',
    color: '#f2f2f2'
  },
  date: {
    fontSize: 20,
    color: '#f2f2f2'
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent'
  },
  backButtonContainer: {
    alignItems: 'flex-start',
    paddingLeft: 40,
    paddingBottom: 10
  },
  hint: {
    backgroundColor: 'transparent',
    color: '#f2f2f2',
    fontSize: 16
  }
});
