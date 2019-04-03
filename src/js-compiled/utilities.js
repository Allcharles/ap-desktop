"use strict";

/** List of event csv files  */
var eventList = [];
/** List of selected csv files (used by html form) */

var eventSelection = [];
/** List of events to be processed by the user*/

var eventEvents = [];
/** List of events processed by the user for a single file. This is reset after each file */

var finishedEvents = [];
/** Current event being processed */

var eventCurrent = [];

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};
/**
 * Lets the user select what files to analyse
 */


function eventSelectFolder() {
  document.querySelector("#eventspinner").style.display = "inherit";
  document.querySelector("#eventitems").style.display = "none";
  document.querySelector("#EventDetectionHelper .h1-no-hover").style.marginBottom = "-14px";

  process.dlopen = function () {
    throw new Error("Load native module is not safe");
  }; //Open file selector dialog


  dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory", "multiSelections"],
    title: "Select Event Folder"
  }, function (folder) {
    //Clear EventList and spinner
    eventList = [];
    document.querySelector("#eventspinner").style.display = "none"; //Hide event items

    document.querySelector("#eventitems").style.display = "none";
    document.querySelector("#EventDetectionHelper .h1-no-hover").style.marginBottom = "-14px"; //If no folder is selected

    if (folder !== undefined) {
      //Update EventDetectionInputs
      document.getElementById("EventDetectionInputs").innerHTML = "";
      findFilesRecursive(folder, ".csv", ".Events");
    }
  });
}
/**
 * Finds all files inside a folder recursively
 * @param [list] folderList Folders to search
 * @param [string] match File extension to find
 * @param [string] contains Specific word the file must contain
 */


function findFilesRecursive(folderList, match) {
  var contains = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

  //Parallel Recursive Search (https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search)
  var fs = require("fs");

  var path = require("path");

  var walk = function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
      if (err) return done(err);
      var pending = list.length;
      if (!pending) return done(null, results);
      list.forEach(function (file) {
        file = path.resolve(dir, file);
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file, function (err, res) {
              results = results.concat(res);
              if (! --pending) done(null, results);
            });
          } else {
            results.push(file);
            if (! --pending) done(null, results);
          }
        });
      });
    });
  }; //Get .csv files


  folderList.forEach(function (dir) {
    walk(dir, function (err, results) {
      if (err) throw err;
      results.forEach(function (filePath) {
        var fullFilename = getFilename(filePath);
        var filename = fullFilename.substr(0, fullFilename.lastIndexOf("_") - 1);
        var file = {};
        file.id = eventList.length;
        file.filePath = filePath; //Full file path

        file.fileName = filename; //File name minus file extension

        file.extension = filePath.substr(filePath.length - match.length);

        if (file.extension === match && fullFilename.includes(contains)) {
          //First element found
          if (eventList.length === 0) {
            //Display event items
            document.querySelector("#eventitems").style.display = "inherit";
            document.querySelector("#EventDetectionHelper .h1-no-hover").style.marginBottom = "0px";
            document.getElementById("EventDetectorForm").style.display = "inherit";
            document.getElementById("EventDetectorAnswerForm").style.display = "none";
          }

          eventList.push(file);
          document.getElementById("EventDetectionInputs").innerHTML += '<li><input id="util' + generateID(file.filePath) + '" value="' + file.id + '" class="checkbox-custom" name="eventDetection" type="checkbox" checked onchange="" /><label for="util' + generateID(file.filePath) + '" class="checkbox-custom-label">' + file.fileName + "</label></li>";
        }
      });
    });
  });
}
/**
 * Creates the event detector utility.
 * @param [object] el HTML element
 */


function createEventDetectionUtility(el) {
  el.preventDefault(); //Verify inputs

  var input = document.getElementById("EventDetectorForm");
  var selection = input.querySelectorAll("input:checked"); //If no items selected, return

  if (selection.length === 0) {
    return;
  } //Update selection list with new selections


  eventSelection = [];

  for (var i = 0; i < selection.length; i++) {
    eventSelection.push(eventList[Number(selection[i].value)]);
  } //Update forms and disable buttons


  input.style.display = "none";
  eventDetectionUtilityNext(el);
}
/**
 * Updates event detector form with the next event.
 * @param [object] el HTML element
 */


