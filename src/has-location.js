import Match from "./match"
import React from "react"

export default (Comp) => {
    return class LocationProvider extends Match {
        static defaultProps = Match.defaultProps;

        static contextTypes = Match.contextTypes;

        static displayName = Comp.displayName;

        throwParentError() {
            throw new Error("Elements that have location must be placed inside of a route object!");
        }

        addToRoute(route) {
            route.addLocationProvider(this);
        }

        removeFromRoute(route) {
            route.removeLocationProvider(this);
        }

        setLocation(locationName, locationProps) {
            this.setState({
                location: {locationName, props: locationProps}
            });
        }

        render() {
            return <Comp {...this.props} location={this.state.location || {}}/>
        }
    };
};