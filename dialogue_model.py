class DialogueModel:
    def __init__(self, dataset, dialogues, user_id):

        # Load data
        self.dataset = dataset

        # Set the user
        self.user_id = user_id

        # All dialogues
        self.dialogues = dialogues
        self.num_dialogues = len(self.dialogues)

        # Labeled and unlabeled
        self.num_labeled = 0
        self.num_unlabeled = 0

        # Current dialogue
        self.current_dialogue_index = 0
        self.current_dialogue = self.dialogues[self.current_dialogue_index]

        # Split into labeled and unlabeled
        self.get_dialogues_states()

    def get_current_dialogue(self):
        return self.current_dialogue

    def set_current_dialogue(self, index):

        self.current_dialogue_index = index
        self.current_dialogue = self.dialogues[self.current_dialogue_index]

        return True

    def update_dialogue(self, dialogue_data):

        # Find the matching dialogue
        for dialogue in self.dialogues:
            if dialogue.dialogue_id == dialogue_data['dialogue_id']:

                # Loop over the utterances in the dialogue
                utterances = []
                for utterance in dialogue_data['utterances']:

                    # Create a new utterance
                    tmp_utterance = Utterance(utterance['text'], utterance['speaker'])

                    # Set utterance labels if not blank
                    if utterance['ap_label'] is not "":
                        tmp_utterance.set_ap_label(utterance['ap_label'])
                    if utterance['da_label'] is not "":
                        tmp_utterance.set_da_label(utterance['da_label'])

                    # Get labeled state if it exists
                    if 'is_labeld' in utterance.keys():
                        tmp_utterance.is_labeled = utterance['is_labeled']

                    # Add to utterance list
                    utterances.append(tmp_utterance)

                # Check if the labeled and time values are also set
                dialogue.is_labeled = dialogue_data['is_labeled']
                dialogue.time = dialogue_data['time']

        self.get_dialogues_states()

        return True

    def get_dialogues_states(self):

        # Reset labeled and unlabeled lists
        labeled_dialogues = []
        unlabeled_dialogues = []

        # Split dialogues into lists
        for dialogue in self.dialogues:

            if dialogue.check_labels():
                labeled_dialogues.append(dialogue)
            else:
                unlabeled_dialogues.append(dialogue)

        # Set number of labeled, unlabeled and total
        self.num_labeled = len(labeled_dialogues)
        self.num_unlabeled = len(unlabeled_dialogues)

    def inc_current_dialogue(self):

        # Increment dialogue index or wrap to beginning
        if self.current_dialogue_index + 1 < self.num_dialogues:
            self.current_dialogue_index += 1
        else:
            self.current_dialogue_index = 0

        # Set new current dialogue with index
        self.set_current_dialogue(self.current_dialogue_index)

        return True

    def dec_current_dialogue(self):

        # Decrement dialogue index or wrap to end
        if self.current_dialogue_index - 1 < 0:
            self.current_dialogue_index = self.num_dialogues - 1
        else:
            self.current_dialogue_index -= 1

        # Set new current dialogue with index
        self.set_current_dialogue(self.current_dialogue_index)

        return True


class Dialogue:

    def __init__(self, dialogue_id, utterances, num_utterances):
        self.dialogue_id = dialogue_id
        self.utterances = utterances
        self.num_utterances = num_utterances
        self.is_labeled = False
        self.time = 0.0
        self.check_labels()

    def check_labels(self):

        # Check if any utterances still have default labels
        for utt in self.utterances:

            if not utt.check_labels():
                self.is_labeled = False
                return self.is_labeled

        self.is_labeled = True
        return self.is_labeled


class Utterance:
    def __init__(self, text, speaker='', ap_label='AP-Label', da_label='DA-Label'):
        self.text = text
        self.speaker = speaker
        self.ap_label = ap_label
        self.da_label = da_label
        self.is_labeled = False

    def set_ap_label(self, label):
        self.ap_label = label
        self.check_labels()

    def set_da_label(self, label):
        self.da_label = label
        self.check_labels()

    def check_labels(self):
        # Check if utterance still has default labels
        if self.ap_label == 'AP-Label' or self.da_label == 'DA-Label':
            self.is_labeled = False
            return self.is_labeled

        self.is_labeled = True
        return self.is_labeled
