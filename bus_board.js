import readline from "readline-sync";

function getBusStopIdFromUser(myMessageToUser){

    console.log(myMessageToUser);
    
    let busId = readline.prompt(myMessageToUser);
    busId = "490004486k";

    while( !busId.match(/^[0-9]{9}[a-z]$/gi) ){
        console.log("ERROR: That is not a valid bus stop!")
        busId = readline.prompt(myMessageToUser);
    }
    return busId;
}

function secondsToMinutesAndSeconds(numberOfSeconds){
    if (numberOfSeconds%60<10){
        return `${Math.floor(numberOfSeconds/60)}:0${numberOfSeconds%60}`;
    }
    else {
        return `${Math.floor(numberOfSeconds/60)}:${numberOfSeconds%60}`;
    }
}

let myBusStopId = getBusStopIdFromUser("enter a bus id");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId}/Arrivals`)

.then(response => response.json())
.then(body => body.slice(0,5));

for( let i=0; i<5; i++ ){
        
    let myDestination = arrivals[i].destinationName;
    let myArrivalTime = arrivals[i].timeToStation;

    console.log(`your next bus to ${myDestination} arrives in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
}