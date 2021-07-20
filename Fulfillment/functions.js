/* IMPORTS */
const axios = require('axios');

/* CONSTANTS */
const serviceSite = "SERVICESITE" /* where the service is hosted */



function parseChords(inputChords){ /* cannot send arrays as param in get, parse before sending */
  if(inputChords == undefined || inputChords.length == 0)
    return ""
  else
    return inputChords.join("-");
}

// CHECK IF DOUBLE REQUIRED
exports.isDouble = (trackInfo) => {
  options = ["veryhigh","high","medium","low","verylow"]
  if((trackInfo.chords == "" || trackInfo.chords == undefined) &&
      (trackInfo.tuning == "" || trackInfo.tuning == undefined) &&
      (trackInfo.tonality == "" || trackInfo.tonality == undefined) &&
      (options.includes(trackInfo.speed) || trackInfo.speed == "" || trackInfo.speed == undefined))
    return false
  else 
    return true
}

exports.waitTime = (isDouble, trackParams) => {
  // ANALYSIS API SERVER ALWAYS TAKES A LOT TO RETURN THE RESPONSE
  let seconds = 0;
  if(isDouble){
	// API NOT RELIABLE ENOUGH
    /*
    let options = ["veryhigh","high","medium","low","verylow"]
    if(trackParams.tuning != undefined && trackParams.tuning != ""){
      seconds = Math.max(seconds, 60)
    }
    if(trackParams.chords != undefined && trackParams.chords != ""){
      seconds = Math.max(seconds, 330)
    }
    if(trackParams.tonality != undefined && trackParams != ""){
      seconds = Math.max(seconds, 330)
    }
    if(trackParams.speed != undefined && !options.includes(trackParams.speed)){
      seconds = Math.max(seconds, 330)
    }else{
      seconds = Math.max(seconds, 60)
    }
    */
    seconds = 330
  }else{
    seconds = 1
  }
  let timeObject = {
    url: serviceSite+"audioTracks/"+seconds+"secondsofsilence.mp3",
    time: seconds
  }
  return timeObject
}

// SONG FETCHING FUNCTIONS
exports.requestTracksReplacement = (trackParams) => {
  axios.get(serviceSite+"requestReplacement", {
    params: {
      order: trackParams.order_by,
      mood: trackParams.mood,
      genre: trackParams.genre,
      speed: trackParams.speed
    }
  })
}

exports.requestTracksDouble = (trackParams) => {
  axios.get(serviceSite+"requestDouble", {
    params: {
      order: trackParams.order_by,
      mood: trackParams.mood,
      genre: trackParams.genre,
      speed: trackParams.speed,
      chords: parseChords(trackParams.chords),
      tuning: trackParams.tuning,
      tonality: trackParams.tonality
    }
  })
}

exports.getTracksReplacement = async () => {
  const responseService = await axios.get(serviceSite+"responseReplacement")
  if(Array.isArray(responseService.data)){
    return responseService.data
  }else{
    return "NoData"
  }
}

exports.getTracksDouble = async () => {
  const responseService = await axios.get(serviceSite+"responseDouble")
  if(Array.isArray(responseService.data)){
    return responseService.data
  }else{
    return "NoData"
  }
}
