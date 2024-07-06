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
    const angleBAP = parseFloat(document.getElementById('angleBAP').value) * Math.PI / 180;
    const angleCBP = parseFloat(document.getElementById('angleCBP').value) * Math.PI / 180;
    const angleACP = parseFloat(document.getElementById('angleACP').value) * Math.PI / 180;

    if (!pointA || !pointB || !pointC || isNaN(angleBAP) || isNaN(angleCBP) || isNaN(angleACP)) {
        displayResults("Error: Please enter all required data.");
        return;
    }

    // Calculate weights
    const wA = Math.sin(angleBAP) * Math.sin(angleACP);
    const wB = Math.sin(angleCBP) * Math.sin(angleBAP);
    const wC = Math.sin(angleACP) * Math.sin(angleCBP);

    // Calculate total weight
    const wTotal = wA + wB + wC;

    // Calculate coordinates of point P using Tienstra formula
    const eastingP = (wA * pointA.easting + wB * pointB.easting + wC * pointC.easting) / wTotal;
    const northingP = (wA * pointA.northing + wB * pointB.northing + wC * pointC.northing) / wTotal;

    // Calculate distances
    const distanceAP = calculateDistance(pointA, {easting: eastingP, northing: northingP});
    const distanceBP = calculateDistance(pointB, {easting: eastingP, northing: northingP});
    const distanceCP = calculateDistance(pointC, {easting: eastingP, northing: northingP});
    const distanceAB = calculateDistance(pointA, pointB);
    const distanceBC = calculateDistance(pointB, pointC);
    const distanceCA = calculateDistance(pointC, pointA);

    // Calculate bearings
    const bearingAP = calculateBearing(pointA, {easting: eastingP, northing: northingP});
    const bearingBP = calculateBearing(pointB, {easting: eastingP, northing: northingP});
    const bearingCP = calculateBearing(pointC, {easting: eastingP, northing: northingP});
    const bearingAB = calculateBearing(pointA, pointB);
    const bearingBC = calculateBearing(pointB, pointC);
    const bearingCA = calculateBearing(pointC, pointA);

    // Calculate angles
    const angleBAC = Math.acos((Math.pow(distanceAB, 2) + Math.pow(distanceCA, 2) - Math.pow(distanceBC, 2)) / (2 * distanceAB * distanceCA));
    const angleCBA = Math.acos((Math.pow(distanceBC, 2) + Math.pow(distanceAB, 2) - Math.pow(distanceCA, 2)) / (2 * distanceBC * distanceAB));
    const angleACB = Math.acos((Math.pow(distanceCA, 2) + Math.pow(distanceBC, 2) - Math.pow(distanceAB, 2)) / (2 * distanceCA * distanceBC));

    displayResults(`
        Resection Results (Tienstra Method):
        Point P (Unknown Point):
        Easting: ${eastingP.toFixed(3)}
        Northing: ${northingP.toFixed(3)}

        Distances:
        AP: ${distanceAP.toFixed(3)} m
        BP: ${distanceBP.toFixed(3)} m
        CP: ${distanceCP.toFixed(3)} m
        AB: ${distanceAB.toFixed(3)} m
        BC: ${distanceBC.toFixed(3)} m
        CA: ${distanceCA.toFixed(3)} m

        Bearings:
        AP: ${bearingAP.toFixed(4)}°
        BP: ${bearingBP.toFixed(4)}°
        CP: ${bearingCP.toFixed(4)}°
        AB: ${bearingAB.toFixed(4)}°
        BC: ${bearingBC.toFixed(4)}°
        CA: ${bearingCA.toFixed(4)}°

        Angles:
        BAC: ${(angleBAC * 180 / Math.PI).toFixed(4)}°
        CBA: ${(angleCBA * 180 / Math.PI).toFixed(4)}°
        ACB: ${(angleACB * 180 / Math.PI).toFixed(4)}°
        BAP: ${(angleBAP * 180 / Math.PI).toFixed(4)}°
        CBP: ${(angleCBP * 180 / Math.PI).toFixed(4)}°
        ACP: ${(angleACP * 180 / Math.PI).toFixed(4)}°
    `);

    drawDiagram(pointA, pointB, pointC, {easting: eastingP, northing: northingP});
}

