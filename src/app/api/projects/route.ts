import { NextResponse } from 'next/server'
import { getAllProjects } from '@db/projects'

// NOTE: to run on every request during development:
// export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const projects = await getAllProjects()
    return NextResponse.json({ data: projects }, { status: 200 })
  }
  catch (error) {
    console.error('GET /api/projects failed: ', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
