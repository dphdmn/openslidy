//Module for basic user interactions with page, such as changing the filters

/*DEPENDENCIES
dataDisplaying.js
dataFetching.js
replayGeneration.js
*/


function toggleCountryRanks(){
    countryRanksEnabled = countriesCB.checked;
    sendMyRequest();
}

//"Public" function to change control type
function changeControls(newtype) {
    controlType = newtype;
    if (!loadingPower){
        sendMyRequest();
    }
}

//"Public" function to change filter for the name
function changeNameFilter(nameFilter) {
    usernameInput.value = nameFilter;
    requestProxy.nameFilter = nameFilter;
}

//"Public" function to change display type
function changeDisplayType(displayType) {
    requestProxy.displayType = displayType;
}

//"Public" function to change gameMode ("solveType" - Standard, 2-N Relay etc.)
function changeGameMode(gameMode) {
    requestProxy.gameMode = gameMode;
}

//"Public" function to change leaderboardType (time, move, tps)
function changeLeaderboardType(leaderboardType) {
    requestProxy.leaderboardType = leaderboardType;
}

//"Public" function to change puzzle size OR page type completely
function changePuzzleSize(puzzleSize) {
    if (puzzleSize === "NxN WRs") {
        requestProxy.size = [squaresSheetType, squaresSheetType];
        return;
    }
    if (puzzleSize === "All Singles") {
        requestProxy.size = ["All", "All"];
        return;
    }
    if (puzzleSize === "History") {
        requestProxy.size = ["History", "History"];
        return;
    }
    if (String(puzzleSize).includes("Rankings")) {
        requestProxy.size = [puzzleSize, puzzleSize];
        return;
    }
    const match = puzzleSize.toLowerCase().match(/^(\d+)x(\d+)$/);
    if (match) {
        const [N, M] = match.slice(1).map(Number);
        if (N >= 2 && M >= 2) {
            requestProxy.size = [N, M];
        }
    }
}

