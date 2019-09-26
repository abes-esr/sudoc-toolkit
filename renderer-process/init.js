$( "#parseFile" ).click(function() {
  var parser = parse({delimiter: ';',trim: true,columns: true}, function (err, data) {
      isbnKey = $('.isbnChoice:checked').val()  
        arrColumns = $('.columnsChoice:checked').map(function(){
          return this.value;
      }).get();
      var item = {}
    //arrColumnstoString = arrColumns.join(',')
    test = data.forEach(function(line) {
      arrColumns.forEach(function(c){
    // item = { [c] : line[c],"isbn" : line[isbnKey]}
    return { [c] : line[c],"isbn" : line[isbnKey]}
      })
    })
    return test
  })
    })

    fs.readFile(fileName, 'utf-8', function (err, data) {
      var lines = data.trim().split('\n');
 console.log(lines[0].trim().split(';'))
return  lines[0].trim().split(';').map(function(key){
  $("#checkboxIsbnResult").append("<input class='isbnChoice' value='" + key + "' type='checkbox' />"+key)
  $("#checkboxColumnsResult").append("<input class='columnsChoice' value='" + key + "' type='checkbox' />"+key)  
 })  
    });   

    $( "#test" ).click(function() {
      let input = "C:/Users/Cunouille/Desktop/temp/isbn.csv"
      let output = "data/out.csv"
      var csvData=[]; 
      fs.createReadStream(input)
          .pipe(parse({delimiter: ';',trim: true,columns: true}))
          .on('data', function(csvrow) {      
            getPpn(csvrow.id).then(function(val) {
                csvrow["ppn"]=val
                //writeStream.write(JSON.stringify(csvrow));
              })
              console.log(filterTypes(csvrow,["id","BU"]))
              //do something with csvrow
              csvData.push(csvrow);        
          })
          .on('end',function() {
            //do something wiht csvData
            console.log(csvData);
          })     
    })