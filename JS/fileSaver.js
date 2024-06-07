var FileSaver = require('file-saver');

// Function to save JSON file
export function saveJSONFile(data,name) {
    var blob = new Blob([data], {type: "application/json;charset=utf-8"});
    FileSaver.saveAs(blob, name + ".json");
}

