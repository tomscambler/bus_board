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
    if (numberOfSeconds%60<10){
        return `${Math.floor(numberOfSeconds/60)}:0${numberOfSeconds%60}`;
    }
    else {
        return `${Math.floor(numberOfSeconds/60)}:${numberOfSeconds%60}`;
    }
}

let myPostCode = getInputFromUser("Enter a postcode");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const postcodeInfo = await fetch(`http://api.postcodes.io/postcodes/${myPostCode}`)

.then(response => response.json())


console.log(postcodeInfo)


//.then(body => body.slice(0,2));
// arrivals.sort(function(a, b){return a.timeToStation - b.timeToStation});

// for( let i=0; i<5; i++ ){
        
//     let myDestination = arrivals[i].destinationName;
//     let myArrivalTime = arrivals[i].timeToStation;

//     console.log(`your next bus to ${myDestination} arrives in ${secondsToMinutesAndSeconds(myArrivalTime)}`);
// }


