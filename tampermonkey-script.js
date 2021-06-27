// ==UserScript==
// @name         YouTube custom speeds
// @namespace    https://github.com/tomsaleeba
// @version      0.5
// @description  Adds a div to the YouTube player page with custom speed controls
// @author       Tom Saleeba
// @match        https://www.youtube.com/*
// @grant        unsafeWindow
// ==/UserScript==
/* jshint -W097 */
'use strict'
var className = 'speed-selector'
var maxFastnessAnchorId = 'max-fastness'
var adCheckerTimeout = 1000
var lsKeyPrefix = 'techotom.yt.'
var lsKeyUserSpeed = lsKeyPrefix + 'user-speed'
var lsKeyIsAdFF = lsKeyPrefix + 'is-ad-ff'

function resetBoldness() {
  var speedSelectors = document.getElementsByClassName(className)
  for (var i = 0; i < speedSelectors.length; i++) {
    var curr = speedSelectors[i]
    curr.style.fontWeight = 'normal'
  }
}

function setPlayerSpeed(newSpeed) {
  document.getElementsByClassName('html5-main-video')[0].playbackRate = newSpeed
}

function speedToClassName(speed) {
  return 'techotom-yt-' + (speed + '').replace('.', '-')
}

function appendSpeedControl(div, speed, idToUse) {
  var speedAnchor = document.createElement('a')
  speedAnchor.style.display = 'block'
  speedAnchor.onclick = function () {
    setPlayerSpeed(speed)
    resetBoldness()
    this.style.fontWeight = 'bold'
    var isAdTriggeredSpeedChange = localStorage.getItem(lsKeyIsAdFF)
    localStorage.removeItem(lsKeyIsAdFF)
    if (isAdTriggeredSpeedChange) {
      return
    }
    // only save the user's speed setting otherwise we end up
    // re-setting the speed from the ads
    localStorage.setItem(lsKeyUserSpeed, speed)
  }
  speedAnchor.classList.add('speed-selector')
  speedAnchor.classList.add(speedToClassName(speed))
  var label = document.createTextNode(speed + 'x')
  speedAnchor.appendChild(label)
  if (idToUse) {
    speedAnchor.id = idToUse
  }
  div.appendChild(speedAnchor)
}

var callCount = 0
function waitForTargetElement(callback) {
  callCount++
  log('Check #' + callCount + ' for target element')
  var strategies = [
    function ytdWatch() {
      return document.getElementsByTagName('ytd-watch')[0]
    },
    function playerContainer() {
      return document.getElementById('player-container')
    },
  ]
  var targetElement
  for (var i = 0; i < strategies.length; i++) {
    var currStrategy = strategies[i]
    targetElement = currStrategy()
    if (targetElement) {
      log('success with strategy: ' + currStrategy.name)
      break
    }
  }
  if (typeof targetElement !== 'undefined' && targetElement !== null) {
    callback(targetElement)
    return
  }
  var waitMs = Math.max(10 * callCount, 2000)
  setTimeout(function () {
    waitForTargetElement(callback)
  }, waitMs)
}

waitForTargetElement(function (targetElement) {
  var css =
    '.techotom-speed-control { opacity: 0.1; } .techotom-speed-control:hover { opacity: 0.8; }'
  var head = document.head || document.getElementsByTagName('head')[0]
  var style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)

  var div = document.createElement('div')
  div.classList = 'techotom-speed-control'
  div.style.position = 'absolute'
  div.style.margin = '6em 0 0 2em'
  div.style.fontSize = '2em'
  div.style.background = '#FFF'
  div.style.zIndex = '999'
  div.style.top = '0'
  div.style.left = '0'
  appendSpeedControl(div, 1)
  appendSpeedControl(div, 1.25)
  appendSpeedControl(div, 1.33)
  appendSpeedControl(div, 1.5)
  appendSpeedControl(div, 1.75)
  appendSpeedControl(div, 1.88)
  appendSpeedControl(div, 2)
  appendSpeedControl(div, 2.1)
  appendSpeedControl(div, 2.25)
  appendSpeedControl(div, 2.5)
  appendSpeedControl(div, 2.75)
  appendSpeedControl(div, 3)
  appendSpeedControl(div, 10, maxFastnessAnchorId)
  targetElement.insertBefore(div, targetElement.childNodes[0])
  scheduleAdCheck()
})

function autoFastForwardAds() {
  var classForOnlyVideoAds = 'ytp-ad-player-overlay' // .video-ads at the top level also includes footer ads
  var [adContainer] = document.getElementsByClassName(classForOnlyVideoAds)
  const isAdHidden = !adContainer || adContainer.offsetParent === null
  var speedAnchor = document.getElementById(maxFastnessAnchorId)
  if (isAdHidden || !speedAnchor) {
    scheduleAdCheck()
    useSavedPlaybackSpeed()
    return
  }
  log('ad is playing, time to fast forward!')
  localStorage.setItem(lsKeyIsAdFF, true)
  speedAnchor.click()
  scheduleAdCheck()
  var [skipButton] = document.getElementsByClassName('ytp-ad-skip-button')
  var isSkipButtonHidden = !skipButton || skipButton.offsetParent === null
  if (isSkipButtonHidden) {
    scheduleAdCheck()
    return
  }
  log('skip button is visible, click it!')
  skipButton.click()
}

function scheduleAdCheck() {
  setTimeout(autoFastForwardAds, adCheckerTimeout)
}

function useSavedPlaybackSpeed() {
  var savedSpeed = localStorage.getItem(lsKeyUserSpeed)
  if (!savedSpeed) {
    return
  }
  var existingSpeed = document.getElementsByClassName('html5-main-video')[0]
    .playbackRate
  if (parseFloat(existingSpeed) === parseFloat(savedSpeed)) {
    return
  }
  log('Using previously set playback speed: ' + savedSpeed)
  var speedAnchor = document.getElementsByClassName(
    speedToClassName(savedSpeed)
  )[0]
  if (!speedAnchor) {
    return
  }
  speedAnchor.click()
}

function log(msg) {
  var logPrefix = 'TechoTom custom speeds'
  unsafeWindow.console.debug('[' + logPrefix + '] ' + msg)
}
