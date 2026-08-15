import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@db/projects';

// Runs on every request rather than being cached, so the log below is not
// emitted once at build time and then skipped (During development of the API).
// export const dynamic = 'force-dynamic';

export async function GET(
request: NextRequest,
{ params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    console.log("request is: ", request);
    console.log("slug is ", slug);
    console.log(`GET /api/projects/[slug] returned ${project?.UIData?.slug ?? 'nothing'}`);
    
    console.dir(project);

    return NextResponse.json({ data: project }, { status: 200 });
  }
  catch (error) {
    console.error('GET /api/projects/[slug] failed: ', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
