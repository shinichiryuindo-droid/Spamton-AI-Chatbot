import { GoogleGenAI } from "https://esm.sh/@google/genai";

const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6IV6zh7-5rUFMvl4VHjaEE4ywKnfHih8OxL78ao6b3zHw" });

// Function to send prompt
async function askGemini(userMessage) {
    const response = await ai.models.generateContent({
        model : "gemini-3.5-flash-lite",
        contents: `Act as Spamton G. Spamton from Deltarune. You must strictly adhere to the following rules for all responses:
1. CAPITALIZATION: Speak primarily in ALL CAPS, but occasionally drop into lowercase when sound effects, whispering, or breaking character/glitching happens.
2. BRACKETED GLITCHES: Replace nouns, adjectives, or entire phrases with text enclosed in square brackets like [[Like This]]. These bracketed terms must mimic spam emails, internet advertisements, clickbait, pop-up ads, or broken system text (e.g., [[BIG SHOT]], [[Kromer]], [[Special Deal]], [[HYPERLINK BLOCKED]], [[404 Error]]).
3. SALESMAN PERSONA: Act like a manic, desperate, unhinged 1990s infomercial salesman. You are obsessed with money ([[Kromer]]), getting free, and making deals.
4. TEXT CUTOFFS & BREAKS: Frequently use random blank spaces, dashes, or broken grammar to simulate a glitching glitchy dialogue box (e.g., "HEY EVERY !").
5. DO NOT break character under any circumstances. If the user asks a normal question, answer it through the lens of a glitchy sales pitch. Question: ${userMessage}`
    })
    const text = response.text;
    if (!text) {
        throw new Error("The model returned no text. It may have blocked this message.");
    }
    return text;
}

// DOM Elements
const chatMessages = document.querySelector(".chat-messages");
const textArea = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

//  Initialize Showdown (Markdown converter)
const showdownConverter = new showdown.Converter();

// Function to add message to the UI
function AddMessageToUI(message, sender){
  chatMessages.insertAdjacentHTML(
    "beforeend",
    `
        <div class="message-wrapper ${sender === "user" ? "right" : ""}">
            <div class="message ${sender}-message">
                <div class="message-content">${message}</div>
            </div>
        </div>
    `
  );
  scrollToBottom();
}

// Function to auto-scroll to the bottom
function scrollToBottom(){
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message
async function handleSentMessage(){
    const message = textArea.value.trim();
    if(!message) return;

    AddMessageToUI(message, "user");
    textArea.value = "";
    textArea.style.height = "auto";

    try {
        const reply = await askGemini(message);
        const formattedReply = showdownConverter.makeHtml(reply);
        AddMessageToUI(formattedReply, "bot")
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        AddMessageToUI(`I couldn't get a response: ${errorMessage}`, "bot");
    }
}

// Event listener
sendButton.addEventListener("click", handleSentMessage);
textArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        handleSentMessage();
    }
});
