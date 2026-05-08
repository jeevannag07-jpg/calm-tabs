const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static('public'));

app.post('/api/analyze-tabs', (req, res) => {

    const tabs = req.body.tabs;

    if (!tabs || tabs.length === 0) {

        return res.status(400).json({
            error: 'No tabs received'
        });

    }

    const analyzedTabs = tabs.map((url) => {

        return {

            url,

            title: 'AI Productivity Tab',

            category: 'Development',

            status: 'useful',

            summary: 'AI recommends keeping this tab open.'

        };

    });

    res.json(analyzedTabs);

});

app.listen(5000, () => {

    console.log('Server running on http://localhost:5000');

});