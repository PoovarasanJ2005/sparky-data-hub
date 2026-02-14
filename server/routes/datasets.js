const express = require('express');
const router = express.Router();
const Dataset = require('../models/Dataset');

// Get all datasets
router.get('/', async (req, res) => {
    try {
        const datasets = await Dataset.find();
        res.json(datasets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single dataset
router.get('/:id', async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });
        res.json(dataset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new dataset
router.post('/', async (req, res) => {
    const dataset = new Dataset({
        name: req.body.name,
        columns: req.body.columns,
        rows: req.body.rows,
        cleaned: req.body.cleaned,
        row_count: req.body.row_count
    });

    try {
        const newDataset = await dataset.save();
        res.status(201).json(newDataset);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a dataset
router.patch('/:id', async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

        if (req.body.name != null) dataset.name = req.body.name;
        if (req.body.columns != null) dataset.columns = req.body.columns;
        if (req.body.rows != null) dataset.rows = req.body.rows;
        if (req.body.cleaned != null) dataset.cleaned = req.body.cleaned;
        if (req.body.row_count != null) dataset.row_count = req.body.row_count;

        const updatedDataset = await dataset.save();
        res.json(updatedDataset);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a dataset
router.delete('/:id', async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) return res.status(404).json({ message: 'Dataset not found' });

        await dataset.deleteOne(); // or findByIdAndDelete
        res.json({ message: 'Dataset deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
