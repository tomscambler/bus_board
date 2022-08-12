import readline from "readline-sync";

function isValidBusId(myInput){
    return myInput.match(/^[0-9]{9}[a-z]$/gi);
}

function getInputFromUser(myMessageToUser){

    console.log(myMessageToUser);
    
    let myInput = readline.prompt(myMessageToUser);
    myInput = "490004486k";

    while( !isValidBusId(myInput) ){
        console.log("ERROR: That is not valid!")
        myInput = readline.prompt(myMessageToUser);
    }
    return myInput;
}

function secondsToMinutesAndSeconds(numberOfSeconds){
    if (numberOfSeconds%60<10){
        return `${Math.floor(numberOfSeconds/60)}:0${numberOfSeconds%60}`;
    }
    else {
        return `${Math.floor(numberOfSeconds/60)}:${numberOfSeconds%60}`;
    }
}

let myBusStopId = getInputFromUser("enter a bus id");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId}/Arrivals`)

.then(response => response.json())
.then(body => body.slice(0,5));

arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

for( let i=0; i<5; i++ ){
        
    let myDestination = arrivals[i].destinationName;
    let myArrivalTime = arrivals[i].timeToStation;

    console.log(`your next bus to ${myDestination} arrives in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
}