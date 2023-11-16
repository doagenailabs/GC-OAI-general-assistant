const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OAI_API_KEY });

router.delete('/api/deleteThread', async (req, res) => {
    try {
        const threadId = req.query.threadId;
        await openai.beta.threads.del(threadId);
        res.status(200).send('Thread deleted successfully');
    } catch (error) {
        console.error('Error deleting thread:', error);
        res.status(500).send('Error deleting thread');
    }
});

module.exports = router;
