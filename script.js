function computeForward() {
  const distance = parseFloat(document.getElementById('distance').value);
  const bearingDegrees = parseFloat(document.getElementById('bearingDegrees').value) || 0;
  const bearingMinutes = parseFloat(document.getElementById('bearingMinutes').value) || 0;
  const bearingSeconds = parseFloat(document.getElementById('bearingSeconds').value) || 0;
  const startEasting = parseFloat(document.getElementById('startEasting').value);
  const startNorthing = parseFloat(document.getElementById('startNorthing').value);

  const bearing = bearingDegrees + bearingMinutes / 60 + bearingSeconds / 3600;
  const bearingRad = bearing * Math.PI / 180;
  const deltaEasting = distance * Math.sin(bearingRad);
  const deltaNorthing = distance * Math.cos(bearingRad);

  const endEasting = startEasting + deltaEasting;
  const endNorthing = startNorthing + deltaNorthing;

  displayResults(`
      Forward Computation Results:
      End Easting: ${endEasting.toFixed(3)}
      End Northing: ${endNorthing.toFixed(3)}
  `);
}

function computeBackward() {
  const startEasting = parseFloat(document.getElementById('startEasting').value);
  const startNorthing = parseFloat(document.getElementById('startNorthing').value);
  const endEasting = parseFloat(document.getElementById('endEasting').value);
  const endNorthing = parseFloat(document.getElementById('endNorthing').value);

  const deltaEasting = endEasting - startEasting;
  const deltaNorthing = endNorthing - startNorthing;

  const distance = Math.sqrt(deltaEasting ** 2 + deltaNorthing ** 2);
  const bearingRad = Math.atan2(deltaEasting, deltaNorthing);
  const bearingDeg = bearingRad * 180 / Math.PI;

  const bearingDegrees = Math.floor(bearingDeg);
  const bearingMinutes = Math.floor((bearingDeg - bearingDegrees) * 60);
  const bearingSeconds = ((bearingDeg - bearingDegrees - bearingMinutes / 60) * 3600).toFixed(1);

  displayResults(`
      Backward Computation Results:
      Distance: ${distance.toFixed(3)}
      Bearing: ${bearingDegrees}° ${bearingMinutes}' ${bearingSeconds}"
  `);
}

function displayResults(text) {
  document.getElementById('results').innerText = text;
}

function addCoordinatePair() {
    const container = document.getElementById('coordinates-container');
    const newPair = document.createElement('div');
    newPair.className = 'coordinate-pair';
    newPair.innerHTML = `
        <input type="number" step="0.001" placeholder="Easting ${container.children.length + 1}">
        <input type="number" step="0.001" placeholder="Northing ${container.children.length + 1}">
    `;
    container.appendChild(newPair);
}

function calculateArea() {
    const coordinates = [];
    const coordinatePairs = document.querySelectorAll('.coordinate-pair');

    coordinatePairs.forEach(pair => {
        const inputs = pair.querySelectorAll('input');
        const easting = parseFloat(inputs[0].value);
        const northing = parseFloat(inputs[1].value);
        if (!isNaN(easting) && !isNaN(northing)) {
            coordinates.push({easting, northing});
        }
    });

    if (coordinates.length < 3) {
        displayResults("Error: At least 3 valid coordinate pairs are required to calculate area.");
        return;
    }

    // Ensure the polygon is closed
    if (coordinates[0].easting !== coordinates[coordinates.length-1].easting || 
        coordinates[0].northing !== coordinates[coordinates.length-1].northing) {
        coordinates.push(coordinates[0]);
    }

    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        area += (coordinates[i].easting * coordinates[i+1].northing) - 
                (coordinates[i+1].easting * coordinates[i].northing);
    }
    area = Math.abs(area) / 2;

    displayResults(`The calculated area is: ${area.toFixed(3)} square units`);
}
function calculateResection() {
    // Get known points
    const pointA = getPointCoordinates('A');
    const pointB = getPointCoordinates('B');
    const pointC = getPointCoordinates('C');

    // Get measured angles
    const angleBAC = parseFloat(document.getElementById('angleBAC').value) * Math.PI / 180;
    const angleABC = parseFloat(document.getElementById('angleABC').value) * Math.PI / 180;

    if (!pointA || !pointB || !pointC || isNaN(angleBAC) || isNaN(angleABC)) {
        displayResults("Error: Please enter all required data.");
        return;
    }

    // Calculate using the resection formula
    const cotA = 1 / Math.tan(angleBAC);
    const cotB = 1 / Math.tan(angleABC);

    const numeratorE = (pointA.northing - pointC.northing) + cotA * (pointC.easting - pointA.easting) + cotB * (pointB.easting - pointC.easting);
    const numeratorN = (pointC.easting - pointA.easting) + cotA * (pointA.northing - pointC.northing) + cotB * (pointC.northing - pointB.northing);
    const denominator = cotA + cotB;

    const eastingP = pointC.easting + numeratorE / denominator;
    const northingP = pointC.northing + numeratorN / denominator;

    displayResults(`
        Resection Results:
        Point P (Unknown Point):
        Easting: ${eastingP.toFixed(3)}
        Northing: ${northingP.toFixed(3)}
    `);
}

