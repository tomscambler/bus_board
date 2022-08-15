import readline from "readline-sync";
import winston from "winston";
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: 'combined.log' })
    ]
});

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
    let radius = 0;
    let nearestBusStops;

      do {
        radius+=25;
        try {
            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
            nearestBusStops = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}&app_key=9a27a636e630462685f5b20949631f4f`)
            .then(response => response.json());
            if (nearestBusStops === undefined){
                throw "There are no bus stops nearby"
            }
            if (radius > 1025){
                throw "There are no bus stops within 1km of your location"
            }
        }
        catch (error){
            console.log(error);
            return []
        }
    } while (nearestBusStops.stopPoints.length<numberOfBusStops)

    return nearestBusStops;
}

////////////////////////////////////////////////////////////////////////

let myPostCode = await getInputFromUser("Enter a postcode", isValidPostCode);

const postcodeInfo = await fetch(`http://api.postcodes.io/postcodes/${myPostCode}`)
.then(response => response.json())

let myLat = postcodeInfo.result.latitude;
let myLon = postcodeInfo.result.longitude;

let myBusStopId = await findNNearestBusStops(2, myLat, myLon);

for (let i = 0; i < myBusStopId.length; i++){
    
    //console.log(myBusStopId.stopPoints[i].naptanId);

    const arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/${myBusStopId.stopPoints[i].naptanId}/Arrivals`)
    .then(response => response.json());

    //console.log(arrivals);
    arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

    try {
        // console.log("Hi")
        arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

        if (arrivals.length === 0){
            throw "Live updates are not available for this stop"
        }

        for( let j=0; j<Math.min(arrivals.length, 5); j++ ){
                
            let myDestination = arrivals[j].destinationName;
            let myArrivalTime = arrivals[j].timeToStation;
            let myRoute = arrivals[j].lineId;
            let myStop = arrivals[j].stationName;
        
            console.log(`Your next bus from ${myStop} is the ${myRoute} to ${myDestination}, arriving in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
        }
        let myInput = await getInputFromUser("Do you need directions to this bus stop?", isYorN);
        myInput = myInput.toUpperCase();
    
        if (myInput=="Y"){
    
            const directions = await fetch(`https://api.tfl.gov.uk/Journey/JourneyResults/${myPostCode}/to/${myBusStopId.stopPoints[i].naptanId}`)
            .then(response => response.json());
    
            for (let k=0; k<directions.journeys[0].legs[0].instruction.steps.length; k++){
                console.log(`${directions.journeys[0].legs[0].instruction.steps[k].descriptionHeading}${directions.journeys[0].legs[0].instruction.steps[k].description}`);
            }
        }


       
    }

    catch (error) {
         console.log(error);
    }
    

}
