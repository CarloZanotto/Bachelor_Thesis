const express = require('express');
const jamendo = require('./functions')

const app = express()
const port = 3000

var replacementTracklist
var isReplacementDone
var doubleTracklist
var isDoubleDone


app.get('/', async (req, res) => {
    res.send("Why are you even here?")
})

app.get('/requestReplacement', async (req, res) => {
    let startTime = new Date()
    replacementTracklist = null
    isReplacementDone = false
    let params = req.query
    let replacementParams = {
        order_by: params.order,
        genre: params.genre,
        mood: params.mood,
        speed: params.speed
    }
    console.log("----------START----------")
    console.log(replacementParams)
    console.log("--------------------")
    let replacementTrackInfo = jamendo.parseParamsReplacement(replacementParams)
    replacementTracklist = await jamendo.getTracksReplacement(replacementTrackInfo)
    console.log("--------------------")
    isReplacementDone = true
    if(Array.isArray(replacementTracklist)){
        res.statusCode = 200;
        res.send("Jamendo Request completed")
        console.log(replacementTracklist)
    }else{
        res.statusCode = 500;
        res.send("Something wrong happened")
    }
    let endTime = new Date()
    let timeDiff = endTime - startTime
    timeDiff /= 1000;
    console.log("Took "+timeDiff+" to end.")
    console.log("---------END-----------")
})

app.get('/responseReplacement', function (req, res) {
    console.log("Can print replacement response? "+isReplacementDone)
    if(isReplacementDone){
        console.log("Printing...")
        res.type('json');
        res.send(replacementTracklist)
    }else{
        res.type('json')
        res.send({"response": "Not done yet"})
    }
})

app.get('/requestDouble', async (req, res) => {
    let startTime = new Date()
    doubleTracklist = null
    isDoubleDone = false
    let params = req.query
    let doubleParams = {
        order_by: params.order,
        genre: params.genre,
        mood: params.mood,
        chords: params.chords,
        tuning: params.tuning,
        tonality: params.tonality,
        bpm: params.speed
    }
    console.log("----------START----------")
    console.log(doubleParams)
    console.log("--------------------")
    let doubleTrackInfo = jamendo.parseParamsDouble(doubleParams)
    var songsID = await jamendo.getTracksDouble(doubleTrackInfo)
    doubleTracklist = await jamendo.getID(songsID, doubleTrackInfo);

    console.log("--------------------")
    isDoubleDone = true
    
    
    if(Array.isArray(doubleTracklist)){
        res.statusCode = 200;
        res.send("Analysis+Jamendo Request completed")
        console.log(doubleTracklist)
    }else{
        res.statusCode = 500;
        res.send("Something wrong happened")
        console.log(doubleTracklist)
    }
    
    let endTime = new Date()
    let timeDiff = endTime - startTime
    timeDiff /= 1000;
    console.log("Took "+timeDiff+" seconds to end.")
    console.log("---------END-----------")
})

app.get('/responseDouble', function (req, res) {
    console.log("Can print double response? "+isDoubleDone)
    if(isDoubleDone){
        console.log("Printing...")
        res.type('json');
        res.send(doubleTracklist)
    }else{
        res.type('json')
        res.send({"response": "Not done yet"})
    }
})

app.use(express.static(__dirname+'/static'))

app.listen(port, () => console.log('The server is on port http://localhost:'+port))