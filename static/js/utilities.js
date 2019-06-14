// Loads the content view on page load
window.onload = function () {

    // Get the content view the user was last looking at
    currentView = sessionStorage.getItem("currentView");

    // Reset the session storage, else on first page load content will be undefined
    if (currentView) {
        sessionStorage.removeItem("currentView");
    } else {
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

        // Reset current dialogue and stat variable TODO Unnecessary?
        dataset = null;
        numDialogues = null;
        currentDialogue = null;
        currentDialogueIndex = null;
        currentUttIndex = null;
        dialogueStartTime = null;
    }
};

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

        // If we are loading the annotate view then build it
        if (currentView === 'annotate' &&
            document.getElementById(dialogueViewUttNode) !== null &&
            document.getElementById(dialogueViewBtnBarNode) !== null) {
            buildDialogueViewUtterances(document.getElementById(dialogueViewUttNode));
            buildDialogueViewButtonBars(document.getElementById(dialogueViewBtnBarNode));
        }
    });
}

// // Changes the current active nav menu button to the specified content
// function changeActiveNavBtn(content) {
//
//     // Get the currently active and target button based on content
//     var currentBtn = document.getElementsByClassName("active-nav-menu-btn")[0];
//     var targetBtn = document.getElementById(content);
//
//     // If we are not on the right page then swap active state
//     if (currentBtn.id !== targetBtn.id) {
//         currentBtn.classList.remove("active-nav-menu-btn");
//         targetBtn.className = "active-nav-menu-btn";
//     }
// }

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

    $.ajax({
        type: 'get',
        url: "/logout.do",
        dataType: "json",
        success: function (result) {

            // If they were successfully logged out load home page
            if (result.success) {
                console.log("Logged out: " + result.user_name);
                loadContent('home')
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

        // Check if a timer was started i.e. it isn't/wasn't labelled
        if(dialogueStartTime !== null){
            endDialogueTimer();
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

    dialogueStartTime = Date.now();
    console.log("Timer started @ " + new Date().toUTCString());
    console.log("Current dialogue time: " + currentDialogue.time);
}

// Ends a timer for the current dialogue
function endDialogueTimer() {

    var timeDelta = Date.now() - dialogueStartTime;
    currentDialogue.time = currentDialogue.time + timeDelta;
    console.log("Timer ended @ " + new Date().toUTCString());
    console.log("Time taken: " + timeDelta);
    console.log("Current dialogue time: " + currentDialogue.time);
    dialogueStartTime = null;
}

// Starts a timer for the current utterance
function startUtteranceTimer() {

    utteranceStartTime = Date.now();
    console.log("Timer started @ " + new Date().toUTCString());
    console.log("Current utterance time: " + currentDialogue.time);
}

// Ends a timer for the current utterance
function endUtteranceTimer() {

    var timeDelta = Date.now() - utteranceStartTime;
    currentUtterance.time = currentDialogue.time + timeDelta;
    console.log("Timer ended @ " + new Date().toUTCString());
    console.log("Time taken: " + timeDelta);
    console.log("Current dialogue time: " + currentDialogue.time);
    dialogueStartTime = null;
}

// Updates the current dialogue stats
function updateCurrentStats() {

    // Dataset
    document.getElementById('dataset-lbl').innerText = dataset;

    // Dialogue
    document.getElementById('current-dialogue-id-lbl').innerText = currentDialogue.dialogue_id;
    document.getElementById('current-dialogue-index-lbl').innerText = currentDialogueIndex + 1;
    document.getElementById('num-dialogues-lbl').innerText = numDialogues;
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

function setButtonSelectedState(button, state){
    if(state === true && !button.className.includes('selected')){
        button.className += " selected";
    } else if(state === false && button.className.includes('selected')){
        button.className = button.className.replace(' selected', '')
    }
}

// Toggles the utterance buttons labelled state
function setButtonLabelledState(button, state) {
        if(state === true && !button.className.includes('labelled')){
        button.className += " labelled";
    } else if(state === false && button.className.includes('labelled')){
        button.className = button.className.replace(' labelled', '')
    }
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

