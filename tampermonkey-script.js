// ==UserScript==
// @name         YouTube custom speeds
// @namespace    https://blog.techotom.com
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==
/* jshint -W097 */
'use strict';
var console = console || {};
var className = 'speed-selector';
function resetBoldness() {
    var speedSelectors = document.getElementsByClassName(className);
    for (var i = 0;i < speedSelectors.length;i++) {
        var curr = speedSelectors[i];
        curr.style.fontWeight = 'normal';
    }
}

function appendSpeedControl(div, speed) {
    var speedAnchor = document.createElement("a");
    speedAnchor.style.display = "block";
    speedAnchor.onclick = function() {
        document.getElementsByClassName('html5-main-video')[0].playbackRate = speed;
        resetBoldness();
        this.style.fontWeight = "bold";
    };
    speedAnchor.classList.add('speed-selector');
    var label = document.createTextNode(speed + "x");
    speedAnchor.appendChild(label);
    div.appendChild(speedAnchor);
}

var body = document.getElementsByTagName('body')[0];
var div = document.createElement("div");
div.style.position = "fixed";
div.style.margin = "6em 0 0 2em";
div.style.fontSize = "2em";
div.style.background = "#FFF";
div.style.zIndex = "2";
appendSpeedControl(div, 1);
appendSpeedControl(div, 1.25);
appendSpeedControl(div, 1.33);
appendSpeedControl(div, 1.5);
appendSpeedControl(div, 1.75);
appendSpeedControl(div, 1.88);
appendSpeedControl(div, 2);
appendSpeedControl(div, 2.1);
appendSpeedControl(div, 2.25);
appendSpeedControl(div, 2.5);
appendSpeedControl(div, 2.75);
appendSpeedControl(div, 3);
appendSpeedControl(div, 10);
body.insertBefore(div, body.childNodes[0]);