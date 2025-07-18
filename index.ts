import { Server } from 'hyper-express';
const webserver = new Server();
import * as constants from './constants';
import * as utils from './utils';

webserver.get('/', (req: any, res: any) => {
    // Serve static index.html
    res.sendFile('static/index.html');
});

webserver.get('/compare', (req: any, res: any) => {
    // Serve static compare.html
    res.sendFile('static/compare.html');
});

webserver.get('/index.js', (req: any, res: any) => {
    // Serve static index.js
    res.sendFile('static/index.js');
});

webserver.get('/render.js', (req: any, res: any) => {
    // Serve static render.js
    res.sendFile('static/render.js');
});

webserver.get('/render_type.js', (req: any, res: any) => {
    res.sendFile('static/render_type.js');
})


webserver.get('/api', (req: any, res: any) => {
    res.send('Usage: /api/chainId/address\n You want use ui? not yet implemented');
});

webserver.get('/api/:chainId/:address', async (req: any, res: any) => {
    // Check if chain is supported
    if (!constants.chainIdToChainInfo[req.params.chainId]) {
        res.send('Chain not supported, contact the developer at 60806040#kunagisa.moe');
        return;
    }
    // Get forceEvmole from query params
    const forceEvmole = req.query?.forceEvmole === '1';
    // Call the contract fetcher
    let contract = await utils.fetchContract(req.params.address, req.params.chainId, forceEvmole);
    // Return the result in JSON format
    res.json(contract);
});

webserver.get('/:chainId/:address', async (req: any, res: any) => {
    res.sendFile('static/view.html');
});

webserver.listen(3000, () => {
    console.log('Server running on port 3000');
});