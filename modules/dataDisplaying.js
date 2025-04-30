//Module to create sheets of processed leaderboard data

/*DEPENDENCIES
dataFetching.js
dataProcessing.js
replayGeneration.js
userInteractions.js
*/

function greekLetterSpan(tierName) {
    if (tierName === "Any" || tierName === "WRs only") {
        return tierName;
    }
    // Create a mapping of tier names to their corresponding letters, classes, and glow colors
    const tierMap = {
        kappa: { letter: 'κ', class: 'kappa', glow: '#afafaf' },
        iota: { letter: 'ι', class: 'iota', glow: '#23958b' },
        theta: { letter: 'θ', class: 'theta', glow: '#b9f2ff' },
        eta: { letter: 'η', class: 'eta', glow: '#85fa85' },
        zeta: { letter: 'ζ', class: 'zeta', glow: '#ffaaf4' },
        epsilon: { letter: 'ε', class: 'epsilon', glow: '#ffff00' },
        delta: { letter: 'δ', class: 'delta', glow: '#a14dff' },
        gamma: { letter: 'γ', class: 'gamma', glow: '#ff2262' },
        beta: { letter: 'β', class: 'beta', glow: '#00ff00' },
        alpha: { letter: 'α', class: 'alpha', glow: '#00ffff' }
    };

    // Check if the tierName exists in the mapping
    if (tierMap[tierName]) {
        // Create a span element
        const span = document.createElement('span');

        // Set the class for base styling
        span.className = tierMap[tierName].class;

        // Set the letter as the text content
        span.textContent = tierMap[tierName].letter;

        // Apply glowing effect using inline style for text-shadow
        span.style.textShadow = `
            0 0 5px ${tierMap[tierName].glow},
            0 0 10px ${tierMap[tierName].glow},
            0 0 15px ${tierMap[tierName].glow}
        `;

        span.style.fontSize = '18px';

        // Return the span element
        return span;
    } else {
        console.error('Invalid tier name:', tierName);
        return null;
    }
}

//"Public" function to create card-style sheets (normal or square WRs), sheetType = Squares / -1
function createSheet(sortedLists, sheetType) {
    const noNameFilter = (request.nameFilter === "");
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList.remove("content");
    contentDiv.innerHTML = "";
    NxNWRsContainer.innerHTML = "";
    let tiersData;
    let tiersMap;
    let headersCount = 5;
    generateFormattedString(request);
    const mainHeaders = normalTableHeaders;
    if (Object.values(sortedLists)
        .every(list => list.length === 0)) {
        contentDiv.innerHTML = notFoundError;
        return;
    }
    if (sheetType === squaresSheetType) {
        tiersData = calculateNxMTiers(combinedList);
        if (noNameFilter) {
            createScoresAmountTable(NxNWRsContainer, tiersData);
        }
        tiersMap = tiersData.tiersMap;
    }
    contentDiv.classList = "content";
    mainHeaders.forEach(header => {
        if (sortedLists[header].length > 0) {
            const tableContainer = document.createElement('div');
            tableContainer.classList.add('table-container');
            contentDiv.appendChild(tableContainer);
            const headerElement = document.createElement('h1');
            headerElement.textContent = header;
            tableContainer.appendChild(headerElement);
            tableContainer.classList.add("cardContainer");
            const table = document.createElement('table');
            table.classList.add("normalCardTable");
            tableContainer.appendChild(table);
            const tableHeaderRow = document.createElement('tr');
            if (sheetType !== squaresSheetType || noNameFilter) {
                tableHeaderRow.innerHTML = cardHeadersNormal;
            } else {
                tableHeaderRow.innerHTML = cardHeadersTier;
            }
            //table.appendChild(tableHeaderRow);
            let mytableid = 0;
            let bestValue;
            sortedLists[header].forEach(item => {
                let percentageCurrent = 100;
                const isAverage = (header !== normalTableHeaders[0]);
                mytableid++;
                const tableRow = document.createElement('tr');
                let scoreType = request.leaderboardType;
                let mainValue;
                let tierNameForReplay;
                let isWRforReplay = false;
                let reverse = false;
                if (scoreType === "move") {
                    scoreType = "Moves"
                    mainValue = item.moves;
                }
                if (scoreType === "time") {
                    scoreType = "Time"
                    mainValue = item.time;
                }
                if (scoreType === "tps") {
                    scoreType = "TPS"
                    mainValue = item.tps;
                    reverse = true;
                }
                if (mytableid === 1) {
                    bestValue = mainValue;
                }
                let thisScoreInvalid = false;
                let displayedName = appendFlagIconToNickname(item.nameFilter);
                let limitsString = '';
                let percentageInfoForNormal = "";
                if (sheetType !== squaresSheetType) {
                    //normal sheet
                    const percentage = calculatePercentage(mainValue, bestValue, reverse);
                    percentageInfoForNormal = percentage.toFixed(1) + "% ";
                    const tierName = getClassBasedOnPercentage(percentage, percentageTable);
                    tableRow.classList.add(tierName);
                    tierNameForReplay = tierName;
                    if (percentage === 100) {
                        isWRforReplay = true;
                        percentageInfoForNormal = "WR "
                        tableRow.classList.add("WRPB");
                    }
                    tableRow.appendChild(createTableCell(mytableid, 'tableid'));
                } else {
                    //WRs or PBs sheet
                    if (!noNameFilter) {
                        bestValue = getBestValue(WRsDataForPBs[header], scoreType, item.width, item.height);
                        limitsString = `<p>${item.width}x${item.height} ${header} ${requirementsString} (${request.gameMode}):</p>`
                        const limit = getScoreLimitExact(100, bestValue, reverse);
                        const limitVisual = getScoreLimit(100, bestValue, reverse, scoreType, isAverage);
                        if (limit !== limitVisual) {
                            limitsString += `<p><span class="alpha WRPB">WR: ${limitVisual} (${limit})</span></p>`;
                        } else {
                            limitsString += `<p><span class="alpha WRPB">WR: ${limitVisual}</span></p>`;
                        }
                        for (const key in percentageTable) {
                            if (percentageTable.hasOwnProperty(key)) {
                                const percentageValue = percentageTable[key];
                                const limit = getScoreLimitExact(percentageValue, bestValue, reverse);
                                const limitVisual = getScoreLimit(percentageValue, bestValue, reverse, scoreType, isAverage);
                                const categoryName = key.charAt(0)
                                    .toUpperCase() + key.slice(1)
                                if (limit !== limitVisual) {
                                    limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual} (${limit})</span></p>`;
                                } else {
                                    limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual}</span></p>`;
                                }
                            }
                        }
                        const percentage = calculatePercentage(mainValue, bestValue, reverse);
                        percentageCurrent = percentage;
                        const tierName = getClassBasedOnPercentage(percentage, percentageTable);
                        tierNameForReplay = tierName;
                        tableRow.classList.add(tierName);
                        if (mainValue === bestValue) {
                            displayedName = "WR";
                            isWRforReplay = true;
                            tableRow.classList.add("WRPB");
                        } else {
                           // displayedName = `${tierName.charAt(0).toUpperCase()}${tierName.slice(1)} ${percentage.toFixed(1)}%`;
                           displayedName = `${percentage.toFixed(3)}%`;
                        }
                    } else {
                        isWRforReplay = true;
                        tierNameForReplay = "alpha";
                        tableRow.classList.add(tiersMap[item.nameFilter]);
                    }
                    const puzzleSizeCell = createTableCell(item.width + "x" + item.height, 'tableid');
                    tableRow.appendChild(puzzleSizeCell);
                    puzzleSizeCell.classList.add("clickable");
                    puzzleSizeCell.addEventListener("click", function () {
                        let newSize = item.width + "x" + item.height;
                        customSizeInput.value = newSize;
                        radioCustomSize.value = newSize;
                        radioCustomSize.checked = true;
                        changePuzzleSize(newSize);
                    });
                    if (isInvalid(mainValue, scoreType)) {
                        thisScoreInvalid = true;
                        tableRow.style.color = 'gray';
                    }
                }
                let scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
                const nameCellElement = createTableCellScore([displayedName, percentageInfoForNormal + getControlsAndDate(item.timestamp, item.controls)], 'name', "grayColor");
                tableRow.appendChild(nameCellElement);
                const scoreCellElement = createTableCellScore(scoreString, 'score', "grayColor");
                tableRow.appendChild(scoreCellElement);
                tableRow.classList.add("shadowFun");
                if (!thisScoreInvalid) {
                    
                    if (sheetType !== squaresSheetType || noNameFilter) {
                        nameCellElement.classList.add("clickable");
                        nameCellElement.addEventListener("click", function () {
                            if (request.width == request.height) {
                                radioNxNWRs.checked = true;
                                changePuzzleSize(radioNxNWRs.value);
                            } else {
                                radioNxMWRs.checked = true;
                                changePuzzleSize(radioNxMWRs.value);
                            }
                            changeNameFilter(item.nameFilter);
                        });
                    }
                    if (sheetType === squaresSheetType && !noNameFilter) {
                        nameCellElement.addEventListener('mouseover', () => {
                            tooltip.innerHTML = limitsString;
                            tooltip.style.display = 'block';
                        });
                        nameCellElement.addEventListener('mousemove', (e) => {
                            tooltip.style.left = (e.pageX - 170) + 'px';
                            tooltip.style.top = (e.pageY - 470) + 'px';
                        });
                        nameCellElement.addEventListener('mouseout', () => {
                            tooltip.style.display = 'none';
                        });
                    }
                }
                tableRow.addEventListener('mouseover', () => {
                    tableRow.classList.add("highlightedCell");
                });
                if (!debugMode){
                    const videolink = videoLinkCheck(item.videolink);
                    makeyoutubelink = false;
                    if (videolink){
                        scoreCellElement.classList.add("clickable");
                        scoreCellElement.firstChild.innerHTML = youtubeElement + scoreCellElement.firstChild.textContent;
                        makeyoutubelink = true;
                    }
                    if (true//request.gameMode === "Standard"// && !isAverage//
                        ) {
                       // const solution = getSolutionForScore(item);
                        if (item.solve_data_available) {
                            makeyoutubelink = false;
                            scoreCellElement.classList.add("clickable");
                            let videoLinkForReplay = -1;
                            if (videolink){
                                videoLinkForReplay = videolink;
                                scoreCellElement.firstChild.innerHTML = redEggElement + scoreCellElement.firstChild.textContent;
                            }
                            else{
                                scoreCellElement.firstChild.innerHTML = eggElement + scoreCellElement.firstChild.textContent;
                            }
                            const scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, tierNameForReplay, isWRforReplay, scoreType);
                            scoreCellElement.addEventListener('click', function (event) {
                                getSolutionForScore(item, (error, solveData) => {
                                    if (error) {
                                        alert("Error while loading solvedata! Maybe server died for a second...", error);
                                    } else {
                                        //makeReplay(solution, event, item.tps, item.width, item.height, scoreTitle);
                                        handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, tierNameForReplay, isWRforReplay);
                                    }
                                });    
                            });
                        }
                    }
                    if (makeyoutubelink) {
                        scoreCellElement.addEventListener('click', function () {
                            window.open(videolink, '_blank');
                        });
                    }   
                } else{
                    if (item.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn"){
                        scoreCellElement.classList.add("clickable");
                        scoreCellElement.firstChild.textContent = getScoreIDIcon + scoreCellElement.firstChild.textContent;
                        scoreCellElement.addEventListener('click', function () {
                            promptForVideoLink(item.time, item.moves, item.timestamp);
                        });
                    }
                }
                if (scoreType === "Time" && item.time > 59999) {
                    scoreCellElement.addEventListener('mouseover', () => {
                        tooltip.textContent = formatTime(item.time);
                        tooltip.style.display = 'block';
                    });
                    scoreCellElement.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 150) + 'px';
                        tooltip.style.top = (e.pageY - 20) + 'px';
                    });
                }
                if (scoreType === "Moves" && item.moves > 100000 && isAverage) {
                    scoreCellElement.addEventListener('mouseover', () => {
                        tooltip.textContent = (item.moves / 1000)
                            .toFixed(3);
                        tooltip.style.display = 'block';
                    });
                    scoreCellElement.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 150) + 'px';
                        tooltip.style.top = (e.pageY - 20) + 'px';
                    });
                }
                tableRow.addEventListener('mouseout', () => {
                    tableRow.classList.remove("highlightedCell");
                });
                scoreCellElement.addEventListener('mouseout', () => {
                    tooltip.style.display = 'none';
                });

                if (noNameFilter || percentageCurrent >= getTierPercentageLimit()) {
                    table.appendChild(tableRow);
                }
            });

        } else {
            headersCount--;
        }
        contentDiv.style.gridTemplateColumns = `repeat(${headersCount}, 1fr)`;
    });
}

