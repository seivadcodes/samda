import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // You might need to install uuid: npm install uuid

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Generate a unique name to avoid overwrites
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const uniqueName = `${uuidv4()}-${file.name}`;
    
    // Define the path to the public/images directory
    // Note: In production/vercel, this path might not be writable depending on the platform.
    // This works best on local development or VPS.
    const publicDir = path.join(process.cwd(), 'public', 'images');
    const filePath = path.join(publicDir, uniqueName);

    // Ensure the directory exists
    const { mkdir } = require('fs/promises');
    try {
        await mkdir(publicDir, { recursive: true });
    } catch (e) {
        // Directory likely already exists
    }

    // Write the file
    await writeFile(filePath, buffer);

    // Return the public URL path
    return NextResponse.json({ 
      success: true, 
      path: `/images/${uniqueName}` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}