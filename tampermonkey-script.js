// ==UserScript==
// @name         YouTube custom speeds
// @namespace    https://github.com/tomsaleeba
// @version      0.8
// @description  Adds a div to the YouTube player page with custom speed controls
// @author       Tom Saleeba
// @match        https://www.youtube.com/*
// @grant        unsafeWindow
// ==/UserScript==
/* jshint -W097 */

const maxFastnessAnchorId = 'max-fastness'
const mainLoopInterval = 1000
const lsKeyPrefix = 'techotom.yt.'
const lsKeyUserSpeed = `${lsKeyPrefix}user-speed`
const lsKeyIsAdFF = `${lsKeyPrefix}is-ad-ff`
let panner = null

function resetBoldness(className) {
  const speedSelectors = document.getElementsByClassName(className)
  for (let i = 0; i < speedSelectors.length; i += 1) {
    const curr = speedSelectors[i]
    curr.style.fontWeight = 'normal'
  }
}

function log(msg) {
  const logPrefix = 'TechoTom custom speeds'
  unsafeWindow.console.debug(`[${logPrefix}] ${msg}`)
}

function setPlayerSpeed(newSpeed) {
  document.getElementsByClassName('html5-main-video')[0].playbackRate = newSpeed
}

function speedToClassName(speed) {
  return `techotom-yt-${`${speed}`.replace('.', '-')}`
}

function appendSpeedControl(div, speed, idToUse) {
  const className = 'speed-selector'
  const speedAnchor = document.createElement('a')
  speedAnchor.style.display = 'block'
  speedAnchor.onclick = function handler() {
    setPlayerSpeed(speed)
    resetBoldness(className)
    this.style.fontWeight = 'bold'
    const isAdTriggeredSpeedChange = localStorage.getItem(lsKeyIsAdFF)
    localStorage.removeItem(lsKeyIsAdFF)
    if (isAdTriggeredSpeedChange) {
      return
    }
    // only save the user's speed setting otherwise we end up
    // re-setting the speed from the ads
    localStorage.setItem(lsKeyUserSpeed, speed)
  }
  speedAnchor.classList.add(className)
  speedAnchor.classList.add(speedToClassName(speed))
  const label = document.createTextNode(`${speed}x`)
  speedAnchor.appendChild(label)
  if (idToUse) {
    speedAnchor.id = idToUse
  }
  div.appendChild(speedAnchor)
}

function appendBalanceControl(div, label, valToUse) {
  const className = 'balance-selector'
  const balanceAnchor = document.createElement('a')
  balanceAnchor.style.display = 'block'
  balanceAnchor.onclick = function handler() {
    resetBoldness(className)
    this.style.fontWeight = 'bold'
    const isPannerInited = !!panner
    if (!isPannerInited) {
      log('Initialising panner')
      const audioCtx = new (unsafeWindow.AudioContext ||
        unsafeWindow.webkitAudioContext)()
      const myVideo = document.querySelector('video')
      const source = audioCtx.createMediaElementSource(myVideo)
      panner = audioCtx.createStereoPanner()
      source.connect(panner).connect(audioCtx.destination)
    }
    log(`Panning to ${label} (${valToUse})`)
    panner.pan.value = valToUse
  }
  balanceAnchor.classList.add(className)
  balanceAnchor.appendChild(document.createTextNode(label))
  div.appendChild(balanceAnchor)
}

let callCount = 0
function waitForTargetElement(callback) {
  callCount += 1
  log(`Check #${callCount} for target element`)
  const strategies = [
    function noId() {
      return document.querySelectorAll('.html5-video-player')[0]
    },
    function ytdWatch() {
      return document.getElementsByTagName('ytd-watch')[0]
    },
    function playerContainer() {
      return document.getElementById('player-container')
    },
  ]
  let targetElement
  for (let i = 0; i < strategies.length; i += 1) {
    const currStrategy = strategies[i]
    targetElement = currStrategy()
    if (targetElement) {
      log(`success with strategy: ${currStrategy.name}`)
      break
    }
  }
  if (typeof targetElement !== 'undefined' && targetElement !== null) {
    callback(targetElement)
    return
  }
  const waitMs = Math.max(10 * callCount, 2000)
  setTimeout(() => {
    waitForTargetElement(callback)
  }, waitMs)
}

