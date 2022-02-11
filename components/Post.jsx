import React from 'react';
import Link from 'next/link'

export default function Post({post}) {
  return (
    <div className='card'>
        <img src={post.frontMatter.cover_image} alt="x" />

        <div className="card-content">
          <div className="post-date">Posted on {post.frontMatter.date}</div>
          <h3>{post.frontMatter.title}</h3>

          <p>{post.frontMatter.excerpt}</p>

          <Link href={`/blog/${post.slug}`}>
              <a className="btn">Read More</a>
          </Link>
        </div>
    </div>

  )
}
