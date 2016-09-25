import React, {Component, PropTypes} from "react"
import Route from "./route"

export default class Link extends Component {
    static contextTypes = {
        route: PropTypes.instanceOf(Route)
    };

    static propTypes = {
        page: PropTypes.string,
        path: PropTypes.string
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
        let params = Object.assign({}, this.props);
        delete params["page"];
        delete params["path"];
        this.context.route.redirect(this.props.page, this.props.path, params);
    }

    render() {
        return <a href="javascript:void(0)" onClick={this.redirect}>{this.props.children}</a>;
    }
}