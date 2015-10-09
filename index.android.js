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
    ListView,
    } = React;

var GridView = require('react-native-grid-view');

var INSTAGRAM_API_URL = 'https://api.instagram.com/v1/';
var INSTAGRAM_API_RECENT_URL = INSTAGRAM_API_URL + 'tags/cannabis/media/recent?client_id=d68357d3c1c343cc984f34d45ef502c8';

//TODO: calculate how many columns will be available on the screen
var THUMBNAILS_PER_ROW = 3;

var UPDATE_RECENTS_DELAY = 5000;//in milliseconds

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
            <View style={styles.loadingContainer}>
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
    getInitialState: function () {
        return {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
        };
    },


    renderCommentItem(comment){
        var commentDate = new Date(parseInt(comment.created_time) * 1000);
        var parsedDate = (commentDate.getMonth() + 1) + "/" + commentDate.getDate() + "/" + commentDate.getFullYear();
        return (
            <View>

                <View style={{flexDirection: 'row'}}>
                    <Image
                        source={{uri: comment.from.profile_picture}}
                        style={styles.commentProfileImage}
                        />

                    <Text style={styles.commentTime}>{parsedDate}</Text>
                </View>
                <View >
                    <Text style={{color: "blue"}}>{comment.from.username} <Text
                        style={styles.commentText}>{comment.text}</Text></Text>
                </View>
            </View>
        );
    },

    render() {
        console.log("Details screen render() his.props.data.comments.count = " + this.props.data.comments.count);
        if (this.props.data.comments.count > 0) {

        }

        return (  <View style={styles.flexOne}>
            <TouchableOpacity onPress={this.props.navigator.pop} style={styles.flexOne}>
                <View style={styles.detailsHeaderContainer}>
                    <View style={{flexDirection: 'row',flex : 1}}>
                        <View style={styles.profileImageContainer}>
                            <Image
                                source={{uri: this.props.data.caption.from.profile_picture}}
                                resizeMode={Image.resizeMode.cover}
                                style={styles.profileImage}
                                />

                        </View>
                        <View style={styles.detailsTextContainer}>
                            <Text style={{color: "blue"}}>{this.props.data.caption.from.username} <Text
                                style={{color: "grey"}}>{this.props.data.caption.text}</Text></Text>
                        </View>

                    </View>
                </View>
                <View style={styles.detailsImageContainer}>
                    <Image
                        resizeMode={Image.resizeMode.cover}
                        //hack for modifying the url to get a bigger picture, currently the api does not return the link to the 1080x1080 picture
                        source={{uri: this.props.data.images.standard_resolution.url.replace("s640x640","s1080x1080")}}
                        style={styles.myImage}>
                    </Image>
                </View>
                <View style={styles.flexOne}>
                    <Text>
                        Comments:
                    </Text>
                    <ListView
                        renderRow={this.renderCommentItem}
                        dataSource={this.state.dataSource.cloneWithRows(this.props.data.comments.data)}
                        loadData={this.fetchInstagramPost}/>
                </View>
            </TouchableOpacity>
        </View>);
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
    loadingContainer: {
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
    flexOne: {
        flex: 1,
    },
    myImage: {
        alignItems: 'stretch',
        flex: 1,
        //width: 120,
        //height: 120,
    },
    flexZero: {
        flex: 0,
    },
    commentTime: {
        textAlign: 'right',
        fontSize: 10,
    },
    commentText: {
        color: "grey",
        fontSize: 10,
    },
    commentProfileImage: {
        width: 40,
        height: 40,
    },
    profileImage: {
        width: 80,
        height: 80,
    },
    profileImageContainer: {
        padding: 4,
    },
    detailsImageContainer: {
        flex: 1,
        paddingTop: 10,
    },
    detailsHeaderContainer: {
        flex: 0,
        padding: 5,
    },
    detailsTextContainer: {
        padding: 5,
        flex:1,
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