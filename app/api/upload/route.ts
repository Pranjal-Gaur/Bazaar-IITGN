import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    if (files.length > 5) return NextResponse.json({ error: 'Max 5 images allowed' }, { status: 400 });

    const results = await Promise.all(
      files.map(async (file) => {
        if (file.size > 10 * 1024 * 1024) throw new Error('File too large (max 10MB)');
        const buffer = Buffer.from(await file.arrayBuffer());
        return uploadImage(buffer);
      })
    );

    return NextResponse.json({ urls: results.map((r) => r.url) });
  } catch (err) {
    console.error('Upload error:', err);
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
