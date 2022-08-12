import readline from "readline-sync";

// function isValidBusId(myInput){
//     return myInput.match(/^[0-9]{9}[a-z]$/gi);
// }

// function getInputFromUser(myMessageToUser){

//     console.log(myMessageToUser);
    
//     let myInput = readline.prompt(myMessageToUser);
//     myInput = "490004486k";

//     while( !isValidBusId(myInput) ){
//         console.log("ERROR: That is not valid!")
//         myInput = readline.prompt(myMessageToUser);
//     }
//     return myInput;
// }

function isValidPostCode(myInput){
    return myInput.match(/^(([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z]))))\s*[0-9][A-Z]{2}$/gi);
}

function getInputFromUser(myMessageToUser){

    console.log(myMessageToUser);
    
    let myInput = readline.prompt(myMessageToUser);

    while( !isValidPostCode(myInput) ){
        console.log("ERROR: That is not valid!")
        myInput = readline.prompt(myMessageToUser);
    }
    return myInput;
}

function secondsToMinutesAndSeconds(numberOfSeconds){
    if (numberOfSeconds>120){
        return `${Math.floor(numberOfSeconds/60)} mins`;
    } else if (numberOfSeconds >= 60){
        return `${Math.floor(numberOfSeconds/60)} min`;
    } else {
        return `under a minute`;
    }
}

async function findTwoNearestBusStops(myLat, myLon){

    let stopTypes = "NaptanPublicBusCoachTram";
    let radius = 25;

    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

    let nearestBusStops = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}`)
    .then(response => response.json());

    while (nearestBusStops.stopPoints.length<2){
        radius+=25;
        nearestBusStops = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}`)
        .then(response => response.json());
    }

    return nearestBusStops;
    //return [nearestBusStops.stopPoints[0].naptanId, nearestBusStops.stopPoints[1].naptanId];
}


let myPostCode = getInputFromUser("Enter a postcode");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const postcodeInfo = await fetch(`http://api.postcodes.io/postcodes/${myPostCode}`)
.then(response => response.json())

let myLat = postcodeInfo.result.latitude
let myLon = postcodeInfo.result.longitude

// console.log(myLat)
// console.log(myLon)

let myBusStopId = await findTwoNearestBusStops(myLat, myLon);

//console.log(myBusStopId)

for (let i = 0; i < 2; i++){

    const arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId.stopPoints[i].naptanId}/Arrivals`)
    .then(response => response.json());

    if (arrivals.length==0){

        console.log(`Sorry, no buses today!`);

    }
    else{
        arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

        for(let j=0; j<5; j++ ){
                
            let myDestination = arrivals[j].destinationName;
            let myArrivalTime = arrivals[j].timeToStation;
            let myRoute = arrivals[j].lineId;
            let myStop = arrivals[j].stationName;
        
            console.log(`Your next bus from ${myStop} is the ${myRoute} to ${myDestination}, arriving in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
        }
    }
}

