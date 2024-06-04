console.log('linkFind.js');


function scriptDatas(){

	let datas=[]
	let localUrlDatas=[]
	sendDatas('jsDatas',datas);
	sendDatas('localUrlDatas',localUrlDatas.concat(extract_URL(document.documentElement.outerHTML)));
}

function sendDatas(dataName,datas){
	chrome.runtime.sendMessage({dataName:dataName,datas:datas}, function(response) {

	});
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

scriptDatas();