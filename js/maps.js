 var lastCoord = null;
 var countMap = 0;

 function initMap()
 {
     var uluru = {
         lat: -25.363,
         lng: 131.044
     };
     var map = new google.maps.Map(document.getElementById('map'),
     {
         zoom: 4,
         center: uluru
     });
     var marker = new google.maps.Marker(
     {
         position: uluru,
         map: map
     })


     addCallback(function()
     {
         var currentSecond = getSimulationSecond();
         uluru.lng = getLongitude(currentSecond);
         uluru.lat = getLatitude(currentSecond);

         if (countMap++ % 100 == 0)
         {
             if (lastCoord != null)
             {

                 var flightPlanCoordinates = [
                     lastCoord,
                     uluru
                 ];


                 var flightPath = new google.maps.Polyline(
                 {
                     path: flightPlanCoordinates,
                     geodesic: true,
                     strokeColor: '#FF0000',
                     strokeOpacity: 1.0,
                     strokeWeight: 2
                 });

                 flightPath.setMap(map);
             }


             lastCoord = JSON.parse(JSON.stringify(uluru));
         }
         marker.setPosition(uluru);
     });
 };