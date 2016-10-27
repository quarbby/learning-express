var mongoose = require('mongoose');

var WordSchema = new mongoose.Schema({
    word    : String,
    count   : {type: Number, default: 1}
});

mongoose.model('Word', WordSchema);