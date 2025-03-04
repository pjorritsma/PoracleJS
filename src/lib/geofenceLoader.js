const stripJsonComments = require('strip-json-comments')
const fs = require('fs')

function getGeofenceFromGEOjson(config, rawdata) {
	if (rawdata.type !== 'FeatureCollection' || !rawdata.features) return
	const geofenceGEOjson = rawdata.features
	const outGeofence = []
	for (let i = 0; i < geofenceGEOjson.length; i++) {
		if (geofenceGEOjson[i].type === 'Feature' && geofenceGEOjson[i].geometry.type === 'Polygon') {
			const { properties } = geofenceGEOjson[i]
			const name = properties.name || config.defaultGeofenceName + i.toString()
			const color = properties.color || config.defaultGeofenceColor

			outGeofence[i] = {
				name,
				id: i,
				color,
				path: [],
				group: properties.group || '',
				description: properties.description || '',
				userSelectable: properties.userSelectable === undefined || properties.userSelectable,
				displayInMatches: properties.displayInMatches === undefined || properties.displayInMatches,
			}
			geofenceGEOjson[i].geometry.coordinates[0].forEach((coordinates) => outGeofence[i].path.push([coordinates[1], coordinates[0]]))
		}
	}
	return outGeofence
}

function readGeofenceFile(config, filename) {
	let geofence

	try {
		const geofenceText = stripJsonComments(fs.readFileSync(filename, 'utf8'))
		geofence = JSON.parse(geofenceText)
	} catch (err) {
		throw new Error(`Geofence ${filename} - ${err.message}`)
	}

	if (geofence.type === 'FeatureCollection') geofence = getGeofenceFromGEOjson(config, geofence)

	return geofence
}

module.exports = { readGeofenceFile }