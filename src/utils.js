export default  {
    isMatch(page, path, params, currentRoute) {
        let isMatch = true;

        if(page){
            isMatch = page === currentRoute.page;
        }

        if(path) {
            isMatch = path === currentRoute.path;
        }

        if(isMatch) {
            Object.keys(params).forEach((param)=> {
                if (params[param] !== undefined && params[param] !== currentRoute.params[param]) {
                    isMatch = false;
                }
            });
        }

        return isMatch;
    }
}