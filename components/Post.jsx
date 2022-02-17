import React from 'react';
import Link from 'next/link'

export default function Post({post}) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <div className='card'>
          <img src={post.frontMatter.cover_image} alt="x" />
          <div className="card-content">
            <h2>{post.frontMatter.title}</h2>
            <div className="post-date">Posted on {post.frontMatter.date}</div>
            <p>{post.frontMatter.excerpt}</p>            
          </div>
      </div>
    </Link>

  )
}
