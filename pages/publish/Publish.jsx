import React, { useState } from 'react';
import style from '../../styles/publish.module.css'

export default function Publish() {
    let [title, setTitle] = useState('')
    let [content, setContent] = useState('')
    let [image, setImage] = useState(null)

    const handleTitleChange = (e) => {
        setTitle(e.target.value)
    }

    const handleContentChange = (e) => {
        setContent(e.target.value)
    }   

    const handleImageChange = (e) => {
        setImage(e.target.files[0])
        console.log(image)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        const body = new FormData()
        body.append('file', image)
        body.append('title', title)
        body.append('content', content)
        //console.log(body)
        const res = await fetch('/api/publish', {
            method: 'POST',
            body
        })
        const data = await res.json()
        console.log(data)

    }

    return (
    <div className='container'>
        <h2>Publish</h2>
        <div className={style.formContainer}>
            <form>
                <label htmlFor="">Title: </label>
                <input type="text" value={title} onChange={handleTitleChange}/>
                <input type="file" onChange={handleImageChange} accept="image/*"/>
                <label htmlFor="">Content</label>
                <textarea name="" value={content} onChange={handleContentChange}/>
                <button onClick={handleSubmit}>Submit</button>
            </form>
        </div>
    </div>
    )
}
