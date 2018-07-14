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
            if (callback != null && callback != undefined) callback(pos);
            window.currentLocation = pos;
            return;

        }, function () {

        });
    }
    return null;
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
    return {lat: loc1.lat + loc2.lat, lng: loc1.lng + loc2.lng};
}

function initMap() {

    var centerLocation = {lat: 13.736717, lng: 100.523186};

    getLocation(function (loc) {
        if (loc != null)
            centerLocation = loc;
    })

    map = new google.maps.Map(document.getElementById('map'), {
        center: centerLocation,
        zoom: 9,
        mapTypeId: 'roadmap',
        disableDefaultUI: false
    });

}

function initSearchBox() {
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
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

        if (places.length == 0) {
            return;
        }

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