function buildDialogueViewUtterances(target) {

    // Create the previous dialogue button
    var prev_btn = document.createElement("button");
    prev_btn.className = "prev-next-btn";
    prev_btn.id = "prev-btn";
    prev_btn.innerHTML = '<img src="../static/images/prev.png" alt="Previous" width="60" height="60">';
    prev_btn.addEventListener("click", prev_btn_click);
    // Append to target
    target.appendChild(prev_btn);

    // Build the utterance list
    var utterance_list = document.createElement("ul");
    utterance_list.id = "utterance-list";
    buildUtteranceList('jason-test', utterance_list);//TODO just get current dialogue
    // Append to target
    target.appendChild(utterance_list);

    // Create the previous dialogue button
    var next_btn = document.createElement("button");
    next_btn.className = "prev-next-btn";
    next_btn.id = "next-btn";
    next_btn.innerHTML = '<img src="../static/images/next.png" alt="Previous" width="60" height="60">';
    next_btn.addEventListener("click", next_btn_click);
    // Append to target
    target.appendChild(next_btn);
}

// GET's the specified JSON dialogue file and calls createUtteranceBtns
function buildUtteranceList(filename, target) {


    $.ajax({
        url: "/get_dialogue/" + filename,
        dataType: "json",
        success: function (dialogue_data) {

            console.log("Loaded file: " + filename);
            console.log(dialogue_data);

            // Call create button/labels function
            createUtteranceBtns(dialogue_data, target);
            return dialogue_data;
        }
    });

}

// Creates buttons for the utterances and DA/AP labels and appends it to the target
function createUtteranceBtns(dialogue, target) {

    // For each utterance in the dialogue
    for (var i = 0; i < dialogue.utterances.length; i++) {

        // Get current utterance
        var utterance = dialogue.utterances[i];

        // Create list element
        var utterance_node = document.createElement("li");
        utterance_node.id = "utt_" + i;

        // Create the button
        var utterance_btn = document.createElement("button");
        utterance_btn.className = "utt-btn";
        utterance_btn.id = "utt-btn_" + i;
        utterance_btn.innerHTML = utterance.speaker + ": " + utterance.text;
        utterance_btn.addEventListener("click", utterance_btn_click);

        // Create the AP label
        var ap_text = document.createElement("label");
        ap_text.className = "utt-label-container";
        ap_text.id = "ap-label_" + i;
        if (utterance.ap_label === "") {
            ap_text.innerText = "AP-label";
        } else {
            ap_text.innerText = utterance.ap_label;
        }

        // Create the DA label
        var da_text = document.createElement("label");
        da_text.className = "utt-label-container";
        ap_text.id = "da-label_" + i;
        if (utterance.da_label === "") {
            da_text.innerText = "DA-label";
        } else {
            da_text.innerText = utterance.da_label;
        }

        // Create clear button
        var clear_btn = document.createElement("button");
        clear_btn.className = "clear-btn";
        clear_btn.id = "clear-btn_" + i;
        clear_btn.innerHTML = '<img src="../static/images/delete.png" alt="Clear" width="15" height="15"/>';
        clear_btn.addEventListener("click", utterance_clear_btn_click);

        // Append all to the list
        utterance_node.appendChild(utterance_btn);
        utterance_node.appendChild(ap_text);
        utterance_node.appendChild(da_text);
        utterance_node.appendChild(clear_btn);

        // Append to the target
        target.appendChild(utterance_node);

    }
}

// Builds the dialogue view label button bars
function buildDialogueViewButtonBars(target) {

    // Create AP button bar div
    var ap_btn_bar = document.createElement("div");
    ap_btn_bar.className = "btn-bar";
    ap_btn_bar.id = "ap-btn-bar";

    // Get and build the labels
    buildLabelBtns('ap_labels', ap_btn_bar);

    // Append to the target
    target.appendChild(ap_btn_bar);

    // Create DA button bar div
    var da_btn_bar = document.createElement("div");
    da_btn_bar.className = "btn-bar";
    da_btn_bar.id = "da-btn-bar";

    // Get and build the labels
    buildLabelBtns('da_labels', da_btn_bar);

    // Append to the target
    target.appendChild(da_btn_bar);
}

// Gets the specified DA or AP label groups and calls createLabelBtnsGroup
function buildLabelBtns(label_group, target) {

    $.ajax({
        url: "get_labels/" + label_group,
        dataType: "json",
        success: function (label_groups) {

            // Groups are returned as a 2d list of groups
            for (var i = 0; i < label_groups.length; i++) {
                createLabelBtnsGroup(label_groups[i], target);
            }
        }
    });
}

// Creates a button group for the DA or AP labels and appends it to the target
function createLabelBtnsGroup(group, target) {

    // Create label group div
    var label_group = document.createElement("div");
    label_group.className = "label-group";

    for (var i = 0; i < group.length; i++) {

        // Create button for label
        var label_btn = document.createElement("button");
        label_btn.className = "label-button";
        label_btn.id = group[i];
        label_btn.innerHTML = group[i];
        label_btn.addEventListener("click", label_btn_click);

        // Append to group
        label_group.appendChild(label_btn);
    }

    // Append to target
    target.append(label_group);
}


