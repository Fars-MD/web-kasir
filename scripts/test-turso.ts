import { createClient } from '@libsql/client'

const client = createClient({
  url: 'https://toko-zhafar-zhafar.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJncm91cF91dWlkIjoiNDIxNGZmOWQtYjgyNi00MmU0LTkyNWEtZjNkYTQ3NGExMTNjIiwianRpIjoiVVJpWjVuUXBFZkc4ek02bmNtTVlDQSIsIm9yZ19pZCI6MTAwMDE5MTYyNSwic2NvcGVzIjp7InNjb3BlcyI6WyJkYjpjb25maWd1cmUiLCJkYjpjcmVhdGUiLCJkYjpkZWxldGUiLCJkYjptaW50LXRva2VuIiwiZGI6cm90YXRlLWNyZWRzIiwiZ3JvdXA6Y29uZmlndXJlIiwiZ3JvdXA6bWludC10b2tlbiIsImdyb3VwOnJvdGF0ZS1jcmVkcyIsInJlYWQiXX19.bznncNtvdIN8gMke2mozL0cJ6mHv9cttUV0vjqGMcFv4k0O2do4HgOjjeSVWQ7UoZUoUcdFZ5raFPLDPyPM_Bg',
})

async function main() {
  const r = await client.execute('SELECT 1 as test')
  console.log('Connected!', JSON.stringify(r.rows))
}

main().catch((e: any) => console.error('Error:', e.message))
