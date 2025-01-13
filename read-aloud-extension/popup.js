let voices = [];
let selectedVoice = null;

function populateVoices() {
  voices = speechSynthesis.getVoices();
  const voiceSelect = document.getElementById("voice");
  
  voiceSelect.innerHTML = "";

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.textContent = voice.name + " (" + voice.lang + ")";
    option.value = voice.name;
    voiceSelect.appendChild(option);
  });

  selectedVoice = voices[0]; 
  voiceSelect.value = selectedVoice.name;
}

document.getElementById("voice").addEventListener("change", (event) => {
  selectedVoice = voices.find((voice) => voice.name === event.target.value);
});

document.getElementById("startReading").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: getSelectedText,
      },
      (results) => {
        if (results && results[0].result) {
          const selectedText = results[0].result.trim();
          if (selectedText) {
            const utterance = new SpeechSynthesisUtterance(selectedText);

            chrome.storage.local.get("speed", (data) => {
              const speed = parseFloat(document.getElementById("speed").value) || 1;
              utterance.rate = speed;

              utterance.voice = selectedVoice;
              speechSynthesis.speak(utterance);
            });
          } else {
            alert("No text selected. Please highlight some text to read aloud.");
          }
        }
      }
    );
  });
});

document.getElementById("stopReading").addEventListener("click", () => {
  speechSynthesis.cancel(); 
});

document.getElementById("speed").addEventListener("input", (event) => {
  const speedValue = event.target.value;
  document.getElementById("speedValue").textContent = speedValue;

  chrome.storage.local.set({ speed: parseFloat(speedValue) });
});

function getSelectedText() {
  return window.getSelection().toString();
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
} else {
  populateVoices();
}