function eventDetectionUtilityNext(el) {
  el.preventDefault();

  var fs = require("fs");

  var readInputs = true; //If no selection left, allow user to select more

  if (eventSelection.length === 0 && eventEvents.length === 0) {
    updateEventCSV();
    document.getElementById("EventDetectorForm").style.display = "inherit";
    document.getElementById("EventDetectorAnswerForm").style.display = "none";
    return;
  } else if (eventEvents.length === 0) {
    readInputs = false;
    updateEventCSV(); //Grab selection and find related files

    var EVENT_START = 0;
    var EVENT_DURATION = 2;
    var SPECIES = 8;
    var EVENT_START_OFFSET = 12;
    var FILENAME_CELL = 14;
    var csv = eventSelection.shift().filePath;
    var path = getFolder(csv) + "/"; //Read csv file

    var data = fs.readFileSync(csv, "utf8");
    var rows = data.toString().split("\n"); //Skip the header row and

    for (var i = 1; i < rows.length; i++) {
      var cell = rows[i].split(","); //This removes the last line which can be sometimes left empty

      if (cell[FILENAME_CELL] === undefined) continue; //Get name of event

      var filename = cell[FILENAME_CELL].replaceAll('"', ""); //Push important details to list

      var event = {
        csv: csv,
        duration: parseFloat(cell[EVENT_DURATION].replaceAll('"', "")),
        image: path + filename + "__Image.png",
        path: path,
        position: i,
        sound: path + filename + ".wav",
        species: cell[SPECIES].replaceAll('"', ""),
        start: parseFloat(cell[EVENT_START].replaceAll('"', "")) - Number(cell[EVENT_START_OFFSET].replaceAll('"', "")) //What position in the recording does the sound begin

      };
      eventEvents.push(event);
      console.log("Updated List of Events");
    }
  } //Read inputs unless already read or previous eventCurrent has not been set


  if (readInputs && eventCurrent !== undefined) readEventInput(); //Get event details

  eventCurrent = eventEvents.shift(); //Check files exist

  if (fs.existsSync(eventCurrent.sound) && fs.existsSync(eventCurrent.image)) {
    document.getElementById("EventDetectorAnswerForm").style.display = "inherit";
    document.getElementById("EventDetectionHelperError").style.display = "none"; //Update form with details

    document.getElementById("EventDetectionHelperError").style.display = "none";
    var form = document.getElementById("EventDetectorAnswerForm");
    form.querySelector("#EventDetectorSwitch").checked = false;
    form.querySelector("#EventDetectorAnimal").value = eventCurrent.species;
    form.querySelector("#EventDetectorAnimal").disabled = true;
    form.querySelector("#EventDetectorComment").value = "";
    form.querySelector("#EventDetectorComment").disabled = true;
    updateEventSpectrogram(form);
    updateEventAudio(form);
  } else {
    //Files do not exist, display error and cancel out of helper
    eventCurrent = [];
    eventEvents = [];
    document.getElementById("EventDetectorForm").style.display = "inherit";
    document.getElementById("EventDetectorAnswerForm").style.display = "none";
    document.getElementById("EventDetectionHelperError").style.display = "inherit";
    document.querySelector("#eventitems").style.display = "none";
    document.querySelector("#EventDetectionHelper .h1-no-hover").style.marginBottom = "-14px";
  }
}
/**
 * Skips audio to start of event.
 * @param [HTMLElement] form HTMLElement for the encompasing form. Used to reduce processing time.
 */


