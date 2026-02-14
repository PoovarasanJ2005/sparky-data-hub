const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    columns: [String],
    rows: [mongoose.Schema.Types.Mixed],
    created_at: { type: Date, default: Date.now },
    cleaned: { type: Boolean, default: false },
    row_count: { type: Number, default: 0 }
});

// Virtual for id
DatasetSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

DatasetSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Dataset', DatasetSchema);
