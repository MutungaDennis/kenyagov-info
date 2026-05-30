import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const parsePdf = require('pdf-parse-fork');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No document file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    const parsedPdf = await parsePdf(fileBuffer);
    const fullText: string = parsedPdf?.text || '';
    
    if (typeof fullText !== 'string' || !fullText.trim()) {
      return NextResponse.json({ error: 'Extracted PDF text layer is empty or type distorted.' }, { status: 422 });
    }

    const cleanText = fullText.replace(/\r\n/g, '\n');

    /**
     * IEBC Hybrid Regular Expression Engine:
     * Handles both fused text rows and standard spaced text layouts safely.
     * 1. (\d{3})\s* -> County Code
     * 2. (.+?)\s*(?=\d{3}\s+[A-Z]|\d{3}[A-Z]) -> County Name (stops at constituency code)
     * 3. (\d{3})\s* -> Const Code
     * 4. (.+?)\s*(?=\d{4}\s+[A-Z]|\d{4}[A-Z]) -> Const Name (stops at ward code)
     * 5. (\d{4})\s* -> CAW (Ward) Code
     * 6. (.+?)\s*(?=\d{3}\s+[A-Z]|\d{3}[A-Z]) -> Ward Name (stops at reg centre code)
     * 7. (\d{3})\s* -> Reg Centre Code
     * 8. (.+?)\s*(?=\d{15}) -> Reg Centre Name (stops at 15-digit polling station code)
     * 9. (\d{15})\s* -> Polling Station Code
     * 10. (.+?)\s* -> Polling Station Name
     * 11. (\d+)\s*$ -> Registered Voter Count
     */
    const lineRegex = /(\d{3})\s*(.+?)\s*(?=\d{3}\s+[A-Z]|\d{3}[A-Z])(\d{3})\s*(.+?)\s*(?=\d{4}\s+[A-Z]|\d{4}[A-Z])(\d{4})\s*(.+?)\s*(?=\d{3}\s+[A-Z]|\d{3}[A-Z])(\d{3})\s*(.+?)\s*(?=\d{15})(\d{15})\s*(.+?)\s*(\d+)\s*$/gm;
    
    const records = [];
    const contentLines = cleanText.split('\n');

    for (const line of contentLines) {
      const cleanLine = line.trim();

      // Skip IEBC page headers, title labels, or empty strings completely
      if (
        !cleanLine ||
        cleanLine.includes('REGISTERED VOTERS') ||
        cleanLine.includes('GENERAL ELECTION') ||
        cleanLine.includes('County Name') ||
        cleanLine.includes('Const Code') ||
        cleanLine.includes('Polling Station Name')
      ) {
        continue;
      }

      // Reset internal tracking pointer index state for independent row evaluation
      lineRegex.lastIndex = 0;
      const match = lineRegex.exec(cleanLine);

      if (match) {
        let [
          _, 
          county_code, county_name, 
          const_code, const_name, 
          caw_code, caw_name, 
          reg_centre_code, reg_centre_name, 
          polling_station_code, name, 
          registered_voters
        ] = match;

        records.push({
          county_name: county_name.trim(),
          const_name: const_name.trim(),
          ward_name: caw_name.trim(),
          reg_centre_code: reg_centre_code.trim(),
          reg_centre_name: reg_centre_name.trim().replace(/\.+$/, ''),
          polling_station_code: polling_station_code.trim(),
          name: name.trim().replace(/\.+$/, ''),
          registered_voters_2022: parseInt(registered_voters.trim(), 10)
        });
      }
    }

    if (records.length === 0) {
      return NextResponse.json({ error: 'Zero data rows matched the parsed layout parameters.' }, { status: 422 });
    }

    // Process chunk insertion (2,000 entities per micro-batch)
    const chunkSize = 2000;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      const { error } = await supabase.rpc('bulk_insert_polling_stations', {
        station_data: chunk
      });
      
      if (error) {
        return NextResponse.json({ 
          error: `Database write failed at batch offset index ${i}`, 
          details: error.message 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, totalParsedRecords: records.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
