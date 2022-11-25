const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

const process = require('node:process')
const fs = require('fs')
const path = require('path');

let generateString

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/91.0.4516.106"
const hosting = ['Mega','Gdrive','Cda','Vk','Sibnet']
const required_res = 1080

let browser_limit = 11  //how many tasks can be done at once, max 12
let open_browser = 0

const myArgs = process.argv.slice(2);

let queueCount = 0
let queue = []
let queueId = 0
let acceptedPlayers = [] 

process.on('beforeExit', (code) => {

    if(acceptedPlayers.length>0) {
        console.log(acceptedPlayers)
        final()
    }
    else
    {

        try {
            fs.writeFileSync('test.txt', generateString);
        } catch (err) {
            console.error(err);
        }
    
        console.clear()
        console.log('output zapisany tutaj :',path.resolve('test.txt'));
    }
});

// setInterval(() => { //just checking how many memory it uses

//     const used = process.memoryUsage().heapUsed / 1024 / 1024;
//     console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);

// }, 3000);

//////////////////////////////////////////////////////////
//converting data to one line string that is output //////
//////////////////////////////////////////////////////////

async function namesToString (arr) {

    //each arr need to be separated by <-$#->
    //in arr variables need to be separated by <-&%->
    //in in arr variables need to be separated by <-&#->

    let stringarr = ''  //this is output

    for (let index = 0; index < arr.length; index++) {
        stringarr = stringarr + `${arr[index][0]}<-&#->${arr[index][1]}<-&#->${arr[index][2]}<-&%->`
    }
    stringarr = stringarr + '<-$#->'
    generateString = stringarr

    console.log(stringarr)

    return
}

async function playerToString(data) {

    //each arr need to be separated by <-$#->
    generateString = generateString + data + '<-$#->'
    return
}

/////////////////////////////////////////////////
//getting links to players and episodes id //////
/////////////////////////////////////////////////

getPlayersData(myArgs[0])

async function getPlayersData(link) {            //this gets data from eachepisode function, then run data to players for every eipsode simultaneously 
    let episodeIDs = await getEachEpisodeID(link)
    namesToString(episodeIDs)

    for (let index = 0; index < episodeIDs.length; index++) {
        let link = getLinkFromID(episodeIDs[index])
        dataToPlayers(link)
        sleep(15) //it was way too fast
    }
}

async function dataToPlayers (link) {            //this function gets data from that one above, 
    let playerdata = await getPlayerData(link)      // go to episode link and get data

    try {
        if(playerdata[0][2].includes('assets'))
        {
            dataToPlayers(link)
            console.log('BAD DATA ', link)          //if any errors occur it will try again, this error occured few times when too much sites was loaded at once
            return
        }
        filter_players(playerdata)   //then sends data about episodes and send it to filter players

        // let pageBrowser = await getPage()
        // let finalPlayerdata = await getData(correct,pageBrowser[1])
        // closeBrowser(pageBrowser[0])

    } catch (error) {
        return
    }
}

async function final() {
    let max = browser_limit

    for (let index = max; index > 0; index--) {
        //runs once for every browser
        let howmany = Math.floor(acceptedPlayers.length/index)
        let data = [] //this wil be sent to function that gets players data

        if(howmany == 0) continue
        for (let index = 0; index < howmany; index++) {
            data.push(acceptedPlayers[index])
        }

        acceptedPlayers = acceptedPlayers.slice(howmany)

        run()
        async function run() {
            //console.log(data)

            let pageBrowser = await getPage()
            await getData(data,pageBrowser[1])
            await closeBrowser(pageBrowser[0])
        }
    }

}

async function getPlayerData(link) { //you puts link to specific episode on shinden.pl and will return id's to videos
    let pageBrowser = await getPage() ; let page = pageBrowser[1]
    await page.goto(link,{waitUntil: 'networkidle0'})

    let list = await page.evaluate(() => document.querySelector('.table-responsive').innerHTML)
    await closeBrowser(pageBrowser[0])

    list = list.split('\n')  

    let data  = []
    let start = []
    let end   = []

    for (let index = 0; index < list.length; index++) {
        if(list[index].includes('<tr>')) start.push(index)
        else if(list[index].includes('</tr>')) end.push(index)
    }

    for (let index = 1; index < start.length; index++) { //index 1 bcs first tr contains table names

        let hosting = await list[start[index]+1].split('>') ; hosting = hosting[1]  ;hosting = await hosting.replace('</td','')
        let res     = await list[start[index]+2].replace('<td class="ep-pl-res"><span title="','') ;res  = await res.split("<") ; res = res[1] ; res = await res.replace(`/span>`,"")
        let player  = await list[end[index]-1].split('"',6); player = player[5];player = player.replace('player_data_','')

        data.push([hosting,res,player])
    }

    return data

}

function getLinkFromID(idArr) {
    let link = myArgs[0] ; link = link.replace('episodes',`view/${idArr[2]}`) ; link = link.replace('series','episode')
    return link
}

