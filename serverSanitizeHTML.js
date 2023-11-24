const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;

const DOMPurify = createDOMPurify(window);

async function serverSanitizeHTML(req, res) {
    try {
        // Assuming that your POST body parsing middleware has already populated `req.body`
        const dirtyHTML = req.body.html;
        
        // Sanitize the HTML
        const cleanHTML = DOMPurify.sanitize(dirtyHTML);
        
        // Send the sanitized HTML back in the response
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ safeHTML: cleanHTML }));
    } catch (error) {
        console.error(`Error in serverSanitizeHTML:`, error);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: error.message }));
    }
}

module.exports = serverSanitizeHTML;
