async function findTwoNearestBusStops(myLat, myLon){

    //let myLat = 51.5;
    //let myLon = 0.12;
    let stopTypes = "NaptanPublicBusCoachTram";
    let radius = 25;

    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


    let arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}`)
    .then(response => response.json());

    while (arrivals.stopPoints.length<2){
        radius+=25;
        arrivals = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${myLat}&lon=${myLon}&stopTypes=${stopTypes}&radius=${radius}`)
        .then(response => response.json());
    }

    return [arrivals.stopPoints[0].naptanId, arrivals.stopPoints[1].naptanId];
}
//console.log(findTwoNearestBusStops(51.5, 0.12));