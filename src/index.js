const LCUConnector = require('lcu-connector');
const axios = require('axios');
const https = require('https');

console.log(`\x1b[36mWaiting to start League Client\n`); 
const connector = new LCUConnector();
const agent = new https.Agent({
    rejectUnauthorized: false,
});

const championId = 234; // VIEGO

const animatedTitle = async(title)=> {
    const chars = title.split('');
    process.title = '';

    chars.forEach((char, index)=> {
        setTimeout(()=> {
            process.title += char;
            if(index+1 >= chars.length) return animatedTitle(title);
        }, 125 * index)
    })
}

animatedTitle(`INSTALOCK VIEGO @ryannospherys Nospher#9995  `);

connector.on('connect', async(credentials) => {
    console.log('League Client started.');

    const api = axios.create({
        baseURL: `https://127.0.0.1:${credentials.port}`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`)
            .toString("base64")}`,
        },
        httpsAgent: agent
    });

    setInterval(async()=> {
        const session = await api.get('lol-champ-select/v1/session').then((response)=> response.data).catch(()=> undefined);
        if(!session) return;

        const localCellId = session.localPlayerCellId;
    
        const action = session.actions[0].filter((action)=> action.actorCellId === localCellId)[0]

        return await api.patch(`lol-champ-select/v1/session/actions/${action.id}`, {
            "championId" : championId,
            "completed" : true
        }).catch(()=> undefined);
    }, 1000)

}).start();
