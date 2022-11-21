function generateView() {

    let element = document.getElementById('heretext').value
    let arr = element.split('<-$#->')

    arr[0] = getNames(arr)
    getPlayers(arr)

    function getNames(element) {  //returns arr with names titles id (-1)

        //each arr need to be separated by <-$#->
        //in arr variables need to be separated by <-&%->
        //in in arr variables need to be separated by <-&#->

      let namearr = element[0].split('<-&%->')

        for (let index = 0; index < namearr.length-1; index++) {
            namearr[index] = namearr[index].split('<-&#->')
        }

      return namearr
    }

    function getPlayers(arr) { //edit every stringfy json type

        // arr[0] contains episode names etc

        for (let index = 1; index < arr.length-1; index++) {
            arr[index] =  JSON.parse(arr[index])
        }
        return
    }

    


}