function createNMSlider() {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.backgroundColor = '#12121205'; 
    container.style.paddingTop = "10px";
    container.style.paddingBottom = "10px";
    container.style.color = 'cyan'; 
    
    let inputElement;
    
    if (false) {
        container.appendChild(document.createTextNode("Epic Vovker Number Input"));
        
        inputElement = document.createElement('input');
        inputElement.type = 'number';
        inputElement.min = 0;
        inputElement.value = n_m_size_limit;
    
        // Basic styling
        inputElement.style.width = '10%';
        inputElement.style.outline = 'none';
        inputElement.style.border = '2px solid #00FF00';
        inputElement.style.textAlign = 'center';
        inputElement.style.background = "black";
        inputElement.style.color = "#00FF00";
        inputElement.style.fontFamily = 'monospace';
        inputElement.style.fontSize = '1.2em';
    
        // Epic hacker neon effects
        inputElement.style.boxShadow = '0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00';
        inputElement.style.borderRadius = '5px';
        inputElement.style.padding = '10px';
        inputElement.style.transition = '0.3s ease';


    }else {
        inputElement = document.createElement('input');
        inputElement.type = 'range';
        inputElement.min = 0;
        inputElement.max = 300;
        inputElement.step = 50;
        inputElement.value = n_m_size_limit;
        inputElement.style.width = '80%';
        inputElement.style.outline = 'none';
        inputElement.style.border = 'none';
    }

    const valueDisplay = document.createElement('div');
    valueDisplay.addEventListener('click', () => {
        // Prompt user for a number input, ensuring it's above 10
        const userInput = prompt("Enter a custom limit (must be above 10):");
        n_m_size_limit = parseInt(userInput, 10);
    
        // Check if input is valid (greater than 10 or equal to 0)
        if (n_m_size_limit > 10 || n_m_size_limit === 0) {
            changeSliderText();
            sendMyRequest();
        } else {
            alert("Invalid number. Please enter a value above 10 next time.");
        }
    });
    // Add hover effect with JavaScript
    valueDisplay.addEventListener('mouseover', () => {
        valueDisplay.style.textShadow = '0 0 20px cyan, 0 0 40px cyan';
        if (logged_in_as === "vovker"){
            valueDisplay.textContent = "Click to enter custom value, vovker";
        } else {
            valueDisplay.textContent = "Click to enter custom value";
        }
    });

    valueDisplay.addEventListener('mouseout', () => {
        valueDisplay.style.textShadow = '0 0 5px cyan, 0 0 10px cyan';
        changeSliderText();
    });
    valueDisplay.style.cursor = 'pointer';
    valueDisplay.style.marginTop = '10px';
    valueDisplay.style.textAlign = 'center';
    valueDisplay.style.fontSize = '1.5em';
    valueDisplay.style.textShadow = '0 0 5px cyan, 0 0 10px cyan'; 

    function changeSliderText() {
        let val = n_m_size_limit;
        if (val !== 0) {
            valueDisplay.textContent = `Tiles limit: ${val}`; 
        } else {
            valueDisplay.textContent = `No limit for tiles`; 
        }
    }

    changeSliderText();

    inputElement.addEventListener('change', () => {
        n_m_size_limit = parseInt(inputElement.value);
        if (n_m_size_limit > 10 || n_m_size_limit === 0){
            changeSliderText();
            sendMyRequest();
        } else {
            alert("invalid number");
        }
    });

    if (inputElement.type === 'range') {
        inputElement.addEventListener('input', () => {
            changeSliderText();
        });
    }
    
    container.appendChild(inputElement);
    container.appendChild(valueDisplay);
    
    return container; 
}

