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
'use strict';
L.Icon.DeviceImage = L.DivIcon.extend({

    options: {
        zoomRatio: 1.5,
        labelShift: 18
    },

    createIcon: function () {
        var options = this.options, div = L.DomUtil.create('div', 'traccar-device');

        if (this.options.label) {
            div.appendChild(this._createLabel(options.label));
        }

        div.appendChild(this._createIcon(options.category ? options.category : 'default'));

        if (options.color) {
            this._updateFillColor(options.color);
        } else if (options.status) {
            this._updateFillClass(options.status);
        } else {
            this._updateFillColor('#008000');
        }

        if (options.course) {
            this._updateTransform(options.course);
        }

        this._updateScale(options.selected);

        return div;
    },

    updateStatus: function (status) {
        if (status !== this._status) {
            this._updateFillClass(status);
            this._status = status;
        }
    },

    updateCourse: function (course) {
        if (course !== this._course) {
            this._updateTransform(course);
            this._course = course;
        }
    },

    updateZoom: function (zoom) {
        if (zoom !== this._zoom) {
            this._updateScale(zoom);
            this._zoom = zoom;
        }
    },

    updateLabel: function (text) {
        if (this._label.textContent !== text) {
            this._label.textContent = text;
        }
    },

    /* eslint no-underscore-dangle: "error" */
    _updateFillClass: function (status) {
        var statusClass;
        switch (status) {
            case 'online':
                statusClass = 'device-online';
                break;
            case 'offline':
                statusClass = 'device-offline';
                break;
            default:
                statusClass = 'device-unknown';
                break;
        }
        this._background.setAttribute('class', statusClass);
    },

    _updateFillColor: function (color) {
        this._background.setAttribute('style', 'fill:' + color + ';');
    },

    _updateTransform: function (angle) {
        var bgPath = this._background.getElementById('background');
        bgPath.setAttribute('transform', 'rotate(' + (angle ? angle : '0') + ' 20 20)');
    },

    _updateScale: function (zoom) {
        var shift;
        this._container.setAttribute('style', 'transform: scale(' + (zoom ? this.options.zoomRatio : 1) + ')');
        if (this._label) {
            shift = this.options.labelShift * (this.options.category === 'arrow' ? 0.6 : 1) *
                (zoom ? this.options.zoomRatio : 1);
            this._label.setAttribute('style', 'margin-top: -' + shift + 'px');
        }
    },

    _createIcon: function (category) {
        var background, iconObject, containerDiv = L.DomUtil.create('div', 'traccar-device-image');

        if (category === 'arrow') {
            background = document.createElement('div');
            background.className = 'traccar-device-background';
            background.innerHTML = '<svg ' +
                'viewBox="0 0 40 40"' +
                'version="1.1" ' +
                'xmlns="http://www.w3.org/2000/svg" ' +
                'xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '<polygon points="19,10 25,28 19,25 13,28"' +
                'style="stroke:#000000;stroke-width:1px;pointer-events:all;"' +
                'id=background />' +
                '</svg>';
        } else {
            iconObject = L.DomUtil.create('object', 'traccar-device-image traccar-device-icon');
            iconObject.data = 'images/' + category + '.svg';
            iconObject.type = 'image/svg+xml';

            background = document.createElement('div');
            background.className = 'traccar-device-background';
            background.innerHTML = '<svg ' +
                'viewBox="0 0 40 40"' +
                'version="1.1" ' +
                'xmlns="http://www.w3.org/2000/svg" ' +
                'xmlns:xlink="http://www.w3.org/1999/xlink">' +
                '<path d="M 20.001953 3.6816406 L 18.871094 7.0722656 A 12.37437 12.37437 0 0 1 20.001953 7.0097656 A 12.37437 12.37437 0 0 1 21.130859 7.0664062 ' +
                'L 20.001953 3.6816406 z M 20 7.625 A 12.37437 12.37437 0 0 0 7.625 20 A 12.37437 12.37437 0 0 0 20 32.375 A 12.37437 12.37437 0 0 0 32.375 20 ' +
                'A 12.37437 12.37437 0 0 0 20 7.625 z "' +
                'style="fill-opacity:1;stroke:#333333;stroke-width:1.89999998;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;pointer-events:all;"' +
                'id=background></path>' +
                '</svg>';
        }

        this._background = background.getElementsByTagName('svg')[0];

        containerDiv.appendChild(background);
        if (iconObject) {
            containerDiv.appendChild(iconObject);
        }
        this._container = containerDiv;

        return containerDiv;
    },

    _createLabel: function (text) {
        var textSpan = L.DomUtil.create('span', 'traccar-device-label');
        textSpan.textContent = text;
        this._label = textSpan;
        return textSpan;
    }
    /* eslint no-underscore-dangle: "off" */
});

L.icon.deviceImage = function (options) {
    return new L.Icon.DeviceImage(options);
};
