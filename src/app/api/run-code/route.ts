import { NextRequest, NextResponse } from "next/server";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

// Piston language + version mapping
const LANGUAGE_CONFIG: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "cpp", version: "10.2.0" },
  c: { language: "c", version: "10.2.0" },
};

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();
    const config = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.javascript;

    const pistonRes = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ content: code }],
      }),
    });

    const result = await pistonRes.json();

    const output =
      result.run?.stdout ||
      result.run?.stderr ||
      result.compile?.stderr ||
      "No output";

    return NextResponse.json({
      output,
      status: result.run?.code === 0 ? "Success" : "Error",
    });
  } catch (error) {
    console.error("Piston error:", error);
    return NextResponse.json({ error: "Code execution failed" }, { status: 500 });
  }
}