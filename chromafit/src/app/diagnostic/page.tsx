'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(true)
  const [diagnostics, setDiagnostics] = useState<any>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    runDiagnostics()
  }, [])

  const runDiagnostics = async () => {
    const results: any = {}

    try {
      // Check 1: User Authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      results.auth = {
        status: user ? 'success' : 'error',
        message: user ? `Logged in as ${user.email}` : 'Not logged in',
        data: user ? { id: user.id, email: user.email } : null
      }

      if (!user) {
        setDiagnostics(results)
        setLoading(false)
        return
      }

      // Check 2: Profile Exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      results.profile = {
        status: profile ? 'success' : 'error',
        message: profile ? 'Profile exists' : `Profile not found: ${profileError?.message}`,
        data: profile
      }

      // Check 3: Storage Buckets
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets()

      const avatarBucket = buckets?.find(b => b.id === 'avatars')
      results.storage = {
        status: avatarBucket ? 'success' : 'error',
        message: avatarBucket ? 'Avatars bucket exists' : 'Avatars bucket not found',
        data: { avatarBucket, allBuckets: buckets?.map(b => b.id) }
      }

      // Check 4: Can Insert Profile (Test RLS)
      const { error: insertTestError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: user.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      results.rls_insert = {
        status: !insertTestError ? 'success' : 'error',
        message: !insertTestError ? 'Can insert/update profile' : `RLS Error: ${insertTestError?.message}`,
        data: insertTestError
      }

      // Check 5: Can Upload to Storage (Test)
      const testFile = new Blob(['test'], { type: 'text/plain' })
      const testPath = `${user.id}/diagnostic-test.txt`
      
      const { error: uploadTestError } = await supabase
        .storage
        .from('avatars')
        .upload(testPath, testFile, { upsert: true })

      results.storage_upload = {
        status: !uploadTestError ? 'success' : 'error',
        message: !uploadTestError ? 'Can upload to storage' : `Upload Error: ${uploadTestError?.message}`,
        data: uploadTestError
      }

      // Clean up test file
      if (!uploadTestError) {
        await supabase.storage.from('avatars').remove([testPath])
      }

    } catch (err: any) {
      results.general_error = {
        status: 'error',
        message: err.message,
        data: err
      }
    }

    setDiagnostics(results)
    setLoading(false)
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'error': return <XCircle className="h-6 w-6 text-red-600" />
      default: return <AlertCircle className="h-6 w-6 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-yellow-50 border-yellow-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">System Diagnostics</h1>
              <p className="text-sm text-gray-600">Check ChromaFit setup status</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(diagnostics).map(([key, value]: [string, any]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${getStatusColor(value.status)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(value.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">{value.message}</p>
                    {value.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(value.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button onClick={runDiagnostics} variant="outline">
            Run Again
          </Button>
          <Link href="/profile">
            <Button>
              Go to Profile
            </Button>
          </Link>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Fix Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900">❌ If you see errors:</h4>
              <ol className="list-decimal list-inside space-y-2 mt-2 text-gray-700">
                <li>Go to your Supabase Dashboard</li>
                <li>Open SQL Editor</li>
                <li>Run the file: <code className="bg-gray-100 px-2 py-1 rounded">supabase/complete-setup.sql</code></li>
                <li>Come back here and click "Run Again"</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">✅ If all green:</h4>
              <p className="text-gray-700 mt-2">
                Your system is properly configured! You can upload photos in the profile page.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
