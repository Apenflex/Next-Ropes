import mongoose from 'mongoose'

const ropeSchema = new mongoose.Schema({
	text: { type: String, required: true },
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	community: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Community',
	},
	createdAt: { type: Date, default: Date.now },
  parentId: { type: String },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rope',
    }
  ],
})

const Rope = mongoose.models.Rope || mongoose.model('Rope', ropeSchema)

export default Rope
