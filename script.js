const svg = document.getElementById('interactive-art');
let viewBox = { x: 0, y: 0, width: 1000, height: 1000 };
let isPanning = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let initialPinchDistance = null;
let lastPinchDistance = null;
let lastPinchMidpoint = { x: 0, y: 0 };
let pinchMidpoint = { x: 0, y: 0 };

// Prevent default touch behavior
svg.addEventListener('touchstart', function(evt) {
    evt.preventDefault();
}, { passive: false });

svg.addEventListener('mousedown', function(evt) {
    isPanning = true;
    startPoint = { x: evt.clientX, y: evt.clientY };
    svg.style.cursor = 'grabbing';
});

svg.addEventListener('mousemove', function(evt) {
    if (!isPanning) return;
    endPoint = { x: evt.clientX, y: evt.clientY };
    let dx = (startPoint.x - endPoint.x) * (viewBox.width / svg.clientWidth);
    let dy = (startPoint.y - endPoint.y) * (viewBox.height / svg.clientHeight);
    viewBox.x += dx;
    viewBox.y += dy;
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    startPoint = endPoint;
});

svg.addEventListener('mouseup', function() {
    isPanning = false;
    svg.style.cursor = 'grab';
});

svg.addEventListener('mouseleave', function() {
    isPanning = false;
    svg.style.cursor = 'grab';
});

svg.addEventListener('wheel', function(evt) {
    evt.preventDefault();

    const mousePointTo = function(evt) {
        const point = svg.createSVGPoint();
        point.x = evt.clientX;
        point.y = evt.clientY;
        return point.matrixTransform(svg.getScreenCTM().inverse());
    };

    const zoom = function(scale, point) {
        viewBox.x = point.x - (point.x - viewBox.x) * scale;
        viewBox.y = point.y - (point.y - viewBox.y) * scale;
        viewBox.width *= scale;
        viewBox.height *= scale;
        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    };

    let scale = evt.deltaY > 0 ? 1.05 : 0.95; // Adjusted zoom speed
    let point = mousePointTo(evt);

    zoom(scale, point);
});

svg.addEventListener('touchstart', function(evt) {
    if (evt.touches.length === 1) {
        isPanning = true;
        startPoint = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
        svg.style.cursor = 'grabbing';
    } else if (evt.touches.length === 2) {
        isPanning = false;
        initialPinchDistance = getPinchDistance(evt.touches);
        lastPinchDistance = initialPinchDistance;
        lastPinchMidpoint = getMidpoint(evt.touches);
    }
});

svg.addEventListener('touchmove', function(evt) {
    evt.preventDefault();

    if (evt.touches.length === 1 && isPanning) {
        endPoint = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
        let dx = (startPoint.x - endPoint.x) * (viewBox.width / svg.clientWidth);
        let dy = (startPoint.y - endPoint.y) * (viewBox.height / svg.clientHeight);
        viewBox.x += dx;
        viewBox.y += dy;
        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        startPoint = endPoint;
    } else if (evt.touches.length === 2) {
        let currentPinchDistance = getPinchDistance(evt.touches);
        let scale = lastPinchDistance / currentPinchDistance;
        pinchMidpoint = getMidpoint(evt.touches);
        zoomAtPoint(scale, pinchMidpoint);
        lastPinchDistance = currentPinchDistance;

        // Handle panning during pinch zoom
        let dx = (lastPinchMidpoint.x - pinchMidpoint.x) * (viewBox.width / svg.clientWidth);
        let dy = (lastPinchMidpoint.y - pinchMidpoint.y) * (viewBox.height / svg.clientHeight);
        viewBox.x += dx;
        viewBox.y += dy;
        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        lastPinchMidpoint = pinchMidpoint;
    }
});

svg.addEventListener('touchend', function() {
    isPanning = false;
    svg.style.cursor = 'grab';
    initialPinchDistance = null;
    lastPinchDistance = null;
    lastPinchMidpoint = { x: 0, y: 0 };
    pinchMidpoint = { x: 0, y: 0 };
});

function getPinchDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX;
    let dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(touches) {
    return {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2
    };
}

function zoomAtPoint(scale, point) {
    let svgPoint = svg.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    let transformedPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

    viewBox.x = transformedPoint.x - (transformedPoint.x - viewBox.x) * scale;
    viewBox.y = transformedPoint.y - (transformedPoint.y - viewBox.y) * scale;
    viewBox.width *= scale;
    viewBox.height *= scale;
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
}
