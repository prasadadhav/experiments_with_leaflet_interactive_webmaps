chrome.runtime.sendMessage({ message: "doSomething" }, (response) => {
    if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError.message);
        // Optionally handle the error, e.g., retry or inform the user
    } else {
        console.log("Response received:", response);
    }
});