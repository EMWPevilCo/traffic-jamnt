var placesToRandom = 5;


var rand_lat;
var rand_lng;

function init() {
    initMap();
    initSearchBox();
}

function getLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            if (callback != null && callback !== undefined) callback(pos);
            window.currentLocation = pos;
            return;

        }, function () {

        });
    }
    return null;
}

function Locationize(latitute, longitude) {
    return {
        lat: latitute,
        lng: longitude
    };
}

function displayInfo(pos, message) {
    var infoWindow = new google.maps.InfoWindow;
    infoWindow.setPosition(pos);
    infoWindow.setContent(message);
    infoWindow.open(map);
}

function drawLine() {

    var locs = [];
    for (var i = 0; i < arguments.length; i++) {
        locs.push(arguments[i]);
    }

    var PolylinePath = new google.maps.Polyline({
        path: locs, // From a to b
        geodesic: false,
        strokeColor: '#FF2222',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    PolylinePath.setMap(map);
}

function combineLocation(loc1, loc2) {
    return {
        lat: loc1.lat + loc2.lat,
        lng: loc1.lng + loc2.lng
    };
}

function initMap() {

    var centerLocation = {
        lat: 13.736717,
        lng: 100.523186
    };

    getLocation(function (loc) {
        if (loc != null)
            centerLocation = loc;
    })

    map = new google.maps.Map(document.getElementById('map'), {
        center: centerLocation,
        zoom: 18,
        mapTypeId: 'roadmap',
        disableDefaultUI: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_TOP
        },
        fullscreenControl: true
    });


    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();
    //directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    directionsDisplay.setMap(map);

    getLocation(); //Fetch my location
}

function initSearchBox() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    var searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
        var places = searchBox.getPlaces();
        if (places.length === 0) {
            return;
        }
        selectedPlaceUpdated(places);

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function generateWaypointsFromLocation() {
    var waypoints = [];
    for (var i = 0; i < arguments.length; i++) {
        waypoints.push({
            location: arguments[i],
            stopover: false
        });
    }
    return waypoints;
}

function bugSprayOnStupidDot() {
    setTimeout(function () {
        clearStupidDot();
    }, 1);
    setTimeout(function () {
        clearStupidDot();
    }, 2);
    setTimeout(function () {
        clearStupidDot();
    }, 5);
    setTimeout(function () {
        clearStupidDot();
    }, 10);
    setTimeout(function () {
        clearStupidDot();
    }, 30);
    setTimeout(function () {
        clearStupidDot();
    }, 60);
    setTimeout(function () {
        clearStupidDot();
    }, 120);
    setTimeout(function () {
        clearStupidDot();
    }, 250);
    setTimeout(function () {
        clearStupidDot();
    }, 500);
    setTimeout(function () {
        clearStupidDot();
    }, 1000);
}

function clearStupidDot() {
    var imgs = document.getElementsByTagName("img");
    for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].src === "https://maps.gstatic.com/mapfiles/dd-via.png") {
            imgs[i].style.visibility = "hidden";
        }
    }
}

function calcRoute(_origin, _destination, _waypoints, showonmap, callback) {
    var request = {
        origin: _origin,
        destination: _destination,
        waypoints: _waypoints,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function (response, status) {
        callbackValid = (callback !== undefined && callback != null);

        if (status === 'OK') {
            window.directionQueryResponse = response;
            if (showonmap !== false) directionsDisplay.setDirections(response);
            window.response = response;
            bugSprayOnStupidDot();
            if (callbackValid) callback(true);
        }
        else {
            callback(false);
        }
    });
}

function selectedPlaceUpdated(places) {
    if (places.length !== 1) return;
    getLocation();
    loc2 = Locationize(places[0].geometry.location.lat(), places[0].geometry.location.lng());

    calcRoute(currentLocation, loc2, undefined, false, function (woo) {
        if (woo) {
            window.shortestRouteDistance = directionQueryResponse.routes[0].legs[0].distance;
        }
    });

    generateStupidRoute(false);
}

function randomLocation() {
    rand_lat = Math.floor(Math.random() * 7) - 3;
    rand_lng = Math.floor(Math.random() * 7) - 3;
    if (rand_lat === 0 || rand_lng === 0) {
        randomLocation();
        return;
    }
}


//exit variable use for concurrent call
function generateStupidRoute(exit) {
    if (exit === true) {
        newDistance = directionQueryResponse.routes[0].legs[0].distance;

        setTimeout(function () {

            alert("Hello there!\n" +
                "Originally you will have to travel for " + shortestRouteDistance.text + "\n" +

                "With our advanced algorithm you'll have to travel for just " + newDistance.text + "\n" +

                "We saved you " + ((shortestRouteDistance.value - newDistance.value) / 1000) + " km" + "\n" +
                "This shit is impressive, isn't it?"
            );
        }, 1000);
        return;
    }

    //Generate random waypoints
    var waypoints = [];
    for (var i = 0; i < placesToRandom; i++) {
        randomLocation();
        waypoints.push({
            location: combineLocation(currentLocation, Locationize(rand_lat, rand_lng)),
            stopover: false
        });
    }

    //Pass generateStupidRoute as a callback so if route generation failed, it will re-random and try to find new one
    calcRoute(currentLocation, loc2, waypoints, true, generateStupidRoute);
}

function startButton() {
    getLocation(function (a) {
        displayInfo(window.currentLocation, 'YOU ARE HERE');
    });
}
/*function drawLine() {

    var locs = [];
    for (var i = 0; i < arguments.length; i++) {
        locs.push(arguments[i]);
    }

    var PolylinePath = new google.maps.Polyline({
        path: locs, // From a to b
        geodesic: false,
        strokeColor: '#FF2222',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    PolylinePath.setMap(map);
}*/
