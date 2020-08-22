//---variables declaration---//
var fileName;
var fileContent;
var fileContentSize;
var fileSep;
var fileResult = 'output.csv'
var selectedOption;
var chooseKey;
var columnResultName;
var arrData = []
var bar = new ldBar(".myBar", {
    "stroke": '#f00',
    "stroke-width": 10,
    "preset": "bubble",
    "value": 0
});

$('#options').change(function () {
    selectedOption = $("input[name='ws']:checked").val();
})
$("#clear").click(function () {
    bar.set(
        0,
        false
    );
    $("input[name='ws']").prop('checked', false);
    $("#fileSep").val('');
    $("#selectedFile").empty(); $("#checkboxIdResult").empty(); $("#checkboxColumnsResult").empty(); $('#columnResultName').val(''); $('#chartContainer').empty();
})
//---get source file + read stream on first row to parse columns---//
$("#openSourceFile").click(function () {
    window.BISELECTRON.dialog.showOpenDialog({
        title: 'Select file in',
        properties: ['openFile'],
        filters: [
            { name: 'csv', extensions: ['csv'] }]
    }).then((fileNames) => {
        if (fileNames === undefined) return;
        fileContent = window.BISELECTRON.fs.readFileSync(fileNames.filePaths[0]).toString();
        fileContentSize = fileContent.split("\n").length - 1;
        $("#fileContentSize").append(fileContentSize)
        fileName = fileNames.filePaths[0]
        if ($("#fileSep").val() != '') {
            fileSep = $("#fileSep").val()
        }
        else {
            alert("sep must not be empty")
        }
        $("#selectedFile").append(fileName)
        window.BISELECTRON.fs.createReadStream(fileName)
            .pipe(window.BISELECTRON.parse({ delimiter: fileSep, trim: true, from_line: 1, to_line: 1 }))
            .on('error', function (error) {
                window.BISELECTRON.dialog.showMessageBox(null, { message: error });
            })
            .on('data', function (csvrow) {
                return csvrow.map(function (key) {
                    $("#checkboxIdResult").append("<label><input class='idChoice uk-checkbox' value='" + key + "' type='checkbox' /> " + key + "</label><br>")
                    $("#checkboxColumnsResult").append("<label><input class='columnsChoice uk-checkbox' value='" + key + "' type='checkbox' /> " + key + "</label><br>")
                })
            })
            .on('end', function () {
                this.destroy()
            })
            .on('close', function () {
                console.log('Stream has been Closed');
            });
    });
})

//----papaparse content and consume the selected web service---//
$("#parseFile").click(function () {
    //variables
    columnResultName = $('#columnResultName').val()
    chooseKey = $('.idChoice:checked').val()
    var arrColumns = $('.columnsChoice:checked').map(function () {
        return this.value;
    }).get();
    //progress function call 
    progressCountInterval();
    //parse action
    window.BISELECTRON.Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        worker: true,
        complete: function (result) {
            const addWSResult = (d) =>
                getAbesWS(d[chooseKey].toString()).then(
                    function (val) {
                        record = filterTypes(d, arrColumns)
                        if (val === undefined) { record[columnResultName] = "2 ou +" }
                        else {
                            record[columnResultName] = val
                        }
                        //console.log(record)
                        arrData.push(record)
                    })

            const requests = result.data.map((d, index) =>
                new Promise(resolve =>
                    setTimeout(() => resolve(addWSResult(d)), index * 100)
                ));

            /* Promise.all(requests).then((updatedArr) => {
               console.log(updatedArr);
             })*/
        }
    })
})
//----copy result array to file ans download---//
$("#downloadResultFile").click(function () {
    window.BISELECTRON.dialog.showSaveDialog({
        defaultPath: "output.csv",
        filters: [
            { name: 'csv', extensions: ['csv'] }
        ]
    }).then((fileNames) => {
        window.BISELECTRON.fs.writeFileSync(fileNames.filePath.toString(),
            window.BISELECTRON.Papa.unparse(arrData, {
                delimiter: ";",
                header: true,
                newline: "\r\n"
            })
        )
    })
})
//function to get result array length by interval
function progressCountInterval() {
    var id = setInterval(function () {
        var stepResultLength = Math.round((arrData.length / fileContentSize) * 100)
        if (stepResultLength < 100) {
            bar.set(
                stepResultLength,
                false
            );
        }
        else if (stepResultLength = 100) {
            clearInterval(id);
            bar.set(
                100,
                false
            );
            getGraphicResults();
        }
    }, 500);
}
function getGraphicResults() {
    var counts = window.BISELECTRON._.countBy(arrData, columnResultName);
    var dataGraph = window.BISELECTRON._.map(counts, function (value, key) {
        return {
            label: key,
            y: value
        };
    });
    drawGraph(dataGraph, columnResultName, chooseKey, arrData.length)
}

