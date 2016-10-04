import React, {Component, PropTypes} from "react"
import Route from "./route"
import {autobind} from "core-decorators"

@autobind
export default class Match extends Component {
    static propTypes = {
        component: PropTypes.string,
        params: PropTypes.object,
        page: PropTypes.string,
        path: PropTypes.string
    };

    static defaultProps = {
        component: "div",
        params: {}
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
        if(!this.state.visible) return null;

        let {component, children} = this.props;

        return React.createElement(component, {style: this.props.style}, children);
    }
}
