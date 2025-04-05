import fetch from "node-fetch";

const finalCookieString = 

const characterIds = [	583401
,   583402
, 583403
, 583404
,  583405
,   583406
,  583407
,  	583408
,  583409
, 583410
,	583411
];

async function getPlayerEquipContents() {
    const response = await fetch("https://api.blablalink.com/api/game/proxy/Tools/GetPlayerEquipContents", {
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:136.0) Gecko/20100101 Firefox/136.0",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "x-common-params": JSON.stringify({
                game_id: "16",
                area_id: "global",
                source: "pc_web",
                intl_game_id: "29080",
                language: "en",
                env: "prod",
                data_statistics_scene: "outer",
                data_statistics_page_id: "https://www.blablalink.com/shiftyspad/nikke/835",
                data_statistics_client_type: "pc_web",
                data_statistics_lang: "en"
            }),
            "x-language": "en",
            "x-channel-type": "2",
            "Origin": "https://www.blablalink.com",
            "Referer": "https://www.blablalink.com/",
            "Cookie": finalCookieString,
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site"
        },
        body: JSON.stringify({ character_ids: characterIds })
    });

    const data = await response.json();
    return data;
}

// Execute and print the response
(async () => {
    try {
        const result = await getPlayerEquipContents();
        console.log("Response:", JSON.stringify(result, null, 4));
    } catch (error) {
        console.error("Error:", error);
    }
})();