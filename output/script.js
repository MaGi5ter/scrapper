function generateView() {

    let element = document.getElementById('heretext').value
    let arr = element.split('<-$#->')

    arr[0] = getNames(arr)
    getPlayers(arr)

    console.log(arr)

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

    writeTitles(arr)

    function writeTitles(arr) {

        document.write(`<!DOCTYPE html><html lang="en"><head>
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title>
          <script src="script.js"></script></head><body><br><br><br><br><br><br>`)

        for (let index = 0; index < arr[0].length-1; index++) {
            document.write(`<div class="lista" onclick="show(${arr[0][index][0]})">
            <div class="odcinek"><div class="numer_odcinka">${arr[0][index][0]}</div><div class="tytul">${arr[0][index][1]}
            </div><div class="id">${arr[0][index][2]}</div></div><div id="player_${arr[0][index][0]}" style="display: none;">`)

            for (let i = 1; i < arr.length-1; i++) {
                if(arr[i].episode.episode_no == arr[0][index][0]) {
                    let link = new DOMParser().parseFromString(arr[i].embded,'text/html')
                    link = link.querySelector('iframe').src

                    document.write(`<div class="player"><div class="player_name">
                    ${arr[i].player_name}</div><div class="resolution">
                    ${arr[i].max_res}</div><div class="author">
                    ${arr[i].subtitle_author}</div><div class="link">
                    <a href="${link}">here</a></div><div class="audio">
                    ${arr[i].audio_lang}</div><div class="subtitle">
                    ${arr[i].sub_lang}</div></div>`)
                }
            }

            document.write(`</div></div>`)
        }

        document.write(`
        <style>

    .player_name {
      min-width: 50px;
      padding: 10px;
    }

    .resolution , .author, .link, .audio, .subtitle {
      width: 15%;
      padding: 10px;
      border-left: 2px solid rgb(245, 237, 237);
    }

    .author {
      width: 350px;
    }

    .resolution,.audio,.subtitle {
      width: 40px;
    }

    body {
      background: #2a2a2a;
      color: #e2e2e2;
    }

    .lista:hover {
      background-color: #333;
    }

    .odcinek {
      display: flex;
    }

    .lista {
      margin-left: auto;
      margin-right: auto;
      width: 800px;
      border: 2px solid rgb(245, 237, 237);
      height: 40px;
      text-align: center;
      margin-top: 10px;
    }
    .numer_odcinka {
      width: 15%;
      padding: 10px;
    }
    .tytul {
      width: 70%;
      padding: 10px;
      border-left: 2px solid rgb(245, 237, 237);
      color: #14bfa1;
    }
    .id {
      width: 15%;
      padding: 10px;
      border-left: 2px solid rgb(245, 237, 237);
    }

    .player {
      display: flex;
      width: 90%;
      margin-left: auto;
      margin-right: auto;
      margin-top: 10px;border: 2px solid rgb(207, 205, 205);}</style>`)

    }
}

function show(id) {
    let element = document.getElementById(`player_${id}`)
    if(element.style.display != 'block') {
        element.style.display = 'block'
    }
    else element.style.display = 'none'
    console.log(element)

}