//"Public" function to create NxM matrix sheet (can also display PBs)
function createSheetNxM(WRList) {
    copyOfWRList = JSON.parse(JSON.stringify(WRList));
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList = "NxMContent";
    contentDiv.innerHTML = "";
    generateFormattedString(request);
    if (copyOfWRList.length === 0) {
        contentDiv.innerHTML = notFoundError;
        return;
    }
    tiersData = calculateNxMTiers(NxMRecords);
    if (request.nameFilter === "") {
        createScoresAmountTable(contentDiv, tiersData);
    }
    tiersMap = tiersData.tiersMap;
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    tableContainer.classList.add("bigContainer");
    contentDiv.appendChild(createNMSlider());
    contentDiv.appendChild(tableContainer);
    const table = document.createElement('table');
    tableContainer.appendChild(table);
    table.classList.add("NxMTable");
    let allSizes = getAllSizes(copyOfWRList, NxMstyleDPH);
    const tableHeaderRow = document.createElement('tr');
    const th = document.createElement('th');
    if (NxMstyleDPH) {
        th.textContent = NxMSwappedString;
    } else {
        th.textContent = NxMNormalString;
    }
    th.classList.add("clickable");
    th.addEventListener("click", function () {
        NxMstyleDPH = !NxMstyleDPH;
        if (NxMSelected !== totalWRsAmount) {
            createSheetNxM(NxMRecords.filter(item => item.nameFilter === NxMSelected));
        } else {
            createSheetNxM(NxMRecords);
        }
        updateSelectSizes();
    });
    tableHeaderRow.appendChild(th);
    for (const widthValue of allSizes["width"]) {
        const th = document.createElement('th');
        th.textContent = widthValue.toString();
        tableHeaderRow.appendChild(th);
    }
    table.appendChild(tableHeaderRow);
    allSizes["height"].forEach(height => {
        const row = document.createElement('tr');
        const thHeight = document.createElement('th');
        thHeight.textContent = height.toString();
        row.appendChild(thHeight);
        allSizes["width"].forEach(width => {
            let cell = document.createElement('td');
            var result;
            if (NxMstyleDPH) {
                result = copyOfWRList.find(item => item.width === height && item.height === width);
            } else {
                result = copyOfWRList.find(item => item.width === width && item.height === height);
            }
            if (result) {
                let mainValue;
                let scoreType = request.leaderboardType;
                let reverse = false;
                if (scoreType === "move") {
                    scoreType = "Moves"
                    mainValue = result.moves;
                }
                if (scoreType === "time") {
                    scoreType = "Time"
                    mainValue = result.time;
                }
                if (scoreType === "tps") {
                    scoreType = "TPS"
                    mainValue = result.tps;
                    reverse = true;
                }
                let recordisInvalid = isInvalid(mainValue, scoreType);
                if (recordisInvalid) {
                    result.nameFilter = invalidPlaceHolderString;
                }
                let bestValue;
                let percentage = 100;
                let tierName = "alpha";
                let isWR = true;
                if (request.nameFilter !== "") {
                    bestValue = getBestValue(WRsDataForPBs, scoreType, result.width, result.height);
                    percentage = calculatePercentage(mainValue, bestValue, reverse);
                    if (percentage < getTierPercentageLimit()) {
                        recordisInvalid = true;
                    }
                    tierName = getClassBasedOnPercentage(percentage, percentageTable);
                    isWR = (mainValue === bestValue);
                    let displayedName;

                    if (isWR) {
                        //displayedName = "WR";
                        displayedName = "";
                    } else {
                        //displayedName = `${percentage.toFixed(1)}%`;
                        displayedName = "";
                    }
                    let scoreString = getScoreStringNxM(result.time, result.moves, result.tps, scoreType, isAverage = false, displayedName);
                    cell = createTableCellScore(scoreString, 'score', "kappa");
                    cell.classList.add(tierName);
                    if (isWR) {
                        cell.classList.add("WRPB");
                    }
                } else {
                    let scoreString = getScoreStringNxM(result.time, result.moves, result.tps, scoreType, isAverage = false, result.nameFilter);
                    cell = createTableCellScore(scoreString, 'score', tiersMap[result.nameFilter]);
                    cell.classList.add(tiersMap[result.nameFilter]);
                }
                if (recordisInvalid) {
                    if (NxMstyleDPH) {
                        cell.textContent = height + "x" + width;
                    } else {
                        cell.textContent = width + "x" + height;
                    }
                    cell.style.color = "#555";
                    cell.style.fontSize = "12px";
                    cell.setAttribute("class", "");
                } else {
                    let newSize = result.width + "x" + result.height;
                    if (!debugMode){
                        const videolink = videoLinkCheck(result.videolink);
                        let makeyoutubelink = false;
                        if (videolink){
                            cell.classList.add("clickable");
                            cell.firstChild.innerHTML = youtubeElement + cell.firstChild.textContent;
                            makeyoutubelink = true;
                        }
                        if (true//request.gameMode === "Standard") {
                        ){//const solution = getSolutionForScore(result);
                            if (result.solve_data_available) {
                                makeyoutubelink = false;
                                let videoLinkForReplay = -1;
                                if (videolink){
                                    videoLinkForReplay = videolink;
                                    cell.firstChild.innerHTML = redEggElement + cell.firstChild.textContent;
                                } else {
                                    cell.firstChild.innerHTML = eggElement + cell.firstChild.textContent;
                                }
                                cell.classList.add("clickable");
                                
                                const scoreTitle = getScoreTitle(videoLinkForReplay, result.width, result.height, result.displayType, result.nameFilter, result.controls, result.timestamp, tierName, isWR, scoreType);
                                cell.addEventListener('click', function (event) {
                                    getSolutionForScore(result, (error, solveData) => {
                                        if (error) {
                                            alert(error);
                                        } else {
                                            //makeReplay(solution, event, result.tps, result.width, result.height, scoreTitle);
                                            handleSavedReplay(result, solveData, event, result.tps, result.width, result.height, scoreTitle, videoLinkForReplay, tierName, isWR);
                                        }
                                    });     
                                });
                            }
                        }
                        if (makeyoutubelink) {
                            cell.addEventListener('click', function () {
                                window.open(videolink, '_blank');
                            });
                        } 
                    }
                    else{
                        if (result.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn"){
                            cell.classList.add("clickable");
                            cell.firstChild.textContent = getScoreIDIcon + cell.firstChild.textContent;
                            cell.addEventListener('click', function () {
                                promptForVideoLink(result.time, result.moves, result.timestamp);
                            });
                        }
                    }
                    let extraInfo = "";
                    if (scoreType === "Time" && result.time > 59999) {
                        extraInfo = " " + formatTime(result.time);
                    }
                    if (request.nameFilter !== ""){
                        if (isWR) {
                            extraInfo += "<br>WR";
                        } else {
                            extraInfo += `<br>${percentage.toFixed(7)}%`;
                        }
                    }
                    cell.addEventListener('mouseover', () => {
                        tooltip.innerHTML = newSize + "<br>" + getControlsAndDate(result.timestamp, result.controls) + "<br>" + extraInfo;
                        cell.classList.add("highlightedCell");
                        tooltip.style.display = 'block';
                    });
                    cell.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 120) + 'px';
                        tooltip.style.top = (e.pageY - 100) + 'px';
                    });
                    cell.addEventListener('mouseout', () => {
                        cell.classList.remove("highlightedCell");
                        tooltip.style.display = 'none';
                    });
                    cell.style.textWeight = "bold";
                }
            } else {
                cell.textContent = NxMstyleDPH ? `${height}x${width}` : `${width}x${height}`;
                if (n_m_size_limit > 0 && width * height > n_m_size_limit){
                    cell.style.opacity = 0;
                }
                cell.style.color = "#555";
                cell.style.fontSize = "12px";
            }
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

//"Public" function to create Rankings sheet
function createSheetRankings(playerScores) {
    savedPlayerScores = playerScores;
    let reverse = false;
    if (request.leaderboardType === "tps") {
        reverse = true;
    }
    let scoreType = request.leaderboardType;
    if (scoreType === "move") {
        scoreType = "Moves"
    }
    if (scoreType === "time") {
        scoreType = "Time"
    }
    if (scoreType === "tps") {
        scoreType = "TPS"
    }
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList = "NxMContent";
    contentDiv.innerHTML = "";
    contentDiv.style.overflowX = "auto"
    generateFormattedString(request);
    createHideEmptyCheckbox();
    if (playerScores.length === 0) {
        contentDiv.innerHTML = notFoundError;
    } else {
        if (loadingPower){loadPower();return;}
        const tableContainer = document.createElement('div');
        tableContainer.classList.add('table-container');
        tableContainer.classList.add('bigContainer');
        contentDiv.appendChild(tableContainer);
        let palyerId = 0;
        for (const category in percentageTable) {
            if (percentageTable.hasOwnProperty(category)) {
                const table = document.createElement('table');
                table.classList.add("rankingCells");
                const tableHeaderRow = document.createElement('tr');
                const currentPrecentage = percentageTable[category];
                let categoryCapName = category.charAt(0).toUpperCase() + category.slice(1);

                const thElementLetter = document.createElement('th');
                thElementLetter.appendChild(greekLetterSpan(category));
                tableHeaderRow.appendChild(thElementLetter);

                const thElementName = document.createElement('th');
                thElementName.textContent = categoryCapName;
                thElementName.style.fontSize = "12px";
                tableHeaderRow.appendChild(thElementName);


                tableHeaderRow.appendChild(document.createElement('th'))
                    .textContent = ">" + currentPrecentage + "%";
                tableHeaderRow.classList.add(category);
                playerScores[0].scores.forEach(function (score) {
                    fakeScoreInfo = parseId(score.id); //fix for non-existing scores
                    var th = document.createElement('th');
                    var smallText = document.createElement('span');
                    let isAverage = (fakeScoreInfo.avglen !== 1);
                    const bestValue = bestValues[score.id];
                    const newScoreLimit = getScoreLimit(currentPrecentage, bestValue, reverse, scoreType, isAverage);
                    smallText.textContent = newScoreLimit;
                    smallText.classList.add("smallTextForCellsRanks");
                    th.innerHTML = score.id.replace(" ", "<br>");
                    th.appendChild(document.createElement('br'));
                    th.appendChild(smallText);
                    th.classList.add("clickable");
                    let newSize = fakeScoreInfo.width + "x" + fakeScoreInfo.height;
                    let newGameMode = fakeScoreInfo.gameMode;
                    th.addEventListener("click", function () {
                        customSizeInput.value = newSize;
                        radioCustomSize.value = newSize;
                        radioCustomSize.checked = true;
                        for (const radio of gamemodeRadios) {
                            if (radio.value === newGameMode) {
                                radio.checked = true;
                                break;
                            }
                        }
                        changePuzzleSize(newSize);
                        changeGameMode(newGameMode);
                    });
                    th.addEventListener('mouseover', () => {
                        tooltip.innerHTML = exactLimitString + "<br>" + category + " " + score.id + ":<br>" + getScoreLimitExact(currentPrecentage, bestValues[score.id], reverse);
                        th.classList.add("highlightedCell");
                        tooltip.classList.add(category);
                        tooltip.style.display = 'block';
                    });
                    th.addEventListener('mousemove', (e) => {
                        tooltip.style.left = (e.pageX - 150) + 'px';
                        tooltip.style.top = (e.pageY - 100) + 'px';
                    });
                    th.addEventListener('mouseout', () => {
                        th.classList.remove("highlightedCell");
                        tooltip.classList.remove(category);
                        tooltip.style.display = 'none';
                    });
                    if (bestValue !== defaultScore && !isInvalid(bestValue, scoreType)) {
                        tableHeaderRow.appendChild(th);
                    }
                });
                table.appendChild(tableHeaderRow);
                let beforeAddingID = palyerId;
                for (const playerScore of playerScores) {
                    if (playerScore.tier === category) {
                        palyerId++;
                        const playerTableRow = document.createElement('tr');
                        const playerPlaceCell = document.createElement('td');
                        playerPlaceCell.textContent = palyerId;
                        const playerNameCell = document.createElement('td');
                        playerNameCell.innerHTML = appendFlagIconToNickname(playerScore.name);
                        playerNameCell.classList.add("clickable");
                        playerNameCell.addEventListener("click", function () {
                            radioNxNWRs.checked = true;
                            changePuzzleSize(radioNxNWRs.value);
                            changeNameFilter(playerScore.name);
                        });
                        const playerPowerCell = document.createElement('td');
                        playerPowerCell.textContent = playerScore.power.toFixed(3) + "%";
                        playerPlaceCell.classList.add(category);
                        playerNameCell.classList.add(category);
                        playerNameCell.classList.add("nameCell");
                        playerPowerCell.classList.add(category);
                        playerNameCell.classList.add("blackBG");
                        playerPowerCell.classList.add("blackBG");
                        playerPlaceCell.classList.add("blackBG");
                        playerTableRow.appendChild(playerPlaceCell);
                        playerTableRow.appendChild(playerNameCell);
                        playerTableRow.appendChild(playerPowerCell);
                        playerScore.scores.forEach(function (scoreData) {
                            let item = scoreData.scoreInfo;
                            let isAverage = (item.avglen !== 1);
                            let scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
                            const scoreCell = createTableCellScore([scoreString[0], ""], 'score', "kappa");
                            scoreCell.classList.add(scoreData.scoreTier);
                            let extraInfo = "";
                            if (scoreType === "Time") {
                                extraInfo = formatTime(item.time);
                                extraInfo += ` (${(item.moves / 1000).toFixed(3).replace(/\.?0+$/, '')} / ${normalizeTPS(item.tps)})`
                                extraInfo += "<br>";
                            }
                            if (scoreType === "Moves") {
                                extraInfo = (item.moves / 1000).toFixed(3).replace(/\.?0+$/, ''); //remove extra 0
                                extraInfo += ` (${formatTime(item.time)} / ${normalizeTPS(item.tps)})`
                                extraInfo += "<br>";
                            }
                            if (scoreType === "TPS") {
                                extraInfo = normalizeTPS(item.tps);
                                extraInfo += ` (${formatTime(item.time)} / ${(item.moves / 1000).toFixed(3).replace(/\.?0+$/, '')})`
                                extraInfo += "<br>";
                            }
                            if (scoreData.scorePercentage === 100) {
                                scoreCell.classList.add("WRPB");
                                extraInfo += " [WR]<br>";
                            } else {
                                extraInfo += " " + scoreData.scorePercentage + "%<br>"
                            }
                            if (scoreString[0].includes("NaN")) {
                                scoreCell.classList.add("no-box-shadow");
                                scoreCell.innerHTML = "-";
                            } else {
                                if (!debugMode){
                                    const videolink = videoLinkCheck(item.videolink);
                                    let makeyoutubelink = false;
                                    if (videolink){
                                        scoreCell.classList.add("clickable");
                                        scoreCell.firstChild.innerHTML = youtubeElement + scoreCell.firstChild.textContent;
                                        makeyoutubelink = true;
                                    }
                                    if (true//item.gameMode === "Standard" //&& !isAverage
                                        ) {
                                        //const solution = getSolutionForScore(item);
                                        if (item.solve_data_available) {
                                            makeyoutubelink = false;
                                            let videoLinkForReplay = -1;
                                            if (videolink){
                                                videoLinkForReplay = videolink;
                                                scoreCell.innerHTML = redEggElement + scoreCell.textContent;
                                            } else {
                                                scoreCell.innerHTML = eggElement + scoreCell.textContent;
                                            }
                                            scoreCell.classList.add("clickable");
                                            const scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, scoreData.scoreTier, scoreData.scorePercentage === 100, scoreType);
                                            scoreCell.addEventListener('click', (event) => {
                                                getSolutionForScore(item, (error, solveData) => {
                                                    if (error) {
                                                        alert(error);
                                                    } else {
                                                        //makeReplay(solution, event, item.tps, item.width, item.height, scoreTitle);
                                                        handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, scoreData.scoreTier, scoreData.scorePercentage === 100);
                                                    }
                                                });   
                                            });
                                        }
                                    }
                                    if (makeyoutubelink) {
                                        scoreCell.addEventListener('click', function () {
                                            window.open(videolink, '_blank');
                                        });
                                    }   
                                } else{

                                    if (item.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn"){
                                        scoreCell.classList.add("clickable");
                                        scoreCell.firstChild.textContent = getScoreIDIcon + scoreCell.firstChild.textContent;
                                        scoreCell.addEventListener('click', function () {
                                            promptForVideoLink(item.time, item.moves, item.timestamp);
                                        });
                                    }
                                }
                                scoreCell.addEventListener('mouseover', () => {
                                    tooltip.innerHTML = extraInfo + scoreData.id + byString + item.nameFilter + "<br>" + getControlsAndDate(item.timestamp, item.controls);
                                    scoreCell.classList.add("highlightedCell");
                                    tooltip.style.display = 'block';
                                    tooltip.classList.add(scoreData.scoreTier);
                                });
                                scoreCell.addEventListener('mousemove', (e) => {
                                    tooltip.style.left = (e.pageX - 200) + 'px';
                                    tooltip.style.top = (e.pageY - 100) + 'px';
                                });

                                scoreCell.addEventListener('mouseout', () => {
                                    scoreCell.classList.remove("highlightedCell");
                                    tooltip.style.display = 'none';
                                    tooltip.classList.remove(scoreData.scoreTier);
                                });
                            }
                            if (bestValues[scoreData.id] !== defaultScore && !isInvalid(bestValues[scoreData.id], scoreType)) {
                                playerTableRow.appendChild(scoreCell);
                            }
                        });
                        table.appendChild(playerTableRow);
                    }
                }
                if (palyerId === beforeAddingID) {
                    const playerTableRow = document.createElement('tr');
                    const playerPlaceCell = document.createElement('td');
                    const playerNameCell = document.createElement('td');
                    playerNameCell.textContent = emptyTierPlaceHolder;
                    const playerPowerCell = document.createElement('td');
                    playerPlaceCell.classList.add(category);
                    playerNameCell.classList.add(category);
                    playerNameCell.classList.add("nameCell");
                    playerPowerCell.classList.add(category);
                    playerTableRow.appendChild(playerPlaceCell);
                    playerTableRow.appendChild(playerNameCell);
                    playerTableRow.appendChild(playerPowerCell);
                    table.appendChild(playerTableRow);
                    if (hideEmptyTiers) {
                        table.style.display = "none";
                    }
                }
                tableContainer.appendChild(table);
            }
        }
    }
}

