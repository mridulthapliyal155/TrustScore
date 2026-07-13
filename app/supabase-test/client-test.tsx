'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ClientTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [details, setDetails] = useState<string>('')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        // Querying a dummy table to test connection.
        // PostgREST will respond, verifying API key & endpoint.
        const { error } = await supabase.from('connection_test').select('*').limit(1)
        
        // If the error code is 42P01/PGRST205 (relation/table does not exist) or PGRST116 (0 rows returned),
        // it means the REST endpoint is reached and the credentials are valid.
        if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== 'PGRST205') {
          setStatus('error')
          setDetails(`API returned error code: ${error.code} - ${error.message}`)
        } else {
          setStatus('success')
          setDetails('Successfully reached the Supabase API from the browser! (REST endpoint active, credentials verified)')
        }
      } catch (err: any) {
        setStatus('error')
        setDetails(err.message || 'Unknown network error')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-4 border rounded-xl bg-neutral-905 border-neutral-800">
      <h2 className="text-lg font-semibold mb-2 text-neutral-200">Browser Client Connection</h2>
      {status === 'loading' && <p className="text-neutral-400">Testing browser connection...</p>}
      {status === 'success' && (
        <div className="text-emerald-400">
          <p className="font-medium">✓ Connected</p>
          <p className="text-sm text-neutral-400 mt-1">{details}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-rose-400">
          <p className="font-medium">✗ Connection Failed</p>
          <p className="text-sm text-neutral-400 mt-1">{details}</p>
        </div>
      )}
    </div>
  )
}
