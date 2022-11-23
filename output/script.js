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
          <script src="script.js"></script></head><body><br><br><br><br><br><br><div id="container">`)

        for (let index = 0; index < arr[0].length-1; index++) {

          document.write(`
          <button class="accordion">
            <div class="odcinek">
                <div class="numer_odcinka">
                ${arr[0][index][0]}
                </div>
                <div class="tytul">
                ${arr[0][index][1]}
                </div>
                <div class="id">
                ${arr[0][index][2]}
                </div>
              </div>
          </button>
          <div class="panel">
            <div class="players">
          
          `)

            for (let i = 1; i < arr.length-1; i++) {
                if(arr[i].episode.episode_no == arr[0][index][0]) {
                    let link = new DOMParser().parseFromString(arr[i].embded,'text/html')
                    link = link.querySelector('iframe').src

                    console.log(arr[i])

                    document.write(`<br>
                    <div class="player">
                    <div class="player_name">
                    <p>${arr[i].player_name}</p>
                      </div>
                      <div class="resolution">
                      <p>${arr[i].max_res}</p>
                      </div>
                      <div class="author">
                      <a class="author_link" href="${arr[i].source}" target="_blank"><p class="authorp">${arr[i].subtitle_author}</p></a>
                      </div>
                      <div class="link">
                        <a href="${link}" target="_blank"><p>here</p></a>
                      </div>
                      <div class="audio">
                      <p>${arr[i].audio_lang}</p>
                      </div>
                      <div class="subtitle">
                      <p>${arr[i].sub_lang}</p>
                      </div>
                    </div>
                    `)
                }
            }

            document.write(`</div><br></div>`)
        }

        document.write(`</div>
        <style>
        body {
          background: #2a2a2a;
          color: #e2e2e2;
        }
    
        .accordion {
          cursor: pointer;
          width: 100%;
          text-align: center;
          padding: 0;
          font-size: 15px;
          transition: 0.4s;
          background: #2a2a2a;
          border: none;
          color: #e2e2e2;
        }
        
        .active, .accordion:hover {
          background-color: #333;
        }
        
        .panel {
          padding: 0 18px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.2s ease-out;
        }
    
        #container {
            width: 800px;
            margin-left: auto;
          margin-right: auto;
        }
    
        .odcinek {
          height: 40px;
          border: 2px solid rgb(245, 237, 237);
        }
    
        .numer_odcinka {
          width: 120px;
          padding: 10px;
          float: left;
        }
        .tytul {
          width: 490px;
          padding: 10px;
          border-left: 2px solid rgb(245, 237, 237);
          color: #14bfa1;
          float: left;
        }
        .id {
          width: 120px;
          padding: 10px;
          border-left: 2px solid rgb(245, 237, 237);
          float: left;
        }

        .author_link:link { text-decoration: none; }
        .author_link:visited { text-decoration: none; }

        .player {
          width: 720px;
          margin-left: auto;
          margin-right: auto;
          text-align: center;
          border: 2px solid rgb(207, 205, 205);
          max-height: 100px;
          overflow: hidden;
          display: flex;
        }
    
        .player_name {
          min-width: 50px;
          min-height: 40px;
          /* float: left; */
        }
    
        .author {
          width: 380px;
          color: #14bfa1;
          border-left: 2px solid rgb(245, 237, 237);
          /* float: left; */
          min-height: 40px;
          box-sizing: border-box;
        }
    
        .resolution,.audio,.subtitle,.link {
          width: 70px;
          border-left: 2px solid rgb(245, 237, 237);
          /* float: left; */
          min-height:100%;
        }
    
        a:link , a:visited {
          color: #14bfa1;
        }
    
        p {
          margin-top: 10px;
          margin-bottom: 10px;
          margin-left: 5px;
          margin-right: 5px;
        }
    
        .authorp{
          overflow-wrap: break-word;
        }
    </style>
    <script>
    var acc = document.getElementsByClassName("accordion");
    var i;
    
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        } 
      });
    }
    </script>
    `)

    }
}