//"Public" function to create Latest records sheet
function createSheetHistory(recordsList, recordsListWR, showAll = false) {
    let reverse = false;
    if (request.leaderboardType === "tps") {
        reverse = true;
    }
    let scoreType = request.leaderboardType;
    if (scoreType === "move") {
        scoreType = "Moves";
    }
    if (scoreType === "time") {
        scoreType = "Time";
    }
    if (scoreType === "tps") {
        scoreType = "TPS";
    }
    let mainList = recordsList;
    if (mainList.length <= 2000) {
        showAll = true;
    }
    if (!showAll) {
        mainList = mainList.slice(0, 2000);
    }
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.classList = "NxMContent";
    contentDiv.innerHTML = "";
    generateFormattedString(request);
    if (mainList.length === 0) {
        contentDiv.innerHTML = notFoundError;
    } else {
        const groupedRecords = groupRecordsByTimestamp(mainList);
        let tableCount = 0;
        let cellsTotalCounter = 0;

        for (const [interval, records] of Object.entries(groupedRecords)) {
            if (records.length > 0 && !tableIsEmpty(records, recordsListWR, scoreType)) {
                const tableContainer = document.createElement('div');
                tableContainer.classList.add('table-container');
                tableContainer.style.maxWidth = "50%";
                tableContainer.style.minWidth = "900px";
                tableContainer.style.margin = "20px";
                const table = document.createElement('table');
                table.classList.add("historyRecordsTable");
                const headers = historyTableHeaders;
                const intervalHeaderRow = document.createElement('tr');
                intervalHeaderRow.classList.add('interval-header');
                intervalHeaderRow.classList.add('clickable');
                tableContainer.insertBefore(intervalHeaderRow, tableContainer.firstChild);
                const intervalHeaderCell = document.createElement('th');
                intervalHeaderCell.colSpan = headers.length;
                intervalHeaderCell.textContent = `${interval} ${showHistoryString}`;
                intervalHeaderRow.appendChild(intervalHeaderCell);
                intervalHeaderCell.addEventListener('click', () => {
                    const currentDisplay = table.style.display;
                    table.style.display = currentDisplay === 'none' ? 'table' : 'none';
                    intervalHeaderCell.textContent = currentDisplay === 'none' ? `${interval}` : `${interval} ${showHistoryString}`;
                    if (table.dataset.populated !== 'true') {
                        populateTableHistory(records, recordsListWR, scoreType, table, reverse);
                        table.dataset.populated = 'true';
                    }
                });
                const headersRow = document.createElement('tr');
                headers.forEach(headerText => {
                    const headerCell = document.createElement('th');
                    headerCell.textContent = headerText;
                    headersRow.appendChild(headerCell);
                });
                table.appendChild(headersRow);
                if (showAll || cellsTotalCounter < 50) {
                    intervalHeaderCell.textContent = `${interval}`;
                    cellsTotalCounter += populateTableHistory(records, recordsListWR, scoreType, table, reverse);
                    table.dataset.populated = 'true';
                    table.style.display = 'table';
                } else {
                    table.style.display = 'none';
                }
                tableCount++;
                tableContainer.appendChild(table);
                contentDiv.appendChild(tableContainer);
            }
        }
        if (!showAll) {
            var allButton = document.createElement("button");
            allButton.textContent = showAllHistoryString;
            allButton.addEventListener("click", function () {
                createSheetHistory(recordsList, recordsListWR, showAll = true);
                updateSelectSizes();
            });
            contentDiv.appendChild(allButton);
        }
    }
    if (contentDiv.innerHTML === "") {
        contentDiv.innerHTML = notFoundError;
    }
}

