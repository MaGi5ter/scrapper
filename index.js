const puppeteer = require('puppeteer-extra')
const fs = require('fs').promises;
const {executablePath} = require('puppeteer')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())


const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36 OPR/91.0.4516.106"
const auth = ""
const video = "23542"


async function saveCookies(page) {
    const cookies = await page.cookies();
    await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    console.log("cookies saved")
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

puppeteer.launch({
    headless: false ,
    executablePath: executablePath()
}).then(async browser => {

    const cookiesString = await fs.readFile('./cookies.json'); 
    const cookies = JSON.parse(cookiesString);
    const page = await browser.newPage() //OPEN PAGE
    await page.setCookie(...cookies);    //LOAD COOKIES

    page.setUserAgent(userAgent)

    await page.goto(`https://api4.shinden.pl/xhr/${video}/player_load?auth=${auth}`,{ waitUntil: 'networkidle0' })
    let data = await page.evaluate(() => document.querySelector('body').innerHTML) //how many second to get link to player

    console.log(data)
    await sleep(data*1000)

    await page.goto(`https://api4.shinden.pl/xhr/${video}/player_show?auth=${auth}&width=765&height=-1`,{ waitUntil: 'networkidle0' })


    try {
        const video_link = await page.evaluate(() => document.querySelector('body iframe').src)
        console.log(video_link)

        const input_value = await page.evaluate(() => document.querySelector('body input').value)
        console.log(JSON.parse(input_value))

        await page.goto(video_link)
    } catch (err) {
        console.log('dthis one does not exist')
    }

})