//"Public" function to add major event listeners for html elements
function addListenersToElements() {
    countriesCB.addEventListener("change", toggleCountryRanks);
    function addSuggestions() {
        let filteredSuggestions = [];
        usernameInput.addEventListener("input", function () {
            suggestionsContainer.innerHTML = "";
            const userInput = usernameInput.value.trim().toLowerCase();
            filteredSuggestions = fullUniqueNames.filter((name) =>
                name.toLowerCase()
                    .includes(userInput)
            );
            filteredSuggestions.forEach((suggestion, index) => {
                const suggestionElement = document.createElement("div");
                suggestionElement.textContent = suggestion;
                suggestionElement.classList.add("suggestion");
                suggestionElement.addEventListener("click", function (event) {
                    event.stopPropagation();
                    usernameInput.value = suggestion;
                    suggestionsContainer.innerHTML = "";
                    changeNameFilter(usernameInput.value);
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
        });
        usernameInput.addEventListener("keydown", function (event) {
            const suggestions = document.querySelectorAll(".suggestion");
            if ((event.key === "Tab" || event.key === "Enter") && filteredSuggestions.length > 0) {
                event.preventDefault();
                suggestions[0].click();
                changeNameFilter(usernameInput.value);
            }
        });
        usernameInput.addEventListener("focus", function () {
            suggestionsContainer.style.display = "block";
        });
        usernameInput.addEventListener("blur", function () {
            setTimeout(() => {
                suggestionsContainer.style.display = "none";
            }, 200);
        });
    }
    addSuggestions();
    createCustomReplayButton.addEventListener("click", function () {
        makeReplay("", -1, 15000, 4, 4, "Custom");
    });
    enableDebugMode.addEventListener("click", function(){
        if (!debugMode){
            if (logged_in_as !== "vovker" && logged_in_as !== "dphdmn"){
                alert("Please find your score on the leaderboard, click on it, and add video link to submit." +
                    "\nNote: Only YouTube links are accepted.\nYou can only submit your own videos for your own scores.\n" +
                    "Abuse of the system may result in a ban from the leaderboard.");
                }
        }
        debugMode = !debugMode;
        sendMyRequest();
    });
   // ytOnlyButton.addEventListener("click", function(){
  //      ytOnlyEnabled = !ytOnlyEnabled;
 //       if (ytOnlyEnabled){
 //           ytOnlyButton.textContent = "Load replays";
 //           hiddenSolveData = solveData;
 //           solveData = [];
 //           sendMyRequest();
 //       }
 //       else {
 //           ytOnlyButton.textContent = "Hide replays";
 //           solveData = hiddenSolveData;
 //           sendMyRequest();
 //       }
//
 //   });

 function incrementSize(increase = true, dimension = "both") {
    const width = request.width, height = request.height;
    if (typeof width === 'number' && Number.isInteger(width) && typeof height === 'number' && Number.isInteger(height)) {
        let newWidth = width, newHeight = height;
        if (dimension !== "height") newWidth = increase ? width + 1 : Math.max(2, width - 1);
        if (dimension !== "width") newHeight = increase ? height + 1 : Math.max(2, height - 1);
        if (newWidth !== width || newHeight !== height) {
            requestProxy.size = [newWidth, newHeight];
        }
    }
}

    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.altKey) && (event.key === "+" || event.key === "-" || event.key === "=")) {
            event.preventDefault();
            const increase = event.key === "+" || event.key === "=";
            if (event.ctrlKey) incrementSize(increase, "height");
            else if (event.altKey) incrementSize(increase, "width");
        } else if (event.key === "+" || event.key === "-" || event.key === "=") {
            incrementSize(event.key === "+" || event.key === "=", "both");
        }
        if (event.target.tagName !== "INPUT" && event.target.tagName !== "TEXTAREA") {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                var rewindSlider = document.getElementById("rewindSlider");
                if (rewindSlider) {
                    rewindSlider.focus();
                    event.preventDefault();
                }
            }
        }
    });
    tierSlider.addEventListener("input", function () {
        const value = tierSlider.value;
        tierLimit = tierLabels[value];
        if (value < 1) {
            tierSliderLabel.innerHTML = `<span class="kappa">${showAnyLevelRecords}</span>`;
        } else if (value > 9) {
            tierSliderLabel.innerHTML = `<span class="alpha WRPB">${showWRsOnly}</span>`;
        } else {
            tierSliderLabel.textContent = '';
            tierSliderLabel.appendChild(document.createTextNode(showRecordsAtleast + ' '));
            tierSliderLabel.appendChild(greekLetterSpan(tierLimit));
            tierSliderLabel.appendChild(document.createTextNode(' ' + showRecordsAtleastTierWord));
            
        }
        sendMyRequest();
    });
    customRankingsArea.addEventListener("change", () => {
        changeCustomRanks();
    });
    usernameInput.addEventListener("input", () => {
        changeNameFilter(usernameInput.value);
    });
    customMarathonInput.addEventListener("input", () => {
        let inputValue = customMarathonInput.value;
        inputValueNew = inputValue.replace(/[^0-9]/g, '');
        customMarathonInput.value = inputValueNew;
        if (inputValue === inputValueNew) {
            radioCustom.value = "Marathon " + parseInt(inputValueNew);
            radioCustom.checked = true;
            changeGameMode(radioCustom.value);
        }
    });
    radioCustom.addEventListener("click", () => {
        customMarathonInput.focus();
    });
    radioCustomSize.addEventListener("click", () => {
        customSizeInput.focus();
    });
    customSizeInput.addEventListener("input", () => {
        let inputValue = customSizeInput.value;
        const inputValueNew = inputValue.replace(/[^0-9xX]/g, '');
        customSizeInput.value = inputValueNew;
        if (inputValue === inputValueNew) {
            radioCustomSize.value = inputValueNew;
            radioCustomSize.checked = true;
            changePuzzleSize(radioCustomSize.value);
        }
    });
    puzzleSizeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                if (radio.value === "History") {
                    radio_allGameModsInteresting.checked = true;
                    request.gameMode = "Interesting";
                }
                if (radio.value === "POWER") {
                    gettingOldPower = false;
                    gettingFMCPower = false;
                    rankingTabs.style.display = "none";
                    getPowerData();
                    return;
                }
                if (radio.value === "POWEROLD") {
                    gettingOldPower = true;
                    gettingFMCPower = false;
                    rankingTabs.style.display = "none";
                    getPowerData();
                    return;
                }
                if (radio.value === "POWERFMC") {
                    gettingOldPower = false;
                    gettingFMCPower = true;
                    rankingTabs.style.display = "none";
                    getPowerData();
                    return;
                }
                changePuzzleSize(radio.value);
            }
        });
    });
    gamemodeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            if (radio.checked) {
                changeGameMode(radio.value)
            }
        });
    });
    customRankingsArea.placeholder = helpMessage;
    makeExampleButtons(customRankButtonsExamples);
    addTooltip(radio_allGameModsLabelInteresting, tooltipText);
}

//_________________End of "Public" functions of this module_________________//

//_________________"Private" functions (multiple usage)_________________

//obscure "function" to change request...
var requestProxy = new Proxy(request, {
    set: function (target, key, value) {
        if (key == "size") {
            target["width"] = value[0];
            target["height"] = value[1];
        } else {
            target[key] = value;
        }
        if (!loadingPower){
            sendMyRequest();
        }
        return true;
    },
});

//_________________"Private" functions (multiple usage) ends_________________
