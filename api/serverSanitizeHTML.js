const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

// Create a new JSDOM instance and window object
const window = new JSDOM('').window;
// Create a DOMPurify instance using the window object
const DOMPurify = createDOMPurify(window);

function extractAndSanitizeHTML(input) {
    // Split the input by lines and process each line separately.
    const lines = input.split('\n');
    let resultHTML = '';

    lines.forEach(line => {
        // Check if the line contains HTML tags
        if (/<[a-z][\s\S]*>/i.test(line)) {
            // If it does, sanitize and append it directly
            resultHTML += DOMPurify.sanitize(line);
        } else {
            // If not, escape and wrap in paragraph tags
            const textNode = window.document.createTextNode(line);
            const p = window.document.createElement('p');
            p.appendChild(textNode);
            resultHTML += p.outerHTML;
        }
    });

    return resultHTML;
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