//"Public" (helper) function to format time from ms
function formatTime(milliseconds, cut = false) {
    const hours = Math.floor(milliseconds / 3600000);
    const remainingMillis = milliseconds % 3600000;
    const minutes = Math.floor(remainingMillis / 60000);
    const remainingSeconds = Math.floor((remainingMillis % 60000) / 1000);
    const millisecondsPart = remainingMillis % 1000;
    if (cut) {
        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        } else if (minutes > 0) {
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        } else {
            return `${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        }
    } else {
        if (hours > 0) {
            return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        } else if (minutes > 0) {
            return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        } else {
            return `${remainingSeconds}.${millisecondsPart.toString().padStart(3, '0')}`;
        }
    }
}

//"Public" (helper) function to format timestamp (with time included)
function formatTimestampWithTime(timestamp) {
    if (timestamp === -1) {
        return invalidTimestampStringHistory;
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1)
        .padStart(2, '0');
    const day = String(date.getDate())
        .padStart(2, '0');
    const hours = String(date.getHours())
        .padStart(2, '0');
    const minutes = String(date.getMinutes())
        .padStart(2, '0');
    const seconds = String(date.getSeconds())
        .padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

//"Public" (helper) function to format timestamp compared to current Time
function getTimeAgo(timestamp) {
    const currentTime = new Date().getTime();
    const recordTime = new Date(timestamp).getTime();
    const timeDifference = currentTime - recordTime;

    // Convert time difference to seconds
    const seconds = Math.floor(timeDifference / 1000);
    
    if (seconds < 60) {
        return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 48) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}


//"Public" (helper) function to get current limit of scores to display
function getTierPercentageLimit() {
    if (tierLimit === "Any") {
        return 0;
    }
    if (tierLimit === "WRs only") {
        return 100;
    }
    return percentageTable[tierLimit];
}

//"Public" function to update styles of filters (displayType, leaderboardType, controlType)
function updateSelectSizes() {
    displayTypeSelect.style.width = `${getTextOfSelectLength(displayTypeSelect) + 1}ch`;
    leaderboardTypeSelect.style.width = `${getTextOfSelectLength(leaderboardTypeSelect) + 1}ch`;
    controlTypeSelect.style.width = `${getTextOfSelectLength(controlTypeSelect) + 1}ch`;
    if (request.displayType === "Standard") {
        displayTypeSelect.style.color = "white";
    } else {
        displayTypeSelect.style.color = "#ff2262";
    }
    if (controlType === "unique") {
        controlTypeSelect.style.color = "white";
    } else {
        controlTypeSelect.style.color = "#ff2262";
    }
    if (request.leaderboardType === "time") {
        leaderboardTypeSelect.style.color = "white";
    } else {
        leaderboardTypeSelect.style.color = "#ff2262";
    }
    function changeOptionTextColor(select, optionValue, color) {
        const options = select.getElementsByTagName("option");
        for (const option of options) {
            if (option.value === optionValue) {
                option.style.color = color;
            }
        }
    }
    changeOptionTextColor(displayTypeSelect, "Standard", "white");
    changeOptionTextColor(controlTypeSelect, "unique", "white");
    changeOptionTextColor(leaderboardTypeSelect, "time", "white");
}

//"Public" function to add tooltip for the element
function addTooltip(element, text) {
    element.addEventListener("mouseover", function () {
        const tooltip = document.createElement("div");
        tooltip.innerHTML = text;
        element.appendChild(tooltip);
        tooltip.classList.add("normalToolTipStyle");
        element.addEventListener("mouseout", function (e) {
            if (element.contains(tooltip)) {
                element.removeChild(tooltip);
            }
        });
    });
}

//"Public" function to create example buttons for custom rankings
function makeExampleButtons(customRankButtonsExamples) {
    const buttonShare = document.createElement("button");
    buttonShare.textContent = shareCustomRanksText;
    buttonShare.classList.add("pause-button");
    buttonShare.addEventListener("click", function () {
        navigator.clipboard.writeText(shareCustomRanks())
            .then(() => {
                const copiedMessage = document.createElement("div");
                copiedMessage.textContent = linkCopiedSuccsess;
                copiedMessage.style.position = "fixed";
                copiedMessage.style.background = "rgba(0, 0, 0, 0.7)";
                copiedMessage.style.color = "white";
                copiedMessage.style.padding = "10px";
                copiedMessage.style.borderRadius = "5px";
                copiedMessage.style.textAlign = "center";
                copiedMessage.style.top = "50%";
                copiedMessage.style.left = "50%";
                copiedMessage.style.transform = "translate(-50%, -50%)";
                copiedMessage.style.zIndex = "999";
                document.body.appendChild(copiedMessage);
                setTimeout(() => {
                    copiedMessage.style.transition = "opacity 0.5s";
                    copiedMessage.style.opacity = "0";
                    setTimeout(() => {
                        document.body.removeChild(copiedMessage);
                    }, 500);
                }, 1000);
            })
            .catch((error) => {
                console.error("Copy failed: ", error);
            });
    });
    const h1Container = document.createElement("h1");
    h1Container.style.margin = "0";
    rankingTabs.appendChild(h1Container);
    function createCustomRankButtons(customRankObj, container) {
        function setCustomRanks(string) {
            customRankingsArea.value = string;
            if (!loadingPower) {
                changeCustomRanks();
            }
        }
        for (const key in customRankObj) {
            if (customRankObj.hasOwnProperty(key)) {
                const buttonText = key;
                const ranksText = customRankObj[key];
                const button = document.createElement("button");
                button.textContent = buttonText;
                button.addEventListener("click", () => setCustomRanks(ranksText));
                container.appendChild(button);
                if (buttonText === "MAIN 30"){
                    button.click();
                }
            }
        }
    }
    for (const customRankObj of customRankButtonsExamples) {
        createCustomRankButtons(customRankObj, rankingTabs);
    }
    rankingTabs.appendChild(buttonShare);
}

//"Public" function to calculate percentage of the score based on best value
function calculatePercentage(value, bestValue, reverse) {
    if (value < 0.001) {
        return 100;
    } else {
        return reverse ? (value / bestValue) * 100 : (bestValue / value) * 100;
    }
}

//"Public" function to calculate class based on score percentage
function getClassBasedOnPercentage(percentage, percentageTable) {
    let className = "kappa";
    for (const cls in percentageTable) {
        if (percentage >= percentageTable[cls]) {
            className = cls;
            break;
        }
    }
    return className;
}

//_________________End of "Public" functions of this module_________________//

//_________________"Private" functions (multiple usage)_________________

function getBestValue(data, scoreType, width, height) {
    let bestValue = null;
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.width === width && item.height === height) {
            if (scoreType === "Moves") {
                bestValue = item.moves;
            } else if (scoreType === "Time") {
                bestValue = item.time;
            } else if (scoreType === "TPS") {
                bestValue = item.tps;
            }
            break;
        }
    }
    return bestValue;
}

function getScoreTitle(videolink, width, height, displayType, username, controls, timestamp, scoreTier, isWR, scoreType) {
    tierTitleSpan = document.createElement("span");
    tierTitleSpan.classList.add(scoreTier);
    if (isWR) {
        tierTitleSpanWR = document.createElement("span");
        tierTitleSpanWR.classList.add("WRPB");
        tierTitleSpanWR.textContent = "[WR] ";
        tierTitleSpan.appendChild(tierTitleSpanWR);
    }
    let display_type_string = ""
    if (displayType !== "Standard"){
        display_type_string = `${displayType} display type `
    }
    tierTitleSpan.innerHTML += `${display_type_string}Solve by ${username}<br>${scoreType} PB | ${controls} | ${formatTimestamp(timestamp)}`;
    if (videolink !== -1){
        tierTitleSpan.classList.add("clickable");
        tierTitleSpan.addEventListener('click', function () {
            window.open(videolink, '_blank');
        });
        tierTitleSpan.innerHTML = youtubeElement + tierTitleSpan.innerHTML;
    }
    return tierTitleSpan;
}

function getScoreString(time, moves, tps, scoreType, isAverage) {
    result = normalizeValues(time, moves, tps, isAverage);
    time = result["time"];
    moves = result["moves"];
    tps = result["tps"];
    if (scoreType === "Moves") {
        return [moves, "" + time + " / " + tps + ""];
    }
    if (scoreType === "Time") {
        return [time, "" + moves + " / " + tps + ""];
    }
    if (scoreType === "TPS") {
        return [tps, "" + time + " / " + moves + ""];
    }
}

function createTableCellScore(scoreString, className, secondaryClass) {
    const cell = document.createElement('td');
    cell.className = className;
    const mainValue = document.createElement('span');
    mainValue.style.fontWeight = 'bold';
    mainValue.innerHTML = scoreString[0];
    const secondaryValue = document.createElement('span');
    secondaryValue.classList = secondaryClass;
    secondaryValue.style.fontSize = '12px';
    secondaryValue.textContent = scoreString[1];
    cell.appendChild(mainValue);
    cell.appendChild(document.createElement('br'));
    cell.appendChild(secondaryValue);
    return cell;
}

function getControlsAndDate(timestamp, controls) {
    return "(" + controls + " / " + formatTimestamp(timestamp) + ")";
}

function createScoresAmountTable(tableContainer, amountTiersInfo) {
    function selectRecordsFilter(columnName) {
        NxMSelected = columnName;
        if (request.width === squaresSheetType) {
            if (columnName !== totalWRsAmount) {
                const filteredNxNRecords = {};
                Object.keys(NxNRecords)
                    .forEach(key => {
                        filteredNxNRecords[key] = NxNRecords[key].filter(item => item.nameFilter === columnName);
                    });
                createSheet(filteredNxNRecords, squaresSheetType);
            } else {
                createSheet(NxNRecords, squaresSheetType);
            }
        } else {
            if (columnName !== totalWRsAmount) {
                createSheetNxM(NxMRecords.filter(item => item.nameFilter === columnName));
            } else {
                createSheetNxM(NxMRecords);
            }
        }
        updateSelectSizes();
    }
    function transposeData(data) {
        return data[0].map((_, colIndex) => data.map(row => row[colIndex]));
    }
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.margin = '10px auto';
    const transposedData = transposeData(amountTiersInfo.scoresCount);
    const table = document.createElement('table');
    table.classList.add("WRstable");
    table.classList.add("rankingCells");
    const headerRow = table.insertRow(0);
    headerRow.style.backgroundColor = "#f2f2f2";
    headerRow.classList.add("clickable");
    for (let i = 0; i < transposedData[0].length; i++) {
        const headerCell = headerRow.insertCell(i);
        headerCell.innerHTML = transposedData[0][i];
        headerCell.style.fontSize = "13px";
        headerCell.style.fontWeight = "bold";
    }
    for (let i = 1; i < transposedData.length; i++) {
        const row = table.insertRow(i);
        row.classList.add("clickable");
        for (let j = 0; j < transposedData[i].length; j++) {
            const cell = row.insertCell(j);
            cell.style.fontSize = "20px";
            const columnName = transposedData[0][j];
            const cellValue = transposedData[i][j];
            cell.innerHTML = cellValue;
            cell.classList.add(amountTiersInfo.tiersMap[columnName]);
            headerRow.cells[j].classList.add(amountTiersInfo.tiersMap[columnName]);
            if (NxMSelected === columnName) {
                cell.style.backgroundColor = "#222";
                headerRow.cells[j].style.backgroundColor = "#222";
            }
            cell.addEventListener('click', () => {
                selectRecordsFilter(columnName);
            });
            headerRow.cells[j].addEventListener('click', () => {
                selectRecordsFilter(columnName);
            });
            cell.addEventListener('mouseover', () => {
                cell.classList.add("highlightedCell");
                headerRow.cells[j].classList.add("highlightedCell");
            });
            headerRow.cells[j].addEventListener('mouseover', () => {
                cell.classList.add("highlightedCell");
                headerRow.cells[j].classList.add("highlightedCell");
            });
            cell.addEventListener('mouseout', () => {
                cell.classList.remove("highlightedCell");
                headerRow.cells[j].classList.remove("highlightedCell");
            });
            headerRow.addEventListener('mouseout', () => {
                cell.classList.remove("highlightedCell");
                headerRow.cells[j].classList.remove("highlightedCell");
            });
        }
    }
    container.appendChild(table);
    tableContainer.appendChild(container);
}

function normalizeValues(time, moves, tps, isAverage) {
    return result = {
        "time": normalizeTime(time),
        "moves": normalizeMoves(moves, isAverage),
        "tps": normalizeTPS(tps)
    };
}

function normalizeTime(time) {
    if (time === -1) {
        return unknownStatsShortString;
    } else {
        return formatTime(time, cut = true);
    }
}

function normalizeMoves(moves, isAverage) {
    if (moves === -1) {
        return unknownStatsShortString;
    } else {
        if (!isAverage) {
            return (moves / 1000).toFixed(0);
        } else {
            if (moves % 1000 === 0) {
                return (moves / 1000).toFixed(0);
            } else {
                if (moves > 100000) {
                    return Math.floor(moves / 1000) + "~";
                } else {
                    return (moves / 1000).toFixed(3);
                }
            }
        }
    }
}

function normalizeTPS(tps) {
    if (tps === -1) {
        return tps = unknownStatsShortString;
    } else {
        tps = (tps / 1000).toFixed(3);
        if (tps > 1000000) {
            tps = "∞";
        }
        return tps;
    }
}

function formatTimestamp(timestamp) {
    if (timestamp === -1) {
        return unknownStatsShortString;
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1)
        .toString()
        .padStart(2, '0');
    const day = date.getDate()
        .toString()
        .padStart(2, '0');
    const formattedDate = `${year}.${month}.${day}`;
    return formattedDate;
}

function calculateNxMTiers(WRList) {
    const nameSet = new Set(WRList.map(record => record.nameFilter));
    const tiersMap = {};
    const scoresCount = {};
    nameSet.forEach(name => {
        const filteredRecords = WRList.filter(record => record.nameFilter === name);
        const validScores = filteredRecords.filter(record => !isInvalidScore(record));
        if (validScores.length > 0) {
            const count = validScores.length;
            scoresCount[name] = count;
        }
    });
    const sortedNames = Object.keys(scoresCount).sort((a, b) => scoresCount[b] - scoresCount[a]);
    sortedNames.forEach((name, index) => {
        const tier = tierstable[index] || 'kappa';
        tiersMap[name] = tier;
    });
    const scoreCountOutput = Object.entries({
        ...scoresCount,
        [totalWRsAmount]: Object.values(scoresCount)
            .reduce((acc, val) => acc + val, 0)
    }).sort(([keyA], [keyB]) => keyA === totalWRsAmount ? -1 : keyB === totalWRsAmount ? 1 : scoresCount[keyB] - scoresCount[keyA]);
    return {
        "tiersMap": tiersMap,
        "scoresCount": scoreCountOutput
    };
}

function isInvalidScore(result) {
    let scoreType = request.leaderboardType;
    let mainValue;
    if (scoreType === "move") {
        scoreType = "Moves"
        mainValue = result.moves;
    }
    if (scoreType === "time") {
        scoreType = "Time"
        mainValue = result.time;
    }
    if (scoreType === "tps") {
        scoreType = "TPS"
        mainValue = result.tps;
    }
    return isInvalid(mainValue, scoreType);
}

function getScoreLimitExact(precentage, bestscore, reverse) {
    precentage = precentage / 100;
    if (bestscore === defaultScore || precentage === 0) {
        return tierLabels[0];
    }
    if (reverse) {
        return (Math.floor(precentage * bestscore) / 1000)
            .toFixed(3);
    } else {
        return (Math.floor(bestscore / precentage) / 1000)
            .toFixed(3);
    }
}

function getScoreLimit(precentage, bestscore, reverse, scoreType, isAverage) {
    precentage = precentage / 100;
    let value;
    if (bestscore === defaultScore || precentage === 0) {
        return tierLabels[0];
    }
    if (reverse) {
        value = Math.floor(precentage * bestscore);
    } else {
        value = Math.floor(bestscore / precentage);
    }
    if (scoreType === "Moves") {
        return normalizeMoves(value, isAverage);
    }
    if (scoreType === "Time") {
        return normalizeTime(value);
    }
    if (scoreType === "TPS") {
        return normalizeTPS(value);
    }
}

function generateFormattedString(request) {
    function generateSelect(id, values, texts) {
        if (values.length !== texts.length) {
            console.error("Values and texts arrays must have the same length.");
            return '';
        }
        const optionsHTML = values.map((value, index) => `<option value="${value}">${texts[index]}</option>`).join('');
        const selectHTML = `<select id="${id}">${optionsHTML}</select>`;
        return selectHTML;
    }
    const selectString = generateSelect("displayType", displayTypeOptions, displayTypeOptions);
    const selectPBTypeString = generateSelect("pbTypeSelect", PBTypeValues, PBTypeStrings);
    var selectControlTypeString;
    if (request.width === squaresSheetType || request.width === "All" || String(request.width)
        .includes("Rankings")) {
        selectControlTypeString = generateSelect("controlTypeSelect", controlTypeSelectValuesUnique, controlTypeSelectStringsUnique);
    } else {
        selectControlTypeString = generateSelect("controlTypeSelect", controlTypeSelectValues, controlTypeSelectStrings);
    }
    const formattedParts = [];
    const sortedByPart = `<span style="font-weight: 900;">${selectPBTypeString}</span> ${leaderboardForString} `;
    formattedParts.push(sortedByPart);
    if (request.gameMode !== "Standard" && !String(request.width)
        .includes("Rankings")) {
        formattedParts.push(`<span class="gamma" style="font-weight: 700;">${request.gameMode}</span> `);
    }
    if (request.width === squaresSheetType) {
        if (request.nameFilter.length === 0) {
            formattedParts.push(`<span class="epsilon" style="font-weight: 900;">${worldRecordsOnNN}</span> ${slidingPuzzleString}`);
            if (NxMSelected !== totalWRsAmount) {
                formattedParts.push(`${byString}<span class="pinktext">${NxMSelected}</span>`);
            }
        } else {
            formattedParts.push(`${PBsPlaceHolderString} ${slidingPuzzleString}`);
        }
    } else if (request.width === "All") {
        if (request.nameFilter.length === 0) {
            formattedParts.push(`<span class="alpha" style="font-weight: 900;">${worldRecordsOnNM}</span> ${slidingPuzzleString}</span>`);
            if (NxMSelected !== totalWRsAmount) {
                formattedParts.push(`${byString}<span class="pinktext">${NxMSelected}</span>`);
            }
        } else {
            formattedParts.push(`${PBsPlaceHolderStringNxM} ${slidingPuzzleString}`);
        }
    } else if (request.width === "Rankings") {
        formattedParts.push(`<span class="beta" style="font-weight: 900;">${MainRankingsString}</span> ${slidingPuzzleString}`);
    } else if (request.width === "Rankings2") {
        createCustomSlider();
        formattedParts.push(`<span class="beta" style="font-weight: 900;">${PopularRankingsString}</span> ${slidingPuzzleString}`);
    } else if (request.width === "Rankings3") {
        formattedParts.push(`<span class="beta" style="font-weight: 900;">${customRankingsString}</span> ${slidingPuzzleString}`);
    } else if (request.width === "History") {
        formattedParts.push(`<span class="delta" style="font-weight: 900;">${hisroryPageString}</span> ${slidingPuzzleString}`);
        if (request.nameFilter !== "") {
            formattedParts.push(`${byString}<span id="nameSpanHeader" class="pinktext" style="font-weight: 900;"></span>`);
        }
    } else {
        formattedParts.push(`<span class="pinktext" style="font-weight: 900;">${request.width}x${request.height}</span> ${slidingPuzzleStringOne}`);
    }
    formattedParts.push(`
        <style>
            .glow-button {
                background: black;
                border: none;
                cursor: pointer;
                border-radius: 5px;
                padding: 5px;
                transition: box-shadow 0.3s;
                outline: none;
            }
    
            .glow-button:hover {
                background-color: white;
                box-shadow: 0 0 50px cyan;
            }
        </style>
        <button class="glow-button" onclick="updateServer(user_token, last_displayType, last_controlType, last_pbType)">
            <span style="font-size: 24px; color: white;">&#x267B;</span> <!-- Unicode for refresh icon -->
        </button>
    `);
    formattedParts.push(`<br><h2>${doneWithString} ` + selectString + displayTypeHeaderString);
    formattedParts.push(`<span class="pinktext" style="font-weight: 700;">${selectControlTypeString}</span> ${controlsTypeHeaderString}</h2>`);
    let timeAgo = getTimeAgo(latestRecordTime);
    formattedParts.push(`<span class="leaderboardUpdateSpan">${lastLeaderboardUpdateString} <span style="color: #ffffff">${timeAgo}</span></span>`);
    clearInterval(window.leaderboardInterval); 
    window.leaderboardInterval = setInterval(() => {
        try {
          const updateSpan = document.querySelector(".leaderboardUpdateSpan");
          if (updateSpan) {
            updateSpan.innerHTML = `${lastLeaderboardUpdateString} <span style="color: #ffffff">${getTimeAgo(latestRecordTime)}</span>`;
          }
        } catch (error) {
          // Ignore errors
        }
      }, 10000);   // if(latestRecordTime){
   //     let timeAgo = getTimeAgo(new Date(latestRecordTime));
   //     formattedParts.push(`<span class="leaderboardUpdateSpan">${lastLeaderboardUpdateString} <span style="color: #ffffff">${timeAgo}</span></span>`);
   //     if (timeAgo.includes("days")){
   //         formattedParts.push(`<span class="leaderboardUpdateSpan"><p style="color: red">${leaderboardUpdatesInfoText}</p></span>`);
   //     }
   // }
    //formattedParts.push(`<span class="leaderboardUpdateSpan"><a style="color: #FF88BB" href="${submitVideoLink}">${submitVideoText}</a></span>`);
    const finalString = `${formattedParts.join(' ')}`;
    leaderboardName.innerHTML = finalString;
    function displayTypeChanged() {
        let currentValue = displayTypeSelect.value;
        changeDisplayType(currentValue);
        displayTypeSelect.style.width = `${getTextOfSelectLength(displayTypeSelect) + 1}ch`;
    }

    function leaderboardTypeChanged() {
        let currentValue = leaderboardTypeSelect.value;
        changeLeaderboardType(currentValue);
        leaderboardTypeSelect.style.width = `${getTextOfSelectLength(leaderboardTypeSelect) + 1}ch`;
    }

    function controlTypeChanged() {
        let currentValue = controlTypeSelect.value;
        changeControls(currentValue);
        controlTypeSelect.style.width = `${getTextOfSelectLength(controlTypeSelect) + 1}ch`;
    }
    displayTypeSelect = document.getElementById("displayType");
    displayTypeSelect.addEventListener("change", displayTypeChanged);
    displayTypeSelect.value = request.displayType;
    leaderboardTypeSelect = document.getElementById("pbTypeSelect");
    leaderboardTypeSelect.addEventListener("change", leaderboardTypeChanged);
    leaderboardTypeSelect.value = request.leaderboardType;
    controlTypeSelect = document.getElementById("controlTypeSelect");
    controlTypeSelect.addEventListener("change", controlTypeChanged);
    controlTypeSelect.value = controlType;
    const nameSpanHeader = document.getElementById('nameSpanHeader');
    if (nameSpanHeader) {
        const removeIcon = document.createElement('button');
        removeIcon.textContent = request.nameFilter;
        removeIcon.fontSize = "16px";
        removeIcon.addEventListener('click', () => {
            usernameInput.value = "";
            changeNameFilter("");
        });
        nameSpanHeader.appendChild(removeIcon);
    }
    if (loadingPower) {
        leaderboardName.innerHTML = `
        <span class="leaderboardUpdateSpan" onclick="getPowerData();" style="cursor: pointer;">
          ${lastLeaderboardUpdateString} 
          <span style="color: #ffffff;">${timeAgo}</span>
        </span>
      `;    }
}

function getTextOfSelectLength(mySelect) {
    return mySelect.options[mySelect.selectedIndex].textContent.length;
}


function appendFlagIconToNickname(nickname) {
    const lowerCaseNickname = nickname.toLowerCase();
    let country = null;

    // Try to find the country for this nickname
    for (const user in userCountryMap) {
        if (user.toLowerCase() === lowerCaseNickname) {
            country = userCountryMap[user];
            break;
        }
    }

    const flagIconLink = country && countryEmojis[country] 
        ? countryEmojis[country] 
        : "images/flags/default.png"; // fixed default path

    const isDonator = donatorsList.some(donator => donator.toLowerCase() === lowerCaseNickname);
    const donatorIcon = isDonator ? `<a href="/donate" class="gold-icon-link">
        <img class="emoji" draggable="false" alt="gold" src="images/gold.png" 
        style="border-radius: 50%;"
        title="✨ This user supported Open Leaderboard! &#10;💛 Very Egg-cellent! &#10;(click for more info)">
    </a>` : '';

    const isAdminOrDeveloper = adminsList.some(user => user.toLowerCase() === lowerCaseNickname);
    const roleIcon = isAdminOrDeveloper ? `<a href="/donate" class="admin-icon-link"  
        title="🛠️ This user is an Admin/Developer! &#10;They build and maintain the system. &#10;(click for more info)">🛠️
    </a>` : '';

    return `<img class="emoji" draggable="false" alt="${country || 'unknown'}" src="${flagIconLink}">${nickname}${roleIcon}${donatorIcon}`;
}




//_________________"Private" functions (multiple usage) ends_________________

//_________________"Private" functions for createSheet_________________

function createTableCell(item, className) {
    const cell = document.createElement('td');
    cell.className = className;

    // Create a text node and append it to the cell
    const textNode = document.createTextNode(item);
    cell.appendChild(textNode);

    return cell;
}

//_________________"Private" functions for createSheet ends_________________

//_________________"Private" functions for createSheetNxM_________________

function getAllSizes(resultsList, transposed = false) {
    const widthSet = new Set(resultsList.map(result => result.width));
    const heightSet = new Set(resultsList.map(result => result.height));
    if (transposed) {
        return {
            height: [...widthSet].sort((a, b) => a - b),
            width: [...heightSet].sort((a, b) => a - b),
        };
    }
    return {
        width: [...widthSet].sort((a, b) => a - b),
        height: [...heightSet].sort((a, b) => a - b),
    };
}

function getScoreStringNxM(time, moves, tps, scoreType, isAverage, username) {
    result = normalizeValues(time, moves, tps, isAverage);
    time = result["time"];
    moves = result["moves"];
    tps = result["tps"];
    if (scoreType === "Moves") {
        return [moves, username];
    }
    if (scoreType === "Time") {
        return [time, username];
    }
    if (scoreType === "TPS") {
        return [tps, username];
    }
}

//_________________"Private" functions for createSheetNxM ends_________________

//_________________"Private" functions for createSheetRankings_________________


function getClosestAllowedValue(value, allowedValues) {
    return allowedValues.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
}

function createCustomSlider() {
    const slider = document.createElement("input");
    slider.type = "range";
    allowedCategoryCountsCategories = Array.from(allowedCategoryCounts.keys());
    slider.min = Math.min(...allowedCategoryCountsCategories);
    slider.max = Math.max(...allowedCategoryCountsCategories);

    // Find the closest allowed value for the initial slider value
    const closestAllowedValue = getClosestAllowedValue(lastSliderValue, allowedCategoryCountsCategories);
    slider.value = closestAllowedValue;

    const getMinPlayers = (value) => allowedCategoryCounts.get(parseInt(value));

    const sliderLabel = document.createElement("label");
    sliderLabel.innerHTML = `<span style="color: white;">Min. number of players: </span><span style="color: #00ff00;">${getMinPlayers(slider.value)}</span><br><span style="color: gray;font-style: italic;">${maxCategoriesForPopularString} ${slider.value}</span>`;
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.insertBefore(sliderLabel, contentDiv.firstChild);
    contentDiv.insertBefore(slider, contentDiv.firstChild);

    slider.addEventListener("input", function () {
        const closestAllowedValue = getClosestAllowedValue(slider.value, allowedCategoryCountsCategories);
        slider.value = closestAllowedValue;
        sliderLabel.innerHTML = `<span style="color: white;">Min. number of players: </span><span style="color: #00ff00;">${getMinPlayers(slider.value)}</span><br><span style="color: #90EE90;font-style: italic;">${maxCategoriesForPopularString} ${slider.value}</span>`;
    });

    slider.addEventListener("change", function () {
        const closestAllowedValue = getClosestAllowedValue(slider.value, allowedCategoryCountsCategories);
        slider.value = closestAllowedValue;
        lastSliderValue = closestAllowedValue;
        sendMyRequest();
    });

    sliderLabel.classList.add("sliderlabel");

    const onlySquaresCheckbox = document.createElement("input");
    onlySquaresCheckbox.type = "checkbox";
    onlySquaresCheckbox.id = "onlySquaresCheckbox";
    onlySquaresCheckbox.checked = lastSquaresCB;
    onlySquaresCheckbox.addEventListener("change", function () {
        lastSquaresCB = onlySquaresCheckbox.checked;
        sendMyRequest();
    });

    const onlySquaresLabel = document.createElement("label");
    onlySquaresLabel.textContent = onlyInterestingCategoriesPopular;
    onlySquaresLabel.htmlFor = "onlySquaresCheckbox";

    contentDiv.appendChild(onlySquaresCheckbox);
    contentDiv.appendChild(onlySquaresLabel);
    contentDiv.appendChild(document.createElement("br"));
    contentDiv.appendChild(document.createElement("br"));
}

function createHideEmptyCheckbox() {
    const hideEmptyCheckbox = document.createElement("input");
    hideEmptyCheckbox.type = "checkbox";
    hideEmptyCheckbox.id = "hideEmptyCheckbox";
    hideEmptyCheckbox.checked = hideEmptyTiers;
    hideEmptyCheckbox.addEventListener("change", function () {
        hideEmptyTiers = hideEmptyCheckbox.checked;
        sendMyRequest();
    });
    const hideEmptyCheckboxLabel = document.createElement("label");
    hideEmptyCheckboxLabel.textContent = hideEmptyTiersCheckboxText;
    hideEmptyCheckboxLabel.htmlFor = "hideEmptyCheckbox";
    const contentDiv = document.getElementById("contentDiv");
    contentDiv.appendChild(hideEmptyCheckbox);
    contentDiv.appendChild(hideEmptyCheckboxLabel);
    contentDiv.appendChild(document.createElement("br"));
}

//_________________"Private" functions for createSheetRankings ends_________________

//_________________"Private" functions for createSheetHistory_________________

function tableIsEmpty(records, recordsListWR, scoreType) {
    for (const item of records) {
        const tierInfo = getTier(item, recordsListWR, scoreType);
        const percentage = tierInfo[0];
        if (percentage >= getTierPercentageLimit() && !isInvalidScore(item)) {
            return false;
        }
    }
    return true;
}

function getTier(item, recordsListWR, scoreType) {
    let bestValue = getBestValueWithGameMode(recordsListWR, scoreType, item.width, item.height, item.gameMode, item.avglen);
    let mainValue;
    let reverse = false;
    if (scoreType === "Moves") {
        mainValue = item.moves;
    }
    if (scoreType === "Time") {
        mainValue = item.time;
    }
    if (scoreType === "TPS") {
        mainValue = item.tps;
        reverse = true;
    }
    const percentage = calculatePercentage(mainValue, bestValue, reverse);
    return [percentage, getClassBasedOnPercentage(percentage, percentageTable), bestValue];
}

function getBestValueWithGameMode(data, scoreType, width, height, gameMode, avglen) {
    let bestValue = null;
    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.width === width && item.height === height && item.gameMode === gameMode && item.avglen === avglen) {
            if (scoreType === "Moves") {
                bestValue = item.moves;
            } else if (scoreType === "Time") {
                bestValue = item.time;
            } else if (scoreType === "TPS") {
                bestValue = item.tps;
            }
            break;
        }
    }
    return bestValue;
}

function groupRecordsByTimestamp(records) {
    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    function isLastWeek(date, currentDate) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.abs(date - currentDate) <= 7 * oneDay;
    }

    function isEarlierThisMonth(date, currentDate) {
        return date.getMonth() === currentDate.getMonth() &&
            date.getFullYear() === currentDate.getFullYear();
    }
    const groupedRecords = {
        [todayString]: [],
        [weekString]: [],
        [monthString]: [],
    };
    for (const record of records) {
        const recordDate = new Date(record.timestamp);
        const currentDate = new Date();
        if (isSameDay(recordDate, currentDate)) {
            groupedRecords[todayString].push(record);
        } else if (isLastWeek(recordDate, currentDate)) {
            groupedRecords[weekString].push(record);
        } else if (isEarlierThisMonth(recordDate, currentDate)) {
            groupedRecords[monthString].push(record);
        } else {
            let recordMonthYear = invalidTimestampStringHistory;
            if (record.timestamp !== -1) {
                recordMonthYear = recordDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                });
            }
            if (!groupedRecords[recordMonthYear]) {
                groupedRecords[recordMonthYear] = [];
            }
            groupedRecords[recordMonthYear].push(record);
        }
    }
    const groupKeys = Object.keys(groupedRecords);
    groupKeys.sort((a, b) => {
        const firstRecordA = groupedRecords[a][0];
        const firstRecordB = groupedRecords[b][0];
        if (firstRecordA && firstRecordB) {
            return firstRecordB.timestamp - firstRecordA.timestamp;
        } else if (firstRecordA) {
            return -1; // A has records, B doesn't
        } else if (firstRecordB) {
            return 1; // B has records, A doesn't
        } else {
            return 0; // Both A and B have no records
        }
    });
    const sortedGroupedRecords = {};
    for (const key of groupKeys) {
        sortedGroupedRecords[key] = groupedRecords[key];
    }
    return sortedGroupedRecords;
}

function populateTableHistory(records, recordsListWR, scoreType, table, reverse) {
    let scoresCounter = 0;
    records.forEach(item => {
        const tierInfo = getTier(item, recordsListWR, scoreType);
        const percentage = tierInfo[0];
        if (percentage >= getTierPercentageLimit() && !isInvalidScore(item)) {
            scoresCounter++;
            const dataRow = document.createElement('tr');
            table.appendChild(dataRow);
            const puzzleCell = document.createElement('td');
            dataRow.appendChild(puzzleCell);
            const isAverage = (item.avglen !== 1);
            let avgpart = "single";
            if (isAverage) {
                avgpart = `ao${item.avglen}`;
            }
            puzzleCell.innerHTML = `${item.width}x${item.height}<br>${avgpart}`;
            puzzleCell.classList.add("clickable");
            let newSize = item.width + "x" + item.height;
            let newGameMode = item.gameMode;
            puzzleCell.addEventListener("click", function () {
                customSizeInput.value = newSize;
                radioCustomSize.value = newSize;
                radioCustomSize.checked = true;
                for (const radio of gamemodeRadios) {
                    if (radio.value === newGameMode) {
                        radio.checked = true;
                        break;
                    }
                }
                changeGameMode(newGameMode);
                changePuzzleSize(newSize);
            });
            const gamemodeCell = document.createElement('td');
            gamemodeCell.innerHTML = item.gameMode.replace(" ", "<br>").replace("Everything-up-to","EUT");
            dataRow.appendChild(gamemodeCell);
            const displayedName = item.nameFilter;
            const playerNameCell = document.createElement("td");
            playerNameCell.innerHTML = appendFlagIconToNickname(displayedName);
            playerNameCell.classList.add("clickable");
            playerNameCell.style.minWidth = "150px";
            playerNameCell.style.maxWidth = "150px";
            playerNameCell.addEventListener("click", function () {
                changeNameFilter(item.nameFilter);
            });
            dataRow.appendChild(playerNameCell);
            const scoreString = getScoreString(item.time, item.moves, item.tps, scoreType, isAverage);
            const scoreCell = createTableCellScore(scoreString, 'score', "grayColor");
            const tier = tierInfo[1];
            const bestValue = tierInfo[2];
            if (!debugMode){
                    let makeyoutubelink = false;
                    const videolink = videoLinkCheck(item.videolink);
                    if (videolink){
                        scoreCell.classList.add("clickable");
                        scoreCell.firstChild.innerHTML = youtubeElement + scoreCell.firstChild.textContent;
                        makeyoutubelink = true;
                    }           
                if (true//item.gameMode === "Standard"// && !isAverage
                    ) {
                    //const solution = getSolutionForScore(item);
                    if (item.solve_data_available) {
                        makeyoutubelink = false;
                        let videoLinkForReplay = -1;
                        if (videolink){
                            videoLinkForReplay = videolink;
                            scoreCell.firstChild.innerHTML = redEggElement + scoreCell.firstChild.textContent;
                        } else {
                            scoreCell.firstChild.innerHTML = eggElement + scoreCell.firstChild.textContent;
                        }
                        scoreCell.classList.add("clickable");
                        
                        const scoreTitle = getScoreTitle(videoLinkForReplay, item.width, item.height, item.displayType, item.nameFilter, item.controls, item.timestamp, tier, percentage === 100, scoreType);
                        scoreCell.addEventListener('click', (event) => {
                            getSolutionForScore(item, (error, solveData) => {
                                if (error) {
                                    alert(error);
                                } else {
                                    //makeReplay(solution, event, item.tps, item.width, item.height, scoreTitle);
                                    handleSavedReplay(item, solveData, event, item.tps, item.width, item.height, scoreTitle, videoLinkForReplay, tier, percentage === 100);
                                }
                            });
                           // makeReplay(solution, event, item.tps, item.width, item.height, scoreTitle);
                        });
                    }
                }
                if (makeyoutubelink) {
                    scoreCell.addEventListener('click', function () {
                        window.open(videolink, '_blank');
                    });
                }   
            } else{
                if (item.nameFilter === logged_in_as || logged_in_as === "vovker" || logged_in_as === "dphdmn"){
                    scoreCell.classList.add("clickable");
                    scoreCell.firstChild.textContent = getScoreIDIcon + scoreCell.firstChild.textContent;
                    scoreCell.addEventListener('click', function () {
                        promptForVideoLink(item.time, item.moves, item.timestamp);
                    });
                }
            }
            dataRow.appendChild(scoreCell);
            const controlsCell = document.createElement('td');
            controlsCell.textContent = item.controls;
            dataRow.appendChild(controlsCell);
            const tierCell = document.createElement('td');
            const limitsString = getLimitString(bestValue, item, avgpart, item.gameMode, reverse, isAverage, scoreType);
            const tierCap = tier.charAt(0)
                .toUpperCase() + tier.slice(1);
            if (percentage === 100) {
                tierCell.textContent = `WR`;
                tierCell.classList.add("WRPB");
            } else {
                tierCell.innerHTML = `${tierCap}<br>(${percentage.toFixed(1)}%)`;
            }
            dataRow.classList.add(tier);
            dataRow.appendChild(tierCell);
            tierCell.addEventListener('mouseover', () => {
                tooltip.innerHTML = limitsString;
                tooltip.style.display = 'block';
            });
            tierCell.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX - 170) + 'px';
                tooltip.style.top = (e.pageY - 470) + 'px';
            });
            tierCell.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            dataRow.classList.add("shadowFun");
            dataRow.addEventListener('mouseover', () => {
                dataRow.classList.add("highlightedCell");
            });
            if (scoreType === "Time" && item.time > 59999) {
                scoreCell.addEventListener('mouseover', () => {
                    tooltip.textContent = formatTime(item.time);
                    tooltip.style.display = 'block';
                });
                scoreCell.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.pageX - 150) + 'px';
                    tooltip.style.top = (e.pageY - 20) + 'px';
                });
            }
            if (scoreType === "Moves" && item.moves > 100000 && isAverage) {
                scoreCell.addEventListener('mouseover', () => {
                    tooltip.textContent = (item.moves / 1000)
                        .toFixed(3);
                    tooltip.style.display = 'block';
                });
                scoreCell.addEventListener('mousemove', (e) => {
                    tooltip.style.left = (e.pageX - 150) + 'px';
                    tooltip.style.top = (e.pageY - 20) + 'px';
                });
            }
            dataRow.addEventListener('mouseout', () => {
                dataRow.classList.remove("highlightedCell");
            });
            dataRow.addEventListener('mouseout', () => {
                tooltip.style.display = 'none';
            });
            const dateCell = document.createElement('td');
            dateCell.textContent = formatTimestampWithTime(item.timestamp);
            dataRow.appendChild(dateCell);
        }
    });
    return scoresCounter;
}

function getLimitString(bestValue, item, avgpart, gameMode, reverse, isAverage, scoreType) {
    let limitsString = `<p>${item.width}x${item.height} ${avgpart} ${requirementsString} (${gameMode}):</p>`
    const limit = getScoreLimitExact(100, bestValue, reverse);
    const limitVisual = getScoreLimit(100, bestValue, reverse, scoreType, isAverage);
    if (limit !== limitVisual) {
        limitsString += `<p><span class="alpha WRPB">WR: ${limitVisual} (${limit})</span></p>`;
    } else {
        limitsString += `<p><span class="alpha WRPB">WR: ${limitVisual}</span></p>`;
    }

    for (const key in percentageTable) {
        if (percentageTable.hasOwnProperty(key)) {
            const percentageValue = percentageTable[key];
            const limit = getScoreLimitExact(percentageValue, bestValue, reverse);
            const limitVisual = getScoreLimit(percentageValue, bestValue, reverse, scoreType, isAverage);
            const categoryName = key.charAt(0)
                .toUpperCase() + key.slice(1)
            if (limit !== limitVisual) {
                limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual} (${limit})</span></p>`;
            } else {
                limitsString += `<p><span class="${key}">${categoryName} (${percentageValue}%): ${limitVisual}</span></p>`;
            }
        }
    }
    return limitsString;
}

//_________________"Private" functions for createSheetHistory ends_________________
