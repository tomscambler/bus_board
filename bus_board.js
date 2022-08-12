import readline from "readline-sync";
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function isValidPostCode(myInput){
    return myInput.match(/^(([A-Z][0-9]{1,2})|(([A-Z][A-HJ-Y][0-9]{1,2})|(([A-Z][0-9][A-Z])|([A-Z][A-HJ-Y][0-9]?[A-Z]))))\s*[0-9][A-Z]{2}$/gi);
}

function isYorN(myInput){
    return myInput.match(/[YN]{1}/gi);
}

function getInputFromUser(myMessageToUser, myValidationFunction){

    console.log(myMessageToUser);
    
    let myInput = readline.prompt(myMessageToUser);

    while( !myValidationFunction(myInput) ){
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
}

////////////////////////////////////////////////////////////////////////

let myPostCode = getInputFromUser("Enter a postcode", isValidPostCode);

const postcodeInfo = await fetch(`http://api.postcodes.io/postcodes/${myPostCode}`)
.then(response => response.json())

let myLat = postcodeInfo.result.latitude;
let myLon = postcodeInfo.result.longitude;

let myBusStopId = await findTwoNearestBusStops(myLat, myLon);

for (let i = 0; i < 2; i++){
    
    //console.log(myBusStopId.stopPoints[i].naptanId);

    const arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId.stopPoints[i].naptanId}/Arrivals`)
    .then(response => response.json());

    if (arrivals.length==0){

        console.log(`Sorry, no buses today!`);

    }
    else {
        arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

        for( let j=0; j<5; j++ ){
                
            let myDestination = arrivals[j].destinationName;
            let myArrivalTime = arrivals[j].timeToStation;
            let myRoute = arrivals[j].lineId;
            let myStop = arrivals[j].stationName;
        
            console.log(`Your next bus from ${myStop} is the ${myRoute} to ${myDestination}, arriving in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
        }
    }
    
    let myInput = getInputFromUser("Do you need directions to this bus stop?", isYorN).toUpperCase();

    if (myInput=="Y"){

        const directions = await fetch(`https://api.tfl.gov.uk/Journey/JourneyResults/${myPostCode}/to/${myBusStopId.stopPoints[i].naptanId}`)
        .then(response => response.json());

        for (let k=0; k<directions.journeys[0].legs[0].instruction.steps.length; k++){
            console.log(`${directions.journeys[0].legs[0].instruction.steps[k].descriptionHeading}${directions.journeys[0].legs[0].instruction.steps[k].description}`);
        }
    }
}
