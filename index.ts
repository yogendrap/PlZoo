// create kernel object
// kernel some how can return setting for server
// create server
// pass the settings to server 
// and a callback to server for request and response
// again pass resuest, response to kernel to handle

import PlZooKernel from './core/plZooKernel';
import BaseServer from './core/lib/Server/BaseServer';


const kernel: PlZooKernel = PlZooKernel.create();


const server = new BaseServer(kernel.getSettingsFor('server'), (request, response) => {
   kernel.handle(request, response);
});

server.start();
