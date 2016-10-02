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
        parts: [],
        misses: [],
        providers: [],
        currentRoute: undefined
    };

    routeListener;

    static propTypes = {
        location: PropTypes.instanceOf(RoutePart),
        visible: PropTypes.bool
    };

    static defaultProps = {
        component: "div",
        visible: true,
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

    addLocationProvider(locationProvider){
        let {providers} = this.state;
        providers.push(locationProvider);
        this.setState({
            providers
        });
    }

    addPart(part) {
        let {parts} = this.state;
        parts.push(part);
        this.setState({
            parts
        });
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

    removeLocationProvider(locationProvider) {
        let {providers} = this.state;
        let index = providers.indexOf(locationProvider);
        if(index !== -1) {
            providers.splice(index, 1);
            this.setState({
                providers
            });
        }
    }

    removePart(part) {
        let {parts} = this.state;
        let index = parts.indexOf(part);
        if(index !== -1) {
            parts.splice(index, 1);
            this.setState({
                parts
            });
        }
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
        let currentRoute = this.props.location.currentRoute;
        this.setState({
            currentRoute
        });
        this.state.parts.forEach((part)=>{
            part.setParams(currentRoute.params);
        })
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
                newProps.location.startingContext.start();
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

    updateMatch(match, currentRoute) {
        let {page, path, params} = match.props;

        if(utils.isMatch(page, path, params, currentRoute)) {
            match.show();
            return true;
        }else{
            match.hide();
            return false;
        }
    }

    updateMatches(matches, misses, currentRoute) {
        let hasMatch = false;
        matches.forEach((match)=>{
            if(this.updateMatch(match, currentRoute)){
                hasMatch = true;
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

    updateProviders(providers, locationName, currentRoute) {
        providers.forEach((provider)=>{
            provider.setLocation(locationName, currentRoute);
        })
    }

    componentDidUpdate() {
        let {matches, misses, providers} = this.state;
        let {location} = this.props;
        let currentRoute;
        if(location && (currentRoute = location.currentRoute)) {
            this.updateMatches(matches, misses, currentRoute);
            this.updateProviders(providers, location.partName, currentRoute);
        }
    }

    getChildren(children, childProps) {
        return React.Children.map(children, (child)=>child?React.cloneElement(child, Object.assign({}, child.props, childProps)):undefined);
    }

    render() {
        let {component, children} = this.props;

        if(!this.props.location) return React.createElement(component);

        let style = {};

        if(!this.props.visible) style.display = "none";

        return React.createElement(component, {style: style}, children);
    }

}

Route.childContextTypes = {
    route: PropTypes.instanceOf(Route),
    fluxtuateContext: PropTypes.instanceOf(Context)
};