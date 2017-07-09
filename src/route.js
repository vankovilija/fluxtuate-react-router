import React, {Component} from "react"
import PropTypes from "prop-types"
import {Context} from "fluxtuate"
import {RouterEvents} from "fluxtuate-router"
import RoutePart from "fluxtuate-router/lib/route-part"
import {autobind} from "core-decorators"
import utils from "./utils"
import {isString, isObject, isNumber} from "lodash/lang"

function compare(keys, params, nextParams) {
    return keys.reduce((shouldUpdate, currentKey)=> {
        if (shouldUpdate) return true;
        let param = params[currentKey];
        if (currentKey !== "context" && !isString(param) && !isNumber(param) && isObject(param)) {
            let k1 = Object.keys(param);
            let k2 = Object.keys(nextParams[currentKey]);
            if(k1.length !== k2.length) {
                return true;
            }
            return compare(k1, param, nextParams[currentKey]);
        }
        if (!isString(param) && !isNumber(param)) return shouldUpdate;
        shouldUpdate = param !== nextParams[currentKey];
        return shouldUpdate;
    }, false);
}

function comapreLists(list1, list2) {
    if(list1.length !== list2.length) return true;

    return list1.reduce((shouldUpdate, listItem, i)=>{
        if(shouldUpdate) return true;

        return listItem !== list2[i];
    }, false);
}

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
    location;

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
            fluxtuateContext: this.props.location ? this.props.location.endingContext : undefined
        };
    }

    addLocationProvider(locationProvider) {
        let {providers} = this.state;
        providers.push(locationProvider);
        this.setState({
            providers
        });
        let {location} = this.props;
        locationProvider.setLocation(location.partName, location.currentRoute);
    }

    addPart(part) {
        let {parts} = this.state;
        parts.push(part);
        this.setState({
            parts
        });

        part.setParams(this.props.location.currentRoute.params);
    }

    addMatch(match) {
        let {matches} = this.state;
        matches.push(match);
        this.setState({
            matches
        });

        if(this.updateMatch(match, this.props.location.currentRoute)){
            this.hasMatch = true;
            this.updateMisses(this.state.misses);
        }
    }

    addMiss(miss) {
        let {misses} = this.state;
        misses.push(miss);
        this.setState({
            misses
        });

        this.hasMatch !== undefined && this.hasMatch ? miss.hide() : miss.show();
    }

    removeLocationProvider(locationProvider) {
        let {providers} = this.state;
        let index = providers.indexOf(locationProvider);
        if (index !== -1) {
            providers.splice(index, 1);
            this.setState({
                providers
            });
        }
    }

    removePart(part) {
        let {parts} = this.state;
        let index = parts.indexOf(part);
        if (index !== -1) {
            parts.splice(index, 1);
            this.setState({
                parts
            });
        }
    }

    removeMatch(match) {
        let {matches} = this.state;
        let index = matches.indexOf(match);
        if (index !== -1) {
            matches.splice(index, 1);
            this.setState({
                matches
            });
        }
    }

    removeMiss(miss) {
        let {misses} = this.state;
        let index = misses.indexOf(miss);
        if (index !== -1) {
            misses.splice(index, 1);
            this.setState({
                misses
            });
        }
    }

    updateRoute() {
        let currentRoute = this.props.location.currentRoute;
        this.updateParts(this.state.parts, currentRoute);
        this.setState({
            currentRoute
        });
    }

    componentWillMount() {
        if (this.props.location) {
            this.componentWillReceiveProps(this.props);
        }
    }

    get currentRoute() {
        return this.state.currentRoute;
    }

    componentWillReceiveProps(newProps) {
        if (this.location !== newProps.location) {
            if (this.context.fluxtuateContext && this.location && this.location.startingContext.isChildOf(this.context.fluxtuateContext)) {
                this.context.fluxtuateContext.removeChild(this.location.startingContext);
            }
            if (this.routeListener) {
                this.routeListener.remove();
                this.routeListener = null;
            }

            if(newProps.location) {
                if (this.context.fluxtuateContext && newProps.location.startingContext.parent !== this.context.fluxtuateContext) {
                    if(newProps.location.startingContext.parent) {
                        newProps.location.startingContext.parent.removeChild(newProps.location.startingContext);
                    }

                    this.context.fluxtuateContext.addChild(newProps.location.startingContext);
                    newProps.location.endingContext.start();
                }

                this.routeListener = newProps.location.addListener(RouterEvents.ROUTE_CHANGED, this.updateRoute);

                let currentRoute = newProps.location.currentRoute;

                this.setState({
                    currentRoute: currentRoute
                });

                this.updateParts(this.state.parts, currentRoute);
            }else{
                this.setState({
                    currentRoute: undefined
                });

                this.updateParts(this.state.parts, undefined);
            }

            this.location = newProps.location;
        }
    }

    componentWillUnmount() {
        if (this.routeListener) {
            if (this.context.fluxtuateContext && !this.context.fluxtuateContext.destroyed) {
                this.context.fluxtuateContext.removeChild(this.props.location.startingContext);
            }
            this.routeListener.remove();
            this.routeListener = null;
        }
    }

    updateMatch(match, currentRoute) {
        let {page, path, params} = match.props;

        if (utils.isMatch(page, path, params, currentRoute)) {
            match.show();
            return true;
        } else {
            match.hide();
            return false;
        }
    }

    updateMatches(matches, misses, currentRoute) {
        this.hasMatch = false;
        matches.forEach((match)=> {
            if (this.updateMatch(match, currentRoute)) {
                this.hasMatch = true;
            }
        });

        this.updateMisses(misses)
    }

    updateMisses(misses) {
        misses.forEach((miss)=> {
            this.hasMatch ? miss.hide() : miss.show();
        });
    }

    updateParts(parts, currentRoute) {
        parts.forEach((part)=> {
            part.setParams(currentRoute ? currentRoute.params : {});
        });
    }

    redirect(pageName, path, params) {
        if (pageName) {
            this.props.location.goToPage(pageName, params);
        } else if (path) {
            this.props.location.goToPath(path, params);
        } else {
            throw new Error("You must specify a page or a path when redirecting to a different URL!");
        }
    }

    updateProviders(providers, locationName, currentRoute) {
        providers.forEach((provider)=> {
            provider.setLocation(locationName, currentRoute);
        })
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        let {matches, misses, providers, parts} = this.state;
        let {location} = this.props;
        let currentRoute;
        if (location && (currentRoute = location.currentRoute)) {
            this.updateMatches(matches, misses, currentRoute);
            this.updateProviders(providers, location.partName, currentRoute);
            this.updateParts(parts, currentRoute);
        }
    }

    getChildren(children, childProps) {
        return React.Children.map(children, (child)=>child ? React.cloneElement(child, Object.assign({}, child.props, childProps)) : undefined);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.location !== nextProps.location ||
            this.props.visible !== nextProps.visible ||
            this.props.component !== nextProps.component) {
            return true;
        }

        if(comapreLists(this.state.matches, nextState.matches) ||
            comapreLists(this.state.misses, nextState.misses) ||
            comapreLists(this.state.providers, nextState.providers) ||
            comapreLists(this.state.parts, nextState.parts) ||
            this.compareChildren(React.Children.toArray(nextProps.children))
        ) {
            return true;
        }

        let params = this.state.currentRoute;
        let nextParams = nextProps.location ? nextProps.location.currentRoute : undefined;
        if (!params || !nextParams) return true;

        let keys = Object.keys(params);
        let nextKeys = Object.keys(nextParams);

        if (keys.length !== nextKeys.length) return true;

        return compare(keys, params, nextParams);
    }

    compareChildren(newChildren) {
        let currentChildren = React.Children.toArray(this.props.children);
        if(newChildren.length !== currentChildren.length) return true;
        for(let i = 0; i < newChildren.length; i++) {
            let oldKeys = Object.keys(currentChildren[i].props);
            let newKeys = Object.keys(newChildren[i].props);

            if(oldKeys.length !== newKeys.length) return true;

            if(compare(newKeys, newChildren[i].props, currentChildren[i].props)) {
                return true;
            }
        }

        return false;
    }

    render() {
        let {component, children} = this.props;

        if (!this.props.location) return React.createElement(component);

        let style = Object.assign({}, this.props.style);

        if (!this.props.visible) style.display = "none";

        return React.createElement(component, {style: style}, children);
    }

}

Route.childContextTypes = {
    route: PropTypes.instanceOf(Route),
    fluxtuateContext: PropTypes.instanceOf(Context)
};