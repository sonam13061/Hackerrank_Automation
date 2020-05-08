let puppeteer = require("puppeteer");
let cFile = process.argv[2];
let fs = require("fs");
(async function () {
  // browser open => visible 
 
  let browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,

    args: ["--start-maximized"]
  });
  // let page = await browser.newPage();
  let pages = await browser.pages();
  let page = pages[0];

  let data = await fs.promises.readFile(cFile);
  let { url, pwd, user } = JSON.parse(data);
  
  await page.goto(url, { waitUntil: "networkidle0" });
  
  await page.type("#input-1", user);
  await page.type("#input-2", pwd);

  await Promise.all(
    [page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("button[data-analytics=LoginPassword]")])
  // ********************DashBoard*************************

  await page.waitForSelector("a[data-analytics=NavBarProfileDropDown]", { visible: true });
  await page.click("a[data-analytics=NavBarProfileDropDown]");
  await Promise.all(
    [page.waitForNavigation({ waitUntil: "networkidle0" }),
    page.click("a[data-analytics=NavBarProfileDropDownAdministration]"),])

  await page.waitForSelector(".administration header", { visible: true })
  let tabs = await page.$$(".administration header ul li a");

  let href = await page.evaluate(function (el) {
    return el.getAttribute("href");
  }, tabs[1])
  let mpUrl = "https://www.hackerrank.com" + href;
  
  await page.goto(mpUrl, { waitUntil: "networkidle0" });
  handlesinglepagequestion(page,browser);
  
  
})();
 async function handlesinglepagequestion(page,browser){
  await page.waitForSelector(".backbone.block-center");
  let qoncpage=await page.$$(".backbone.block-center");
  let parr=[];
  for(let i=0;i<qoncpage.length;i++){
    let href=await page.evaluate(function(ele){
      return ele.getAttribute("href");
    },qoncpage[i]);
  
  let newpage=await browser.newPage();
  let mwillbeaddedtoquestion=handlesinglequestion(newpage,"https://www.hackerrank.com"+href);
  parr.push(mwillbeaddedtoquestion);
  }
  await Promise.all(parr);
  await page.waitForSelector(".pagination ul li");
  paginations=await page.$$(".pagination ul li");
  let nextbtn=paginations[paginations.length-2];
  let classname=await page.evaluate(function(ele){
    return ele.getAttribute("class");
  },nextbtn);
  if(classname=="disabled"){
        return;
  }
  else{
    await Promise.all([nextbtn.click(),page.waitForNavigation({waitUntil:"networkidle0"})]);
    await handlesinglepagequestion(page,browser);
  }

}
 async function handlesinglequestion(newpage,link){
  await newpage.goto(link,{waitUntil:"networkidle0"});
  await newpage.waitForSelector(".tag");
  await newpage.click("li[data-tab=moderators]");
  await newpage.waitForSelector("input[id=moderator]",{waitUntil:"networkidle0"});
  await newpage.type("#moderator",process.argv[3]);
  await newpage.keyboard.press("Enter");
  await newpage.click(".save-challenge.btn.btn-green");
  await newpage.close();

}
