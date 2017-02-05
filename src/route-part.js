import Match from "./match"
import React from "react"
import Route from "./route"
import {autobind} from "core-decorators"

@autobind
export default class RoutePart extends Match {
    static defaultProps = Match.defaultProps;

    static contextTypes = Match.contextTypes;

    componentWillReceiveProps(newProps, nextContext) {
        let locationParams;
        if(nextContext.route && nextContext.route.props && nextContext.route.props.location) {
            locationParams = nextContext.route.props.location.currentRoute.params;
        }else if(this.state && this.state.params){
            locationParams = this.state.params;
        }

        this.setParams(locationParams, newProps);
    }

    throwParentError() {
        throw new Error("Parts must be placed inside a route object!");
    }

    addToRoute(route) {
        route.addPart(this);
    }

    removeFromRoute(route) {
        route.removePart(this);
    }

    setParams(params, props) {
        if(!props) {
            props = this.props;
        }
        let {partName} = props;
        this.setState({
            location: params[partName],
            params
        });
    }

    render() {
        let props = Object.assign({}, this.props);
        props.partName = undefined;
        props.children = undefined;
        return <Route {...props} location={this.state.location}>{this.props.children}</Route>
    }
}