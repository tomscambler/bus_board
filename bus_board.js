import readline from "readline-sync";
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function isValidPostCode(myInput){
    
    let validatePostcode = await fetch(`https://api.postcodes.io/postcodes/${myInput}/validate`)
    .then(response => response.json());

    return validatePostcode.result;
}

async function isYorN(myInput){
    return myInput.match(/[YN]{1}/gi);
}

async function getInputFromUser(myMessageToUser, myValidationFunction){

    console.log(myMessageToUser);
    
    let myInput = readline.prompt(myMessageToUser);

    while( ! await myValidationFunction(myInput) ){
        console.log("ERROR: That is not valid!")
        console.log(myMessageToUser);
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

async function findNNearestBusStops(numberOfBusStops, myLat, myLon){

    let stopTypes = "NaptanPublicBusCoachTram";
    let radius = 25;
    let nearestBusStops;

    try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        nearestBusStops = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}`)
        .then(response => response.json());
    }
    catch (error){
        console.log("Sorry, there was an error: ", error);
    }

    while (nearestBusStops.stopPoints.length<numberOfBusStops){
        radius+=25;

        try {
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            nearestBusStops = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}`)
            .then(response => response.json());
        }
        catch (error){
            console.log("Sorry, there was an error: ", error);
        }
    }

    return nearestBusStops;
}

////////////////////////////////////////////////////////////////////////

let myPostCode = await getInputFromUser("Enter a postcode", isValidPostCode);

const postcodeInfo = await fetch(`http://api.postcodes.io/postcodes/${myPostCode}`)
.then(response => response.json())

let myLat = postcodeInfo.result.latitude;
let myLon = postcodeInfo.result.longitude;

let myBusStopId = await findNNearestBusStops(2, myLat, myLon);

for (let i = 0; i < 2; i++){
    
    //console.log(myBusStopId.stopPoints[i].naptanId);

    const arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId.stopPoints[i].naptanId}/Arrivals`)
    .then(response => response.json());

    //console.log(arrivals);

    try {

        
        arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

        for( let j=0; j<Math.min(arrivals.length, 5); j++ ){
                
            let myDestination = arrivals[j].destinationName;
            let myArrivalTime = arrivals[j].timeToStation;
            let myRoute = arrivals[j].lineId;
            let myStop = arrivals[j].stationName;
        
            console.log(`Your next bus from ${myStop} is the ${myRoute} to ${myDestination}, arriving in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
        }
    }

     catch (error) {
         console.log(`Sorry, no buses today!`);
    }
    
    let myInput = await getInputFromUser("Do you need directions to this bus stop?", isYorN).toUpperCase();

    if (myInput=="Y"){

        const directions = await fetch(`https://api.tfl.gov.uk/Journey/JourneyResults/${myPostCode}/to/${myBusStopId.stopPoints[i].naptanId}`)
        .then(response => response.json());

        for (let k=0; k<directions.journeys[0].legs[0].instruction.steps.length; k++){
            console.log(`${directions.journeys[0].legs[0].instruction.steps[k].descriptionHeading}${directions.journeys[0].legs[0].instruction.steps[k].description}`);
        }
    }
}
