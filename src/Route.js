import React, {Component, PropTypes} from "react"
import {Context} from "fluxtuate"
import {RouterEvents} from "fluxtuate-router"
import RoutePart from "fluxtuate-router/lib/route-part"
import {autobind} from "core-decorators"
import utils from "./utils"

@autobind
export default class Route extends Component {
    state = {
        matches: [],
        misses: [],
        currentRoute: undefined
    };

    routeListener;

    static propTypes = {
        location: PropTypes.instanceOf(RoutePart)
    };

    static defaultProps = {
        component: "div",
        location: undefined
    };

    static contextTypes = {
        fluxtuateContext: PropTypes.instanceOf(Context)
    };

    getChildContext() {
        return {
            route: this,
            fluxtuateContext: this.props.location? this.props.location.endingContext : undefined
        };
    }

    addMatch(match) {
        let {matches} = this.state;
        matches.push(match);
        this.setState({
            matches
        });
    }

    addMiss(miss) {
        let {misses} = this.state;
        misses.push(miss);
        this.setState({
            misses
        })
    }

    removeMatch(match) {
        let {matches} = this.state;
        let index = matches.indexOf(match);
        if(index !== -1) {
            matches.splice(index, 1);
            this.setState({
                matches
            });
        }
    }

    removeMiss(miss) {
        let {misses} = this.state;
        let index = misses.indexOf(miss);
        if(index !== -1) {
            misses.splice(index, 1);
            this.setState({
                misses
            });
        }
    }

    updateRoute() {
        this.setState({
            currentRoute: this.props.location.currentRoute
        });
    }

    componentWillMount() {
        if(this.props.location) {
            this.componentWillReceiveProps(this.props);
        }
    }

    get currentRoute() {
        return this.state.currentRoute;
    }

    componentWillReceiveProps(newProps) {
        if(this.props.location !== newProps.location) {
            if(this.context.fluxtuateContext && this.props.location){
                this.context.fluxtuateContext.removeChild(this.props.location.startingContext);
            }
            if(this.routeListener) {
                this.routeListener.remove();
                this.routeListener = null;
            }

            if(this.context.fluxtuateContext){
                this.context.fluxtuateContext.addChild(newProps.location.startingContext);
            }

            this.routeListener = newProps.location.addListener(RouterEvents.ROUTE_CHANGED, this.updateRoute);

            this.setState({
                currentRoute: newProps.location.currentRoute
            });
        }
    }

    componentWillUnmount() {
        if(this.routeListener) {
            if(this.context.fluxtuateContext){
                this.context.fluxtuateContext.removeChild(this.props.location.startingContext);
            }
            this.routeListener.remove();
            this.routeListener = null;
        }
    }

    updateMatches(matches, misses, currentRoute) {
        let hasMatch = false;
        matches.forEach((match)=>{
            let {page, path, params} = match.props;

            if(utils.isMatch(page, path, params, currentRoute)) {
                hasMatch = true;
                match.show();
            }else{
                match.hide();
            }
        });

        misses.forEach((miss)=>{
            hasMatch ? miss.hide() : miss.show();
        });
    }

    redirect(pageName, path, params) {
        if(pageName) {
            this.props.location.goToPage(pageName, params);
        }else if(path){
            this.props.location.goToPath(path, params);
        }else{
            throw new Error("You must specify a page or a path when redirecting to a different URL!");
        }
    }

    componentDidUpdate() {
        let {matches, misses, currentRoute} = this.state;
        if(currentRoute)
            this.updateMatches(matches, misses, currentRoute);
    }

    getChildren(children, childProps) {
        return React.Children.map(children, (child)=>child?React.cloneElement(child, Object.assign({}, child.props, childProps)):undefined);
    }

    render() {
        let {component, children} = this.props;

        if(!this.props.location) return React.createElement(component);

        return React.createElement(component, {}, children);
    }

}

Route.childContextTypes = {
    route: PropTypes.instanceOf(Route),
    fluxtuateContext: PropTypes.instanceOf(Context)
};