//sudoc web services
function getAbesWS(id) {
    console.log(selectedOption)
    switch (selectedOption) {
        case "isbn2ppncount":
            return window.BISELECTRON.axios.get('https://www.sudoc.fr/services/isbn2ppn/' + id + '&format=text/json')
                .then(function (response) {
                    if (Array.isArray(response.data.sudoc.query.result)) {
                        return response.data.sudoc.query.result.length
                    }
                    else {
                        return "1"
                    }
                })
                .catch(function (err) {
                    return "0"
                })
            break;
        case "isbn2ppn":
            return window.BISELECTRON.axios.get('https://www.sudoc.fr/services/isbn2ppn/' + id + '&format=text/json')
                .then(function (response) {
                    return response.data.sudoc.query.result.ppn
                })
                .catch(function (err) {
                    return "0"
                })
            break;
        case "issn2ppncount":
            return window.BISELECTRON.axios.get('https://www.sudoc.fr/services/issn2ppn/' + id + '&format=text/json')
                .then(function (response) {
                    if (Array.isArray(response.data.sudoc.query.result)) {
                        return response.data.sudoc.query.result.length
                    }
                    else {
                        return "1"
                    }
                })
                .catch(function (err) {
                    return "0"
                })
            break;
        case "issn2ppn":
            return window.BISELECTRON.axios.get('https://www.sudoc.fr/services/issn2ppn/' + id + '&format=text/json')
                .then(function (response) {
                    return response.data.sudoc.query.result.ppn
                })
                .catch(function (err) {
                    return "0"
                })
            break;
        case "merged":
            return window.BISELECTRON.axios.get('https://www.sudoc.fr/services/merged/' + id + '&format=text/json')
                .then(function (response) {
                    return response.data.sudoc.query.result.ppn
                })
                .catch(function (err) {
                    return "0"
                })
            break;
        case "multiwhere":
            return window.BISELECTRON.axios.get('https://www.sudoc.fr/services/multiwhere/' + id + '&format=text/json')
                .then(function (response) {
                    if (Array.isArray(response.data.sudoc.query.result.library)) {
                        return response.data.sudoc.query.result.library.length
                    }
                    else {
                        return "1"
                    }
                })
                .catch(function (err) {
                    return "0"
                })
            break;
    }
}
//dynamic donut charting
function drawGraph(data, resultName, keyName, totalData) {
    var chart = new window.BISELECTRON.CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        data: [{
            type: "doughnut",
            startAngle: 60,
            //innerRadius: 60,
            indexLabelFontSize: 10,
            indexLabel: "#percent% - {label} " + resultName,
            toolTipContent: "<b>{y}</b> " + keyName + " sur " + totalData + " (#percent%) renvoient {label} " + resultName,
            dataPoints: data
        }]
    });
    chart.render();
}
//util function to filter json object on array data
function filterTypes(itemKeys, accepted) {
    var result = {};
    for (var type in itemKeys)
        if (accepted.indexOf(type) > -1)
            result[type] = itemKeys[type];
    return result;
}
