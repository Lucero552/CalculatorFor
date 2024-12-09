document.getElementById("graph-btn").addEventListener("click", function () {
    const inequality1 = document.getElementById("inequality1").value;
    const inequality2 = document.getElementById("inequality2").value;
    const inequality3 = document.getElementById("inequality3").value;

    if (!inequality1 && !inequality2 && !inequality3) {
        alert("Please enter at least one inequality!");
        return;
    }

    try {
        drawGraph(inequality1, inequality2, inequality3);
    } catch (error) {
        alert(error.message);
    }
});

function parseInequality(inequality) {
    console.log("Parsing inequality:", inequality);

    // Updated regular expression to handle inequalities like 'y > 2x + 1', 'y ≤ -3x + 4', and others
    const match = inequality.trim().match(/^y\s*(<=|>=|<|>)\s*(-?\d*\.?\d*)\s*x\s*([+-]?\s*\d*\.?\d+)?\s*$/);

    if (!match) {
        console.error("Error: Invalid format for inequality:", inequality);
        throw new Error("Invalid inequality format. Use forms like 'y > 2x + 1' or 'y ≤ -3x + 4'.");
    }

    const operator = match[1];  // Capture operator (<=, >=, >, <)
    const slope = match[2] === "" ? 1 : parseFloat(match[2]);  // If no slope is specified, default to 1
    const intercept = match[3] ? parseFloat(match[3].replace(/\s/g, "")) : 0;  // Parse intercept, default to 0 if missing

    console.log("Operator:", operator, "Slope:", slope, "Intercept:", intercept);

    return { operator, slope, intercept };
}

function drawGraph(ineq1, ineq2, ineq3) {
    const canvas = document.getElementById("graph-canvas");
    const ctx = canvas.getContext("2d");

    // Clear previous graph
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate the range for the axes
    const axisRange = calculateAxisRange(ineq1, ineq2, ineq3);

    if (axisRange) {
        console.log("Axis Range: ", axisRange); // Log the axis range to check the values
        // Draw grid with dynamic axis scaling
        drawGrid(ctx, canvas.width, canvas.height, axisRange);

        // Plot inequalities
        if (ineq1) plotInequality(ctx, parseInequality(ineq1), axisRange);
        if (ineq2) plotInequality(ctx, parseInequality(ineq2), axisRange);
        if (ineq3) plotInequality(ctx, parseInequality(ineq3), axisRange);

        // If two inequalities are provided, find the intersection
        if (ineq1 && ineq2) {
            const intersection = findIntersection(parseInequality(ineq1), parseInequality(ineq2));
            if (intersection) {
                plotIntersection(ctx, intersection, axisRange);
            }
        }
    } else {
        alert("Could not calculate axis range.");
    }
}

function calculateAxisRange(ineq1, ineq2, ineq3) {
    const allInequalities = [ineq1, ineq2, ineq3].filter(Boolean);
    let minX = -10, maxX = 10, minY = -10, maxY = 10;

    if (allInequalities.length === 0) {
        return null;
    }

    allInequalities.forEach(ineq => {
        const { slope, intercept } = parseInequality(ineq);
        
        // Calculate the x and y intercepts and adjust the axis range
        const xIntercept = -intercept / slope; // Where y = 0
        const yIntercept = intercept; // Where x = 0

        minX = Math.min(minX, xIntercept - 5);
        maxX = Math.max(maxX, xIntercept + 5);
        minY = Math.min(minY, yIntercept - 5);
        maxY = Math.max(maxY, yIntercept + 5);
    });

    // Ensure that the values are sensible (no reverse ranges)
    minX = Math.min(minX, 0);
    maxX = Math.max(maxX, 0);
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, 0);

    console.log("minX: ", minX, "maxX: ", maxX, "minY: ", minY, "maxY: ", maxY); // Log values for debugging

    return { minX, maxX, minY, maxY };
}

function drawGrid(ctx, width, height, { minX, maxX, minY, maxY }) {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;

    // Dynamically calculate the step size based on the axis range
    const xRange = maxX - minX;
    const yRange = maxY - minY;

    // Determine the step size based on the range (use 10 steps for simplicity)
    const xStep = Math.max(20, width / xRange);  // Adjust grid step for x-axis
    const yStep = Math.max(20, height / yRange); // Adjust grid step for y-axis

    // Draw vertical lines and number labels
    for (let x = minX; x <= maxX; x += (maxX - minX) / 10) {
        const canvasX = (x - minX) * width / (maxX - minX); // Scale X value to canvas
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
        ctx.stroke();

        // Show number label only for relevant positions
        if (x !== 0) {
            ctx.fillStyle = "#000";
            ctx.fillText(x.toFixed(1), canvasX, height - 10); // X-axis numbers
        }
    }

    // Draw horizontal lines and number labels
    for (let y = minY; y <= maxY; y += (maxY - minY) / 10) {
        const canvasY = height - (y - minY) * height / (maxY - minY); // Scale Y value to canvas
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
        ctx.stroke();

        // Show number label only for relevant positions
        if (y !== 0) {
            ctx.fillStyle = "#000";
            ctx.fillText(y.toFixed(1), 10, canvasY); // Y-axis numbers
        }
    }

    // Draw axes
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

function plotInequality(ctx, { operator, slope, intercept }, { minX, maxX }) {
    const canvas = document.getElementById("graph-canvas");
    const width = canvas.width;
    const height = canvas.height;

    const scaleX = 20;
    const scaleY = 20;

    const x1 = -width / 2;
    const x2 = width / 2;

    const y1 = height / 2 - (slope * x1 + intercept) * scaleY;
    const y2 = height / 2 - (slope * x2 + intercept) * scaleY;

    ctx.strokeStyle = operator === ">=" || operator === "<=" ? "#6200ea" : "#6200ea88";
    ctx.lineWidth = 2;
    ctx.setLineDash(operator === ">" || operator === "<" ? [5, 5] : []);
    ctx.beginPath();
    ctx.moveTo(x1 + width / 2, y1);
    ctx.lineTo(x2 + width / 2, y2);
    ctx.stroke();

    if (operator === ">=" || operator === "<=") {
        ctx.fillStyle = "rgba(98, 0, 234, 0.2)";
        ctx.beginPath();
        ctx.moveTo(x1 + width / 2, y1);
        ctx.lineTo(x2 + width / 2, y2);
        ctx.lineTo(x2 + width / 2, height);
        ctx.lineTo(x1 + width / 2, height);
        ctx.closePath();
        ctx.fill();
    }
}

function findIntersection(ineq1, ineq2) {
    const m1 = ineq1.slope;
    const b1 = ineq1.intercept;
    const m2 = ineq2.slope;
    const b2 = ineq2.intercept;

    if (m1 === m2) {
        return null; // No intersection if the slopes are equal
    }

    // Solve for x: m1 * x + b1 = m2 * x + b2
    const x = (b2 - b1) / (m1 - m2);

    // Solve for y using either equation, we'll use the first inequality's equation
    const y = m1 * x + b1;

    return { x, y };
}

function plotIntersection(ctx, intersection, { minX, maxX }) {
    const canvas = document.getElementById("graph-canvas");
    const width = canvas.width;
    const height = canvas.height;

    // Convert the intersection to canvas coordinates
    const scaleX = 20;
    const scaleY = 20;

    const x = intersection.x * scaleX + width / 2;
    const y = height / 2 - intersection.y * scaleY;

    // Draw the intersection point
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}
