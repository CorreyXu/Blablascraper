import fetch from "node-fetch";
import fs from "fs";


const finalCookieString = fs.readFileSync("cookie.config", "utf-8");
const playersData = JSON.parse(fs.readFileSync("players.config", "utf-8"));
const unitData = JSON.parse(fs.readFileSync("units.config", "utf-8"));


async function getPlayerEquipContents(playerlink, unitid, body) {
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
                data_statistics_page_id: `https://www.blablalink.com/shiftyspad/nikke/${unitid}?uid=${playerlink}`,
                data_statistics_client_type: "pc_web",
                data_statistics_lang: "en",
            }),
            "x-language": "en",
            "x-channel-type": "2",
            "Origin": "https://www.blablalink.com",
            "Connection": "keep-alive",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-site",
            "Cookie": finalCookieString,
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        },
        "credentials" : "include",
        "referer": "https://www.blablalink.com/",
        "body": JSON.stringify(body),
        "mode": "cors"
    });

    const data = await response.json();
    return data;
}

function getBody(uid, unitArray){
    const body = {
        "character_ids": [
            `${unitArray}`
        ],
        "uid": `${uid}`
    }
    console.log(body);
    return body;
}
console.log (finalCookieString)
console.log(playersData.players[1].name)
const playerlink = playersData.players[1].link
const playeruid = playersData.players[1].uid
console.log(unitData.units[0].name)
const unit = unitData.units[0]
console.log(unit)
const unitid = unitData.units[0]?.name || "defaultUnitName"; // Use optional chaining and fallback
const unitArray = unit.ids || "defaultUnitArray"; // Use optional chaining and fallback

(async () => {
    try {
        const result = await getPlayerEquipContents(playerlink, unitid, getBody(playeruid, unitArray));
        console.log(`Response for player`, JSON.stringify(result, null, 4));
    } catch (error) {
        console.error(`Error for player:`, error);
    }
})();

/*
for (const player of playersData.players) {
    console.log(player.name);
    console.log(player.uid);
    console.log(player.link);
}

for (const unit of unitData.units){
    console.log(unit.unit)
    console.log(unit.blablalink)
    console.log(unit.ids)
}
*/

