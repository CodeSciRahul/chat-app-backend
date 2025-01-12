import multer from "multer";

//configure multer to store file in memory(RAM) temporary

const storage = multer.memoryStorage(); //it store file memory in buffer

//Initilize multer
export const upload = multer({storage})
