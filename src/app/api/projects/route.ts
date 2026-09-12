import { NextResponse } from 'next/server';
import { getAllProjects } from '@db/projects';
 
// Run on every request rather than being cached during development. 
// So the log below is not emitted once at build time and then skipped.
// export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ data: projects }, { status: 200 });
  }
  catch (error) {
    console.error('GET /api/projects failed: ', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
