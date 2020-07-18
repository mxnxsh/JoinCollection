const mongoose = require('mongoose');

const singleImageSchema = new mongoose.Schema({
   singleImage: {
      type: String,
   },
   multipleImage: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image'
   }],

});

module.exports = new mongoose.model('File', singleImageSchema);