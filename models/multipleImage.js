const mongoose = require('mongoose');

const multipleImageSchema = new mongoose.Schema({
   multipleImage: {
      type: [String],
   },
   singleImageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
   },
});

module.exports = new mongoose.model('Image', multipleImageSchema);