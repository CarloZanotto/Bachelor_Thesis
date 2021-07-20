/*
Code for the Tracker Google Assistant Service.
 */



/* IMPORTS */
const jamendo = require("./functions");
exports.getTracksReplacement = jamendo.getTracksReplacement;
exports.parseParamsReplacement = jamendo.requestTracksReplacement;
exports.getTracksDouble = jamendo.getTracksDouble;
exports.parseParamsDouble = jamendo.requestTracksDouble;
exports.isDouble = jamendo.isDouble;
exports.waitTime = jamendo.waitTime;

/* WEBHOOKS */
const {conversation, Simple, Media} = require('@assistant/conversation');
const functions = require('firebase-functions');
const app = conversation({debug: true});

app.handle('jamendoConnect', (conv) => {
  conv.overwrite = false;
  //TODO: Check if both Jamendo and Analisys servers are up.
  conv.add('Connected to Jamendo!');
	conv.scene.next.name = 'Main';
});

app.handle('clearParam', (conv) => {
  conv.session.params.enteredParam = false;
})

app.handle('enteredParam', (conv) => {
  conv.session.params.enteredParam = true;
})

app.handle('mainClearSession', (conv) => {
  conv.session.params.chosenOrder = conv.session.params.chosenMood = undefined;
  conv.session.params.chosenGenre = conv.session.params.isDouble = undefined; 
  conv.session.params.chosenBPM = conv.session.params.chosenTuning = undefined;
  conv.session.params.chosenTonality = conv.session.params.chosenChords = undefined;
  conv.session.params.chosenOrder = conv.session.params.chosenMood = undefined;
  conv.session.params.explainChoice = undefined;
  conv.session.params.enteredParam = false;
});

app.handle('jamendoSearch', (conv) =>{
  let startTime = new Date();
  // Search parameters for replacement search
  const replacementParamsObject = {
    order_by: conv.session.params.chosenOrder,
    mood: conv.session.params.chosenMood,
    genre: conv.session.params.chosenGenre,
    speed: conv.session.params.chosenBPM,
  };
  // Search parameters for double layered search
  const doubleParamsObject = {
    order_by: conv.session.params.chosenOrder,
    mood: conv.session.params.chosenMood,
    genre: conv.session.params.chosenGenre,
    speed: conv.session.params.chosenBPM,
    chords: conv.session.params.chosenChords,
    tuning: conv.session.params.chosenTuning,
    tonality: conv.session.params.chosenTonality,
  };
  conv.session.params.doubleObject = doubleParamsObject;
  conv.session.params.replacementObject = replacementParamsObject;
  let endTime = new Date();
  conv.session.params.parseTime = (endTime-startTime)/1000;
  let isMultipleSearch = jamendo.isDouble(doubleParamsObject);
  conv.session.params.isDouble = isMultipleSearch;
  let time = jamendo.waitTime(isMultipleSearch, doubleParamsObject)
  conv.session.params.waitTime = time;
  // If double then call both searches, otherwise just replacement
  jamendo.requestTracksReplacement(replacementParamsObject)
  if(isMultipleSearch){
    jamendo.requestTracksDouble(doubleParamsObject)
  }

  // CHECK FOR WHICH PARAMETERS WERE RESOLVED
  
  /*
  conv.overwrite = true;
  requestDetails = "Searching for songs with the following parameters: ";
  if(isMultipleSearch){
    for(var prop in doubleParamsObject){
      if(doubleParamsObject[prop] != undefined && prop != "boost")
        requestDetails += prop+" "+doubleParamsObject[prop]+", "
    }
  }else{
    for(var prop in replacementParamsObject){
      if(replacementParamsObject[prop] != undefined && prop != "boost")
        requestDetails += prop+" "+replacementParamsObject[prop]+", "
    }
  }
  requestDetails += "."
  conv.add(new Simple({
    speech: requestDetails,
  }));
  */
});

/// OK UNTIL HERE

app.handle('jamendoWait', (conv) => {
  let time = conv.session.params.waitTime

  var minutes = Math.floor(time.time/60)
  var seconds = time.time - minutes*60

  var introPhrase = "Fetching the songs, please wait for about "+minutes+" minutes and "+seconds+" seconds"
  conv.add(introPhrase)

  let mediaObject = {
    name: "Fetching tracks, please wait.",
    url: time.url,
  };
  conv.add(new Media({
    mediaObjects: mediaObject,
    mediaType: 'AUDIO',
    optionalMediaControls: ['PAUSED', 'STOPPED'],
  }));
});