async function getEachEpisodeID(link) {               //you puts link to shinden.pl/randomamime/episodes on shinden.pl and will return id's to episodes
    let pageBrowser = await getPage() ; let page = pageBrowser[1]

    await page.goto(link,{waitUntil: 'networkidle0'})

    let list = await page.evaluate(() => document.querySelector('.list-episode-checkboxes').innerHTML) //bcs puppeter does not allow me to just get queryselectorall
    if(list.includes('Zobacz wszystkie odcinki')) {                                                    //I need to do this overcomplex way
        link = await link.replace('episodes','all-episodes')
        await page.goto(link,{waitUntil: 'networkidle0'})
        list = await page.evaluate(() => document.querySelector('.list-episode-checkboxes').innerHTML)
    }
    
    list = list.split('\n')                                                                            

    let data  = []
    let start = []
    let end   = []

    for (let index = 0; index < list.length; index++) {
        if(list[index].includes('<tr>')) start.push(index)
        else if(list[index].includes('</tr>')) end.push(index)
    }

    for (let index = 0; index < start.length; index++) {

        let number = await list[start[index]+1].replace('<td>','')                  ; number = await number.replace('</td>','')
        let title  = await list[start[index]+2].replace('<td class="ep-title">','') ; title  = await title.replace('</td>','')
        let view   = await list[end[index]-2].replace(`" class="button active"><i class="fa fa-fw fa-info-circle"></i> Szczegóły </a>`,''); view = await view.split('/'); view = view[4]

        data.push([number,title,view])
    }

    console.log(data)
    await closeBrowser(pageBrowser[0])
    return data
    
}

async function getData(video,page) {      //this will return link to player , hidden behind api 
    console.log('get data started')               // video neeed to be an array

    const newAuth = await getAuth(page)

    let output = []

    for (let i = 0; i < video.length; i++) {
        await page.goto(`https://api4.shinden.pl/xhr/${video[i]}/player_load?auth=${newAuth}`,{ waitUntil: 'networkidle0' })
        let data = await page.evaluate(() => document.querySelector('body').innerHTML) //how many second to get link to player
        await sleep(data*1000)

        await page.goto(`https://api4.shinden.pl/xhr/${video[i]}/player_show?auth=${newAuth}&width=765&height=-1`,{ waitUntil: 'networkidle0' })

        try {
            const input_value = await page.evaluate(() => document.querySelector('body input').value)
            output.push(input_value)
            playerToString(input_value)                               //also it puts every player data to finaloutput function
        } catch (err) {

            console.log(err)

            if(err) {
                console.log("invalid player: ",video[i])
            }
        }     
        
    }

    return output
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getAuth(page) {                     //return auth code
    const newAuth = await page.evaluate(() => { 
        return _Storage.basic
    })
    console.log("auth code: ",newAuth)
    return newAuth 
}

async function getPage() {                     //returns new browser and page, also add to queue
    await checkBrowsers()
    let browser = await getBrowser()
    let page = await getSecuredPage(browser)
    return [browser,page]
}

async function closeBrowser(browser) {
    await browser.close()
    open_browser--
    console.log('current open browser: ',open_browser)
    return true
}

async function checkBrowsers() {   //check if new browser can be opened, basiclly its queue
    let id = queueId; queueId = queueId + 1
    queueCount++
    console.log(queueCount,' tasks waiting in queue')
    queue.push(id)
    let randToWhile = Math.floor(Math.random() * (5000 - 1000) + 1000)
    while (true) {
        await sleep(randToWhile)
        if(queue[0] == id && open_browser < browser_limit){
            console.log('allowed to open browser')
            open_browser++    //every time it get permission to open it adds to this var
            queueCount-- 
            queue = queue.slice(1)
            return 'page_op'
        }
    }
}

async function getSecuredPage(browser) {        //it will return page that passed
    const page = await browser.newPage()        //clodlfare test
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'pl'
    });
    page.setUserAgent(userAgent)
    await page.goto(`https://shinden.pl`,{ waitUntil: 'networkidle0' })

    while (check_title(page) == "Just a moment...") { 
        console.log('Checking secure...')
        await sleep(500) 
    }
    return page
}

async function getBrowser() {                     //returns browser to use
    let browser = await puppeteer.launch({        //bcs when I tried just add page 
        headless: false ,                         //old page frozes
        executablePath: './chromium/chrome.exe',
        args: ['--lang=pl-PL,pl']
    })
    console.log('new task started')
    return browser
}

async function filter_players(player_data) {    //this function removes players that not pass specified properties , resolution player etc
    //                                          //then send data to acceptePlayers

    console.log(player_data)

    for (let index = 0; index < player_data.length; index++) {

        let equation = player_data[index][1].replace('p','')

        if(equation >= required_res && hosting.includes(player_data[index][0])) {
            console.log('accepted: ',player_data[index][2])
            acceptedPlayers.push(player_data[index][2])
        }
        else console.log('removed ',player_data[index])
    }
}

function check_title(page) {
    return new Promise(resolve => page.evaluate(() => document.querySelector('head title').innerHTML))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}