import { describe, expect, it } from 'vitest'

import {
  DEFAULT_POST_COVER_IMAGES,
  pickDefaultPostCoverPath,
  resolveDefaultSiteCoverImage,
  resolvePostCoverImage,
} from '@/lib/default-cover-images'

describe('default cover images', () => {
  it('picks a stable default cover for the same seed', () => {
    const first = pickDefaultPostCoverPath({ slug: 'stable-seed', title: 'Same title' })
    const second = pickDefaultPostCoverPath({ slug: 'stable-seed', title: 'Same title' })

    expect(first).toBe(second)
    expect(DEFAULT_POST_COVER_IMAGES).toContain(first)
  })

  it('falls back to a bundled default cover when no explicit cover is set', () => {
    const cover = resolvePostCoverImage(
      { slug: 'missing-cover', title: 'No cover here' },
      { baseUrl: 'https://yuanle-blog.example.com' },
    )

    expect(cover).toMatch(/^https:\/\/yuanle-blog\.example\.com\/default-covers\/qm-cover-[1-3]\.jpg$/)
  })

  it('prefers the explicit cover image and resolves relative paths', () => {
    expect(resolvePostCoverImage(
      { cover_image: '/api/images/example.png', slug: 'post-slug', title: 'Post title' },
      { baseUrl: 'https://yuanle-blog.example.com' },
    )).toBe('https://yuanle-blog.example.com/api/images/example.png')

    expect(resolvePostCoverImage(
      { cover_image: 'https://cdn.example.com/cover.jpg', slug: 'post-slug', title: 'Post title' },
      { baseUrl: 'https://yuanle-blog.example.com' },
    )).toBe('https://cdn.example.com/cover.jpg')
  })

  it('resolves the site-wide fallback cover image', () => {
    expect(resolveDefaultSiteCoverImage('https://yuanle-blog.example.com'))
      .toBe('https://yuanle-blog.example.com/default-covers/qm-cover-1.jpg')
  })
})
