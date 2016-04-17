export default class ControllerReference {
    
    /**
     * Constructor.
     *
     * @param string controller The controller name
     * @param array  attributes An array of parameters to add to the Request attributes
     * @param array  query      An array of parameters to add to the Request query string
     */
    constructor(public controller, public attributes: Object, public query: Object) {

    }
}