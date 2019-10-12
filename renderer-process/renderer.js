'use strict'
const electron = require('electron')
const dialog = electron.remote.dialog
const BrowserWindow = electron.remote.BrowserWindow
const path = require('path')
const request = require('requestretry')
const childProcess = require('child_process')

const fs = require('fs')
const parse = require('csv-parse')
const transform = require('stream-transform')
const stringify = require('csv-stringify')
const progress = require('progress-stream')
const _ = require('underscore')
const CanvasJS =  require('./canvasjs.min')

//---variables declarations---//
var fileName;
var fileResult = 'output.csv'
var selectedOption;
var chooseKey;
var columnResultName;

$('#options').change(function(){
    //first init variables
    $("#selectedFile").empty();$("#selectedFolderPath").empty();$("#checkboxIdResult").empty();$("#checkboxColumnsResult").empty();$('#columnResultName').val('');$('#chartContainer').empty();$('#fileResult').empty();$('#resultFolderPath').empty();
    selectedOption = $(this).val();
})

//---get source file + read stream on first row to parse columns---//
$( "#openSourceFile" ).click(function() {

  dialog.showOpenDialog({ filters: [
    { name: 'csv', extensions: ['csv'] }
   ]},function (fileNames) {
    if (fileNames === undefined) return; 
    fileName = fileNames[0];
    $("#selectedFile").append(fileName)
    fs.createReadStream(fileName)
    .pipe(parse({delimiter: ';',trim: true,from_line:1,to_line:1}))
    .on('error', function (error) {
        dialog.showMessageBox(null,{message: error});
    })
    .on('data', function(csvrow) {            
       return  csvrow.map(function(key){   
        $("#checkboxIdResult").append("<label><input class='idChoice uk-checkbox' value='" + key + "' type='checkbox' /> "+key+"</label><br>")
        $("#checkboxColumnsResult").append("<label><input class='columnsChoice uk-checkbox' value='" + key + "' type='checkbox' /> "+key+"</label><br>")   
       })   
    })
    .on('end',function() {
      this.destroy() 
    }) 
    .on('close', function () {
        console.log('Stream has been Closed');
    });
   }); 
})
//----choose destination folder path---//
$("#chooseResultFolderPath").click(function(){
  dialog.showOpenDialog({
        title:"Choisir un dossier de destination",
        properties: ["openDirectory"]
    }, function(folderPaths){
        // folderPaths is an array that contains all the selected paths
        if(folderPaths === undefined){
            console.log("Pas de dossier de destination choisi");
            return;
        }else{
         $("#resultFolderPath").val(path.join(folderPaths[0],fileResult));
         $("#selectedFolderPath").append(path.join(folderPaths[0],fileResult))
         console.log(path.join(folderPaths[0],fileResult))
        }
    })
})
//----read stream + api calls + write stream---//
$( "#parseFile" ).click(function() {
    //variables
    var arrData = []
    columnResultName = $('#columnResultName').val()
    chooseKey = $('.idChoice:checked').val() 
    var   arrColumns = $('.columnsChoice:checked').map(function(){
        return this.value;
    }).get();

    //progress-stream
    var stat = fs.statSync(fileName);
var str = progress({
    length: stat.size,
    time: 1000
})
.on('progress', function(progress) {
    $("#fileResult").append(Math.round(progress.percentage)+'% </br>')
});
 
    //streams
    var readStream = fs.createReadStream(fileName)
    var writeStream = fs.createWriteStream($("#resultFolderPath").val())
    writeStream .on('end',function() {
        console.log('finish writing')
    })

    readStream
        .pipe(parse({delimiter: ';',trim: true,columns: true}))
        .pipe(transform(function(record,callback){
    getValue(record[chooseKey].toString()).then(
        function(val) {
        record = filterTypes(record,arrColumns)
        console.log(record)
        if(val === undefined) {record[columnResultName]="2 ou +"}
        else {
          record[columnResultName]=val  
        }   
          callback(null, record)          
         }
         )    
        })
         ) 
         .on('error', function (error) {
            dialog.showMessageBox(null,{message: error});
        })
         .on('data',function(record) {
            arrData.push(record)
         })
         .on('end',function() {
             var total = arrData.length
            var counts = _.countBy(arrData,columnResultName);
           var dataGraph = _.map(counts, function(value, key){
                return {
                    label: key,
                    y: value
                };
            });
            drawGraph(dataGraph,columnResultName,chooseKey,total)

         })  
         .on('close', function () {
            console.log('Stream has been Closed');
        })
        .pipe(stringify ({delimiter: ';',header: true}))
        .pipe(str)
        .pipe(writeStream)
  
       
  })
  //----Getting results features----//

  $("#showResultFile").click(function(){
    window.open($("#resultFolderPath").val())
  })
  /*[unused] bouton download
  $("#saveResultFile").click(function(){
    dialog.showSaveDialog({ filters: [
        { name: 'csv', extensions: ['csv'] }
       ]},function(choosePath){
        fs.readFile(fileResult, function (err, data) {
            if (err) {console.log(err)}
            fs.writeFile(choosePath, data, function (err) {
             if (err) {console.log(err)}
            }) 
    })
})
  })*/
  $('#openResultFileOptions').change(function(){
      if($(this).val() != "choice") {
    //var cmd = 'start '+$(this).val()+' '+path.join(__dirname, '../', fileResult);
    var cmd = 'start '+$(this).val()+' '+ $("#resultFolderPath").val();
    childProcess.exec(cmd, function (err, stdout, stderr) {
        if (err) {
            console.error(err);
            return;
        }
    })
}
})
//util function to filter json object on array data
    function filterTypes(itemKeys,accepted) {
      var result = {};
      for (var type in itemKeys)
          if (accepted.indexOf(type) > -1) 
              result[type] = itemKeys[type];
      return result;
  }
