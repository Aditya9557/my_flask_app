// Function to speak text using the Web Speech API
function speakResponse(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

// Function to send user input to the backend and handle the response
function sendMessage(userInput) {
    fetch('/process_voice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
    })
        .then(response => response.json())
        .then(data => {
            const aiResponse = data.response;
            document.getElementById('response-text').innerHTML = `AI Response: "${aiResponse}"`;
            document.getElementById('loading-spinner').style.display = 'none';

            // Speak the AI's response
            speakResponse(aiResponse);

            // Update conversation history
            updateConversationHistory(data.conversation_history);
        })
        .catch(error => {
            document.getElementById('response-text').innerHTML = 'Error processing request.';
            document.getElementById('loading-spinner').style.display = 'none';
        });
}

// Function to update the conversation history
function updateConversationHistory(history) {
    const conversationHistory = document.getElementById('conversation-history');
    conversationHistory.innerHTML = ''; // Clear existing history

    history.forEach(entry => {
        const historyEntry = document.createElement('div');
        historyEntry.classList.add('history-entry');

        const userInput = document.createElement('div');
        userInput.classList.add('user-input');
        userInput.innerHTML = `You: ${entry.user}`;

        const aiResponse = document.createElement('div');
        aiResponse.classList.add('ai-response');
        aiResponse.innerHTML = `AI: ${entry.ai}`;

        historyEntry.appendChild(userInput);
        historyEntry.appendChild(aiResponse);

        conversationHistory.appendChild(historyEntry);
    });

    // Scroll to the bottom of the conversation history
    conversationHistory.scrollTop = conversationHistory.scrollHeight;
}

// Speech recognition setup
const startRecordBtn = document.getElementById('start-record-btn');
const loadingSpinner = document.getElementById('loading-spinner');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false; // Stop after one sentence
recognition.interimResults = false; // Only final results

recognition.onstart = function () {
    startRecordBtn.classList.add('listening');
    document.getElementById('response-text').innerHTML = 'Listening...';
};

recognition.onspeechend = function () {
    recognition.stop();
    startRecordBtn.classList.remove('listening');
};

recognition.onresult = function (event) {
    const userInput = event.results[0][0].transcript;
    document.getElementById('response-text').innerHTML = `You said: "${userInput}"`;
    loadingSpinner.style.display = 'block';

    // Send user input to the backend
    sendMessage(userInput);
};

recognition.onerror = function (event) {
    document.getElementById('response-text').innerHTML = 'Error: Could not process your speech.';
    startRecordBtn.classList.remove('listening');
    loadingSpinner.style.display = 'none';
};

startRecordBtn.addEventListener('click', () => {
    recognition.start();
});

// Clear conversation history
document.getElementById('clear-history-btn').addEventListener('click', () => {
    document.getElementById('conversation-history').innerHTML = '';
});