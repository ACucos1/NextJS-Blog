import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

export const config = {
    api: {
        bodyParser: false,
    },
 }

export default function handler(req, res) {

    if(req.method !== 'POST'){
        res.status(400).send({msg: 'Only POST requests allowed'})
    }
    // const body = JSON.parse(req.body)
    const form = new formidable.IncomingForm()
    form.parse(req, async function(err, fields, files) {
        console.log(fields);
        await saveFile(files.file)
        await publishPost(fields, files.file)
        res.status(201).send({msg: 'File uploaded successfuly'})
    })

    const saveFile = async (file) => {
        //console.log(file)
        const data = fs.readFileSync(file.filepath)
        fs.writeFileSync(`./public/images/posts/${file.originalFilename}`, data)
        await fs.unlinkSync(file.filepath)
        return
    }
    // res.status(200).send({msg: "End of API Call"})
    const publishPost = async ({title, content}, image) => {
        try {
            let date = new Date()
            console.log(image);
            if(title && content){
                //console.log(body)
                let formattedContent = 
                `---
title: '${title}'
date: '${date.toLocaleString('default', {month: 'long'})} ${date.getDate()}, ${date.getFullYear()}'
excerpt: '${content.slice(0, 45)}'
cover_image: '/images/posts/${image.originalFilename}'
---
${content} `
    
                fs.writeFile(path.join(`./posts/${title}.md`), formattedContent, (err) => {
                    if(err) console.log(err)
                    console.log('File saved!')
                })
    
                // res.status(200).json({msg: "Succ"})
            }  
            else {
                res.status(400).send({msg: 'Missing Title or Content'})
            }
        } catch (err) {
            console.log(err)
        } 
    }

    
}