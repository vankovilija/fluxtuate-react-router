import React, {Component} from "react"
import Route from "./route"
import {autobind} from "core-decorators"

@autobind
export default class Match extends Component {
    static defaultProps = {
        component: "div"
    };

    static contextTypes = {
        route: PropTypes.instanceOf(Route)
    };

    state = {
        visible: false
    };

    throwParentError() {
        throw new Error("Match must be placed inside a route object!");
    }

    addToRoute(route) {
        route.addMatch(this);
    }

    removeFromRoute(route) {
        route.removeMatch(this);
    }

    componentWillMount() {
        if(!this.context.route) {
            this.throwParentError();
        }

        this.addToRoute(this.context.route);
    }

    componentWillUnmount() {
        this.removeFromRoute(this.context.route);
    }

    show() {
        if(!this.state.visible) {
            this.setState({
                visible: true
            });
        }
    }

    hide() {
        if(this.state.visible) {
            this.setState({
                visible: false
            });
        }
    }

    render() {
        let {component} = this.props;

        let children;
        if(this.state.visible) {
            children = this.props.children;
        }

        return React.createElement(component, {}, children);
    }
}
