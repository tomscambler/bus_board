function getBusStopIdFromUser(myMessageToUser){

    const readline = require('readline-sync');

    console.log(myMessageToUser);
    
    let busId = readline.prompt(myMessageToUser);

    while( !busId.match(/^[0-9]{9}[a-z]$/gi) ){
        console.log("ERROR: That is not a valid bus stop!")
        busId = readline.prompt(myMessageToUser);
    }

    return busId;
}




let myBusStopId = getBusStopIdFromUser("enter a bus id");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId}/Arrivals`)

.then(response => response.json())
.then(body => console.log(body));
