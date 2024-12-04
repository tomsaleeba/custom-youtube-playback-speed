// ==UserScript==
// @name         YouTube custom speeds
// @namespace    https://github.com/tomsaleeba
// @version      0.91
// @description  Adds a div to the YouTube player page with custom speed controls
// @author       Tom Saleeba
// @match        https://www.youtube.com/*
// @grant        unsafeWindow
// ==/UserScript==
/* jshint -W097 */

const adFastFordwardAnchorId = 'ad-ff-speed'
const mainLoopInterval = 1000
const ssKeyPrefix = 'techotom.yt.'
const ssKeyUserSpeed = `${ssKeyPrefix}user-speed`
const ssKeyIsAdFF = `${ssKeyPrefix}is-ad-ff`
let panner = null
const isTrace = false

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

function trace(msg) {
  if (!isTrace) {
    return
  }
  log(` [TRACE] ${msg}`)
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
    const isAdTriggeredSpeedChange = sessionStorage.getItem(ssKeyIsAdFF)
    sessionStorage.removeItem(ssKeyIsAdFF)
    if (isAdTriggeredSpeedChange) {
      return
    }
    // only save the user's speed setting otherwise we end up
    // re-setting the speed from the ads
    sessionStorage.setItem(ssKeyUserSpeed, speed)
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
      return document.querySelectorAll('body ytd-app #content')[0]
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
  div.style.margin = '5em 0 0 2em'
  appendSpeedControl(div, 1)
  appendSpeedControl(div, 1.75)
  appendSpeedControl(div, 1.88)
  appendSpeedControl(div, 2, adFastFordwardAnchorId)
  appendSpeedControl(div, 2.1)
  appendSpeedControl(div, 2.25)
  appendSpeedControl(div, 2.5)
  appendSpeedControl(div, 2.75)
  appendSpeedControl(div, 3)
  appendSpeedControl(div, 10)
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

function isLiveBroadcast() {
  const watch7content = document.getElementById('watch7-content')
  if (!watch7content) {
    return false
  }
  if (watch7content.getElementsByTagName('span').length === 2) {
    return false
  }
  const span3 = watch7content.getElementsByTagName('span')[2]
  // live broadcasts that haven't ended yet
  if (
    span3.querySelector('meta[itemprop=startDate]') &&
    !span3.querySelector('meta[itemprop=endDate]')
  ) {
    return true
  }
  const videoEndDateTime = span3
    .querySelector('meta[itemprop=endDate]')
    .content.slice(0, 19)
  const currentDateTime = new Date().toISOString().slice(0, 19)
  if (currentDateTime > videoEndDateTime) {
    return false
  }
  return (
    span3.querySelector('meta[itemprop=isLiveBroadcast]').content === 'True'
  )
}

function useSavedPlaybackSpeed() {
  if (isLiveBroadcast()) {
    return
  }
  const savedSpeed = sessionStorage.getItem(ssKeyUserSpeed)
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

function clickButtonIfClickable(btn, niceName) {
  if (!btn || btn.offsetParent === null) {
    return
  }
  log(`${niceName} button found, clicking`)
  btn.click()
}

function clickBtnIfVisible(className, niceName) {
  const [btn] = document.getElementsByClassName(className)
  clickButtonIfClickable(btn, niceName)
}

function clickBtnIfVisibleQS(querySelector, niceName) {
  const [btn] = document.querySelectorAll(querySelector)
  clickButtonIfClickable(btn, niceName)
}

function autoFastForwardAds() {
  const speedAnchor = document.getElementById(adFastFordwardAnchorId)
  if (!speedAnchor) {
    trace('no speed anchor')
    // don't control the player when the human can't control us
    return
  }
  const classForOnlyVideoAds = 'ad-showing'
  const [adContainer] = document.getElementsByClassName(classForOnlyVideoAds)
  const isAdHidden = !adContainer || adContainer.offsetParent === null
  if (isAdHidden) {
    trace('ad *is* hidden')
    useSavedPlaybackSpeed()
    assertMuteState(false)
    return
  }
  sessionStorage.setItem(ssKeyIsAdFF, true)
  assertMuteState(true)
  log('ad is playing, time to fast forward!')
  speedAnchor.click()
  log('ad is playing, waiting for clickable skip button!')
  clickBtnIfVisible('ytp-ad-skip-button', 'old skip button')
  clickBtnIfVisible('ytp-ad-skip-button-modern', '2024-feb skip button')
  clickBtnIfVisible('ytp-skip-ad-button', '2024-jun skip button')
  clickBtnIfVisibleQS(
    'button[id="skip-button:x"]',
    '2024-jun skip button (by ID)',
  )
  // FIXME disable check for ads from now on?
}

function assertMuteState(isMute) {
  const muteButton = document.querySelector('.ytp-mute-button')
  const currMuteState = muteButton.title.startsWith('Unmute')
  trace(JSON.stringify({ currMuteState, isMute }))
  if (currMuteState === isMute) {
    return
  }
  muteButton.click()
}

function cancelStupidAutoplay() {
  clickBtnIfVisible(
    'ytp-autonav-endscreen-upnext-cancel-button',
    'autoplay cancel',
  )
}

function skipSurvey() {
  clickBtnIfVisible('ytp-ad-skip-button', 'skip survey')
  clickBtnIfVisible('ytp-ad-skip-button-modern', 'new skip survey')
}

function skipPremiumTrial() {
  const niceName = 'Skip premium trial'
  clickBtnIfVisibleQS('button[aria-label="No thanks"]', niceName)
}

function skipMusicPremiumTrial() {
  const niceName = 'Skip music premium trial'
  clickBtnIfVisibleQS('button[aria-label="Skip trial"]', niceName)
}

function premiumNoThanks() {
  const niceName = 'No thanks premium'
  clickBtnIfVisibleQS('ytd-mealbar-promo-renderer #dismiss-button', niceName)
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
    skipMusicPremiumTrial()
    premiumNoThanks()
    fadeAdOverlay()
  }
  // "Ad blockers are not allowed on YouTube" modal
  // document.querySelector('.ytd-enforcement-message-view-model') - the modal
  // document.querySelector('yt-button-view-model[icon="COUNTDOWN_TO_CLOSE"]').click() - close button (after timer has expired)
  // need to click play on the ad again too
  setInterval(worker, mainLoopInterval)
  // FIXME do we need to clearInterval() ?
}

waitForTargetElement((targetElement) => {
  appendCss()
  appendSpeedControlContainer(targetElement)
  appendBalanceControlContainer(targetElement)
  runMainLoop()
})
