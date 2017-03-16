// ==UserScript==
// @name         YouTube custom speeds
// @namespace    http://techotom.wordpress.com
// @version      0.1
// @description  try to take over the world!
// @author       Tom Saleeba
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

var page = document.getElementById("page");
var div = document.createElement("div");
div.style.position = "fixed";
div.style.margin = "1em";
div.style.fontSize = "1.5em";
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
page.insertBefore(div, page.childNodes[0]);
