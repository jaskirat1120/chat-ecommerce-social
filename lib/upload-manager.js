let CONSTANTS = require('../config/storage-conf');
let RESPONSE_MSG = require('../config/constants').responseMessages;
let Path = require('path');
let knox = require('knox');
let winston = require('winston');
let fsExtra = require('fs-extra');
const Fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
let AWS = require('aws-sdk');
const sharp = require('sharp');
const sizeOf = require('image-size');
const ffmpeg = require('ffmpeg')
const request = require('request')
let accessKeyId = CONSTANTS.AWS_S3.accessKeyId;
let secretAccessKeyId = CONSTANTS.AWS_S3.secretAccessKey;
let bucketName = CONSTANTS.AWS_S3.bucket;
let region = CONSTANTS.AWS_S3.region;
let bucketFolder = CONSTANTS.AWS_S3.folder;

AWS.config.update({accessKeyId: accessKeyId, secretAccessKey: secretAccessKeyId});


let s3 = new AWS.S3();


async function s3PutObject(folder, fileName, data, mimeType) {
    console.log("======mimeType=============", mimeType)

    let params = {
        Bucket: bucketName,
        Key: folder + '/' + fileName,
        Body: data,
        ACL: 'public-read',
        ContentType: mimeType
    };
    await s3.putObject(params).promise();

    return {}
}

/*
 Save File on the disk
 */


let uploadFile = async (fileBuffer, originalPicFolder, thumbnailPicFolder,
                        processedPicFolder, thumbnailMedPicFolder, fileName,
                        mimeType, fileExtension, videoOriginalFolder,
                        videoThumbnailFolder, audioOriginalFolder, documentFolder, videoThumbName) => {
    console.log("In Upload File", mimeType.split("/")[0]);

    try {
        let promises = [];
        if (mimeType.split("/")[0] == "image") {
            promises = [];

            console.log("============inside============", fileBuffer)
            let dimensions = await sizeOf(fileBuffer);
            console.log("dimensions", dimensions)

            let originalImage = await uploadOriginalImage(fileBuffer, originalPicFolder, fileName, mimeType)

            let quality = {quality: 50};
            let buffer = await uploadProcessedImage(fileBuffer, processedPicFolder, fileName, mimeType, fileExtension, quality);

            console.log("bufferbufferbufferbuffer", buffer)

            dimensions.width = 300;
            console.log("dimensionsdimensions", dimensions)

            promises.push(uploadThumbnailImage(buffer, thumbnailPicFolder, fileName, mimeType, dimensions, 1, quality, fileExtension));

            dimensions.width = 800;
            promises.push(uploadThumbnailImage(buffer, thumbnailMedPicFolder, fileName, mimeType, dimensions, 1, quality, fileExtension));
        } else if (mimeType.split("/")[1] == "pdf" || mimeType.split("/")[1] == "doc" || mimeType.split("/")[1] == "docx" || mimeType.split("/")[1] == "xls" || mimeType.split("/")[1] == "csv") {
            promises = [];

            console.log("============inside============")
            // let dimensions = await sizeOf(fileBuffer);
            promises.push(uploadFileOnS3BucketAfterRead('', fileName, {}, mimeType, fileBuffer,));
        } else {
            if (mimeType.split("/")[0] == "video") {
                let thumbnailName = videoThumbName;
                console.log("thumbName", thumbnailName)
                promises = [
                    uploadOriginalImage(fileBuffer, videoOriginalFolder, fileName, mimeType, fileExtension),
                    uploadThumbnailVideo(fileBuffer, videoThumbnailFolder, fileName, mimeType, fileExtension, thumbnailName)
                ];
            } else if (mimeType.split("/")[0] == "audio") {
                promises = [uploadOriginalImage(fileBuffer, audioOriginalFolder, fileName, mimeType, fileExtension)]
            } else {
                throw RESPONSE_MSG.STATUS_MSG.ERROR.INVALID_FILE_TYPE
            }
        }
        let [thumbnailPic, thumbnailPicMed, processedPic] = await Promise.all(promises);

        return {};

    } catch (err) {
        console.log("===================err===========", err)
        return err;
    }
};

