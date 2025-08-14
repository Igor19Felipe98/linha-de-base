'use client';

export function EnvDebug() {
  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono">
      <h3 className="font-bold mb-2">Environment Variables Debug</h3>
      <div>
        <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'UNDEFINED'}
      </div>
      <div>
        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'UNDEFINED'}
      </div>
    </div>
  );
}