// Loads the content view on page load
window.onload = function () {

    // Get the content view the user was last looking at
    if (sessionStorage.getItem("currentView")) {
        currentView = sessionStorage.getItem("currentView");
        sessionStorage.removeItem("currentView");
    } else {
        // Else on first page load content will be undefined
        currentView = 'home'
    }

    // Load the content view
    loadContent(currentView);
};

// Saves the content view and current dialogue before page refresh
window.onbeforeunload = function () {

    // Save the current content view the user was on
    sessionStorage.setItem("currentView", currentView);

    // Check if we need to save the current dialogue
    if (currentDialogue) {
        saveDialogue(currentDialogue);

        // Reset current dialogue and stat variables
        dataset = null;
        numDialogues = null;
        currentDialogue = null;
        currentDialogueIndex = null;
        currentUtt = null;
        currentUttIndex = null;
        dialogueStartTime = null;
    }
};

// Checks fro scrolling on the home and schema pages
function scrollView() {

    // If we are on home or schema page check for scrolling
    if (currentView === 'home' || currentView === 'schema') {

        // If so enable back to top button
        if (document.getElementById("main-content-container").scrollTop > 20) {
            document.getElementById("to-top-btn").style.display = "block";
        } else {
            document.getElementById("to-top-btn").style.display = "none";
        }
    }
}

// Scrolls main content div back to top (Home and Schema pages)
function toTopBtnClick() {
    document.getElementById("main-content-container").scrollTop = 0;
}

// Loads the specified content to the content container
function loadContent(content) {

    // Check if we need to save the dialogue before navigating away from annotate
    if (currentView === 'annotate') {
        saveDialogue(currentDialogue);
    }

    // Check if we need to change the active nav button
    if (currentView !== content) {
        document.getElementById(currentView).classList.remove("active-nav-menu-btn");
        document.getElementById(content).className = "active-nav-menu-btn"
    } else {
        document.getElementById(content).className = "active-nav-menu-btn"
    }

    // Load the specified content and update the current view
    $("#main-content-container").load("/" + content, function () {
        currentView = content;

        // Disable 'back to top' button
        document.getElementById("to-top-btn").style.display = "none";

        // If we are loading the annotate view then build it
        if (currentView === 'annotate' &&
            document.getElementById(dialogueViewUttNodeId) !== null &&
            document.getElementById(dialogueViewBtnBarNodeId) !== null) {
            buildDialogueViewUtterances(document.getElementById(dialogueViewUttNodeId));
            buildDialogueViewButtonBars(document.getElementById(dialogueViewBtnBarNodeId));
        }
    });
}

function login() {

    // Get the user name from the input box
    let userName = document.getElementById("user-name").value;

    // If it is blank don't bother with POST request
    if (userName !== '') {
        $.ajax({
            type: 'post',
            url: "/login.do",
            data: userName,
            dataType: "json",
            success: function (result) {
                if (result.success) {
                    console.log("Logged in as: " + userName);
                    loadContent('annotate')
                } else {
                    console.log("Failed to login: " + userName);
                    alert("Failed to login: " + userName)
                }
                return result;
            }
        });
    } else {
        alert("Login ID cannot be blank!")
    }
}

function logout() {

    // Save the current dialogue first
    saveDialogue(currentDialogue);

    $.ajax({
        type: 'get',
        url: "/logout.do",
        dataType: "json",
        success: function (result) {

            // If they were successfully logged out load home page
            if (result.success) {
                console.log("Logged out: " + result.user_name);
                loadContent('login')
            } else {
                console.log("Failed to logout: " + result.user_name);
                alert("Failed to logout!")
            }
            return result;
        }
    });
}

// Saves the current dialogue to the server model
function saveDialogue(dialogue) {

    if (currentDialogue !== null) {

        // Check if a dialogue timer was started i.e. it isn't/wasn't labelled
        if (dialogueStartTime !== null) {
            endDialogueTimer();
        }
        // Check if an utterance timer was started i.e. it was selected
        if (utteranceStartTime !== null) {
            endUtteranceTimer();
        }

        $.ajax({
            type: 'post',
            url: "/save_current_dialogue.do",
            data: JSON.stringify(dialogue),
            dataType: "json",
            contentType: 'application/json;charset=UTF-8',
            success: function (result) {

                if (result.success) {
                    console.log("Saved dialogue: " + dialogue.dialogue_id);
                } else {
                    console.log("Failed to save dialogue: " + dialogue.dialogue_id);
                }
                return result;
            }
        });
    }
}

