import mongoose from "mongoose";
import Utility from "../helpers/utility";

const NoteSchema = new mongoose.Schema({
  noteID: {
    type: String,
    required: true,
    default: Utility.generateUniqueID(),
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  authorID: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});
const NoteModel = mongoose.model("note", NoteSchema);

class NoteDao {}

export default NoteDao;
