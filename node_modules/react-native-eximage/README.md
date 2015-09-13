react-native-eximage
=======
[![NPM](https://nodei.co/npm/react-native-eximage.png)](https://nodei.co/npm/react-native-eximage/)

A image module for React Native.

depend on [SDWebImage](https://github.com/rs/SDWebImage)。

## Feature

* Loading progress indicator for network image
* Auto scale assets image
* More coming soon...

## Getting started

If your project use CocoaPod

1. Like above
2. Like above
3. Add `pod 'SDWebImage', '~> 3.7.2'` to project `Podfile`
4. `pod install`
5. `RCTExImage.xcodeproj > Build Phase > Link Bindary With Libraries > +` Add `ImageIO.framework`.
6. `RCTExImage.xcodeproj > Build Settings > Header Search Paths` Look for `Header Search Paths` and make sure it contains `$(SRCROOT)/../react-native/React` and `$(SRCROOT)/../../Pods/Headers/Public` - mark as `recursive`.

Else

1. Drag & Drop the `{projectDir}/node_modules/react-native-eximage/RCTExImage.xcodeproj` into your project
2. Add `libRCTExImage.a` to your project's `Build Phases > Link Binary With Libraries`
3. `cd {projectDir}/node_modules/react-native-eximage`
4. `git clone https://github.com/rs/SDWebImage.git`
5. Drag & Drop the `SDWebImage.xcodeproj` file under `RCTExImage.xcodeproj`
6. Rebuild SDWebImage automagically if you ever decide to assimilate some changes in the future from git ... then goto `RCTExImage.xcodeproj > Build Phase > Target Dependencies > + > SDWebImage`.
7. `RCTExImage.xcodeproj > Build Phase > Link Bindary With Libraries > +` Add `libSDWebImage.a` and `ImageIO.framework`.
8. `RCTExImage.xcodeproj > Build Settings > Header Search Paths` Look for `Header Search Paths` and make sure it contains `$(SRCROOT)/../react-native/Rend `$(SRCROOT)/SDWebImage` - mark as `recursive`.


## Usage

```
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
} = React;

var Dimensions = require('Dimensions');
var SCREEN_WIDTH = Dimensions.get('window').width;

var ExImage = require('react-native-eximage');

var RCTExImageExample = React.createClass({

  getInitialState: function() {
    return {
      loadFailed: false,
    }
  },

  render: function() {
    var errorEle = null;
    if (this.state.loadFailed) {
      errorEle = (<Text>Reload</Text>);
    }
    return (
      <View style={styles.container}>
        <ScrollView>
          <ExImage
            source={{uri:'http://i.ytimg.com/vi/SQEbPn36m1c/maxresdefault.jpg'}}
            style={{width: SCREEN_WIDTH, height: SCREEN_WIDTH, alignItems:'center', justifyContent:'center'}}
            resizeMode='cover'
            onLoadStart={(event) => {
              this.setState({loadFailed: false});
              console.log('onLoadStart: ' + event);
            }}
            onLoadProgress={(event) => {
              console.log('onLoadProgress: ' + event);
            }}
            onLoadError={(event) => {
              this.setState({loadFailed: true})
              console.log('onLoadError: ' + event);
            }}
            onLoaded={(event) => {
              console.log('onLoaded: ' + event);
            }}
            >
            {errorEle}
          </ExImage>
          <ExImage source={{uri:'assets-library://asset/asset.JPG?id=A1844CD1-28A1-43EB-8894-B769BFABFF12&ext=JPG'}} style={{width: SCREEN_WIDTH, height: SCREEN_WIDTH}} />
        </ScrollView>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  }
});

AppRegistry.registerComponent('RCTExImageExample', () => RCTExImageExample);
```

## Thanks

**thumbnail generate**: http://www.mindsea.com/2012/12/downscaling-huge-alassets-without-fear-of-sigkill/

**Olivier Poitrey (the author of SDWebImage)**: https://github.com/rs

## License

[MIT License](http://opensource.org/licenses/mit-license.html).
