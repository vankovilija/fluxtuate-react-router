import React, {Component} from "react"
import PropTypes from "prop-types"
import Route from "./route"
import {autobind} from "core-decorators"
import utils from "./utils"

const baseStyle = {
    textDecoration: "none",
    color: "black"
};

const BUTTON_TYPE = "button";
const LINK_TYPE = "link";

@autobind
export default class Link extends Component {
    static contextTypes = {
        route: PropTypes.instanceOf(Route)
    };

    static BUTTON = BUTTON_TYPE;
    static LINK = LINK_TYPE;

    static propTypes = {
        page: PropTypes.string,
        path: PropTypes.string,
        params: PropTypes.object,
        style: PropTypes.object,
        linkType: PropTypes.oneOf([BUTTON_TYPE, LINK_TYPE]),
        activeStyle: PropTypes.object
    };

    static defaultProps = {
        params: {},
        style: {},
        activeStyle: {},
        linkType: LINK_TYPE
    };

    componentWillMount() {
        if(!this.context.route) {
            throw new Error("You must place Link instances inside of a route");
        }

        if(!this.props.page && !this.props.path) {
            throw new Error("You must provide a page or a path into the properties of link");
        }

        if(this.props.page && this.props.path) {
            throw new Error("You must provide either a page or a path to a link component");
        }
    }

    redirect() {
        let {page, path, params} = this.props;

        this.context.route.redirect(page, path, params);
    }

    render() {
        let {
            style,
            activeStyle,
            children,
            linkType,
            page,
            path,
            params,
            ...rest
        } = this.props;

        if(linkType === LINK_TYPE)
            return <a {...rest} href="javascript:void(0)" style={Object.assign({}, baseStyle, style, utils.isMatch(page, path, params, this.context.route.currentRoute)?activeStyle : undefined)} onClick={this.redirect}>{children}</a>;
        else
            return <button {...rest} style={Object.assign({}, baseStyle, style, utils.isMatch(matchProps, this.context.route.currentRoute)?activeStyle : undefined)} onClick={this.redirect}>{children}</button>;
    }
}