async function uploadProcessedImage(fileBuffer, thumbnailPicFolder, fileName, mimeType, fileExtension, quality) {
    console.log('fileExtension', fileExtension, fileBuffer)
    try {
        let s3bucket = new AWS.S3();
        let data;
        if (fileExtension == "png") {
            data = await sharp(fileBuffer)
                // .max()
                .toFormat('png', quality)
                .toBuffer();
        } else {
            console.log('fileBuffer', fileBuffer)
            data = await sharp(fileBuffer)
                // .max()
                .toFormat('jpg', quality)
                .toBuffer();
        }
        await s3PutObject(thumbnailPicFolder, fileName, data, mimeType)
        return data
    } catch (err) {
        console.log(" upload file errore sfjksdkjk;fsdjf 8888888 ")
        winston.error("err-->>", err);
    }
}

async function uploadThumbnailImage(fileBuffer, thumbnailPicFolder, fileName, mimeType, dimensions
    , compressLevelRatio, quality, fileExtension, folder) {
    try {
        let data;
        if (fileExtension == "png") {
            let imgSize;
            data = await sharp(fileBuffer)
                .resize(dimensions.width)
                // .min()
                .toFormat('png', quality)
                .toBuffer();
        } else {

            console.log("===============inside==============", fileBuffer)
            data = await sharp(fileBuffer)
                .resize(dimensions.width)
                // .min()
                .toFormat('jpeg', quality)
                .toBuffer();
        }
        await s3PutObject(thumbnailPicFolder, fileName, data, mimeType)

    } catch (err) {
        winston.error("err-->>", err);
    }
    // return {};


}

const uploadFileOnS3BucketAfterRead = async (filePath, fileName, reportData, mimeType1, buffer, folder) => {
    try {
        let fileBuffer
        if (buffer) fileBuffer = buffer
        else fileBuffer = await readdirAsync(filePath);
        console.log("fileBuffer", fileBuffer);
        let s3bucket = new AWS.S3();
        let mimeType = "application/pdf";
        if (mimeType1) {
            mimeType = mimeType1;
            // console.log("========mimeType1=================",mimeType)
        }
        let uploadPath = folder + "/" + fileName;

        let params = {
            Bucket: bucketName,
            Key: uploadPath,
            Body: fileBuffer,
            ACL: 'public-read',
            ContentType: mimeType
        };
        await s3bucket.putObject(params).promise();
        return '';
    } catch (err) {
        winston.error("err-->>", err);
    }
}

async function uploadMultipart(fileBuffer, folder, fileName, mimeType, fileSize) {
    console.log("===============mimeType", mimeType)

    let s3bucket = new AWS.S3(),
        paramsData = [];

    try {
        let createMultipart = await s3bucket.createMultipartUpload({
            Bucket: bucketName,
            Key: folder + '/' + fileName,
            ACL: 'public-read',
            ContentType: mimeType
        }).promise();

        let partSize = 5242880,
            parts = Math.ceil(fileSize / partSize);

        for (let partNum = 0; partNum < parts; partNum++) {            // chain four more times

            let rangeStart = partNum * partSize,
                end = Math.min(rangeStart + partSize, fileSize);

            let updatedBuffer = fileBuffer.slice(rangeStart, end);

            winston.info("uploading......", fileName, " % ", (partNum / parts).toFixed(2));

            paramsData.push({
                Body: updatedBuffer,
                Bucket: bucketName,
                Key: folder + '/' + fileName,
                PartNumber: partNum + 1,
                UploadId: createMultipart.UploadId
            });
        }
        // console.log("================paramsData=============",paramsData)

        let etagData = paramsData.map(async params => {
            // return s3bucket.uploadPart(params).promise()
            let temp = await s3bucket.uploadPart(params).promise()
            return {ETag: temp.ETag, PartNumber: params.PartNumber}

        });
        console.log("============etagData===============", etagData)

        let dataPacks = await Promise.all(etagData);
        console.log("============etagData===============", dataPacks)

        return s3bucket.completeMultipartUpload({
            Bucket: bucketName,
            Key: folder + '/' + fileName,
            MultipartUpload: {
                Parts: dataPacks
            },
            UploadId: createMultipart.UploadId
        }).promise();
    } catch (err) {
        return err;
    }
}


