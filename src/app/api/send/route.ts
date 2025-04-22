import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Email } from '@/store/useStore'

export async function POST(request: Request) {
  try {
    const email: Email = await request.json()
    
    // Validate email format
    if (!email.to.endsWith('@deeper.mail')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir)
    }

    // Save to recipient's inbox
    const recipientInboxPath = path.join(dataDir, `inbox_${email.to.split('@')[0]}.json`)
    let recipientInbox: any[] = []
    if (fs.existsSync(recipientInboxPath)) {
      recipientInbox = JSON.parse(fs.readFileSync(recipientInboxPath, 'utf-8'))
    }
    recipientInbox.push(email)
    fs.writeFileSync(recipientInboxPath, JSON.stringify(recipientInbox, null, 2))

    // Save to sender's sent folder
    const senderSentPath = path.join(dataDir, `sent_${email.from.split('@')[0]}.json`)
    let senderSent: any[] = []
    if (fs.existsSync(senderSentPath)) {
      senderSent = JSON.parse(fs.readFileSync(senderSentPath, 'utf-8'))
    }
    senderSent.push(email)
    fs.writeFileSync(senderSentPath, JSON.stringify(senderSent, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
} 