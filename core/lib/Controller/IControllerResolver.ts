import {ClientRequest as IRequest}  from 'http';

export interface ControllerResolverInterface {
    
    /**
     * Returns the Controller instance associated with a Request.
     *
     * As several resolvers can exist for a single application, a resolver must
     * return false when it is not able to determine the controller.
     *
     * The resolver must only throw an exception when it should be able to load
     * controller but cannot because of some errors made by the developer.
     *
     * @param Request request A Request instance
     *
     * @return callable|false A PHP callable representing the Controller,
     *                        or false if this resolver is not able to determine the controller
     *
     * @throws \LogicException If the controller can't be found
     */
    getController(request: IRequest);

    /**
     * Returns the arguments to pass to the controller.
     *
     * @param Request  request    A Request instance
     * @param callable controller A callable
     *
     * @return array An array of arguments to pass to the controller
     *
     * @throws \RuntimeException When value for argument given is not provided
     */
    getArguments(request: IRequest, controller:string);

    /**
     * Returns the Controller instance with a given controller route definition.
     *
     * As several resolvers can exist for a single application, a resolver must
     * return false when it is not able to determine the controller.
     *
     * @param mixed $controller
     *   The controller attribute like in $request->attributes->get('_controller')
     *
     * @return mixed|bool
     *   A PHP callable representing the Controller, or false if this resolver is
     *   not able to determine the controller
     *
     * @throws \InvalidArgumentException|\LogicException
     *   Thrown if the controller can't be found.
     *
     */
    getControllerFromDefinition(controller: string);
}