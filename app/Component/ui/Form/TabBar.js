import React, {Component} from 'react';

import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text
} from 'react-native';

class TabBar extends Component {

    static propTypes = {
        goToPage: React.PropTypes.func, // 跳转到对应tab的方法
        activeTab: React.PropTypes.number, // 当前被选中的tab下标
        tabs: React.PropTypes.array, // 所有tabs集合

        tabNames: React.PropTypes.array // 保存Tab名称
        //tabIconNames: React.PropTypes.array, // 保存Tab图标
    }

    setAnimationValue({value}) {
       // console.log(value);
    }

    componentDidMount() {
        // Animated.Value监听范围 [0, tab数量-1]
        this.props.scrollValue.addListener(this.setAnimationValue);
    }

    renderTabOption(tab, i) {
        let color = this.props.activeTab == i ? "#ffffff" : "#666666"; // 判断i是否是当前选中的tab，设置不同的颜色
        let l = this.props.level;
        return (
            <TouchableOpacity key={i} onPress={()=>this.props.goToPage(i)}
                style={[styles.tab,this.props.activeTab == i? styles.selectedTab:null]}>
                <View style={styles.tabItem}>
                   <Text style={{color: color}}>
                        {this.props.tabNames[i]}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={this.props.level==='t'?styles.tabs:styles.subTabs}>
                {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tabs: {
        backgroundColor:'#77A8D2',
        flexDirection: 'row',
        height: 50
    },
    subTabs: {
        backgroundColor:'#77A8D2',
        flexDirection: 'row',
        height: 45
    },
    selectedTab:{
        backgroundColor:'#528AC3'
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    tabItem: {
        flexDirection: 'column',
        alignItems: 'center',

    },
});


export default TabBar;