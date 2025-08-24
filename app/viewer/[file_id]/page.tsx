"use client"
import React, { useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function ViewerPageClient() {
  const params = useParams() as { file_id?: string }
  const fileId = params?.file_id || ''
  useEffect(() => {
    if (!fileId) return
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js'
    script.onload = async () => {
      try {
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js'
        const url = `/uploaded_pdfs/${fileId}`
        const viewer = document.getElementById('viewer-root') as HTMLDivElement
        if (!viewer) return
        viewer.style.width = '100vw'; viewer.style.height = '100vh'; viewer.style.background = '#777'
        // @ts-ignore
        const pdf = await pdfjsLib.getDocument(url).promise
        const hashPage = (window.location.hash || '').replace('#page=','') || '1'
        const pageNumber = parseInt(hashPage,10) || 1
        const page = await pdf.getPage(pageNumber)
        const viewport = page.getViewport({scale:1.5})
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width; canvas.height = viewport.height; canvas.style.display='block'; canvas.style.margin='0 auto'
        viewer.appendChild(canvas)
        const ctx = canvas.getContext('2d')
        await page.render({canvasContext: ctx, viewport}).promise
        try {
          const res = await fetch(`/anchors/${fileId}`)
          const data = await res.json()
          const anchors = data.anchors || []
          anchors.filter((a: any) => a.page === pageNumber).forEach((a: any) => {
            const bboxNorm = a.bbox_norm
            const x = bboxNorm.x0 * canvas.width
            const y = bboxNorm.y0 * canvas.height
            const w = (bboxNorm.x1 - bboxNorm.x0) * canvas.width
            const h = (bboxNorm.y1 - bboxNorm.y0) * canvas.height
            const el = document.createElement('div')
            el.style.position = 'absolute'; el.style.left = x + 'px'; el.style.top = y + 'px'
            el.style.width = Math.max(10, w) + 'px'; el.style.height = Math.max(8, h) + 'px'
            el.style.border = '2px solid rgba(255,0,0,0.8)'; el.style.background = 'rgba(255,0,0,0.12)'
            viewer.style.position = 'relative'; viewer.appendChild(el)
          })
        } catch(e) { console.error(e) }
      } catch(e) { console.error('viewer error', e) }
    }
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [fileId])

  return (
    <div id="viewer-root" style={{ width: '100vw', height: '100vh' }} />
  )
}
