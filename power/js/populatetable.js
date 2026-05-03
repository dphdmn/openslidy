
import {FMCtiers, tiersNew, categoriesNew, tiersOld, categoriesOld, categoriesFMC, data } from "./data.js?v=1.0.126";

let powerData;
let tiers;
let categories;
let num_tiers;
let num_categories;
let oldTiers;
let userFinalTierMap;
let fmcPower;


function format(time, noTrail=false) {
    if (time == -1) {
        return "";
    }

    var t = time;
    var seconds = Math.floor(t / 1000);
    var millis = t % 1000;


    var result = seconds + "." + millis.toString().padStart(3, "0");
    // Remove unnecessary trailing zeros after the decimal point
    if (noTrail) {
        result = result.replace(/\.?0+$/, ''); // Remove trailing zeros & dot if necessary
    }
    return result;
    
}

function result_tier(category, time){
    if(time == -1){
        return -1;
    }

    var tier;
    for(tier=0; tier<num_tiers; tier++){
        if(time == ""){
            break;
        }
        if(time > tiers[tier]["times"][category]){
            break;
        }
    }
    return tier-1;
}


function populate_table(table){
    var results_table = document.getElementById("results-table");

    // remove the previous table, if there was one
    while(results_table.hasChildNodes()){
        results_table.removeChild(results_table.firstChild);
    }
    // Insert wrapper div before results_table
    // which user do we need to add to the table next?
    var next_user = 0;

        // Categories table
        var tier_wrapper = document.createElement("div");
        tier_wrapper.className = "results-table";
        tier_wrapper.style.position = "sticky";
        tier_wrapper.style.top = "0";
        tier_wrapper.style.zIndex = "100";
        tier_wrapper.style.paddingTop = "var(--header_height)";
        tier_wrapper.style.marginBottom = "calc(-1 * var(--header_height))";
        var tier_table = document.createElement("table");
        tier_wrapper.appendChild(tier_table);
        results_table.parentNode.insertBefore(tier_wrapper, results_table);
        var tier_head = document.createElement("thead");
        var tier_events_row = document.createElement("tr");
        tier_head.className = "table-header";
        tier_events_row.className = "events-row";
        tier_table.appendChild(tier_head);
        tier_head.appendChild(tier_events_row);
        tier_table.style.position = 'sticky';
        tier_head.style.zIndex = 2;
        for(var j=0; j<3; j++){
            tier_events_row.appendChild(document.createElement("td"));
        }
        tier_events_row.children[0].textContent = "Name";
        tier_events_row.children[0].style.minWidth = "132px";
        tier_events_row.children[1].textContent = "Place";
        tier_events_row.children[2].textContent = "Power";
        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.innerHTML = categories[j].replace(/ /g, '<br>');
            tier_events_row.appendChild(div);
        }
        

    for(var i=num_tiers-1; i>0; i--){
        const tier = tiers[i];
        const tier_name = tier["name"].toLowerCase().replace(" ","-");

        // table of all results of users in this tier
        var tier_table = document.createElement("table");
        tier_table.id = tier_name + "-table";
        results_table.appendChild(tier_table);

        // set up the header rows
        var tier_head = document.createElement("thead"); // header containing the following three rows
        var tier_req_row = document.createElement("tr"); // row containing the results required for the tier
        var tier_events_row = document.createElement("tr"); // row containing names of the categories

        tier_head.className = "table-header";
        tier_req_row.className = "req-row";
        tier_events_row.className = "events-row";
        tier_table.appendChild(tier_head);
        
        tier_events_row.style.display = 'none';
        tier_head.appendChild(tier_req_row);
        tier_head.appendChild(tier_events_row);


        // tier name row
        var tier_name_div = document.createElement("td");

        // fill up the whole width of the table (columns = username, place, power, categories)
        tier_name_div.colSpan = num_categories+3;
        tier_name_div.textContent = tier["name"];
        const name = tier["name"].toLowerCase().replace(" ","-");
        let attrName = name;
        if (oldTiers) {
            attrName += "OLD";
        }
        // tier requirements row
        for(var j=0; j<3; j++){
            const tdel = document.createElement("td");
            tdel.setAttribute("tierf", attrName);
            tier_req_row.appendChild(tdel);
        }

        tier_req_row.children[0].innerHTML = tier["name"].replace(/ /g, '<br>');
        tier_req_row.children[0].style.minWidth = "132px";
        tier_req_row.children[1].textContent = tier["power"];
        tier_req_row.children[2].textContent = tier["limit"];
        if (tier["limit"] == 9999999) {
            tier_req_row.children[2].textContent = "∞";
        }

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.textContent = format(tier["times"][j], true);
            div.setAttribute("tierf", attrName);
            tier_req_row.appendChild(div);
        }

        // tier events row
        for(var j=0; j<3; j++){
            tier_events_row.appendChild(document.createElement("td"));
        }
        tier_events_row.children[0].textContent = "Name";
        tier_events_row.children[0].style.minWidth = "132px";
        tier_events_row.children[1].textContent = "Place";
        tier_events_row.children[2].textContent = "Power";

        for(var j=0; j<num_categories; j++){
            var div = document.createElement("td");
            div.innerHTML = categories[j].replace(/ /g, '<br>');
            tier_events_row.appendChild(div);
        }

        // add the users to the table
        while(true){
            const user = table[next_user];
            // if the user is undefined or the user's power is too low, stop adding new rows
            if (user === undefined) {
                break;
            }
            // if the user's power is too low, stop adding new rows
            if(user[2] < tier["limit"] && tier["limit"]>1){ 
                break;
            }
            if(userFinalTierMap[user[0]] != tier["name"]){
                //don't add users if no scores for valid tier
                if (tier["name"] != "Beginner") {
                    break;
                }
                
            }

            // create a new row and the cells for the username, place, power
            var user_row = document.createElement("tr");
            var name_div = document.createElement("td");
            var place_div = document.createElement("td");
            var power_div = document.createElement("td");

            name_div.innerHTML = appendFlagIconToNickname(user[0], true);
            place_div.textContent = user[1];
            power_div.textContent = user[2];

            user_row.className = "player-row";
            name_div.className = "player";
            place_div.className = "player-place";
            power_div.className = "player-power";
            let attrName = tier_name;
            if (oldTiers) {
                attrName += "OLD";
            }
            name_div.setAttribute("tier", attrName);
            place_div.setAttribute("tier", attrName);
            power_div.setAttribute("tier", attrName);

                if((i !== tiers.length - 1) && (user[2] > tiers[i+1]["limit"])){
                power_div.setAttribute("class", "player-power power_req_reached");
                power_div.setAttribute("title", "Missing one score of the higher tier to rank up.");
                }


            tier_table.appendChild(user_row);
            user_row.appendChild(name_div);
            user_row.appendChild(place_div);
            user_row.appendChild(power_div);
            if (oldTiers) {
                const dynamicSum = getDynamicSum(user.slice(3));
                if (dynamicSum > 303030){
                    if (user[2] > 303030){
                        //power_div.innerHTML += `<br><span style="fontSize=10px;color:cyan">${dynamicSum}</span>`;
                    } else {
                        power_div.innerHTML += `<br><span style="fontSize=10px;">${dynamicSum}</span>`;
                    }
                }
                
            }
            // add the users results
            for(var j=0; j<num_categories; j++){
                let time = user[j+3];

                var div = document.createElement("td");
                div.textContent = format(time, fmcPower);

                user_row.appendChild(div);

                const t = result_tier(j, time);

                // tier is -1 if below the first rank
                if(t != -1){
                    const name = tiers[t]["name"].toLowerCase().replace(" ","-");
                    let attrName = name;
                    if (oldTiers) {
                        attrName += "OLD";
                    }
                    div.setAttribute("tier", attrName);
                }
            }

            next_user++;
        }
    }
}

