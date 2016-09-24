import React, {Component, PropTypes} from "react"
import {Context} from "fluxtuate"
import {RouterEvents} from "fluxtuate-router"
import RoutePart from "fluxtuate-router/lib/route-part"
import {autobind} from "core-decorators"

@autobind
export default class Route extends Component {
    state = {
        matches: [],
        misses: [],
        currentRoute: {}
    };

    routeListener;

    static propTypes = {
        location: PropTypes.instanceOf(RoutePart).isRequired
    };

    static defaultProps = {
        component: "div"
    };

    static contextTypes = {
        fluxtuateContext: PropTypes.instanceOf(Context)
    };

    static childContextTypes = {
        route: PropTypes.instanceOf(Route),
        fluxtuateContext: PropTypes.instanceOf(Context)
    };

    getChildContext() {
        return {
            route: this,
            fluxtuateContext: this.props.location.endingContext
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
        if(this.context.fluxtuateContext){
            this.context.fluxtuateContext.addChild(this.props.location.startingContext);
        }
        this.routeListener = this.props.location.addEventListener(RouterEvents.ROUTE_CHANGED, this.updateRoute);
    }

    componentWillReceiveProps(newProps) {
        if(this.props.location !== newProps.location) {
            if(this.context.fluxtuateContext){
                this.context.fluxtuateContext.removeChild(this.props.location.startingContext);
            }
            if(this.routeListener) {
                this.routeListener.remove();
                this.routeListener = null;
            }

            if(this.context.fluxtuateContext){
                this.context.fluxtuateContext.addChild(newProps.location.startingContext);
            }

            this.routeListener = newProps.location.addEventListener(RouterEvents.ROUTE_CHANGED, this.updateRoute);
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
            let isMatch = true;
            let matchProps = Object.assign({}, match.props);
            let page = matchProps.page;
            let path = matchProps.path;
            if(page){
                isMatch = page === currentRoute.page;
            }

            if(path) {
                isMatch = path === currentRoute.path;
            }

            if(isMatch) {
                delete matchProps["page"];
                delete matchProps["path"];

                Object.keys(matchProps).forEach((param)=> {
                    if (matchProps[param] !== currentRoute.params[param]) {
                        isMatch = false;
                    }
                });
            }


            if(isMatch) {
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

    componentDidMount() {
        let {matches, misses, currentRoute} = this.state;
        this.updateMatches(matches, misses, currentRoute);
    }

    componentDidUpdate() {
        let {matches, misses, currentRoute} = this.state;
        this.updateMatches(matches, misses, currentRoute);
    }

    getChildren(children, childProps) {
        return React.Children.map(children, (child)=>React.cloneElement(child, Object.assign({}, child.props, childProps)));
    }

    render() {
        let {component} = this.props;
        let {currentRoute} = this.state;

        let childProps = Object.assign({}, {route: currentRoute}, this.props);

        childProps.location = undefined;
        childProps.component = undefined;

        let children = this.getChildren(this.props.children, childProps);

        return React.createElement(component, childProps, children);
    }

}