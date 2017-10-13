/*
 * Copyright 2017 Anton Tananaev (anton@traccar.org)
 * Copyright 2017 Andrey Kunitsyn (andrey@traccar.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function(predicate) {
      var value;
      for (var i = 0; i < this.length; i++) {
        value = this[i];
        if (predicate.call(arguments[1], value, i, this)) {
          return value;
        }
      }
      return undefined;
    }
  });
}

var ajax = function (method, url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            callback(JSON.parse(xhr.responseText));
        }
    };
    if (method == 'POST') {
        xhr.setRequestHeader('Content-type', 'application/json');
    }
    xhr.send()
};

var onMarkerClick = function (e) {
    if (this !== selectedMarker) {
        if (selectedMarker) {
            selectedMarker.options.icon.updateZoom(false);
            selectedMarker.setZIndexOffset(0);
        }
        this.options.icon.updateZoom(true);
        this.setZIndexOffset(100000);
        selectedMarker = this;
    }
};

var onMapClick = function (e) {
    if (selectedMarker) {
        selectedMarker.options.icon.updateZoom(false);
        selectedMarker.setZIndexOffset(0);
        selectedMarker = null;
    }
}

var getPreference = function(server, user, key, defaultValue) {
    if (server.forceSettings) {
        return server[key] || user[key] || defaultValue;
    } else {
        return user[key] || server[key] || defaultValue;
    }
}

var url = window.location.protocol + '//' + window.location.host;
var token = (window.location.search.match(/token=([^&#]+)/) || [])[1];

var map = L.map('map').on('click', onMapClick);
L.control.scale().addTo(map);

var markers = {};
var selectedMarker;

ajax('GET', url + '/api/server', function(server) {
    ajax('GET', url + '/api/session?token=' + token, function(user) {

        switch (getPreference(server, user, 'map')) {
            case 'custom':
                L.tileLayer(server.mapUrl, {
                    attribution: ''
                }).addTo(map);
                break;
            case 'carto':
                L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
                        'contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                }).addTo(map);
                break;
            default:
                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                break;
        }

        map.setView(
            [getPreference(server, user, 'latitude', 0.0), getPreference(server, user, 'longitude', 0.0)],
            getPreference(server, user, 'zoom', 2)
        );

        var createWs = function (devices, first) {
            var socket = new WebSocket('ws' + url.substring(4) + '/api/socket');

            socket.onclose = function (event) {
                console.log('socket closed');
            };

            socket.onmessage = function (event) {
                var updatePositions = function (positions, first) {
                    var minLat, minLon, maxLat, maxLon, i;
                    for (i = 0; i < positions.length; i++) {
                        var position = positions[i];
                        var marker = markers[position.deviceId];
                        var point = [position.latitude, position.longitude];
                        if (!marker) {
                            var device = devices.find(function (device) { return device.id === position.deviceId });
                            marker = L.marker(point, {
                                icon: L.icon.deviceImage({
                                    category: device.category,
                                    status: device.status,
                                    course: position.course,
                                    label: device.name
                                })
                            }).on('click', onMarkerClick).addTo(map);
                            markers[position.deviceId] = marker;
                        } else {
                            marker.options.icon.updateCourse(position.course);
                            marker.setLatLng(point);
                        }
                        if (first) {
                            if (i === 0) {
                                minLat = maxLat = point[0];
                                minLon = maxLon = point[1];
                            } else {
                                minLat = Math.min(point[0], minLat);
                                minLon = Math.min(point[1], minLon);
                                maxLat = Math.max(point[0], maxLat);
                                maxLon = Math.max(point[1], maxLon);
                            }
                        }
                    }
                    if (first && getPreference(server, user, 'latitude', 0) === 0 &&
                            getPreference(server, user, 'longitude', 0) === 0 &&
                            getPreference(server, user, 'zoom', 0) === 0) {
                        map.fitBounds([
                            [minLat, minLon],
                            [maxLat, maxLon]
                        ]);
                    }
                        
                };
                var data = JSON.parse(event.data);
                if (data.positions) {
                    updatePositions(data.positions, first);
                    first = false;                }
                if (data.devices) {
                    for (var i = 0; i < data.devices.length; i++) {
                        var device = data.devices[i];
                        var marker = markers[device.id];
                        if (marker) {
                            marker.options.icon.updateStatus(device.status);
                            marker.options.icon.updateLabel(device.name);
                        }
                    }
                }
            };
        };

        ajax('GET', url + '/api/devices', function(devices) {
            createWs(devices, true);
        });
    });
});