app.handle('jamendoPlay', async (conv) => {
  // Create a trackList for each request

  var jamendoResponse;
  var replacementTracks = await jamendo.getTracksReplacement();
  var doubleTracks;
  var replacementNeeded = false;
  if(conv.session.params.isDouble){
    doubleTracks = await jamendo.getTracksDouble();
    if(Array.isArray(doubleTracks) && doubleTracks.length > 0){
      jamendoResponse = doubleTracks
    }else{
      jamendoResponse = replacementTracks
      replacementNeeded = true
    }
  }else{
    jamendoResponse = replacementTracks
  }

  playlist = []
  conv.session.params.jamendoResponse = jamendoResponse

  // Refine the track list into an array compatible with the Media object
  if(Array.isArray(jamendoResponse)){
    for(let element of jamendoResponse){
      let mediaObject = {
        name: element.name,
        description: "A song by " + element.artist_name,
        url: element.audio,
        image: {
          large: {
            url : element.image,
            height: 1600,
            width: 1056
          }
        },
      };
      playlist.push(mediaObject);
    }
  }
  conv.session.params.playlist = playlist

  // Add to the conversation the number of results found

  if(!replacementNeeded){
    switch(playlist.length){
      case 0:
        conv.add('I didn\'t find any song that matched your request. Please search again.');
        conv.scene.next.name = 'Main';
        break;
      case 1:
        conv.add('Found 1 song that matched your request.');
        break;
      default:
        conv.add('Found '+ playlist.length + ' songs that matched your request.');
        break;
    } 
  }else{
    conv.add("I didn't find an exact match but these songs could be similar.")
  }

  conv.add(new Media({
    mediaObjects: playlist,
    mediaType: 'AUDIO',
    optionalMediaControls: ['PAUSED', 'STOPPED'],
    repeat_mode: "ALL",
  }));

  conv.scene.next.name = 'Main';
});

app.handle('jamendoExplain', (conv) => {
  var terms = conv.session.params.explainChoice

  conv.overwrite = true
  for (i = 0; i < terms.length; i++){
    switch(terms[i]){
      case "start":
        conv.add("To get started just say Search followed by the desired characteristics, remember that the order metric is required.")
        break;
      case "search":
        conv.add("There are two types of search, the first one operates only on mood, speed, genre, order. The other can also operate with tuning, tonality, speed in BPM and chords.")
        break;
      case "order":
        conv.add("The order metric has three possible values: ascending relevance, descending relevance and popularity.")
        break;
      case "genre":
        conv.add("This parameter doesn't have particular limitations, the genre list will get bigger with time").
        break;
      case "mood":
        conv.add("This parameter has four possible values: sad, relaxed, aggressive, angry.")
        break;
      case "tonality":
        conv.add("This paramter accepts a single note, from A to G sharp, be it major or minor.")
        break;
      case "chords":
        conv.add("This parameter accepts a list of notes, from A to G sharp, be it major, minor, 7, major 7 or minor 7.")
        break;
      case "speed":
        conv.add("This parameter can either assume one of verylow, low, medium, high, veryhigh, or the BPM of the song, from 30 to 300 in increments of 10.")
        break;
      default:
        break;
    }
  }
});

// OPTIONAL
app.handle('media_status', (conv) => {
  const mediaStatus = conv.intent.params.MEDIA_STATUS.resolved;
  switch(mediaStatus) {
    case 'FINISHED':
      conv.add('Media has finished playing.');
      conv.add('You can now search for new songs.');
      conv.scene.next.name = 'Main';
      break;
    case 'FAILED':
      conv.add('Media reproduction failed, try searching again.');
      conv.scene.next.name='Main';
      break;
    case 'PAUSED':
      // Acknowledge pause
      conv.add(new Media({
        mediaType: 'MEDIA_STATUS_ACK'
        }));
      break;
    case 'STOPPED':
      conv.overwrite = true;
      conv.add("Media reproduction stopped. You can now search for new songs.");
      conv.scene.next.name = 'Main';
      break;
    default:
      conv.add('Unknown media status received.');
  }
});

exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
