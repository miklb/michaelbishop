import { micropub } from '../config.js'

/**
 * Quill sends the access token in both the Authorization header and the POST
 * body. RFC 6750 §3.1 says clients MUST NOT use more than one method, and
 * @benjifs/micropub enforces this strictly. Strip the body token when the
 * header is already present so the request passes validation.
 */
async function stripDuplicateToken(request) {
	if (request.method !== 'POST') return request
	const hasBearer = request.headers.get('authorization')?.startsWith('Bearer ')
	const contentType = request.headers.get('content-type') || ''
	if (!hasBearer || !contentType.includes('application/x-www-form-urlencoded')) return request

	const body = await request.text()
	const params = new URLSearchParams(body)
	if (!params.has('access_token')) return new Request(request.url, {
		method: request.method,
		headers: request.headers,
		body,
	})
	params.delete('access_token')
	return new Request(request.url, {
		method: request.method,
		headers: request.headers,
		body: params.toString(),
	})
}

export default async (request) => micropub.micropubHandler(await stripDuplicateToken(request))
