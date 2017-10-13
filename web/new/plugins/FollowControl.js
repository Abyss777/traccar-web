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
L.Control.FollowControl = L.Control.extend({

    options: {
        position: 'topright',
        followText: '<i class="fa fa-crosshairs" aria-hidden="true"></i>'
    },

    /* eslint no-underscore-dangle: "error" */
    _onClick: function () {
        this.pressed = !this.pressed;
        if (this.pressed) {
            this._container.classList.add('traccar-follow-pressed');
        } else {
            this._container.classList.remove('traccar-follow-pressed');
        }
        if (typeof this.options.handler === 'function') {
            this.options.handler.call(this);
        }
    },

    onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            options = this.options,
            link = L.DomUtil.create('a', 'leaflet-control-zoom-in', container);
        link.innerHTML = options.followText;
        link.href = '#';
        link.title = 'Follow';

        /*
        * Will force screen readers like VoiceOver to read this as "Follow - button"
        */
        link.setAttribute('aria-label', 'Follow');
        link.setAttribute('role', 'button');

        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', L.DomEvent.stop);
        L.DomEvent.on(link, 'click', this._onClick, this);

        this._link = link;
        return container;
    },

    onRemove: function () {
        L.DomEvent.off(this._link);
    }
    /* eslint no-underscore-dangle: "off" */

});

L.control.followControl = function (options) {
    return new L.Control.FollowControl(options);
};
