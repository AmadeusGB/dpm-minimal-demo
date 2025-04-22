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
    const inboxPath = path.join(process.cwd(), 'data', `inbox_${username}.json`)

    if (!fs.existsSync(inboxPath)) {
      return NextResponse.json([])
    }

    const inbox = JSON.parse(fs.readFileSync(inboxPath, 'utf-8'))
    return NextResponse.json(inbox)
  } catch (error) {
    console.error('Error fetching inbox:', error)
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 })
  }
} 