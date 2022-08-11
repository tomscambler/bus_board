//const fetch = require('node-fetch');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

fetch("https://api.tfl.gov.uk/StopPoint/910GDENMRKH/ArrivalDepartures?lineIds=london-overground")

.then(response => response.json())
.then(body => console.log(body));
