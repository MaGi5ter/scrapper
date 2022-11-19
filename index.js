const puppeteer = require('puppeteer-extra')
let {executablePath} = require('puppeteer')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())
const db = require('./mysql')

console.log(executablePath())

const myArgs = process.argv.slice(2);

if(myArgs.length < 2) {
    console.log('no args')
    return
}

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/91.0.4516.106"

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function check_title(page) {
    return new Promise(resolve => page.evaluate(() => document.querySelector('head title').innerHTML))
}
const query = (sql) => {return new Promise((resolve, reject) => {db.query(sql, (err, rows) => {if(err) {return reject(err);}return resolve(rows)})})}

puppeteer.launch({
    headless: false ,
    executablePath: './path-to-executable/puppeter/chrome.exe',
    args: ['--lang=pl-PL,pl']
}).then(async browser => {

    console.log(await getAuth())
   // getVideos(myArgs[0],myArgs[1])

    async function getVideos(min,max) {  // 
        let auth = await getAuth()
        let page = await getSecuredPage()
        let check
        
        for (let index = min; index < max; index++) {
            await query(`SELECT * FROM fuck_shinden WHERE ID = ${index}`).then((data) => {
                check = data
            })
            if(check.length < 1) {
                await saveDB(await getData(index,auth,page),index)
            }
            else {
                console.log(`${index} : exist in DB`)
            }
            
        }

        page.close()
        browser.close()
    }

    async function saveDB(data,id) {
        if(data == "player not found") {
            let sql = `INSERT INTO fuck_shinden (ID, player_name, audio_lang, sub_lang, source, title, episode_no, episode_time,embded, player_link) VALUES (${id}, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)`
            db.query(sql,function (err){
                if(err){
                    console.log('inserting empty player info error')
                    console.log(err)
                }
                console.log(`${id} : EMPTY`)
            })
        }
        else {

            data[1].embded = data[1].embded.replace(/"/ig,"'")

            let sql = `INSERT INTO fuck_shinden (ID, player_name, audio_lang, sub_lang, source, title, episode_no, episode_time,embded, player_link) 
            VALUES (${id}, '${data[1].player_name}','${data[1].audio_lang}', '${data[1].sub_lang}', '${data[1].source}', "${data[1].title.title}", ${data[1].episode.episode_no}, ${data[1].episode.episode_time}, "${data[1].embded}", "${data[0]}")`

            db.query(sql,function (err){
                if(err){
                    console.log('inserting player info error')
                    console.log(err)
                }
                console.log(`${id} : episode: ${data[1].episode.episode_no} serie: ${data[1].title.title}`)
            })
        }
    }

    async function getData(video,newAuth,page) { //this will return data if player exists

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

            //await page.goto(video_link)
        } catch (err) {
            if(err) {
                return "player not found"
            }
        }  
    }

    async function getAuth() {  //return auth code
        let page = await getSecuredPage()
        const newAuth = await page.evaluate(() => { 
            return _Storage.basic
        })
        await page.close()
        return newAuth 
    }

    async function getSecuredPage() { //it will return Secured Page
        const page = await browser.newPage() 
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
})