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
                data_statistics_page_id: `https://www.blablalink.com/shiftyspad/nikke/${unitid}?uid=${playerlink}&openid=${playerlink}`,
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
        "mode": "cors",
        "TE": "trailers"
    });

    const data = await response.json();
    return data;
}

function getBody(uid, unitArray){
    const body = {
        "character_ids": unitArray,
        "uid": `${uid}`
    }
    console.log(body);
    return body;
}
console.log (finalCookieString)
console.log(playersData.players[1].name)
const playerlink = playersData.players[1].link
const playeruid = playersData.players[1].uid
console.log(unitData.units[2].name)
const unit = unitData.units[2]
console.log(unit)
const unitid = unitData.units[0]?.name || "defaultUnitName"; // Use optional chaining and fallback

const unitArray = Array.isArray(unit.ids) ? unit.ids : ["defaultUnitArray"]; // Ensure unitArray is an array

(async () => {
    let result
    try {
        result = await getPlayerEquipContents(playerlink, unitid, getBody(playeruid, unitArray));
        console.log(`Response for player ${playersData.players[1].name} unit: ${unit.name}` );
        


        
        const characterMap = {};

        result.data.player_equip_contents.forEach(entry => {
            const { character_id, equip_contents } = entry;
            // Filter only valid equips (non -99) and limit to 4
            const validEquips = equip_contents
                .filter(equip => equip.equip_id !== -99)
                .slice(0, 4);
        
            characterMap[character_id] = validEquips;
        });
        for(const key in characterMap){
            //console.log(key)
            //console.log(characterMap[key]);
            if(Array.isArray(characterMap[key]) && characterMap[key].length == 0){
                delete characterMap[key];
            }
        }
        
        const flatten = Object.values(characterMap).flat();
        const lastfour = flatten.slice(-4);

        //console.log("helppp", JSON.stringify(lastfour,null,4));
        
        
        // Now sum IncElementDmg values from valid equips only
        let totalElementDmg = 0;
        let totalAtk = 0;
        
        for (const equip in lastfour) { 
            //console.log ("equip", JSON.stringify(lastfour[equip].equip_effects,null,4));
            for (const effect in lastfour[equip].equip_effects) {
                //console.log("equip", JSON.stringify(lastfour[equip].equip_effects[effect].function_details,null,4));
                for (const func in lastfour[equip].equip_effects[effect].function_details) {
                    //console.log("equip", JSON.stringify(lastfour[equip].equip_effects[effect].function_details[func].function_type,null,4));
                    if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "IncElementDmg") {
                        totalElementDmg += lastfour[equip].equip_effects[effect].function_details[func].function_value;
                    }
                    if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "StatAtk") {
                        totalAtk += lastfour[equip].equip_effects[effect].function_details[func].function_value;
                    }
                }
            }
        }
        
        console.log("total IncElementDmg:", totalElementDmg);
        console.log("total Atk:", totalAtk);


    } catch (error) {
        //console.error(`Error for player:`, error);
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