async function uploadOriginalImage(fileBuffer, originalPicFolder, fileName, mimeType, videoOriginalFolder, videoThumbnailFolder) {
    if (fileBuffer.length > 5242880) {

        console.log("======mimeType=============", mimeType)
        return await uploadMultipart(fileBuffer, originalPicFolder, fileName, mimeType, fileBuffer.length);

        // return {};
    } else {
        await s3PutObject(originalPicFolder, fileName, fileBuffer, mimeType)
        return {};
    }
}

async function uploadThumbnailVideo(fileBuffer, originalPicFolder, fileName, mimeType, fileExtension, thumbnailName) {
    console.log("thumbNamethumbNamethumbNamethumbName", thumbnailName)

    try {
        console.log(" uploadThumbnailVideo ");
        let newPath = Path.join(__dirname, '../', '/uploads/', fileName);
        console.log(newPath, " newPath ");
        let fileUpload = await writedirAsync(newPath, fileBuffer);
        let thumbName = thumbnailName;
        console.log(" fileUpload ", thumbName);
        let thumbnailPicFolder = Path.join(__dirname, '../', '/uploads/');
        console.log("thumbnailPicFolderthumbnailPicFolderthumbnailPicFolder", thumbnailPicFolder)

        var process = new ffmpeg(newPath);
        process.then(async function (video) {
            // Callback mode
            video.fnExtractFrameToJPG(thumbnailPicFolder, {
                number: 1,
                file_name: thumbName + ".jpg"
            }, async function (error, file) {
                if (!error) {
                    console.log('New video file: ' + file);
                    console.log("thumbnailPicFolder", thumbnailPicFolder)
                    let bufferData = await readdirAsync(thumbnailPicFolder + thumbName + '_1.jpg');
                    console.log(bufferData, " bufferData ");
                    await uploadOriginalImage(bufferData, originalPicFolder, thumbName + ".jpg", 'image/jpg');
                    // await deleteFile(thumbnailPicFolder +thumbName+'_1.jpg');
                    // await deleteFile(newPath);
                    console.log(originalPicFolder, thumbName, "originalPicFolder - thumbnailFolder");
                } else {
                    throw error;
                }
            });
        }, function (err) {
            console.log('Error: ' + err);
            throw err;
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
        throw e;
    }
}


const writedirAsync = (path, data) => {
    return new Promise(function (resolve, reject) {
        Fs.writeFile(path, data, function (error) {
            if (error) {
                console.log("===error=========", error)
                reject(error);
            } else {
                console.log("===Successss=========")
                resolve();
            }
        });
    });
}

function readdirAsync(path, data) {
    return new Promise(function (resolve, reject) {
        Fs.readFile(path, (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
}


//
// let _basePath = 'file://' + path.resolve('./public/pdfImages') + '/';
// const pdf = require('html-pdf');
//
// let fun = async ()=>{
//     let html=`<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="x-apple-disable-message-reformatting"><link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" ><title> MiGran</title><style>html,body{margin:0 auto !important;letter-spacing:0.5px;padding:0 !important;height:100% !important;width:100% !important;font-family:'Montserrat',sans-serif}*{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}div[style*="margin: 16px 0"]{margin:0 !important}table,td{mso-table-lspace:0pt !important;mso-table-rspace:0pt !important}table{border-spacing:0 !important;border-collapse:collapse !important;margin:0 auto !important}table table table{table-layout:auto}img{-ms-interpolation-mode:bicubic}[x-apple-data-detectors], .x-gmail-data-detectors, .x-gmail-data-detectors *,.aBn{border-bottom:0 !important;cursor:default !important;color:inherit !important;text-decoration:none !important;font-size:inherit !important;font-family:inherit !important;font-weight:inherit !important;line-height:inherit !important}.a6S{display:none !important;opacity:0.01 !important}img.g-img div{display:none !important}.button-link{text-decoration:none !important}@media only screen and (min-device-width: 375px) and (max-device-width: 413px){/ iPhone 6 and 6 / .email-container{min-width:375px !important}}</style><style>.button-td,.button-a{transition:all 100ms ease-in}/ Media Queries / @media screen and (max-width: 600px){/ What it does: Adjust typography on small screens to improve readability */.email-container p{font-size:17px !important;line-height:22px !important}.email-container{padding:10px 10px !important}}</style></head><body width="100%" style="margin: 0;"><center style="width: 100%; background: #EDF2F7; text-align: left;"><div style="max-width: 600px; margin: auto; padding: 10px 20px; background: #fff;" class="email-container"><table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;"><tbody><tr><td bgcolor="#ffffff"><table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"><tbody><tr><td style="font-size: 17px; line-height: 20px; color: #555555;text-align: center;padding-bottom: 0px;"><div style=""> <img src="logo_header.png"class="g-img"></div><hr style="height: 12px;border: none;background-color: #f6860b;margin-top: 20px;"><table style="text-align: center;width:100%;color: #888;font-size: 16px;font-weight: 500;"><tr><td>Alimentos</td><td>Productos</td><td>Pet Partner</td><td>Nosotros</td><td>Blog</td></tr></table><div style="width: 500px;max-width: 100%;margin: 40px auto;"> <i style="background-color: #e36c08;color: #fff;font-size: 24px;width: 70px;height: 70px;border-radius: 50%;line-height: 70px;margin-bottom: 20px;" class="fa fa-check" aria-hidden="true"></i><p style="font-size: 20px;color: #555;font-weight: 600;">Tu pedido a confirmado</p><p style="font-size: 20px;color: #555;">Numero de Pedido: <strong>012345</strong></p><p style="margin-bottom: 30px;font-size: 20px;color: #555;line-height: 30px;">Puedes seguir el estatus de tu pedidi desde tu perfil de usuario</p> <a style="background-color: #f3860b;color: #fff;text-decoration: none;padding: 10px 20px; border-radius: 40px;" href="">Rastrear Pedido</a><h6 style="font-size:18px;color: #555;line-height: 23px;margin-top:50px;margin-bottom:50px;font-weight: 100;">iGracias por comprar en MiGranMacota.com, Carlos! Tu perdido sera entregado de 24 a 48Hras.</h6></div><hr style="height: 4px;border: none;background-color: #3e424847;margin-top: 20px;"><div style="color: #666; font-size: 16px;padding-top:10px; padding-bottom:40px;font-weight: 600;">Resumen del Pedido</div><table style="width:500px;margin: 0 auto;max-width: 100%;color: #666;font-size: 14px;line-height: 20px;"><tbody><tr><td style="text-align: left;"><p>Detalles del Envio<br> Mario Enriwuez<br> 2100 Av. Acuerdo 2100 2B<br> Zapopan, 45110, JAL, Mexico</p></td><td style="text-align: left;"><p>Resumen del Pedido<br> Productos $4,398,00<br> Gastos de envio $0.00<br></p><p> Tota; $4,398.00<br> (impuestos incluidos)</p></td></tr></tbody></table><div style="color: #666; font-size: 16px; font-weight: 600; padding-top:10px; padding-bottom:40px;">Tu Pedido</div><table style="color: #666;font-size: 14px;line-height: 20px;width:100%;"><tbody><tr style="background: #efefef;"><td style="text-align: left; padding: 0px 20px;"><p>Iron Dog Razas Pequenas <br> Presentacion:8KG<br> $299</p></td><td style="text-align:center;"> <img style="width: 100px;" src="product.jpg"></td></tr></tbody></table><table style="color: #666;font-size: 14px;line-height: 20px;width:100%;margin-top: 50px;"><tbody><tr style="background: #efefef;"><td style="text-align: left; padding: 0px 20px;"><p>Iron Dog Razas Pequenas <br> Presentacion:8KG<br> $299</p></td><td style="text-align:center;"> <img style="width: 100px;" src="product.jpg"></td></tr></tbody></table><div style="width: 400px;margin: 50px auto;"> <img style="width: 120px;height: 120px;border-radius: 50%;" src="blog01.png"><h3>Spike <br> te lo agracera</h3></div><p style="font-size: 15px;color: #666;">Is tienes mas preguntas, contacta con nosotros ate responderemos lo antes posible</p></tr><tr style="background-color: #e36c08;color: #fff;font-size: 14px;"><td><table style="width: 100%;padding: 10px 20px 60px;color: #fff;"><tbody><tr><td style="padding: 10px 20px 60px;text-align: center;"> <i class="fa fa-whatsapp" aria-hidden="true"></i> 333 333 333</td><td style="padding: 10px 20px 60px;text-align: center;"> <i class="fa fa-phone" aria-hidden="true"></i> 0182 566 55565</td><td style="padding: 10px 20px 60px;text-align: center;"> <i class="fa fa-envelope" aria-hidden="true"></i> hola@migranmascota.com</td></tr></tbody></table></td></tr><tr><td><table style="width: 500px;padding: 10px 20px 60px;float: right;"><tbody><tr><td style="text-align: right;"> <a href="" style="color:#777;font-size: 14px;"> <i style="text-align: center;width: 30px;height: 30px;background: #000;color: #fff;border-radius: 50%;line-height: 29px;margin-right: 20px;font-size: 16px;" class="fa fa-facebook" aria-hidden="true"></i> /MiGranMascotaOficia/ </a></td><td style="text-align: right;"> <a href="" style="color:#777;font-size: 14px;"> <i style="text-align: center;width: 30px;height: 30px;background: #000;color: #fff;border-radius: 50%;line-height: 29px;margin-right: 20px;font-size: 16px;"class="fa fa-instagram" aria-hidden="true"></i> /MiGranMascotaOficia/ </a></td></tr></tbody></table></td></tr></tbody></table></div></center></body></html>`
//     let template = Handlebars.compile(html);
//     html = template({});
//     let dataUrl= await PDF(html);
//     console.log(dataUrl)
// }
//
// async function PDF(html) {
//
//     //
//     html=html.replace(/&lt;/g, '<');
//     html=html.replace(/&gt;/g, '>');
//     html=html.replace(/&amp;/g, '&');
//     let fileName=+new Date();
//     console.log(html)
//     let path = "./uploads/" +fileName+ ".pdf";
//     // let path = "./uploads/" +"package.pdf";
//     return new Promise((resolve, reject) => {
//         pdf.create(html,
//             {
//                 "height": "12.5in",        // allowed units: mm, cm, in, px
//                 "width": "15in",
//                 "border": {
//                     "top": "0.5in",            // default is 0, units: mm, cm, in, px
//                     "right": "0.5in",
//                     "bottom": "0.5in",
//                     "left": "0.5in"
//                 },
//                 type: 'pdf',
//                 base:_basePath
//                 // "renderDelay": 10000,
//                 // "phantomPath": "./node_modules/phantomjs/bin/phantomjs"
//             }
//         ).toFile(path,async function (err, stream) {
//             // console.log("987789879789798", err, stream);
//             if (err) reject(err);
//             else{
//
//             }
//         });
//     })
//
// }


let getBuffer = async function (fileName) {
    return new Promise(function (resolve, reject) {
        request({
            method: 'GET',
            url: fileName,
            encoding: null,
            headers: {
                'content-type': 'image/jpeg',
            }
        }, (error, response, body) => {
            if (error) reject(error)
            else {
                resolve(Buffer.from(body).toString('base64'))
            }
        })
    })
}

module.exports = {
    uploadFile: uploadFile,
    getBuffer: getBuffer

};