function getPointCoordinates(pointName) {
    const inputs = document.querySelectorAll(`.known-point input[placeholder^="Point ${pointName}"], .known-point input[placeholder$=" ${pointName}"]`);
    if (inputs.length === 3) {
        return {
            name: inputs[0].value,
            easting: parseFloat(inputs[1].value),
            northing: parseFloat(inputs[2].value)
        };
    }
    return null;
}

function calculateIntersection() {
    // Get known points
    const pointA = getPointCoordinates('A');
    const pointB = getPointCoordinates('B');

    // Get measured angles
    const angleAP = parseFloat(document.getElementById('angleAP').value) * Math.PI / 180;
    const angleBP = parseFloat(document.getElementById('angleBP').value) * Math.PI / 180;

    if (!pointA || !pointB || isNaN(angleAP) || isNaN(angleBP)) {
        displayResults("Error: Please enter all required data.");
        return;
    }

    // Calculate azimuth from A to B
    const dE = pointB.easting - pointA.easting;
    const dN = pointB.northing - pointA.northing;
    const azimuthAB = Math.atan2(dE, dN);

    // Calculate azimuths to point P
    const azimuthAP = azimuthAB + angleAP;
    const azimuthBP = azimuthAB + Math.PI - angleBP;

    // Calculate tan of azimuths
    const tanAP = Math.tan(azimuthAP);
    const tanBP = Math.tan(azimuthBP);

    // Calculate intersection point P
    const eastingP = (pointB.northing - pointA.northing + pointA.easting * tanAP - pointB.easting * tanBP) / (tanAP - tanBP);
    const northingP = pointA.northing + (eastingP - pointA.easting) * tanAP;

    displayResults(`
        Intersection Results:
        Point P (Intersection Point):
        Easting: ${eastingP.toFixed(3)}
        Northing: ${northingP.toFixed(3)}
    `);
}

