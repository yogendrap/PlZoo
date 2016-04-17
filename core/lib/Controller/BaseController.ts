
export abstract class BaseController {
    // private logger DI 
   
    // public logger : LoggerInterface = null
    constructor() {

    }  
    
    
   /**
     * Returns a callable for the given controller.
     *
     * @param string controller A Controller string
     *
     * @return callable A P callable
     *
     * @throws \InvalidArgumentException
     */
    protected  createController(controllerName)
    {
        // if (false === strpos($controller, '::')) {
        //     throw new \InvalidArgumentException(sprintf('Unable to find controller "%s".', $controller));
        // }

        // list($class, $method) = explode('::', $controller, 2);

        // if (!class_exists($class)) {
        //     throw new \InvalidArgumentException(sprintf('Class "%s" does not exist.', $class));
        // }

        // return array($this->instantiateController($class), $method);
    }
    /**
     * Returns an instantiated controller.
     *
     * @param string $class A class name
     *
     * @return object
     */
    protected instantiateController(controllerClass) {
        return new controllerClass();
    }
}