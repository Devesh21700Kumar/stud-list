/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { Category } from '@/types';

export async function GET(
  request: Request,
  { params }: any
) {
  const listType = params?.type;

  // MODIFICATION: Add 'women' to the list of valid types
  if (listType !== 'general' && listType !== 'men' && listType !== 'women') {
    return NextResponse.json(
      { error: 'Invalid checklist type requested' },
      { status: 400 }
    );
  }

  try {
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(
      path.join(jsonDirectory, `studentChecklist_${listType}.json`),
      'utf8'
    );
    const data: Category[] = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to load checklist data' },
      { status: 500 }
    );
  }
}