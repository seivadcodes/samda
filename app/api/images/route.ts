import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'images');
    
    // Read all files in the directory
    const files = await readdir(publicDir);
    
    // Filter for image files only
    const images = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ).map(file => ({
      name: file,
      path: `/images/${file}`,
      created_at: new Date().toISOString() // Local files don't have easy metadata without extra fs calls
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array if folder doesn't exist yet
  }
}