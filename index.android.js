'use strict';

//an unique value merger
function uniqBy(a, key) {
    var seen = {};
    return a.filter(function (item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}

var React = require('react-native');
var {
    AppRegistry,
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Navigator,
    Component,
    BackAndroid,
    } = React;

var GridView = require('react-native-grid-view');

var INSTAGRAM_API_URL = 'https://api.instagram.com/v1/';
var INSTAGRAM_API_RECENT_URL = INSTAGRAM_API_URL + 'tags/cannabis/media/recent?client_id=d68357d3c1c343cc984f34d45ef502c8';

//TODO: calculate how many columns will be available on the screen
var THUMBNAILS_PER_ROW = 3;

var UPDATE_RECENTS_DELAY = 15000;//in milliseconds

//default back behaviour for android, does not work on emulator :(
BackAndroid.addEventListener('hardwareBackPress', () => {
    console.log("back pressed standalone");
    if (navigator && navigator.getCurrentRoutes().length > 1) {
        navigator.pop();
        return true;
    }
    return false;
});

var ThumbnailView = React.createClass({
    render() {
        return (
            <View >
                <TouchableOpacity onPress={this.onClickThumbnail}>
                    <Image
                        source={{uri: this.props.data.images.thumbnail.url}}
                        style={styles.thumbnail}>
                        <Text
                            style={styles.title}
                            numberOfLines={3}>{this.props.data.caption.text}></Text>
                    </Image>
                </TouchableOpacity>
            </View>
        );
    },

    onClickThumbnail(event) {
        this.viewInstagramPostDetails();
    },

    viewInstagramPostDetails() {
        this.props.navigator.push({
            title: "Details",
            id: "details_route",
            data: this.props.data,
        });
    },
});

var HomeScreen = React.createClass({
    getInitialState() {
        return {
            dataSource: null,
            loaded: false,
        };
    },

    // componentDidMount is called by react when the component
    // has been rendered on the page. We can set the interval here:
    componentDidMount() {
        //pre fetch
        this.fetchInstagramRecents();

        //schedule fetching from instagram every n milliseconds
        this.timer = setInterval(this.fetchInstagramRecents, UPDATE_RECENTS_DELAY);
    },

    // This method is called immediately before the component is removed
    // from the page and destroyed. We can clear the interval here:
    componentWillUnmount: function () {
        //remove the data fetching scheduling
        clearInterval(this.timer);
    },

    render() {
        if (!this.state.loaded) {
            return this.renderLoadingView();
        }

        return (
            <GridView
                items={this.state.dataSource}
                itemsPerRow={THUMBNAILS_PER_ROW}
                renderItem={this.renderItem}
                contentContainerStyle={styles.gridView}/>
        )
    },

    renderItem(item) {
        return <ThumbnailView data={item} navigator={this.props.navigator}/>
    },

    renderLoadingView() {
        //TODO: create spinner
        return (
            <View style={styles.container}>
                <Text>
                    Loading grams...
                </Text>
            </View>
        );
    },

    fetchInstagramRecents() {
        fetch(INSTAGRAM_API_RECENT_URL)
            .then((response) => response.json())
            .then((responseData) => {
                //if we actually have something
                if (responseData.data) {
                    //save the data to the state
                    this.setState({
                        dataSource: (
                            this.state.dataSource == null
                                ?
                                responseData.data
                                :
                                uniqBy(
                                    //add the new response
                                    this.state.dataSource.concat(responseData.data),
                                    //identify unique by their link URI's
                                    function (item) {
                                        return item.link;
                                    })
                        ),
                        loaded: true,
                    });
                }
            })
            .catch(console.warn)
            .done();
    },
});

var DetailsScreen = React.createClass({
    render() {
        console.log("Details screen render() data = " + this.props.data);
        return (
            <View>
                <TouchableOpacity onPress={this.props.navigator.pop}>
                    <Text>
                        Details:{this.props.data.link}
                    </Text>
                </TouchableOpacity>
            </View>

        );
    },
});

//the main app class
var InstagramReader = React.createClass({
    renderScene(route, navigator) {
        console.log("route data=" + route.data);
        switch (route.id) {
            case 'home_route':
                return <HomeScreen navigator={navigator}/>;
            case 'details_route':
                return <DetailsScreen navigator={navigator} data={route.data}/>;
        }
    },

    render() {
        return (
            <Navigator
                ref={(navigator) => { this.navigator = navigator; }}
                initialRoute={{ title: "Details", id: "home_route"}}
                renderScene={this.renderScene}
                />
        );
    },
});

var styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        opacity: 0.7,
        paddingHorizontal: 40,
        fontSize: 10,
        backgroundColor: 'grey',
        color: 'white'
    },
    thumbnail: {
        width: 120,
        height: 120,
    },
    gridView: {
        //For aligning the children, we need to modify lib file
        //in ./node_modules/react-native-grid-view/index.js

        //change the styles to this:
        //var styles = StyleSheet.create({
        //    group: {
        //        flexDirection: 'row',
        //        alignItems: 'flex-start',
        //        justifyContent: 'flex-start',
        //    }
        //});
    },
});

AppRegistry.registerComponent('InstagramReader', () => InstagramReader);