function appendCss() {
  const css = `
    .techotom-speed-control, .techotom-balance-control {
      opacity: 0.1;
      color: #000;
    }
    .techotom-speed-control:hover, .techotom-balance-control:hover {
      opacity: 0.8;
    }
    .techotom-speed-control a.speed-selector:hover, .techotom-balance-control a.balance-selector:hover {
      color: #4f4f4f;
    }
  `
  const head = document.head || document.getElementsByTagName('head')[0]
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

function addCommonStyles(div) {
  div.style.position = 'absolute'
  div.style.fontSize = '2em'
  div.style.background = '#FFF'
  div.style.zIndex = '999'
  div.style.top = '0'
  div.style.left = '0'
  div.style.borderRadius = '5px'
}

function appendSpeedControlContainer(targetElement) {
  const div = document.createElement('div')
  div.classList = 'techotom-speed-control'
  addCommonStyles(div)
  div.style.margin = '6em 0 0 2em'
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
}

function appendBalanceControlContainer(targetElement) {
  const div = document.createElement('div')
  div.classList = 'techotom-balance-control'
  addCommonStyles(div)
  div.style.margin = '1em 0 0 2em'
  appendBalanceControl(div, 'centre', 0)
  appendBalanceControl(div, 'left', -1)
  appendBalanceControl(div, 'right', 1)
  targetElement.insertBefore(div, targetElement.childNodes[0])
}

function useSavedPlaybackSpeed() {
  const savedSpeed = localStorage.getItem(lsKeyUserSpeed)
  if (!savedSpeed) {
    return
  }
  const existingSpeed =
    document.getElementsByClassName('html5-main-video')[0].playbackRate
  if (parseFloat(existingSpeed) === parseFloat(savedSpeed)) {
    return
  }
  log(`Using previously set playback speed: ${savedSpeed}`)
  const speedAnchor = document.getElementsByClassName(
    speedToClassName(savedSpeed),
  )[0]
  if (!speedAnchor) {
    return
  }
  speedAnchor.click()
}

function autoFastForwardAds() {
  const classForOnlyVideoAds = 'ytp-ad-player-overlay' // .video-ads at the top level also includes footer ads
  const [adContainer] = document.getElementsByClassName(classForOnlyVideoAds)
  const isAdHidden = !adContainer || adContainer.offsetParent === null
  const speedAnchor = document.getElementById(maxFastnessAnchorId)
  if (isAdHidden || !speedAnchor) {
    useSavedPlaybackSpeed()
    return
  }
  log('ad is playing, time to fast forward!')
  localStorage.setItem(lsKeyIsAdFF, true)
  speedAnchor.click()
  const [skipButton] = document.getElementsByClassName('ytp-ad-skip-button')
  const isSkipButtonHidden = !skipButton || skipButton.offsetParent === null
  if (isSkipButtonHidden) {
    return
  }
  log('skip button is visible, click it!')
  skipButton.click()
  // FIXME disable check for ads from now on?
}

function clickBtnIfVisible(className, niceName) {
  const [btn] = document.getElementsByClassName(className)
  // FIXME might need .offsetParent stuff?
  if (!btn || btn.offsetParent === null) {
    return
  }
  log(`${niceName} button found, clicking`)
  btn.click()
}

function cancelStupidAutoplay() {
  clickBtnIfVisible(
    'ytp-autonav-endscreen-upnext-cancel-button',
    'autoplay cancel',
  )
}

function skipSurvey() {
  clickBtnIfVisible('ytp-ad-skip-button ytp-button', 'skip survey')
}

function skipPremiumTrial() {
  const niceName = 'Skip trial'
  const [btn] = document.querySelectorAll('#button[aria-label="Skip trial"]')
  if (!btn || btn.offsetParent === null) {
    return
  }
  log(`${niceName} button found, clicking`)
  btn.click()
}

function fadeAdOverlay() {
  const [thingy] = document.querySelectorAll('.ytp-ad-overlay-container')
  if (!thingy || thingy.offsetParent === null) {
    return
  }
  thingy.style.opacity = '0.1'
}

function runMainLoop() {
  function worker() {
    autoFastForwardAds()
    cancelStupidAutoplay()
    skipSurvey()
    skipPremiumTrial()
    fadeAdOverlay()
  }
  /* const intervalThingy = */ setInterval(worker, mainLoopInterval)
  // FIXME do we need to clearInterval(intervalThingy) ?
}

waitForTargetElement((targetElement) => {
  appendCss()
  appendSpeedControlContainer(targetElement)
  appendBalanceControlContainer(targetElement)
  runMainLoop()
})
