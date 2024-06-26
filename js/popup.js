
chrome.tabs.executeScript({
  file:'js/linkFind.js'
})

var domains=new Array();
var netWorksUrls=new Array();
var crossOrginUrls=new Array();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	let {dataName,datas}=request;
  	switch (dataName) {
		case "localUrlDatas":
			addLists("localUrlDatasDv",unique(datas));
			addLists("domainDatasDv",unique(domains));

	}
     
  });

function addLists (divName,datas) {
	if (divName=="externalUrlDatasDv"){
		let dvName=document.getElementsByClassName("accordion-group");
		let text = ''
		let random=Math.floor(Math.random()*1000);



		let template = `
	<div class="accordion-heading">
        <a class="accordion-toggle" data-toggle="collapse"  href="#collapse${random}">
          ${datas[0]}
        </a>
    </div>
    <div id="collapse${random}" class="accordion-body collapse" >
        <div class="accordion-inner">
        	${datas[1].map( (u) => {
        		return `<div style="text-indent:2em">${u}</div>`
				}).join('')
			}
        </div>
    </div>`

		text+=template
		let accordionObj=document.createElement("div");
		accordionObj.innerHTML=text;
		dvName[0].appendChild(accordionObj);

	}else {
		let dvName=document.getElementById(divName);
		let ulObj=document.createElement("div");
		dvName.appendChild(ulObj);
		for (var i = 0; i < datas.length; i++) {
			var liObj =document.createElement("div");
			liObj.innerText = datas[i];
			ulObj.appendChild(liObj);
		}
	}
}


chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
	let currentTab = tabs[0]
	let urlName;
	urlName=currentTab.url;
	if (typeof(urlName) !="undefined"){
		const bg=chrome.extension.getBackgroundPage();
		let netWorkObj=bg.getDatas(urlName);
		if (typeof(netWorkObj) !="undefined"){
			netWorksUrls=netWorkObj.netWorksUrls;
			crossOrginUrls=netWorkObj.crossOrginUrls;
			addLists('networkDatasDv',unique(netWorksUrls));
			addLists('crossOriginDatasDv',unique(crossOrginUrls));
			for (let i=0;i<crossOrginUrls.length;i++){
				if(i==0){
					domains.push(new URL(netWorksUrls[i]).hostname);
				}
				domains.push(new URL(crossOrginUrls[i]).hostname);
			}
			findUrls(unique(netWorksUrls),unique(crossOrginUrls));


		}
	}
});


function findUrls(netWorksUrls,crossOrginUrls){
	for (let i=0;i<crossOrginUrls.length;i++){
		if(crossOrginUrls[i].endsWith(".js")){
			httpGet(crossOrginUrls[i],(url,urls) => {
				addLists('externalUrlDatasDv',[url,urls]);
			});
		}
	}

	for (let i=0;i<netWorksUrls.length;i++){
		if(netWorksUrls[i].endsWith(".js")){
			httpGet(netWorksUrls[i], (url,urls) => {
				addLists('externalUrlDatasDv',[url,urls]);
			});
		}
	}

}

function httpGet(url, callback){
	let request =new XMLHttpRequest();
	request.onload = () => {
		if(request.status==200){
			let urls=extract_URL(request.responseText);
			if(urls!=null){
				if(callback && typeof callback === 'function'){
					callback(url,unique(urls));
				}
			}
		}else{
			console.log('no 200');
		}

	}
	request.open("GET",url);
	request.send(null);
}

function extract_URL(htmlDatas) {
    // 使用正则表达式匹配 URL
    const urlPattern = /(?:"|')(((?:[a-zA-Z]{1,10}:\/\/|\/\/)[^"'/]{1,}\.[a-zA-Z]{2,}[^"']*)|((?:\/|\.\.\/|\.\/)[^"'><,;| *()(%%$^\/\\\[\]][^"'><,;|()]*)|([a-zA-Z0-9_\-/]+\/[a-zA-Z0-9_\-/]+\.(?:[a-zA-Z]{1,4}|action)(?:[\?|\/][^"|']*)?)|([a-zA-Z0-9_\-]+\.(?:php|asp|aspx|jsp|json|action|html|js|txt|xml)(?:\?[^"|']*)?))(?:"|')/g;

    // 黑名单后缀列表
    const blacklist = [
        ".html", ".webm", ".doc", ".docx", ".zip", ".rar", ".pdf", ".png", 
        ".jpeg", ".jpg", ".gif", ".svg", ".woff", ".mp4", 
        ".mp3", ".woff2", ".woff", ".ico", ".ttf", ".otf", ".min.map", 
        ".css.map", ".js.map"
    ];

    // 获取所有匹配的 URL
    const matches = htmlDatas.match(urlPattern);

    // 如果没有匹配项，返回空数组
    if (!matches) {
        return [];
    }

    // 去掉每个匹配项的开头和结尾的引号
    const urls = matches.map(match => match.slice(1, -1));

    // 过滤掉包含黑名单后缀的 URL
    const filteredUrls = urls.filter(url => 
        !blacklist.some(ext => url.toLowerCase().endsWith(ext))
    );

    return filteredUrls;
}

function unique(arr){
	return Array.from(new Set(arr));
}
