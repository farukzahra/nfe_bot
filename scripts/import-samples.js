const http = require('http')
const fs = require('fs')
const path = require('path')

function jsonRequest(opts, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(opts, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }) }
        catch { resolve({ status: res.statusCode, body: d }) }
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

function multipartRequest(token, endpoint, fpath, fname) {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(fpath)
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2)
    const CRLF = '\r\n'
    const disp = 'Content-Disposition: form-data; name="file"; filename="' + fname + '"'
    const header = Buffer.from(
      '--' + boundary + CRLF + disp + CRLF + 'Content-Type: application/octet-stream' + CRLF + CRLF
    )
    const footer = Buffer.from(CRLF + '--' + boundary + '--' + CRLF)
    const body = Buffer.concat([header, fileContent, footer])

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': body.length
      }
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }) }
        catch { resolve({ status: res.statusCode, body: d }) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  let res = await jsonRequest({
    hostname: 'localhost', port: 3000, path: '/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'farukz@gmail.com', password: 'kuraf007' }))

  if (res.status !== 200) {
    res = await jsonRequest({
      hostname: 'localhost', port: 3000, path: '/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email: 'farukz@gmail.com', password: 'kuraf007' }))
    console.log('Conta criada:', res.body.user?.email)
  } else {
    console.log('Login OK:', res.body.user?.email)
  }

  const token = res.body.token
  if (!token) { console.error('Sem token! Status:', res.status, JSON.stringify(res.body)); return }

  const files = ['1.xml','2.xml','3.xml','4.xml','5.xml','6.xml','7.xml','8.xml','lote.zip']

  for (const fname of files) {
    const fpath = path.join(__dirname, '..', 'nfe_examples', fname)
    const endpoint = fname.endsWith('.zip') ? '/import/zip' : '/import/xml'
    const r = await multipartRequest(token, endpoint, fpath, fname)
    const b = r.body
    const ok = (typeof b === 'object' && b !== null) ? b.successCount : '?'
    const err = (typeof b === 'object' && b !== null) ? b.errorCount : '?'
    console.log(fname + ' [HTTP ' + r.status + '] ok=' + ok + ' err=' + err)
    if (typeof b === 'object' && b !== null && b.errorCount > 0) {
      b.results?.filter(x => !x.success).forEach(x => {
        console.log('  ERRO:', x.fileName, '->', String(x.error).slice(0, 80))
      })
    }
  }
}

main().catch(console.error)
