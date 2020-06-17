const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
 
const passwordResetSchema = new mongoose.Schema({ 
    user: { type: String, required: true },
    status: { type: String, required: true },
    created: { type: Date, default: Date.now },
    used: { type: Date }
});

passwordResetSchema.index({ user: 1 });

module.exports = passwordResetSchema;