function convertToDMS() {
    const decimalDegrees = parseFloat(document.getElementById('decimalDegrees').value);

    if (isNaN(decimalDegrees)) {
        document.getElementById('dmsResult').textContent = "Error: Please enter a valid number for decimal degrees.";
        return;
    }

    const absDD = Math.abs(decimalDegrees);
    const degrees = Math.floor(absDD);
    const minutesFloat = (absDD - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;

    const direction = decimalDegrees >= 0 ? "N/E" : "S/W";

    document.getElementById('dmsResult').textContent = 
        `${Math.abs(degrees)}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`;
}

function convertToDD() {
    const degrees = parseInt(document.getElementById('degrees').value);
    const minutes = parseInt(document.getElementById('minutes').value);
    const seconds = parseFloat(document.getElementById('seconds').value);
    const direction = parseInt(document.getElementById('direction').value);

    if (isNaN(degrees) || isNaN(minutes) || isNaN(seconds)) {
        document.getElementById('ddResult').textContent = "Error: Please enter valid numbers for degrees, minutes, and seconds.";
        return;
    }

    const decimalDegrees = direction * (degrees + minutes / 60 + seconds / 3600);

    document.getElementById('ddResult').textContent = 
        `Decimal Degrees: ${decimalDegrees.toFixed(6)}°`;
}

// Constants for UTM conversion
const a = 6378137; // WGS84 semi-major axis
const f = 1 / 298.257223563; // WGS84 flattening
const k0 = 0.9996; // UTM scale factor

function convertToUTM() {
    const lon = parseFloat(document.getElementById('longitude').value);
    const lat = parseFloat(document.getElementById('latitude').value);

    if (isNaN(lon) || isNaN(lat)) {
        document.getElementById('utmResult').textContent = "Error: Please enter valid numbers for longitude and latitude.";
        return;
    }

    const zone = Math.floor((lon + 180) / 6) + 1;
    const lambda0 = (zone * 6 - 183) * Math.PI / 180; // Central meridian

    // Convert to radians
    const phi = lat * Math.PI / 180;
    const lambda = lon * Math.PI / 180;

    const e = Math.sqrt(2 * f - f * f); // Eccentricity

    const N = a / Math.sqrt(1 - e * e * Math.sin(phi) * Math.sin(phi));
    const T = Math.tan(phi) * Math.tan(phi);
    const C = e * e * Math.cos(phi) * Math.cos(phi) / (1 - e * e);
    const A = (lambda - lambda0) * Math.cos(phi);

    const M = a * ((1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256) * phi
              - (3 * e * e / 8 + 3 * e * e * e * e / 32 + 45 * e * e * e * e * e * e / 1024) * Math.sin(2 * phi)
              + (15 * e * e * e * e / 256 + 45 * e * e * e * e * e * e / 1024) * Math.sin(4 * phi)
              - (35 * e * e * e * e * e * e / 3072) * Math.sin(6 * phi));

    const easting = k0 * N * (A + (1 - T + C) * A * A * A / 6
                   + (5 - 18 * T + T * T + 72 * C - 58 * e * e) * A * A * A * A * A / 120) + 500000;

    let northing = k0 * (M + N * Math.tan(phi) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24
                 + (61 - 58 * T + T * T + 600 * C - 330 * e * e) * A * A * A * A * A * A / 720));

    const hemisphere = lat >= 0 ? 'N' : 'S';
    if (hemisphere === 'S') northing += 10000000;

    document.getElementById('utmResult').textContent = 
        `UTM Zone: ${zone}${hemisphere}, Easting: ${easting.toFixed(2)}m, Northing: ${northing.toFixed(2)}m`;
}

function convertToLongLat() {
    const easting = parseFloat(document.getElementById('easting').value);
    const northing = parseFloat(document.getElementById('northing').value);
    const zone = parseInt(document.getElementById('zone').value);
    const hemisphere = document.getElementById('hemisphere').value;

    if (isNaN(easting) || isNaN(northing) || isNaN(zone)) {
        document.getElementById('longLatResult').textContent = "Error: Please enter valid numbers for easting, northing, and zone.";
        return;
    }

    const e = Math.sqrt(2 * f - f * f); // Eccentricity
    const e1 = (1 - Math.sqrt(1 - e * e)) / (1 + Math.sqrt(1 - e * e));
    const x = easting - 500000;
    let y = northing;

    if (hemisphere === 'S') y -= 10000000;

    const M = y / k0;
    const mu = M / (a * (1 - e * e / 4 - 3 * e * e * e * e / 64 - 5 * e * e * e * e * e * e / 256));

    const phi1 = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu)
               + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu)
               + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu)
               + (1097 * e1 * e1 * e1 * e1 / 512) * Math.sin(8 * mu);

    const C1 = e * e * Math.cos(phi1) * Math.cos(phi1) / (1 - e * e);
    const T1 = Math.tan(phi1) * Math.tan(phi1);
    const N1 = a / Math.sqrt(1 - e * e * Math.sin(phi1) * Math.sin(phi1));
    const R1 = a * (1 - e * e) / Math.pow(1 - e * e * Math.sin(phi1) * Math.sin(phi1), 1.5);
    const D = x / (N1 * k0);

    const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e * e) * D * D * D * D / 24
             + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e * e - 3 * C1 * C1) * D * D * D * D * D * D / 720);

    const lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e * e + 24 * T1 * T1)
             * D * D * D * D * D / 120) / Math.cos(phi1);

    const latitude = lat * 180 / Math.PI;
    const longitude = lon * 180 / Math.PI + (zone * 6 - 183);

    document.getElementById('longLatResult').textContent = 
        `Latitude: ${latitude.toFixed(6)}°, Longitude: ${longitude.toFixed(6)}°`;
}

