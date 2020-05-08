require("chromedriver");
let fs=require("fs");
let swd=require("selenium-webdriver");
let bldr=new swd.Builder();
let driver=bldr.forBrowser("chrome").build();

let cfile=process.argv[2];
let questionsFile = process.argv[3];
( async function(){
    try{
        await driver.manage().setTimeouts({ implicit: 30000, pageLoad: 30000 })
        let data =await fs.promises.readFile(cfile);
        let{url,pwd,user}=JSON.parse(data);
        await driver.get(url);
        let usernamewillbereadpromise=driver.findElement(swd.By.css("#input-1"));
        let pwdwillbereadpromise=driver.findElement(swd.By.css("#input-2"));
        let userandpasspromise= await Promise.all([usernamewillbereadpromise,pwdwillbereadpromise]);
        let usernamewillbesendpromise=userandpasspromise[0].sendKeys(user);
        let pwdwillbesendpromise=userandpasspromise[1].sendKeys(pwd);
        await Promise.all([usernamewillbesendpromise,pwdwillbesendpromise]);
        let loginbtn=await driver.findElement(swd.By.css(" button[data-analytics=LoginPassword]"));
        await loginbtn.click();
        console.log("We have logged in");
       let dropdownbtn=await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDown]"));
       await dropdownbtn.click();
       let adminlinkanchor=await driver.findElement(swd.By.css("a[data-analytics=NavBarProfileDropDownAdministration]"));
       await adminlinkanchor.click();
       await waitforloader();
       let managetabs=await driver.findElements(swd.By.css(".administration header ul li"));
       await managetabs[1].click();
    let ManageChallengePage = await driver.getCurrentUrl();
    let questions = require(questionsFile);
       for(let i=0;i<questions.length;i++){
        await driver.get(ManageChallengePage)
         await waitforloader();
          await createNewChallenge(questions[i]);
       }


    }
    catch(err){
        console.log(err);
    }
})();
 async function waitforloader(){
    let loader=await driver.findElement(swd.By.css("#ajax-msg"));
    await driver.wait(swd.until.elementIsNotVisible(loader));
}
async function createNewChallenge(question){
    let createchallenge=await driver.findElement(swd.By.css(".btn.btn-green.backbone.pull-right"));
    await createchallenge.click();
    await waitforloader();
    let eselector=["#name","#preview","#problem_statement-container .CodeMirror div textarea","#input_format-container .CodeMirror textarea","#constraints-container .CodeMirror textarea", "#output_format-container .CodeMirror textarea", "#tags_tag"]
    let ewillbeselectedpromise=eselector.map(function(s){
        return driver.findElement(swd.By.css(s));
    })
    let AllElements= await Promise.all(ewillbeselectedpromise);
    let NameWillAddedPromise = AllElements[0].sendKeys(question["Challenge Name"]);
  let descWillAddedPromise = AllElements[1].sendKeys(question["Description"]);

  await Promise.all([NameWillAddedPromise, descWillAddedPromise]);
  await editorHandler("#problem_statement-container .CodeMirror div", AllElements[2], question["Problem Statement"]);
  await editorHandler("#input_format-container .CodeMirror div", AllElements[3], question["Input Format"]);
  await editorHandler("#constraints-container .CodeMirror div", AllElements[4], question["Constraints"]);
  await editorHandler("#output_format-container .CodeMirror div", AllElements[5], question["Output Format"]);
  // tags
  let TagsInput = AllElements[6];
  await TagsInput.sendKeys(question["Tags"]);
  await TagsInput.sendKeys(swd.Key.ENTER);
  // submit 
  let submitBtn = await driver.findElement(swd.By.css(".save-challenge.btn.btn-green"))
  await submitBtn.click();
  
  await driver.wait(swd.until.elementLocated(swd.By.css("span.tag")),10000);
   //let link=(await driver).getCurrentUrl();
  await addtestcase(question);
 
   }
  


   async function addtestcase(question){
     
    await waitforloader();
    await driver.wait(swd.until.elementLocated(swd.By.css("span.tag")),10000);
    // console.log(link);
    // await driver.get(link);
    console.log("Wait completed");
      let waitfortestcase=await driver.wait(swd.until.elementsLocated(swd.By.css(".tabs-cta-wrapper ul li"))); 
      let clickontestcasespromise=await driver.findElements(swd.By.css(".tabs-cta-wrapper ul li"));
      console.log(clickontestcasespromise.length);
      await clickontestcasespromise[2].click();    
    let alltestcases=question["Testcases"];
    console.log(alltestcases.length);
    let managetestcases= await driver.getCurrentUrl();
    for(let j=0;j<alltestcases.length;j++){
      console.log("I am "+(j+1)+" test case");
      //await driver.get(managetestcases);
     // await waitforloader();
    console.log("wait has been  completed");
   await driver.wait(swd.until.elementLocated(swd.By.css(".btn.add-testcase.btn-green")),10000);
    let addtestcases=await driver.findElement(swd.By.css(".btn.add-testcase.btn-green"));
    await addtestcases.click();
    let input=alltestcases[j]["Input"];
    let output=alltestcases[j]["Output"];
    console.log(input+" "+output);
    let eselectorofinputoutput=[".input-testcase-row .CodeMirror.cm-s-default div textarea",".output-testcase-row .CodeMirror.cm-s-default div textarea"];
  
    let inputoutputwillbeselectedpromise=eselectorofinputoutput.map(function(s){
      return driver.findElement(swd.By.css(s));
  })
  let AllElementinputoutput= await Promise.all(inputoutputwillbeselectedpromise);
  // await waitforloader();
    await editorHandler(".input-testcase-row .CodeMirror.cm-s-default div",AllElementinputoutput[0],input)
    await editorHandler(".output-testcase-row .CodeMirror.cm-s-default div",AllElementinputoutput[1],output);
    let savetestcase=await driver.findElement(swd.By.css(".btn.btn-primary.btn-large.save-testcase"));
    await savetestcase.click();
    let ctime = Date.now();
    while(Date.now()<=ctime+4000)
    {
    }
    console.log("1st test case added");
  
     }
     await driver.get(managetestcases);
     await driver.wait(swd.until.elementLocated(swd.By.css(".save-challenge.btn.btn-green")));
     let savechanges=await  driver.findElement(swd.By.css(".save-challenge.btn.btn-green"));
     await savechanges.click();

    
   } 


  async function editorHandler(parentSelector, element, data) {
    let parent = await driver.findElement(swd.By.css(parentSelector));
    
    await driver.executeScript("arguments[0].style.height='10px'", parent);
    await element.sendKeys(data);
  }