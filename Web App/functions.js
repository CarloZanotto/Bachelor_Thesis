const axios = require('axios');
const clientID = "CLIENT ID";

/* INPUT PARSING FUNCTIONS */
function parseMood(inputMood){
	var outputMood;
	switch(inputMood){
		case "relaxed":
			outputMood = "neutral";
			break;
		case "sad":
			outputMood = "sad";
			break;
		case "happy":
			outputMood = "happy";
			break;
		case "aggressive":
			outputMood = "neutral";
			break;
    default:
      outputMood = "";
      break;
	}
	return outputMood;
};

function parseOrdering(inputOrder){
	var outputOrder;
	if(inputOrder == "lowest ranked"){
		outputOrder = "relevance_asc";
	}else{
		outputOrder = "relevance_desc";
	}
	return outputOrder;
};

function parseBoost(inputBoost){
	var outputBoost;
	switch(inputBoost){
		case "popularity":
			outputBoost = "popularity_week";
			break;
		default:
			outputBoost = "";
			break;
	}
	return outputBoost;
};

function parseSpeed(inputSpeed){
  options = ["veryhigh","high","medium","low","verylow"]
  if(options.includes(inputSpeed))
    return inputSpeed; // REPLACEMENT
  else
    if(inputSpeed == "")
      return ""
    else if(Number(inputSpeed) <= 65)
      return "verylow";
    else if(Number(inputSpeed) > 65 && Number(inputSpeed) <= 75)
      return "low";
    else if(Number(inputSpeed) > 75 && Number(inputSpeed) <= 120)
      return "medium";
    else if(Number(inputSpeed) > 120 && Number(inputSpeed) <= 175)
      return "high";
    else if(Number(inputSpeed) > 176)
      return "veryhigh";
    else
      return "" // NO INPUT
    ;  
};

function parseBPM(inputBPM){
  options = ["veryhigh","high","medium","low","verylow"]
  if(inputBPM == "" || inputBPM == undefined)
    return "";
  else if(options.includes(inputBPM)){
    var retVal
    switch(inputBPM){
        case "verylow":
            retVal = "20-65"
        case "low":
            retVal = "66-75"
        case "medium":
            retVal = "76-119"
        case "veryhigh":   
            retVal = "176-240"
        case "high":
            retVal = "120-175"
    }
    return retVal   //DOUBLE
  }
  else
    return (parseInt(inputBPM)-2).toString()+"-"+(parseInt(inputBPM)+2).toString(); //DOUBLE
}

function parseTuning(inputTuning){
  if(inputTuning == "" || inputTuning == undefined)
    return "";
  else
    return (parseFloat(inputTuning)-0.5).toString()+"-"+(parseFloat(inputTuning)+0.5).toString();
};

// NOT NEEDED, PARSING ALREADY DONE BY FULFILLMENT
function parseChords(inputChords){
  if(inputChords == undefined || inputChords.length == 0)
    return ""
  else
    return inputChords.join("-");
}

function parseGenre(inputGenre){
  if(inputGenre == undefined)
    return ""
  else
    return inputGenre
}

function parseTonality(inputTonality){
  if(inputTonality == undefined || inputTonality == "")
    return "";
  else
    return inputTonality;
}

// GENERATE TRACK INFO
exports.parseParamsReplacement = (params) => {
  trackInfo = {
		order_by: parseOrdering(params.order_by),
		boost: parseBoost(params.order_by),
    tags: parseGenre(params.genre),
		fuzzytags: parseMood(params.mood),
		speed: parseSpeed(params.speed),
	};
	// Return Object
	return trackInfo;
}

exports.parseParamsDouble = (params) => {
  trackInfo = {
    order_by: parseOrdering(params.order_by),
		boost: parseBoost(params.order_by),
		tags: parseGenre(params.genre),
    fuzzytags: parseMood(params.mood),
    bpm: parseBPM(params.bpm),
		chords: params.chords,
    tuning: parseTuning(params.tuning),
    tonality: parseTonality(params.tonality),
	};
	// Return Object
	return trackInfo;
}

//////////////////////////////////////////////////////
exports.getTracksReplacement = async (trackInfo) => {
	console.log(trackInfo)
  var response = await axios ({
	  url: "https://api.jamendo.com/v3.0/tracks",
		params: {
      //Request params
			client_id: clientID,
			format: "jsonpretty",
			offset: 0,
			limit: "3",
			include: "musicinfo",
			type: "single albumtrack",
			audioformat: "mp32",
			audiodlformat: "mp32",
      //User derived params
      order: trackInfo.order_by,
      tags: trackInfo.tags,
			fuzzytags: trackInfo.fuzzytags,
			speed: trackInfo.speed,
			boost: trackInfo.boost,
		},
	  method: "GET"
  });
  let trackListReplacement = [];
  if(response.data.results == undefined || response.data.results.length == 0)
    trackListReplacement = "Non esiste"
  else{
    for(let track of response.data.results){
      let trackEssentials = {
        name: track.name,
        artist_name: track.artist_name,
        audio: track.audio,
        image: track.image,
        musicinfo: track.musicinfo
      }
      trackListReplacement.push(trackEssentials);
    }
  }
  return trackListReplacement
}

exports.getTracksDouble = async (trackInfo) => {
  console.log(trackInfo)
  result_size = 120;
  var responseAnalysis = await axios ({
    url: "https://audio-analysis.eecs.qmul.ac.uk/function/search/audiocommons/"+result_size,
    params: {
    namespaces: "jamendo-tracks",
    // User specified params
    tempo: trackInfo.bpm,
    tuning: trackInfo.tuning,
    "global-key" : trackInfo.tonality,
    chords: trackInfo.chords
    },
    method: "GET"
  });
  var songsID;
  if(!(Array.isArray(responseAnalysis.data))){
    songsID = []
  }else{
    // Create the array of song ids
    songsID = [];
    responseAnalysis.data.forEach(function(elem){
      songsID.push(elem.id.split(":")[1])
    });
    console.log(songsID)
    console.log(trackInfo)
  }
  return songsID
}

// FETCH FROM ID
exports.getID = async (songIDs, trackInfo) => {
  responseJam = await axios ({
  url: "https://api.jamendo.com/v3.0/tracks",
    params: {
      client_id: clientID,
      offset: 0,
      limit: "4",
      include: "musicinfo",
      type: "single albumtrack",
      audioformat: "mp32",
      audiodlformat: "mp32",
      tags: trackInfo.tags,
      fuzzytags: trackInfo.fuzzy,
      boost: trackInfo.boost,
      // User specified tracks from previous call
      id: songIDs,
    },
    method: "GET"
  })

  var response = responseJam.data.results

  let trackListDouble = [];
  if(response == undefined || !Array.isArray(response) || response.length == 0)
    trackListDouble = "Non esiste"
  else{
    for(let track of response){
      let trackEssentials = {
        name: track.name,
        artist_name: track.artist_name,
        audio: track.audio,
        image: track.image,
        musicinfo: track.musicinfo
      }
      trackListDouble.push(trackEssentials);
    }
  }

  return trackListDouble
}

