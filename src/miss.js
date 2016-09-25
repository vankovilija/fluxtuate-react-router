import Match from "./match"
import React from "react"
import {autobind} from "core-decorators"

@autobind
export default class Miss extends Match {
    static defaultProps = Match.defaultProps;

    static contextTypes = Match.contextTypes;

    throwParentError() {
        throw new Error("Misses must be placed inside a route object!");
    }

    addToRoute(route) {
        route.addMiss(this);
    }

    removeFromRoute(route) {
        route.removeMiss(this);
    }
}