export function show_results_from_date(date){
    if(date in data){
        //const str = decompress(data[date]);
        //const table = JSON.parse(str);
        //populate_table(table);
        //console.log(powerData);
        populate_table(powerData);
        // show the selected date on the button
        var date_button = document.getElementById("date-button");
        if (oldTiers) {
            date_button.innerHTML = "Classic Power Rankings";
        } else {
            if (fmcPower){
                date_button.innerHTML = "FMC Power Rankings";
            } else {
                date_button.innerHTML = "Modern Power Rankings";
            }
        }
    }
}
window.addEventListener('message', (event) => {
    const [eventPowerData, eventOldTiers, gettingFMCPower, eventuserFinalTierMap] = event.data;
    //console.log(eventPowerData, eventOldTiers);
    powerData = eventPowerData;
    oldTiers = eventOldTiers;
    userFinalTierMap = eventuserFinalTierMap;
    fmcPower = gettingFMCPower;
    var dates = Object.keys(data);
    var latest = dates[dates.length-1];
    
    if (oldTiers) {
        tiers = tiersOld;
        categories = categoriesOld;
    } else {
        if (fmcPower) {
            tiers = FMCtiers;
            categories = categoriesFMC;
        } else {
        tiers = tiersNew;
        categories = categoriesNew;
        }
    }
    num_tiers = tiers.length;
    num_categories = categories.length;
    show_results_from_date(latest);
});