import { extname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { v4 as uuid } from 'uuid'
import { HttpException, HttpStatus } from '@nestjs/common'

//TODO file location in env? process.env.UPLOAD_LOCATION
const fileLocation = './files'
//TODO file size in env? process.env.MAX_FILE_SIZE
const maxFileSize = 1024 * 1024
export const multerConfig = {
  dest: fileLocation
}

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0]
  const fileExtName = extname(file.originalname)
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('')
  callback(null, `${name}-${randomName}${fileExtName}`)
}

export const multerOptions = {
  // Storage properties
  storage: diskStorage({
    // Destination storage path details
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = multerConfig.dest
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath)
      }
      cb(null, uploadPath)
    },
    // File modification details
    filename: editFileName
  }),
  // Enable file size limits
  limits: {
    fileSize: maxFileSize
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      // Allow storage of file
      cb(null, true)
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST
        ),
        false
      )
    }
  }
}
