const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())

const fs = require('fs')
let generateString

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/91.0.4516.106"
const hosting = ['Mega','Gdrive','Cda','Vk','Sibnet']
const required_res = 720

let browser_limit = 8    //how many tasks can be done at once, on weakest PC should be maximum 5
let open_browser = 0

const myArgs = process.argv.slice(2);

let queueCount = 0
let queue = []
let queueId = 0
const acceptedPlayers = []

////////////////////////////////////////////////////////////////////////////////////

getPlayersData(myArgs[0])

async function getPlayersData(link) {
    let episodeIDs = await getEachEpisodeID(link)

    for (let index = 0; index < episodeIDs.length; index++) {
        let link = getLinkFromID(episodeIDs[index])
        dataToPlayers(link)
        sleep(35) //it was way too fast
    }
}

async function dataToPlayers (link) {
    let playerdata = await getPlayerData(link)
    if(playerdata[0][2].includes('assets'))
    {
        dataToPlayers(link)
        console.log('BAD DATA ', link)
        return
    }
    filter_players(playerdata)
}

async function filter_players(player_data) {

    for (let index = 0; index < player_data.length; index++) {

        let equation = player_data[index][1].replace('p','')

        if(equation > required_res && hosting.includes(player_data[index][0])) {
            final(player_data[index])
        }
        else console.log('removed ',player_data[index])

        sleep(500)
    }
}

async function final(playerdata) {

    console.log(playerdata)

    let pageBrowser = await getPage()
    let auth = await getAuth(pageBrowser[1])
    let player = playerdata[2]

    let finalPlayerdata = await getData(player,auth,pageBrowser[1])
    closeBrowser(pageBrowser[0])

    console.log(finalPlayerdata)
}

async function getPlayerData(link) {
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

async function getEachEpisodeID(link) {               //return id to every single episode of link that put 
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

async function getData(video,newAuth,page) {      //this will return link to player , hidden behind api

    console.log('get data started')
    let player_data = []

    await page.goto(`https://api4.shinden.pl/xhr/${video}/player_load?auth=${newAuth}`,{ waitUntil: 'networkidle0' })
    let data = await page.evaluate(() => document.querySelector('body').innerHTML) //how many second to get link to player
    //onsole.log(data)
    await sleep(data*1000)

    await page.goto(`https://api4.shinden.pl/xhr/${video}/player_show?auth=${newAuth}&width=765&height=-1`,{ waitUntil: 'networkidle0' })

    try {
        const video_link = await page.evaluate(() => document.querySelector('body iframe').src)
        player_data.push(video_link)

        const input_value = await page.evaluate(() => document.querySelector('body input').value)
        player_data.push(JSON.parse(input_value))
        return player_data
    } catch (err) {
        if(err) {
            return "player not found"
        }
    }  
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
    await checkBrowsers()          /// here problem
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
    let randToWhile = Math.floor(Math.random() * (10000 - 2000) + 2000)
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

function check_title(page) {
    return new Promise(resolve => page.evaluate(() => document.querySelector('head title').innerHTML))
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}