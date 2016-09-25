import React from "react"
import Link from "./link"

export default class Redirect extends Link {
    static contextTypes = Link.contextTypes;

    static propTypes = Link.propTypes;

    componentWillMount() {
        super.componentWillMount();

        this.redirect();
    }
}