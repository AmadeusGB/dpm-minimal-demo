import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user = searchParams.get('user')

    if (!user) {
      return NextResponse.json({ error: 'User parameter is required' }, { status: 400 })
    }

    const username = user.split('@')[0]
    const sentPath = path.join(process.cwd(), 'data', `sent_${username}.json`)

    if (!fs.existsSync(sentPath)) {
      return NextResponse.json([])
    }

    const sent = JSON.parse(fs.readFileSync(sentPath, 'utf-8'))
    return NextResponse.json(sent)
  } catch (error) {
    console.error('Error fetching sent emails:', error)
    return NextResponse.json({ error: 'Failed to fetch sent emails' }, { status: 500 })
  }
} 