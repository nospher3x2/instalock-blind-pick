const LCUConnector = require('lcu-connector');
const axios = require('axios');
const https = require('https');

console.log('Waiting to start the League Client');
const connector = new LCUConnector();
const agent = new https.Agent({
    rejectUnauthorized: false,
});

connector.on('connect', async(credentials) => {
    console.log('League Client started.');

    setInterval(async()=> {
        const sessionResponse = await request(credentials, 'GET', 'lol-champ-select/v1/session', undefined);
        if(!sessionResponse) return;
        const session = sessionResponse.data
        const localCellId = session.localPlayerCellId;
    
        session.actions[0].forEach(async(action)=> {
            if (action.actorCellId != localCellId) return;
            
            const actionId = action.id;
    
            return await request(credentials, 'PATCH', `lol-champ-select/v1/session/actions/${actionId}`, {
                "championId" : 147,
                "completed" : true
            });
        });
    }, 1000)

}).start();

async function request(credentials, method, route, body) {
    let url = `https://127.0.0.1:${credentials.port}/${route}`;
    let options = {
        headers: {
            'content-type': 'application/json',
            Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`)
            .toString("base64")
        }`
        },
        httpsAgent: agent
    };

    if(method.toUpperCase() === "GET") {
        return await axios.get(url, options).catch(()=> undefined);
    } else if(method.toUpperCase() === "PATCH") {
        return await axios.patch(url, body, options).catch(()=> undefined);
    }

    return undefined;
}

