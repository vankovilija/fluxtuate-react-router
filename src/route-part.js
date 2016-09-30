import Match from "./match"
import React from "react"
import Route from "./route"
import {autobind} from "core-decorators"

@autobind
export default class RoutePart extends Match {
    static defaultProps = Match.defaultProps;

    static contextTypes = Match.contextTypes;

    throwParentError() {
        throw new Error("Parts must be placed inside a route object!");
    }

    addToRoute(route) {
        route.addPart(this);
    }

    removeFromRoute(route) {
        route.removePart(this);
    }

    setParams(params) {
        let {partName} = this.props;
        this.setState({
            location: params[partName]
        });
    }

    render() {
        let props = Object.assign({}, this.props);
        props.partName = undefined;
        props.children = undefined;
        return <Route {...props} location={this.state.location}>{this.props.children}</Route>
    }
}