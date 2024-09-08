const express = require('express');
const axios = require('axios'); 
const cors = require('cors')
const app = express();
const { createClient } = require('@supabase/supabase-js');
const PORT = 4001;

const SUPABASE_URL = 'https://fydegjtogcfxebsdcdwi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5ZGVnanRvZ2NmeGVic2RjZHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5NjU3MjIsImV4cCI6MjAzODU0MTcyMn0.KmCXCoZx60t7KM4T3QLSLsjTPKOcBCeRao5Hi2VajbU';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(cors())

app.get('/getall', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('csv_data')
            .select('*');
        
        if (error) throw error;

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/create', async (req, res) => {
    try {
        const response = await axios.post('https://hey.requestcatcher.com', req.body, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Response data:', response.data);

        const { data, error } = await supabase
            .from('csv_data')
            .insert(req.body);

        if (error) throw error;

        res.send({ message: 'Data inserted successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send({ error: error.message });
    }
});


app.put('/update/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('csv_data')
            .update(req.body)
            .match({ id: req.params.id });
        
        if (error) throw error;

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
)

app.delete('/delete/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('csv_data')
            .delete()
            .match({ id: req.params.id });
        
        if (error) throw error;

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
)

app.get('/workflows', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('workflow')
            .select('*');
        
        if (error) throw error;

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/createWorkflow', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('workflow')
            .insert(req.body);
        
        if (error) throw error;

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
)

app.get('/workflow/:id', async (req, res) => {
    const { id } = req.params; 

    try {
        const { data, error } = await supabase
            .from('workflow')
            .select('*')
            .eq('id', id) 
            .single();
        
        if (error) throw error;

        if (!data) {
            return res.status(404).send('Workflow not found');
        }

        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