//sudoc web services
function getValue(id){
    return new Promise(function(resolve, reject){
        switch(selectedOption) {
            case "isbn2ppncount":
        request({
            url: 'https://www.sudoc.fr/services/isbn2ppn/'+id+'&format=text/json',
            json: true,
            maxAttempts: 5,
            retryDelay: 5000,
            retryStrategy: request.RetryStrategies.HTTPOrNetworkError
             }, function(err, response, body){
            if (response) {
              if(Array.isArray(body.sudoc.query.result)) {
                  resolve(body.sudoc.query.result.length)
                     }
                    else {
                        resolve("1")
                    }
            }
           else {
            resolve("0")
            }
          })
        break;
        case "isbn2ppn":
            request({
                url: 'https://www.sudoc.fr/services/isbn2ppn/'+id+'&format=text/json',
                json: true,
                maxAttempts: 5, 
                retryDelay: 5000,
                retryStrategy: request.RetryStrategies.HTTPOrNetworkError
                 }, function(err, response, body){
                if (response) {
                      resolve(body.sudoc.query.result.ppn)
                }
               else {
                resolve("0")
                }
              })
            break;
            case "issn2ppn":
                request({
                    url: 'https://www.sudoc.fr/services/issn2ppn/'+id+'&format=text/json',
                    json: true,
                    maxAttempts: 5,
                    retryDelay: 5000, 
                    retryStrategy: request.RetryStrategies.HTTPOrNetworkError
                     }, function(err, response, body){
                    if (response) {
                          resolve(body.sudoc.query.result.ppn)
                    }
                   else {
                    resolve("0")
                    }
                  })
                break;
            case "merged":
                request({
                    url: 'https://www.sudoc.fr/services/merged/'+id+'&format=text/json',
                    json: true,
                    maxAttempts: 5,
                    retryDelay: 5000,
                    retryStrategy: request.RetryStrategies.HTTPOrNetworkError
                     }, function(err, response, body){
                    if (response) {
                        if(!body.sudoc) {
                            resolve("0")
                        }
                        else {
                          resolve(body.sudoc.query.result.ppn)
                        }
                    }
                   else {
                    resolve("0")
                    }
                  })
                break;
        case "multiwhere":
            request({
                url: 'https://www.sudoc.fr/services/multiwhere/'+id+'&format=text/json',
                json: true,
                maxAttempts: 5,
                retryDelay: 5000,
                retryStrategy: request.RetryStrategies.HTTPOrNetworkError
                 }, function(err, response, body){
                if (response) {
                  if(Array.isArray(body.sudoc.query.result.library)) {
                      resolve(body.sudoc.query.result.library.length)
                         }
                        else {
                            resolve("1")
                        }
                }
               else {
                resolve("0")
                }
              });
            break;
    }
    });
}

//dynamic donut charting
function drawGraph(data,resultName,keyName,totalData){
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        data: [{
            type: "doughnut",
            startAngle: 60,
            //innerRadius: 60,
            indexLabelFontSize: 10,
            indexLabel: "#percent% - {label} "+resultName,
            toolTipContent: "<b>{y}</b> "+keyName+" sur "+totalData+" (#percent%) renvoient {label} "+resultName,
            dataPoints: data
        }]
    });
    chart.render();   
}

/*init test with bar chart
function drawGraph(data,xLabel,yLabel){
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        title:{
            text: "Répartition des résultats",
            horizontalAlign: "left"
        },
        theme: "light2", // "light1", "light2", "dark1", "dark2"
        data: [{        
            type: "column",  
            showInLegend: false, 
            legendMarkerColor: "grey",
            toolTipContent: "{y} "+xLabel+" revoient {x} "+yLabel,
            legendText: "",
            dataPoints: data
        }]
    });
    chart.render();
}*/
