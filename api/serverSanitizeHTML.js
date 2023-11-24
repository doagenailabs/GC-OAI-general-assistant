const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function extractAndSanitizeHTML(input) {
    // This regular expression is simple and may not catch all edge cases of HTML content.
    // It assumes that HTML content will be enclosed in <html> tags.
    // It might be needed a more robust solution depending on the requirements.
    const htmlRegex = /<html>(.*?)<\/html>/gs;
    let match;
    let extractedHTML = '';

    while ((match = htmlRegex.exec(input)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === htmlRegex.lastIndex) {
            htmlRegex.lastIndex++;
        }
        
        // The full match is at index 0, whereas captured groups start from index 1
        extractedHTML += match[1];
    }

    // Sanitize the extracted HTML
    const cleanHTML = DOMPurify.sanitize(extractedHTML);
    return cleanHTML;
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
