const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Create a new JSDOM instance and window object
const window = new JSDOM('').window;
// Create a DOMPurify instance using the window object
const DOMPurify = createDOMPurify(window);

function extractAndSanitizeHTML(input) {
    // Sanitize the input as it is, assuming it's already in HTML format
    const cleanHTML = DOMPurify.sanitize(input, { ADD_TAGS: ["html"] });

    // Replace escaped HTML tags back to their original form if they were escaped
    const unescapedHTML = cleanHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

    return unescapedHTML;
}

async function serverSanitizeHTML(req, res) {
    try {
        const dirtyInput = req.body.html;
        const cleanHTML = extractAndSanitizeHTML(dirtyInput);
        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ safeHTML: cleanHTML }));
    } catch (error) {
        console.error(`Error in serverSanitizeHTML:`, error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = serverSanitizeHTML;