function updateEventAudio(form) {
  form.querySelector("#EventDetectorSound").innerHTML = '<audio controls id="EventDetectorSound"><source type="audio/wav" src=""/></audio>';
  var audio = form.querySelector("#EventDetectorSound audio");
  fs.readFile(eventCurrent.sound, function (err, buffer) {
    var blob = new window.Blob([new Uint8Array(buffer)]);
    audio.src = URL.createObjectURL(blob);
    audio.load(); //Set minimum time to eventCurrent.start

    audio.addEventListener("canplaythrough", function () {
      var start = parseInt(eventCurrent.start); //Set the minimum time to eventCurrent.start

      if (this.currentTime < start) {
        this.currentTime = start;
      }
    }); //Reset audio when hitting end of sound file

    audio.addEventListener("ended", function () {
      var start = parseInt(eventCurrent.start);
      var finish = parseInt(eventCurrent.start + eventCurrent.duration + 1);

      if (this.currentTime > finish) {
        this.currentTime = start;
      }
    });
  });
}
/**
 * Clips the spectrogram image to only display the required content.
 * @param [HTMLElement] form HTMLElement for the encompasing form. Used to reduce processing time.
 */


function updateEventSpectrogram(form) {
  var fs = require("fs");

  var PIXELS_PER_SECOND = 166.4; //TODO This was calculated using 282kbps wav files. May require changes in the future

  var startPixel = eventCurrent.start * PIXELS_PER_SECOND;
  var image = form.querySelector("#EventDetectorSpectrogram");

  try {
    fs.accessSync(eventCurrent.image);
    image.innerHTML = "";
    buildImageSync(image, eventCurrent.image, "", "", "margin-left: -" + startPixel + "px", "If you are seeing this message, update options SaveIntermediateWavFiles and SaveSonogramImages to 'WhenEventsDetected' in config file. The run analysis again to activate sound and spectrogram.");
  } catch (e) {//Do nothing
  }
}
/**
 * Updates finishedEvents list with user inputs
 */


function readEventInput() {
  //Add the event to the system
  if (eventCurrent !== undefined) {
    console.log("Writting Output to CSV"); //Save event details

    finishedEvents.push(eventCurrent); //Grab the form values the user has entered

    var length = finishedEvents.length - 1;
    var userInput = document.getElementById("EventDetectorAnswerForm");
    var eventSwitch = userInput.querySelector("#EventDetectorSwitch");
    finishedEvents[length].EventDetected = eventSwitch.checked; //If output is checked, use entered values. Otherwise set to defaults.

    if (eventSwitch.checked) {
      finishedEvents[length].SpeciesName = userInput.querySelector("#EventDetectorAnimal").value;
      finishedEvents[length].Comments = userInput.querySelector("#EventDetectorComment").value;
    } else {
      finishedEvents[length].SpeciesName = finishedEvents[length].species;
      finishedEvents[length].Comments = "";
    }

    console.log(finishedEvents[length]);
  }
}
/**
 * Update CSV file with the users inputs
 */


function updateEventCSV() {
  if (finishedEvents.length === 0) return;
  readEventInput();

  var csv = require("csv-parser");

  var fs = require("fs");

  var json2csv = require("json2csv").parse;

  var dataArray = []; //Overwrite csv with new data

  fs.createReadStream(finishedEvents[0].csv).pipe(csv()).on("error", function (err) {
    console.log(err);
  }).on("data", function (row) {
    row.EventDetected = finishedEvents[dataArray.length].EventDetected;
    row.SpeciesName = finishedEvents[dataArray.length].SpeciesName;
    row.Comments = finishedEvents[dataArray.length].Comments;
    dataArray.push(row);
  }).on("end", function () {
    var result = json2csv(dataArray, Object.keys(dataArray[0]));
    fs.writeFileSync(finishedEvents[0].csv, result);
    finishedEvents = [];
  });
}
/**
 * Enables or disables the ability for the individual to enter in information about the animal and leave comments.
 */


function toggleEvent(el) {
  if (el.checked) {
    document.getElementById("EventDetectorAnimal").disabled = false;
    document.getElementById("EventDetectorComment").disabled = false;
  } else {
    document.getElementById("EventDetectorAnimal").disabled = true;
    document.getElementById("EventDetectorComment").disabled = true;
  }
}
/**
 * Checks all inputs in the event detection helper
 */


function checkAll() {
  document.querySelectorAll("#EventDetectionInputs input").forEach(function (node) {
    node.checked = true;
  });
}
/**
 * Unchecks all inputs in the event detection helper
 */


function uncheckAll() {
  document.querySelectorAll("#EventDetectionInputs input").forEach(function (node) {
    node.checked = false;
  });
}