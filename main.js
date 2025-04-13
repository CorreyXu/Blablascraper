import fetch from "node-fetch";
import fs from "fs";


const output = fs.createWriteStream('output.csv');
output.write('player,unit,totalele,totalatk,totalammo,totalcs,totalhitrate,gear1line1,gear1line2,gear1line3,gear2line1,gear2line2,gear2line3,gear3line1,gear3line2,gear3line3,gear4line1,gear4line2,gear4line3,\n');


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
    //console.log(body);
    return body;
}



(async () => {
    let result
    try {
        for (const player of playersData.players) {
            for (const unit of unitData.units){
                const playerlink = player.link
                const playeruid = player.uid
                const unitid = unit?.name || "defaultUnitName"; 
                const unitArray = Array.isArray(unit.ids) ? unit.ids : ["defaultUnitArray"]; 

                result = await getPlayerEquipContents(playerlink, unitid, getBody(playeruid, unitArray));
                console.log(`Response for player ${player.name} unit: ${unit.name}` );
                


                
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
                //console.log("helppp", JSON.stringify(flatten,null,4));
                const lastfour = [0,0,0,0]
                for(const equip_id in flatten){
                    const index = String(flatten[equip_id].equip_id)[1];
                    lastfour[index-1] = flatten[equip_id];
                }
                
                // Now sum IncElementDmg values from valid equips only
                let gearLines = [["blank","blank","blank"],["blank","blank","blank"],["blank","blank","blank"],["blank","blank","blank"]]
                

                let totalElementDmg = 0;
                let totalAtk = 0;
                let totalMaxAmmo = 0;
                let totalChargeSpd = 0;
                let totalHitRate = 0;


                for (const equip in lastfour) { 

                    for (const effect in lastfour[equip].equip_effects) {
                        for (const func in lastfour[equip].equip_effects[effect].function_details) {
                            if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "IncElementDmg") {
                                totalElementDmg += Math.abs(lastfour[equip].equip_effects[effect].function_details[func].function_value/100);
                            }
                            if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "StatAtk") {
                                totalAtk += Math.abs(lastfour[equip].equip_effects[effect].function_details[func].function_value/100);
                            }
                            if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "StatAmmoLoad") {
                                totalMaxAmmo += Math.abs(lastfour[equip].equip_effects[effect].function_details[func].function_value/100);
                            }
                            if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "StatChargeTime") {
                                totalChargeSpd += Math.abs(lastfour[equip].equip_effects[effect].function_details[func].function_value/100);
                            }
                            if (lastfour[equip].equip_effects[effect].function_details[func].function_type == "StatAccuracyCircle") {
                                totalHitRate += Math.abs(lastfour[equip].equip_effects[effect].function_details[func].function_value/100);
                            }
                            gearLines[equip][effect] = `${lastfour[equip].equip_effects[effect].function_details[func].function_type}: ${Math.abs(lastfour[equip].equip_effects[effect].function_details[func].function_value/100).toFixed(2)}`;

                        }
                    }
                }
                
                console.log("total IncElementDmg:", totalElementDmg);
                console.log("total Atk:", totalAtk);
                console.log("total Ammo Load:", totalMaxAmmo);
                console.log("total Charge Spd:", totalChargeSpd);
                console.log("total Hit Rate:", totalHitRate);
                output.write(`${player.name},${unit.name},${totalElementDmg.toFixed(2)},${totalAtk.toFixed(2)},${totalMaxAmmo.toFixed(2)},${totalChargeSpd.toFixed(2)},${totalHitRate.toFixed(2)},${gearLines[0][0]},${gearLines[0][1]},${gearLines[0][2]},${gearLines[1][0]},${gearLines[1][1]},${gearLines[1][2]},${gearLines[2][0]},${gearLines[2][1]},${gearLines[2][2]},${gearLines[3][0]},${gearLines[3][1]},${gearLines[3][2]}\n`);
            }
        }



        output.end(() => {
            console.log('closed CSV')
        })
        

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