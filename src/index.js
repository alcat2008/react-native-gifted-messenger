'use strict';

var React = require('react-native');
import Message from './Message';
var GiftedSpinner = require('react-native-gifted-spinner');
var dismissKeyboard = require('react-native-dismiss-keyboard');
var {
  Text,
  View,
  ListView,
  TextInput,
  Dimensions,
  Animated,
  LayoutAnimation,
  Image,
  TouchableHighlight,
  Platform,
  PixelRatio,
  TouchableOpacity,
  RefreshControl
} = React;

var moment = require('moment');

var Icon = require('react-native-vector-icons/Ionicons');

var Button = require('react-native-button');

var GiftedMessenger = React.createClass({

  firstDisplay: true,
  listHeight: 0,
  footerY: 0,

  getDefaultProps() {
    return {
      displayNames: true,
      displayNamesInsideBubble: false,
      placeholder: '',
      styles: {},
      autoFocus: true,
      onErrorButtonPress: (message, rowID) => {},
      loadEarlierMessagesButton: false,
      loadEarlierMessagesButtonText: '加载历史消息',
      onLoadEarlierMessages: (oldestMessage, callback) => {},
      parseText: false,
      handleUrlPress: (url) => {},
      handlePhonePress: (phone) => {},
      handleEmailPress: (email) => {},
      initialMessages: [],
      messages: [],
      handleSend: (message, rowID) => {},
      maxHeight: Dimensions.get('window').height,
      senderName: 'Sender',
      senderImage: null,
      sendButtonText: '发送',
      onImagePress: null,
      onMessageLongPress: null,
      hideTextInput: false,
      keyboardDismissMode: 'on-drag',
      keyboardShouldPersistTaps: true,
      submitOnReturn: false,
      forceRenderImage: false,
      renderStatus: false,
      onChangeText: (text) => {},
      autoScroll: false,
      textInputHeight: 44,
      panelHeight: 200,
    };
  },

  propTypes: {
    displayNames: React.PropTypes.bool,
    displayNamesInsideBubble: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    styles: React.PropTypes.object,
    autoFocus: React.PropTypes.bool,
    onErrorButtonPress: React.PropTypes.func,
    loadMessagesLater: React.PropTypes.bool,
    loadEarlierMessagesButton: React.PropTypes.bool,
    loadEarlierMessagesButtonText: React.PropTypes.string,
    onLoadEarlierMessages: React.PropTypes.func,
    parseText: React.PropTypes.bool,
    handleUrlPress: React.PropTypes.func,
    handlePhonePress: React.PropTypes.func,
    handleEmailPress: React.PropTypes.func,
    initialMessages: React.PropTypes.array,
    messages: React.PropTypes.array,
    handleSend: React.PropTypes.func,
    onCustomSend: React.PropTypes.func,
    renderCustomText: React.PropTypes.func,
    maxHeight: React.PropTypes.number,
    senderName: React.PropTypes.string,
    senderImage: React.PropTypes.object,
    sendButtonText: React.PropTypes.string,
    onImagePress: React.PropTypes.func,
    onMessageLongPress: React.PropTypes.func,
    hideTextInput: React.PropTypes.bool,
    keyboardDismissMode: React.PropTypes.string,
    keyboardShouldPersistTaps: React.PropTypes.bool,
    forceRenderImage: React.PropTypes.bool,
    renderStatus: React.PropTypes.bool,
    onChangeText: React.PropTypes.func,
    autoScroll: React.PropTypes.bool,
    textInputHeight: React.PropTypes.number,
    panelHeight: React.PropTypes.number,
  },

  getInitialState: function() {
    this._data = [];
    this._rowIds = [];

    if (this.props.hideTextInput === false) {
      //if (this.props.styles.hasOwnProperty('textInputContainer')) {
      //  textInputHeight = this.props.styles.textInputContainer.height || textInputHeight;
      //}
    }

    this.listViewMaxHeight = this.props.maxHeight - this.props.textInputHeight;
    //this.listViewMaxHeight = this.props.maxHeight - this.props.textInputHeight - this.props.panelHeight;

    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => {
      if (typeof r1.status !== 'undefined') {
        return true;
      }
      return r1 !== r2;
    }});
    return {
      dataSource: ds.cloneWithRows([]),
      text: '',
      disabled: true,
      height: new Animated.Value(this.listViewMaxHeight),
      isLoadingEarlierMessages: false,
      allLoaded: false,
      appearAnim: new Animated.Value(0),
      showPanel: false,
      isRefreshing: false
    };
  },

  getMessage(rowID) {
    if (typeof this._rowIds[this._rowIds.indexOf(rowID)] !== 'undefined') {
      if (typeof this._data[this._rowIds[this._rowIds.indexOf(rowID)]] !== 'undefined') {
        return this._data[this._rowIds[this._rowIds.indexOf(rowID)]];
      }
    }
    return null;
  },

  getPreviousMessage(rowID) {
    if (typeof this._rowIds[this._rowIds.indexOf(rowID - 1)] !== 'undefined') {
      if (typeof this._data[this._rowIds[this._rowIds.indexOf(rowID - 1)]] !== 'undefined') {
        return this._data[this._rowIds[this._rowIds.indexOf(rowID - 1)]];
      }
    }
    return null;
  },

  getNextMessage(rowID) {
    if (typeof this._rowIds[this._rowIds.indexOf(rowID + 1)] !== 'undefined') {
      if (typeof this._data[this._rowIds[this._rowIds.indexOf(rowID + 1)]] !== 'undefined') {
        return this._data[this._rowIds[this._rowIds.indexOf(rowID + 1)]];
      }
    }
    return null;
  },

  renderDate(rowData = {}, rowID = null) {
    var diffMessage = null;
    if (rowData.isOld === true) {
      diffMessage = this.getPreviousMessage(rowID);
    } else {
      diffMessage = this.getNextMessage(rowID);
    }
    if (rowData.date instanceof Date) {
      if (diffMessage === null) {
        return (
          <Text style={[this.styles.date]}>
            {moment(rowData.date).calendar()}
          </Text>
        );
      } else if (diffMessage.date instanceof Date) {
        let diff = moment(rowData.date).diff(moment(diffMessage.date), 'minutes');
        if (diff > 5) {
          return (
            <Text style={[this.styles.date]}>
              {moment(rowData.date).calendar()}
            </Text>
          );
        }
      }
    }
    return null;
  },

  renderRow(rowData = {}, sectionID = null, rowID = null) {

    var diffMessage = null;
    if (rowData.isOld === true) {
      diffMessage = this.getPreviousMessage(rowID);
    } else {
      diffMessage = this.getNextMessage(rowID);
    }

    return (
      <View>
        {this.renderDate(rowData, rowID)}
        <Message
          rowData={rowData}
          rowID={rowID}
          onErrorButtonPress={this.props.onErrorButtonPress}
          displayNames={this.props.displayNames}
          displayNamesInsideBubble={this.props.displayNamesInsideBubble}
          diffMessage={diffMessage}
          position={rowData.position}
          forceRenderImage={this.props.forceRenderImage}
          renderStatus={this.props.renderStatus}
          onImagePress={this.props.onImagePress}
          onMessageLongPress={this.props.onMessageLongPress}
          renderCustomText={this.props.renderCustomText}

          styles={this.styles}
        />
      </View>
    )
  },

  onChangeText(text) {
    this.setState({
      text: text
    })
    if (text.trim().length > 0) {
      this.setState({
        disabled: false
      })
    } else {
      this.setState({
        disabled: true
      })
    }

    this.props.onChangeText(text);
  },

  componentDidMount() {
    //LayoutAnimation.spring();

    this.scrollResponder = this.refs.listView.getScrollResponder();

    if (this.props.messages.length > 0) {
      this.appendMessages(this.props.messages);
    } else if (this.props.initialMessages.length > 0) {
      this.appendMessages(this.props.initialMessages);
    } else {
      // Set allLoaded, unless props.loadMessagesLater is set
      if (!this.props.loadMessagesLater) {
        this.setState({
          allLoaded: true
        });
      }
    }

  },

  componentWillReceiveProps(nextProps) {
    this._data = [];
    this._rowIds = [];
    this.appendMessages(nextProps.messages);

    //var textInputHeight = 44;
    //if (nextProps.styles.hasOwnProperty('textInputContainer')) {
    //  textInputHeight = nextProps.styles.textInputContainer.height || textInputHeight;
    //}

    if (nextProps.maxHeight !== this.props.maxHeight) {
      this.listViewMaxHeight = nextProps.maxHeight;
    }

    if (nextProps.hideTextInput && !this.props.hideTextInput) {
      this.listViewMaxHeight += this.props.textInputHeight;

      this.setState({
        height: new Animated.Value(this.listViewMaxHeight),
      });
    } else if (!nextProps.hideTextInput && this.props.hideTextInput) {
      this.listViewMaxHeight -= this.props.textInputHeight;

      this.setState({
        height: new Animated.Value(this.listViewMaxHeight),
      });
    }
  },

  onKeyboardWillHide(e) {
    Animated.timing(this.state.height, {
      toValue: this.listViewMaxHeight,
      duration: 150,
    }).start();
  },

  onKeyboardWillShow(e) {
    this._hidePanel();
    Animated.timing(this.state.height, {
      toValue: this.listViewMaxHeight - (e.endCoordinates ? e.endCoordinates.height : e.end.height),
      duration: 200,
    }).start();
  },

  onKeyboardDidShow(e) {
    if(React.Platform.OS == 'android') {
      this.onKeyboardWillShow(e);
    }
    this.scrollToBottom();
  },
  onKeyboardDidHide(e) {
    if(React.Platform.OS == 'android') {
      this.onKeyboardWillHide(e);
    }
  },

  scrollToBottom() {
    if (this.listHeight && this.footerY && this.footerY > this.listHeight) {
      var scrollDistance = this.listHeight - this.footerY;
      this.scrollResponder.scrollTo({
        y: -scrollDistance,
        x: 0,
        animated: true
      });
    }
  },

  onSend() {
    var message = {
      text: this.state.text.trim(),
      name: this.props.senderName,
      image: this.props.senderImage,
      position: 'right',
      date: new Date()
    };
    if (this.props.onCustomSend) {
      this.props.onCustomSend(message);
    } else {
      var rowID = this.appendMessage(message, true);
      this.props.handleSend(message, rowID);
      this.onChangeText('');
    }
  },

  postLoadEarlierMessages(messages = [], allLoaded = false) {
    this.prependMessages(messages);
    this.setState({
      isLoadingEarlierMessages: false
    });
    if (allLoaded === true) {
      this.setState({
        allLoaded: true,
      });
    }
  },

  preLoadEarlierMessages() {
    this.setState({
      isLoadingEarlierMessages: true
    });
    this.props.onLoadEarlierMessages(this._data[this._rowIds[this._rowIds.length - 1]], this.postLoadEarlierMessages);
  },

  renderLoadEarlierMessages() {
    if (this.props.loadEarlierMessagesButton === true) {
      if (this.state.allLoaded === false) {
        if (this.state.isLoadingEarlierMessages === true) {
          return (
            <View style={this.styles.loadEarlierMessages}>
              <GiftedSpinner />
            </View>
          );
        } else {
          return (
            <View style={this.styles.loadEarlierMessages}>
              <Button
                style={this.styles.loadEarlierMessagesButton}
                onPress={() => {this.preLoadEarlierMessages()}}
              >
                {this.props.loadEarlierMessagesButtonText}
              </Button>
            </View>
          );
        }
      }
    }
    return null;
  },


  _postLoadEarlierMessages(messages = [], allLoaded = false) {
    this.prependMessages(messages);
    this.setState({
      isRefreshing: false
    });
    if (allLoaded === true) {
      this.setState({
        allLoaded: true,
      });
    }
  },

  _onRefresh() {
    this.setState({isRefreshing: true});
    this.props.onLoadEarlierMessages(this._data[this._rowIds[this._rowIds.length - 1]], this._postLoadEarlierMessages);
  },

  prependMessages(messages = []) {
    var rowID = null;
    for (let i = 0; i < messages.length; i++) {
      this._data.push(messages[i]);
      this._rowIds.unshift(this._data.length - 1);
      rowID = this._data.length - 1;
    }
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._data, this._rowIds),
    });
    return rowID;
  },

  prependMessage(message = {}) {
    var rowID = this.prependMessages([message]);
    return rowID;
  },

  appendMessages(messages = []) {
    var rowID = null;
    for (let i = 0; i < messages.length; i++) {
      messages[i].isOld = true;
      this._data.push(messages[i]);
      this._rowIds.push(this._data.length - 1);
      rowID = this._data.length - 1;
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._data, this._rowIds),
    });

    return rowID;
  },

  appendMessage(message = {}, scrollToBottom = true) {
    var rowID = this.appendMessages([message]);

    if (scrollToBottom === true) {
      setTimeout(() => {
        // inspired by http://stackoverflow.com/a/34838513/1385109
        this.scrollToBottom();
      }, (Platform.OS === 'android' ? 200 : 100));
    }

    return rowID;
  },

  refreshRows() {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(this._data, this._rowIds),
    });
  },

  setMessageStatus(status = '', rowID) {
    if (status === 'ErrorButton') {
      if (this._data[rowID].position === 'right') {
        this._data[rowID].status = 'ErrorButton';
        this.refreshRows();
      }
    } else {
      if (this._data[rowID].position === 'right') {
        this._data[rowID].status = status;

        // only 1 message can have a status
        for (let i = 0; i < this._data.length; i++) {
          if (i !== rowID && this._data[i].status !== 'ErrorButton') {
            this._data[i].status = '';
          }
        }
        this.refreshRows();
      }
    }
  },

  _onAccessibilityTap() {
    //console.log('onAccessibilityTap');
    this._hidePanel();
  },

  renderAnimatedView() {
    return (
      <Animated.View
        style={{
          height: this.state.height,
        }}
      >
        <ListView
          ref='listView'
          dataSource={this.state.dataSource}
          renderRow={this.renderRow}

          //accessible={true}
          //onAccessibilityTap={this._onAccessibilityTap}
          onResponderMove={this._onAccessibilityTap}

          //refreshControl={
          //  <RefreshControl
          //    refreshing={this.state.isRefreshing}
          //    onRefresh={this._onRefresh}
          //    tintColor="#ff0000"
          //    title="Loading..."
          //    colors={['#ff0000', '#00ff00', '#0000ff']}
          //    progressBackgroundColor="#ffff00"
          //  />
          //}

          renderHeader={this.renderLoadEarlierMessages}
          onLayout={(event) => {
            var layout = event.nativeEvent.layout;
            this.listHeight = layout.height;
            this.scrollToBottom();
            //if (this.firstDisplay === true) {
            //  requestAnimationFrame(() => {
            //    this.firstDisplay = false;
            //    this.scrollToBottom();
            //  });
            //}

          }}
          renderFooter={() => {
            return <View onLayout={(event)=>{
              var layout = event.nativeEvent.layout;
              this.footerY = layout.y;

              if (this.props.autoScroll) {
                this.scrollToBottom();
              }
            }}></View>
          }}

          style={this.styles.listView}

          // not working android RN 0.14.2
          onKeyboardWillShow={this.onKeyboardWillShow}
          onKeyboardDidShow={this.onKeyboardDidShow}
          onKeyboardWillHide={this.onKeyboardWillHide}
          onKeyboardDidHide={this.onKeyboardDidHide}

          keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps} // @issue keyboardShouldPersistTaps={false} + textInput focused = 2 taps are needed to trigger the ParsedText links
          keyboardDismissMode={this.props.keyboardDismissMode}

          initialListSize={10}
          pageSize={this.props.messages.length}

          {...this.props}
        />

      </Animated.View>
    );
  },

  renderTextInput() {
    if (this.props.hideTextInput === false) {
      return (
        <Animated.View style={this.styles.textInputContainer}>
          <TextInput
            style={this.styles.textInput}
            placeholder={this.props.placeholder}
            ref='textInput'
            onChangeText={this.onChangeText}
            value={this.state.text}
            autoFocus={this.props.autoFocus}
            returnKeyType={this.props.submitOnReturn ? 'send' : 'default'}
            onSubmitEditing={this.props.submitOnReturn ? this.onSend : null}
            enablesReturnKeyAutomatically={true}

            blurOnSubmit={false}
          />
          <Button
            style={this.styles.sendButton}
            styleDisabled={this.styles.sendButtonDisabled}
            onPress={this.onSend}
            disabled={this.state.disabled}
          >
            {this.props.sendButtonText}
          </Button>

          <TouchableOpacity
            onPress={this._handleMore}
          >
            <Icon style={{
              //borderWidth: 2,
              flex: 1,
              paddingTop: 7,
              paddingLeft: 6,
              paddingRight: 6
            }} name="ios-plus-outline" size={30} color="#900" />
          </TouchableOpacity>

        </Animated.View>
      );
    }
  },

  _showPanel() {
    if (!this.state.showPanel) {
      dismissKeyboard();
      this.listViewMaxHeight -= this.props.panelHeight;

      Animated.timing(this.state.height, {
        toValue: this.listViewMaxHeight,
        duration: 150,
      }).start();

      this.setState({
        showPanel: true
      });

      this.scrollToBottom();
    }
  },

  _hidePanel() {
    if (this.state.showPanel) {
      this.listViewMaxHeight += this.props.panelHeight;

      Animated.timing(this.state.height, {
        toValue: this.listViewMaxHeight,
        duration: 150,
      }).start();

      this.setState({
        showPanel: false
      });

      this.scrollToBottom();
    }
  },

  _handleMore() {
    //LayoutAnimation.spring();
    if (this.state.showPanel) {
      this._hidePanel();
    } else {
      this._showPanel();
    }
  },

  renderPanel() {
    //LayoutAnimation.spring();
    if (this.state.showPanel) {
      return (
        <Animated.View style={this.styles.panelContainer}>

          <TouchableOpacity
            style={this.styles.panelItem}
            onPress= {() => {}}
          >
            <Image
              style={this.styles.panelIcon}
              source={require('../img/im-img.png')}
            />
            <Text style={this.styles.panelText}>照片</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.styles.panelItem}
            onPress= {() => {}}
          >
            <Image
              style={this.styles.panelIcon}
              source={require('../img/im-photo.png')}
            />
            <Text style={this.styles.panelText}>拍摄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.styles.panelItem}
            onPress= {() => {}}
          >
            <Image
              style={this.styles.panelIcon}
              source={require('../img/im-quote.png')}
            />
            <Text style={this.styles.panelText}>业务</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={this.styles.panelItem}
            onPress= {() => {}}
          >
            <Image
              style={this.styles.panelIcon}
              source={require('../img/im-card.png')}
            />
            <Text style={this.styles.panelText}>名片</Text>
          </TouchableOpacity>

        </Animated.View>
      );
    }
  },

  render() {
    return (
      <View
        style={this.styles.container}
        ref='container'
      >
        {this.renderAnimatedView()}
        {this.renderTextInput()}
        {this.renderPanel()}
      </View>
    );
  },


  componentWillMount() {
    this.styles = {
      container: {
        flex: 1,
        backgroundColor: '#FFF',
      },
      listView: {
        flex: 1,
      },
      textInputContainer: {
        height: 44,
        borderTopWidth: 1 / PixelRatio.get(),
        borderBottomWidth: 1 / PixelRatio.get(),
        borderColor: '#b2b2b2',
        flexDirection: 'row',
        paddingLeft: 10,
        //paddingRight: 10,
        //borderWidth: 5
      },
      textInput: {
        alignSelf: 'center',
        height: 30,
        width: 100,
        backgroundColor: '#FFF',
        flex: 1,
        padding: 0,
        margin: 0,
        fontSize: 15,
      },
      sendButton: {
        marginTop: 11,
        marginLeft: 10,
        //borderWidth: 2
      },
      date: {
        color: '#aaaaaa',
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 8,
      },
      link: {
        color: '#007aff',
        textDecorationLine: 'underline',
      },
      linkLeft: {
        color: '#000',
      },
      linkRight: {
        color: '#fff',
      },
      loadEarlierMessages: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
      },
      loadEarlierMessagesButton: {
        fontSize: 14,
      },
      panelContainer: {
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'row'
      },
      panelItem: {
        flex: 1,
        margin: 5,
        borderRadius: 3,
        flexDirection: 'column',
        //alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 100
        //marginHorizontal: 70
      },
      panelIcon: {
        width: 69,
        height: 69
      },
      panelText: {
        fontSize: 14,
        //color: ''
      }
    };

    Object.assign(this.styles, this.props.styles);
  },
});

module.exports = GiftedMessenger;
