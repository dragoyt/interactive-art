const svg = document.getElementById('interactive-art');
let viewBox = { x: 0, y: 0, width: 1000, height: 1000 };
let isPanning = false;
let startPoint = { x: 0, y: 0 };
let endPoint = { x: 0, y: 0 };
let initialPinchDistance = null;

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

    let scale = evt.deltaY < 0 ? 0.9 : 1.1;
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
    }
});

svg.addEventListener('touchmove', function(evt) {
    if (isPanning && evt.touches.length === 1) {
        endPoint = { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
        let dx = (startPoint.x - endPoint.x) * (viewBox.width / svg.clientWidth);
        let dy = (startPoint.y - endPoint.y) * (viewBox.height / svg.clientHeight);
        viewBox.x += dx;
        viewBox.y += dy;
        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        startPoint = endPoint;
    } else if (evt.touches.length === 2) {
        let currentPinchDistance = getPinchDistance(evt.touches);
        let scale = initialPinchDistance / currentPinchDistance;
        viewBox.width *= scale;
        viewBox.height *= scale;
        svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
        initialPinchDistance = currentPinchDistance;
    }
});

svg.addEventListener('touchend', function() {
    isPanning = false;
    svg.style.cursor = 'grab';
    initialPinchDistance = null;
});

function getPinchDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX;
    let dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}