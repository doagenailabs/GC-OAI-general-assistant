// openaiAssistant.js

async function sendMessageToOpenAI(message) {
    try {

        const config = await getConfig();

        const requestBody = {
            model: "text-davinci-003",
            prompt: message,
            max_tokens: 150
        };


        const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.OAIApiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        return data.choices[0].text;
    } catch (error) {
        console.error('Error sending message to OpenAI:', error);
        return "Sorry, I couldn't process your request.";
    }
}

document.getElementById('openai-send-button').addEventListener('click', async () => {
    const inputElement = document.getElementById('openai-chat-input');
    const userMessage = inputElement.value;
    inputElement.value = '';

    // Display user message in the chat window
    // ...

    const openaiResponse = await sendMessageToOpenAI(userMessage);

    // Display OpenAI's response in the chat window
    // ...
});
