import { createClient } from '@/lib/supabase/server'
import ClientTest from './client-test'

export const dynamic = 'force-dynamic'

export default async function SupabaseTestPage() {
  let serverStatus: 'success' | 'error' = 'success'
  let serverDetails = ''

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('connection_test').select('*').limit(1)

    // 42P01 and PGRST205 mean the table does not exist, which indicates the REST endpoint is reached and credentials are valid.
    if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== 'PGRST205') {
      serverStatus = 'error'
      serverDetails = `API returned error code: ${error.code} - ${error.message}`
    } else {
      serverStatus = 'success'
      serverDetails = 'Successfully reached the Supabase API from the server! (REST endpoint active, credentials verified)'
    }
  } catch (err: any) {
    serverStatus = 'error'
    serverDetails = err.message || 'Unknown server-side error'
  }

  return (
    <main className="min-h-screen bg-black text-white p-8 font-sans flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Supabase Connection Test</h1>
          <p className="text-neutral-400 text-sm">Temporary verification page for project persistence</p>
        </div>

        <div className="space-y-4">
          {/* Server Connection Result */}
          <div className="p-4 border rounded-xl bg-neutral-905 border-neutral-800">
            <h2 className="text-lg font-semibold mb-2 text-neutral-200">Server Client Connection</h2>
            {serverStatus === 'success' ? (
              <div className="text-emerald-400">
                <p className="font-medium">✓ Connected</p>
                <p className="text-sm text-neutral-400 mt-1">{serverDetails}</p>
              </div>
            ) : (
              <div className="text-rose-400">
                <p className="font-medium">✗ Connection Failed</p>
                <p className="text-sm text-neutral-400 mt-1">{serverDetails}</p>
              </div>
            )}
          </div>

          {/* Browser Connection Result */}
          <ClientTest />
        </div>

        <div className="text-xs text-center text-neutral-500 pt-4">
          Once confirmed, delete the <code className="bg-neutral-900 px-1 py-0.5 rounded">app/supabase-test</code> directory.
        </div>
      </div>
    </main>
  )
}
