// ==UserScript==
// @name         YouTube custom speeds
// @namespace    https://github.com/tomsaleeba
// @version      0.2
// @description  Adds a div to the YouTube player page with custom speed controls
// @author       Tom Saleeba
// @match        https://www.youtube.com/*
// @grant        unsafeWindow
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

var callCount = 0;
var maxCallCount = 50;
function waitForTargetElement (callback) {
    callCount++;
    unsafeWindow.console.log('Check ' + callCount + '/' + maxCallCount + ' for target element');
    if (callCount > maxCallCount) {
        return;
    }
    var targetElement = document.getElementsByTagName('ytd-watch')[0];
    if (typeof targetElement !== 'undefined') {
        callback(targetElement);
        return;
    }
    setTimeout(function () {
        waitForTargetElement(callback);
    }, 100);
}

waitForTargetElement(function (targetElement) {
    var css = '.techotom-speed-control { opacity: 0.1; } .techotom-speed-control:hover { opacity: 0.8; }';
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);

    var div = document.createElement("div");
    div.classList = 'techotom-speed-control';
    div.style.position = "absolute";
    div.style.margin = "6em 0 0 2em";
    div.style.fontSize = "2em";
    div.style.background = "#FFF";
    div.style.zIndex = "999";
    div.style.top = "0";
    div.style.left = "0";
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
    targetElement.insertBefore(div, targetElement.childNodes[0]);
});
