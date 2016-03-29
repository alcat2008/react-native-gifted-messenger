import React, {Text, View, Animated, Image, StyleSheet} from 'react-native';

import Angle from './Angle';

let styles = StyleSheet.create({
  bubble: {
    borderRadius: 5,
    paddingLeft: 14,
    paddingRight: 14,
    paddingBottom: 10,
    paddingTop: 8,
  },
  text: {
    color: '#000',
  },
  textLeft: {
  },
  textRight: {
    color: '#fff',
  }
});

export default class Bubble extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    Object.assign(styles, this.props.styles);
  }

  renderText(text = "", position) {

    if (this.props.renderCustomText) {
      return this.props.renderCustomText(this.props);
    }
    return (
      <Text style={[styles.text, (position === 'left' ? styles.textLeft : styles.textRight)]}>
        {text}
      </Text>
    );
  }

  _renderAngle() {
    if (this.props.position === 'left') {
      return (
        <Angle direction='left' color={this.props.leftBackgroundColor} />
      );
    }

    let bgColor = this.props.rightBackgroundColor;
    if (this.props.status === 'ErrorButton') {
      bgColor = this.props.errorBackgroundColor;
    }
    return (
      <Angle direction='right' color={bgColor} />
    );
  }

  render() {
    let flexStyle = {};
    if (this.props.text.length > 40) {
      flexStyle.flex = 1;
    }

    let customStyle = {};
    if (this.props.position === 'left') {
      customStyle = {
        marginRight: 30,
        backgroundColor: this.props.leftBackgroundColor,
        alignSelf: 'flex-start'
      };
    } else {
      customStyle = {
        marginLeft: 30,
        backgroundColor: this.props.status === 'ErrorButton' ? this.props.errorBackgroundColor : this.props.rightBackgroundColor,
        alignSelf: 'flex-end'
      };
    }

    return (
      <View style={{flexDirection: 'row'}}>
        {this.props.position === 'left' ? this._renderAngle() : null}
        <View style={[styles.bubble, customStyle, flexStyle]}>
          {this.props.name}
          {this.renderText(this.props.text, this.props.position)}
        </View>
        {this.props.position === 'right' ? this._renderAngle() : null}
      </View>
    );
  }
}

Bubble.propTypes = {
  position: React.PropTypes.oneOf(['left', 'right']),
  status: React.PropTypes.string,
  text: React.PropTypes.string,
  renderCustomText: React.PropTypes.func,
  name: React.PropTypes.element,
  leftBackgroundColor: React.PropTypes.string,
  rightBackgroundColor: React.PropTypes.string,
  errorBackgroundColor: React.PropTypes.string
};

Bubble.defaultProps = {
  leftBackgroundColor: '#e6e6eb',
  rightBackgroundColor: '#007aff',
  errorBackgroundColor: '#e01717'
};
