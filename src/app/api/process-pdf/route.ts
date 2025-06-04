import { NextRequest } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });

  const uploadsDir = path.join(process.cwd(), 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, file.name);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  return new Promise((resolve) => {
    const py = spawn('python', ['Full_process.py', filePath], { cwd: process.cwd() });

    let output = '';
    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { output += data.toString(); });

    py.on('close', (code) => {
      if (code === 0) {
        resolve(new Response(JSON.stringify({ result: output }), { status: 200 }));
      } else {
        resolve(new Response(JSON.stringify({ error: output }), { status: 500 }));
      }
    });
  });
}
