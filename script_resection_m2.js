function calculateResection() {
  // Get known points
  const pointA = getPointCoordinates('A');
  const pointB = getPointCoordinates('B');
  const pointC = getPointCoordinates('C');

  // Get measured angles
  const angleAPB = parseFloat(document.getElementById('angleAPB').value) * Math.PI / 180;
  const angleBPC = parseFloat(document.getElementById('angleBPC').value) * Math.PI / 180;

  if (!pointA || !pointB || !pointC || isNaN(angleAPB) || isNaN(angleBPC)) {
      displayResults("Error: Please enter all required data.");
      return;
  }

  // Calculate angles PAB and PCB
  const angleABC = calculateAngle(pointA, pointB, pointC);
  const anglePAB = angleABC - angleAPB;
  const anglePCB = angleABC - angleBPC;

  // Calculate distances
  const distanceAB = calculateDistance(pointA, pointB);
  const distanceBC = calculateDistance(pointB, pointC);

  // Calculate coordinates of P using sine law
  const distanceAP = distanceAB * Math.sin(anglePCB) / Math.sin(angleAPB + anglePCB);
  const distanceCP = distanceBC * Math.sin(anglePAB) / Math.sin(angleAPB + anglePCB);

  const bearingAP = calculateBearing(pointA, pointB) + anglePAB;
  const bearingCP = calculateBearing(pointC, pointB) - anglePCB;

  const eastingP1 = pointA.easting + distanceAP * Math.sin(bearingAP);
  const northingP1 = pointA.northing + distanceAP * Math.cos(bearingAP);

  const eastingP2 = pointC.easting + distanceCP * Math.sin(bearingCP);
  const northingP2 = pointC.northing + distanceCP * Math.cos(bearingCP);

  // Average the two solutions
  const eastingP = (eastingP1 + eastingP2) / 2;
  const northingP = (northingP1 + northingP2) / 2;

  // Calculate additional information
  const distanceBP = calculateDistance(pointB, {easting: eastingP, northing: northingP});
  const bearingAB = calculateBearing(pointA, pointB);
  const bearingBC = calculateBearing(pointB, pointC);
  const bearingBP = calculateBearing(pointB, {easting: eastingP, northing: northingP});

  displayResults(`
      Resection Results:
      Point P (Unknown Point):
      Easting: ${eastingP.toFixed(3)}
      Northing: ${northingP.toFixed(3)}

      Distances:
      AP: ${distanceAP.toFixed(3)} m
      BP: ${distanceBP.toFixed(3)} m
      CP: ${distanceCP.toFixed(3)} m

      Bearings:
      AB: ${(bearingAB * 180 / Math.PI).toFixed(4)}°
      BC: ${(bearingBC * 180 / Math.PI).toFixed(4)}°
      BP: ${(bearingBP * 180 / Math.PI).toFixed(4)}°

      Angles:
      APB: ${(angleAPB * 180 / Math.PI).toFixed(4)}°
      BPC: ${(angleBPC * 180 / Math.PI).toFixed(4)}°
      ABC: ${(angleABC * 180 / Math.PI).toFixed(4)}°
  `);

  drawDiagram(pointA, pointB, pointC, {easting: eastingP, northing: northingP});
}

function calculateAngle(point1, point2, point3) {
  const bearing12 = calculateBearing(point1, point2);
  const bearing32 = calculateBearing(point3, point2);
  let angle = bearing32 - bearing12;
  if (angle < 0) angle += 2 * Math.PI;
  return angle;
}

function calculateDistance(point1, point2) {
  const dx = point2.easting - point1.easting;
  const dy = point2.northing - point1.northing;
  return Math.sqrt(dx * dx + dy * dy);
}

function calculateBearing(point1, point2) {
  const dx = point2.easting - point1.easting;
  const dy = point2.northing - point1.northing;
  let bearing = Math.atan2(dx, dy);
  if (bearing < 0) bearing += 2 * Math.PI;
  return bearing;
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

function displayResults(text) {
  document.getElementById('results').innerHTML = `<pre>${text}</pre>`;
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
  drawLine(ctx, pointA, pointP, scale, padding);
  drawLine(ctx, pointB, pointP, scale, padding);
  drawLine(ctx, pointC, pointP, scale, padding);

  // Draw angles
  drawAngle(ctx, pointA, pointP, pointB, 'APB', scale, padding);
  drawAngle(ctx, pointB, pointP, pointC, 'BPC', scale, padding);
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
function calculateResection() {
    // Dummy function to display angles and points on canvas
    const canvas = document.getElementById('resectionCanvas');
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dummy points for illustration
    const points = {
        A: {x: 100, y: 400},
        B: {x: 250, y: 100},
        C: {x: 400, y: 400},
        P: {x: 250, y: 250}
    };

    // Draw points
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(points.A.x, points.A.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('A', points.A.x + 10, points.A.y);

    ctx.beginPath();
    ctx.arc(points.B.x, points.B.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('B', points.B.x + 10, points.B.y);

    ctx.beginPath();
    ctx.arc(points.C.x, points.C.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('C', points.C.x + 10, points.C.y);

    ctx.beginPath();
    ctx.arc(points.P.x, points.P.y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('P', points.P.x + 10, points.P.y);

    // Draw lines
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(points.A.x, points.A.y);
    ctx.lineTo(points.P.x, points.P.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(points.B.x, points.B.y);
    ctx.lineTo(points.P.x, points.P.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(points.C.x, points.C.y);
    ctx.lineTo(points.P.x, points.P.y);
    ctx.stroke();

    // Display angles (dummy values for now)
    ctx.fillStyle = 'red';
    ctx.fillText('Angle BAP: 45°', points.P.x + 20, points.P.y - 10);
    ctx.fillText('Angle CBP: 60°', points.P.x + 20, points.P.y + 10);
    ctx.fillText('Angle ACP: 75°', points.P.x + 20, points.P.y + 30);
}