function calculateDistance(point1, point2) {
    const dx = point2.easting - point1.easting;
    const dy = point2.northing - point1.northing;
    return Math.sqrt(dx * dx + dy * dy);
}

function calculateBearing(point1, point2) {
    const dx = point2.easting - point1.easting;
    const dy = point2.northing - point1.northing;
    let bearing = Math.atan2(dx, dy) * 180 / Math.PI;
    if (bearing < 0) {
        bearing += 360;
    }
    return bearing;
}

function drawDiagram(pointA, pointB, pointC, pointP) {
    const canvas = document.getElementById('resectionCanvas');
    const ctx = canvas.getContext('2d');
    const padding = 50;
    const scale = calculateScale(pointA, pointB, pointC, pointP, canvas.width - 2*padding, canvas.height - 2*padding);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '12px Arial';

    // Draw points
    drawPoint(ctx, pointA, 'A', scale, padding);
    drawPoint(ctx, pointB, 'B', scale, padding);
    drawPoint(ctx, pointC, 'C', scale, padding);
    drawPoint(ctx, pointP, 'P', scale, padding);

    // Draw lines
    drawLine(ctx, pointA, pointB, scale, padding);
    drawLine(ctx, pointB, pointC, scale, padding);
    drawLine(ctx, pointC, pointA, scale, padding);
    drawLine(ctx, pointA, pointP, scale, padding);
    drawLine(ctx, pointB, pointP, scale, padding);
    drawLine(ctx, pointC, pointP, scale, padding);

    // Draw angles
    drawAngle(ctx, pointB, pointA, pointP, 'BAP', scale, padding);
    drawAngle(ctx, pointC, pointB, pointP, 'CBP', scale, padding);
    drawAngle(ctx, pointA, pointC, pointP, 'ACP', scale, padding);
}

function drawPoint(ctx, point, label, scale, padding) {
    const x = padding + (point.easting - minEasting) * scale;
    const y = ctx.canvas.height - padding - (point.northing - minNorthing) * scale;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText(label, x + 5, y - 5);
}

function drawLine(ctx, point1, point2, scale, padding) {
    const x1 = padding + (point1.easting - minEasting) * scale;
    const y1 = ctx.canvas.height - padding - (point1.northing - minNorthing) * scale;
    const x2 = padding + (point2.easting - minEasting) * scale;
    const y2 = ctx.canvas.height - padding - (point2.northing - minNorthing) * scale;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawAngle(ctx, point1, point2, point3, label, scale, padding) {
    const x2 = padding + (point2.easting - minEasting) * scale;
    const y2 = ctx.canvas.height - padding - (point2.northing - minNorthing) * scale;
    const angle1 = Math.atan2(point1.northing - point2.northing, point1.easting - point2.easting);
    const angle2 = Math.atan2(point3.northing - point2.northing, point3.easting - point2.easting);
    const radius = 20;
    ctx.beginPath();
    ctx.arc(x2, y2, radius, -angle1, -angle2);
    ctx.stroke();
    const labelAngle = (angle1 + angle2) / 2;
    ctx.fillText(label, x2 + (radius + 5) * Math.cos(-labelAngle), y2 - (radius + 5) * Math.sin(-labelAngle));
}

function calculateScale(pointA, pointB, pointC, pointP, width, height) {
    minEasting = Math.min(pointA.easting, pointB.easting, pointC.easting, pointP.easting);
    maxEasting = Math.max(pointA.easting, pointB.easting, pointC.easting, pointP.easting);
    minNorthing = Math.min(pointA.northing, pointB.northing, pointC.northing, pointP.northing);
    maxNorthing = Math.max(pointA.northing, pointB.northing, pointC.northing, pointP.northing);
    const scaleX = width / (maxEasting - minEasting);
    const scaleY = height / (maxNorthing - minNorthing);
    return Math.min(scaleX, scaleY);
}

// Keep the existing getPointCoordinates and displayResults functions
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