// Starts a timer for the current dialogue
function startDialogueTimer() {

    // Make sure we have a current dialogue
    if (currentDialogue !== null) {
        dialogueStartTime = Date.now();
        console.log("Timer started @ " + new Date().toUTCString());
        console.log("Current dialogue time: " + currentDialogue.time);
    } else {
        console.log("No dialogue selected! cannot start timer!")
    }
}

// Ends a timer for the current dialogue
function endDialogueTimer() {

    // Make sure we have a current dialogue and a timer was started
    if (currentDialogue !== null && dialogueStartTime !== null) {
        let timeDelta = Date.now() - dialogueStartTime;
        currentDialogue.time = currentDialogue.time + timeDelta;
        console.log("Timer ended @ " + new Date().toUTCString());
        console.log("Time taken: " + timeDelta);
        console.log("Current dialogue time: " + currentDialogue.time);
        dialogueStartTime = null;
    } else {
        console.log("No dialogue selected! cannot end timer!")
    }
}

// Starts a timer for the current utterance
function startUtteranceTimer() {

    // Make sure we have an utterance selected
    if (currentUttIndex !== null) {
        currentUtt = currentDialogue.utterances[currentUttIndex];

        utteranceStartTime = Date.now();
        console.log("Timer started @ " + new Date().toUTCString());
        console.log("Current utterance time: " + currentUtt.time);
    } else {
        console.log("No utterance selected! cannot start timer!")
    }
}

// Ends a timer for the current utterance
function endUtteranceTimer() {
    // Make sure we have an utterance selected and timer started
    if (currentUttIndex !== null && currentUtt !== null && utteranceStartTime !== null) {

        let timeDelta = Date.now() - utteranceStartTime;
        currentUtt.time = currentUtt.time + timeDelta;
        console.log("Timer ended @ " + new Date().toUTCString());
        console.log("Time taken: " + timeDelta);
        console.log("Current utterance time: " + currentUtt.time);
        utteranceStartTime = null;
        currentUtt = null;
    } else {
        console.log("No utterance selected! cannot end timer!")
    }
}

// Updates the current dialogue stats
function updateCurrentStats() {

    // Dialogue name and number
    document.getElementById('current-dialogue-id-lbl').innerText = currentDialogue.dialogue_id;
    document.getElementById('current-dialogue-index-lbl').innerText = currentDialogueIndex + 1;
    document.getElementById('num-dialogues-lbl_1').innerText = numDialogues;

    // Dialogue completed state
    if (currentDialogue.is_labelled && currentDialogue.is_complete) {
        document.getElementById("current-dialogue-completed-lbl").innerText = "\u2714";
    } else {
        document.getElementById("current-dialogue-completed-lbl").innerText = "\u274C";
    }

    document.getElementById("complete-dialogues-lbl").innerText = numCompleteDialogues;
    document.getElementById('num-dialogues-lbl_2').innerText = numDialogues;
}

// Gets the next unlabelled utterance index
function getUnlabelledUttIndex(dialogue, index) {

    let uttIndex = null;
    for (let i = index; i < dialogue.utterances.length; i++) {
        if (!dialogue.utterances[i].is_labelled) {
            uttIndex = i;
            return uttIndex;
        }
    }
    return uttIndex;
}

// Shows/hides the revise dialogue button
function toggleDialogueCompleteBtnState(state, disabled) {
    // Get the dialogue is_complete button
    let btn = document.getElementById(dialogueCompleteBtn);
    if (state) {
        btn.innerText = "Revise Dialogue";
        btn.disabled = false;
    } else if (!state) {
        btn.innerText = "Complete Dialogue";
        btn.disabled = disabled;
    }
}

