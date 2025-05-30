/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
// Types
import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Setup for temporary file storage
 */
// Determine if we're deploying to Vercel, this affects the temporary directory
const IS_VERCEL_DEPLOY = typeof process.env.VERCEL_ENV === 'string'
// Determine the temporary directory to use, based on Vercel deploy or not
const TMP_DIR = IS_VERCEL_DEPLOY ? '/tmp' : path.join(process.cwd(), '.tmp')
// Ensure the temporary directory exists, so we can stash files
if (!fs.existsSync(TMP_DIR)) {
	fs.mkdirSync(TMP_DIR)
}
// Set the maximum age for a file in the temporary directory
const MAX_FILE_AGE_HOURS = 1
const MAX_FILE_AGE_MS = 1000 * 60 * 60 * MAX_FILE_AGE_HOURS

/**
 * This API route is meant to be used in conjunction with the OpenAPI preview
 * page, which allows authors to preview OpenAPI specs in a multi-page format.
 *
 * The preview page is _not_ deployed in production, and is meant to be
 * accessed from: https://develop.hashicorp.services/open-api-docs-preview-v2
 *
 * This API route:
 *
 * - Handles `POST` requests with preview data. Preview data is generally some
 *   OpenAPI spec JSON, plus additional configuration - everything needed to
 *   build a multi-page preview of the OpenAPI documentation. We save this
 *   preview data to a temporary file with a unique ID. We return the unique
 *   ID, so that it can be used in subsequent requests to retrieve the data.
 *
 * - Handles `GET` requests with a unique file ID. These requests allow pages
 *   to retrieve previously stored preview data, even if the end user reloads
 *   the page or navigates to a new URL. This is particularly necessary as we're
 *   trying to render a multi-page preview, with operations on separate URLs.
 */
const reqHandlers = {
	POST: handlePost,
	GET: handleGet,
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const handle = reqHandlers[req.method]
	if (handle) {
		return handle(req, res)
	} else {
		res.setHeader('Allow', Object.keys(reqHandlers))
		res.status(405).json({ error: 'Method not allowed' })
	}
}

/**
 * Handle POST requests
 *
 * This function is responsible for:
 * - Writing the POST'ed data to a temporary file
 * - Returning the unique file ID to the client
 *
 * We try parsing the POST'ed data, then writing out the file to a tmp dir.
 * If successful, we respond with a newly generated unique file ID.
 * If unsuccessful, we respond with an error message.
 */
async function handlePost(req, res) {
	try {
		const previewData = JSON.parse(req.body)
		const uniqueFileId = writeDataToTmpFile(TMP_DIR, previewData)
		res.status(200).json({ uniqueFileId })
	} catch (error) {
		res.status(500).json({ error: error.toString() })
	}
}

/**
 * Handle GET requests, attempting to read stored props from `/tmp`.
 *
 * We also delete old files in the temporary directory on every request
 * received to this endpoint, to ensure files don't hang around any longer
 * than they need to for author previewing purposes.
 */
async function handleGet(req, res) {
	// Delete old files in the temporary directory, to keep it clean.
	await deleteOldFiles(TMP_DIR, MAX_FILE_AGE_MS)

	/**
	 * Extract a unique file ID from the request query, if possible.
	 * This allows multiple authors to work with different files, and provides
	 * some level of protection against random public access of these files
	 * (not the best security ever, but better than nothing).
	 */
	const uniqueFileId = req.query.uniqueFileId as string | undefined
	// We require a unique file ID in order to read a previously stored file
	if (!uniqueFileId) {
		res.status(422).json({ error: 'No unique file ID provided.' })
		return
	}
	// If we have a unique file ID, attempt to read the props from the file
	const tempFile = getTempFilePath(TMP_DIR, uniqueFileId)
	// If the file doesn't exist, we can return early with that info
	if (!fs.existsSync(tempFile)) {
		res.status(404).json({ error: `File not found at "${tempFile}".` })
		return
	}
	// Otherwise, attempt to read the file
	const [err, data] = readJsonFile(tempFile)
	// If we failed to read props, return an error
	if (err !== null) {
		res.status(500).json({ error: `Failed to read JSON file "${tempFile}".` })
		return
	}
	// Otherwise, we have successfully read in props, return them
	res.status(200).json(data)
	return
}

/**
 * Given the path to a directory, delete old files
 * based on timestamps in each file name.
 *
 * First we read in the filenames in the directory.
 * If the filename contains the pattern `ts(\d+)_`, then parse the digits
 * as a timestamp, representing the milliseconds since the Unix epoch.
 * If the file is older than the provided maxAgeMs, delete the file.
 */
async function deleteOldFiles(directoryPath: string, maxAgeMs: number) {
	const files = fs.readdirSync(directoryPath)
	await Promise.all(
		files.map(async (file) => {
			const match = file.match(/ts(\d+)_/)
			if (match === null) {
				return
			}
			const timestamp = parseInt(match[1], 10)
			const fileAgeMs = Date.now() - timestamp
			if (fileAgeMs > maxAgeMs) {
				// console.log(`Deleting old file: ${file}`)
				fs.promises.unlink(`${directoryPath}/${file}`)
			}
		})
	)
}

/**
 * Given a temporary directory, and some JSON data to write,
 * grab a random UUID and combine with the current timestamp to create a
 * unique file ID, then write to that file, and
 * Return the unique file ID
 */
function writeDataToTmpFile(tmpDir: string, jsonData: $TSFixMe): string {
	const timestamp = Date.now()
	const uniqueFileId = `ts${timestamp}_${randomUUID()}`
	const newTempFile = getTempFilePath(tmpDir, uniqueFileId)
	fs.writeFileSync(newTempFile, JSON.stringify(jsonData, null, 2))
	return uniqueFileId
}

/**
 * Given a file path to a JSON file, attempt to read in the file.
 * If successful, return [null, data], where `data` is the parsed JSON.
 * Otherwise, return [err, null], where `err` describes the failure.
 */
function readJsonFile(filePath): [string, null] | [null, $TSFixMe] {
	try {
		const fileString = fs.readFileSync(filePath, 'utf8')
		return [null, JSON.parse(fileString)]
	} catch (error) {
		return [
			`Error: readJsonFile on "${filePath}" failed. Details: ${error.toString()}`,
			null,
		]
	}
}

/**
 * Given a temporary directory and a unique file ID, return a standard file path
 */
function getTempFilePath(tempDir, uniqueFileId) {
	return `${tempDir}/open-api-docs-view-props_${uniqueFileId}.json`
}