// Toggles disabled state for dialogue utterance and clear buttons
function toggleDialogueDisabledState(dialogue, state) {

    // Get the number of utterance in the dialogue
    let numUtt = dialogue.utterances.length;

    // Select all the utterance and clear buttons and set state
    for (let i = 0; i < numUtt; i++) {
        let uttBtn = document.getElementById("utt-btn_" + i);
        toggleButtonDisabledState(uttBtn, state);
        let clearBtn = document.getElementById("clear-btn_" + i);
        toggleButtonDisabledState(clearBtn, state);
    }
}

// Toggles the buttons disabled state
function toggleButtonDisabledState(button, state) {
    if (state && !button.disabled) {
        button.disabled = true;
    } else if (!state && button.disabled) {
        button.disabled = false;
    }
}

// Toggles the buttons selected state
function toggleButtonSelectedState(button, state) {
    if (state && !button.className.includes('selected')) {
        button.className += " selected";
    } else if (!state && button.className.includes('selected')) {
        button.className = button.className.replace(' selected', '')
    }
}

// Toggles the utterance buttons labelled state
function toggleButtonLabelledState(button, state) {
    if (state && !button.className.includes('labelled')) {
        button.className += " labelled";
    } else if (!state && button.className.includes('labelled')) {
        button.className = button.className.replace(' labelled', '')
    }
}

// Opens a tooltip for the hovered label button
function openTooltip(event) {
    // Get the button that was hovered over
    let hoveredBtn = event.target;

    // Get the appropriate tooltip text
    let labelType = hoveredBtn.id.split("_")[0];
    let labelName = hoveredBtn.id.split("_")[1];

    let labelGroups = labels[labelType];

    // For each label group
    for (let i = 0; i < labelGroups.length; i++) {
        let group = labelGroups[i]['group'];
        // For each label
        for (let j = 0; j < group.length; j++) {
            // Get label text from data
            let labelText = group[j]['name'];
            // If it is the correct label get the tooltip text
            if (labelText === labelName) {
                var tooltipText = "";
                if (group[j]['alt_name']) {
                    tooltipText += group[j]['alt_name'] + "<br>";
                }
                if (group[j]['description']) {
                    tooltipText += group[j]['description'] + "<br>";
                }
                if (group[j]['example']) {
                    tooltipText += group[j]['example'] + "<br>";
                }
                //Replace line breaks with html <br>
                tooltipText = tooltipText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                tooltipText = tooltipText.replace(/(?:\t)/g, '&emsp;');
                break;
            }
        }
    }

    // Create the tooltip and append to its button
    let tooltip = document.createElement("span");
    tooltip.id = "tooltip_" + labelName;
    tooltip.className = "tooltip";
    tooltip.innerHTML = tooltipText;
    document.getElementById(hoveredBtn.id).appendChild(tooltip);

    // Set the position to above the center of its button
    tooltip.style.top = (hoveredBtn.offsetTop - tooltip.offsetHeight - 10) + "px";
    tooltip.style.left = ((hoveredBtn.offsetLeft + hoveredBtn.offsetWidth / 2) - tooltip.offsetWidth / 2) + "px";

    // Set the open transition
    setTimeout(function () {
        tooltip.className += " tooltip-open";
    }, 0)
}

// Closes the open tooltip
function closeTooltip(event) {
    // Get the button that was hovered over
    let hoveredBtn = event.target;

    // Select and remove tooltip element
    let labelName = hoveredBtn.id.split("_")[1];
    document.getElementById(hoveredBtn.id).removeChild(document.getElementById("tooltip_" + labelName));
}

// Checks if this utterance is completely labelled
function checkUtteranceLabels(utterance) {
    return !(utterance.ap_label === defaultApLabel || utterance.da_label === defaultDaLabel);
}

// Checks if this dialogue is completely labelled
function checkDialogueLabels(dialogue) {

    // For each utterance in the dialogue
    for (let i = 0; i < dialogue.utterances.length; i++) {
        if (!checkUtteranceLabels(dialogue.utterances[i])) {
            return false;
        }
    }
    return true;
}

// Clears all children from current node
function clearAllChildren(target) {
    while (target.firstChild) {
        target.removeChild(target.firstChild);
    }
}

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
