importScripts('./d3/d3-quadtree.min.js');
importScripts('./d3/d3-zoom.min.js');
importScripts('./d3/d3-drag.min.js');
importScripts('./d3/d3-dispatch.min.js');
importScripts('./d3/d3-timer.min.js');
importScripts('./d3/d3-selection.min.js');
importScripts('./d3/d3-force.min.js');
importScripts('./d3/forceInBox.js');

// CONSTANTS

const fontFamily = 'Helvetica';
const font = `3px ${fontFamily}`;
const fontBig = `20px ${fontFamily}`;
const fontItalic = `italic ${font}`;
const transformThreshold = 2.5;

const ObjectLayout = {
	Human:	 1,
	Task:	 2,
	Bookmark: 11,
};

const EdgeType = {
	Link:		 0,
	Relation:	 1,
};

let offscreen = null;
let canvas = null;
let ctx = null;
let octx = null;
let width = 0;
let height = 0;
let density = 0;
let transform = null;
let nodes = [];
let edges = [];
let forceProps = {};
let images = {};
let simulation = null;
let theme = '';
let Color = {};
let LineWidth = 0.25;
let frame = 0;
let selected = [];
let groupForce = null;

addEventListener('message', ({ data }) => { 
	if (this[data.id]) {
		this[data.id](data); 
	};
});

init = (data) => {
	canvas = data.canvas;
	forceProps = data.forceProps;
	nodes = data.nodes;
	edges = data.edges;
	theme = data.theme;

	offscreen = new OffscreenCanvas(250, 40);
	octx = offscreen.getContext('2d');

	ctx = canvas.getContext('2d');
	ctx.lineCap = 'round';

	resize(data);
	initColor();

	requestAnimationFrame(() => {
		nodes = nodes.map(nameMapper);
	});

	transform = d3.zoomIdentity.translate(-width, -height).scale(3);
	simulation = d3.forceSimulation(nodes);

	initForces();

	simulation.on('tick', () => { redraw(); });
	simulation.on('end', () => { simulation.alphaTarget(1); });
	simulation.tick(100);
};

nameMapper = (d) => {
	if (d.isRoot) {
		d.fx = width / 2;
		d.fy = height / 2;
		d.radius = 10;
	};

	octx.save();
	octx.clearRect(0, 0, 250, 40);
	octx.font = fontBig;
	octx.fillStyle = Color.text;
	octx.textAlign = 'center';
	octx.fillText(d.shortName, 125, 20);
	octx.restore();

	d.textBitmap = offscreen.transferToImageBitmap();
	return d;
};

initColor = () => {
	switch (theme) {
		default:
			Color = {
				bg: '#fff',
				text: '#2c2b27',
				iconText: '#aca996',
				link: {
					0: '#dfddd0',
					1: '#8c9ea5',
					over: '#ffd15b',
					targetOver: '#5dd400',
					selected: '#c4e3fb',
				},
				node: {
					common: '#f3f2ec',
					filter: '#e3f7d0',
					focused: '#fef3c5',
					over: '#ffd15b',
					targetOver: '#5dd400',
					selected: '#e3eff4',
				},
			}; 
			break;

		case 'dark':
			Color = {
				bg: '#2c2b27',
				text: '#dfddd3',
				iconText: '#dfddd3',
				link: {
					0: '#525148',
					1: '#8c9ea5',
					over: '#ffd15b',
					targetOver: '#5dd400',
					selected: '#212b30',
				},
				node: {
					common: '#484843',
					filter: '#e3f7d0',
					focused: '#fef3c5',
					over: '#ffd15b',
					targetOver: '#5dd400',
					selected: '#212b30',
				},
			};
			break;
	};
};

image = ({ src, bitmap }) => {
	if (!images[src]) {
		images[src] = bitmap;
	};
};

updateProps = (data) => {
	forceProps = data.forceProps;
	
	updateForces();
	restart(1);
};

initForces = () => {
	/*
	groupForce = forceInABox().template('force')
	.strength(0.3) 
	.groupBy('layout')
	.enableGrouping(true)
	.size([ width, height ]);
	*/

	simulation
	.force('link', d3.forceLink())
	.force('charge', d3.forceManyBody())
	.force('collide', d3.forceCollide(nodes))
	.force('center', d3.forceCenter())
	.force('forceX', d3.forceX())
	.force('forceY', d3.forceY())
	.force('forceInABox', groupForce);

	updateForces();
	restart(1);
};

updateForces = () => {
	const center = forceProps.center;
	const charge = forceProps.charge;
	const collide = forceProps.collide;
	const link = forceProps.link;
	const forceX = forceProps.forceX;
	const forceY = forceProps.forceY;

	simulation.force('center')
	.x(width * center.x)
	.y(height * center.y);

	simulation.force('charge')
	.strength(charge.strength * charge.enabled)
	.distanceMin(charge.distanceMin)
	.distanceMax(charge.distanceMax);

	simulation.force('collide')
	.strength(collide.strength * collide.enabled)
	.radius(10 * collide.radius)
	.iterations(collide.iterations);

	simulation.force('link')
	.id(d => d.id)
	.distance(link.distance)
	//.strength(d => simulation.force('forceInABox').getLinkStrength(d) * link.enabled)
	.strength(link.strength * link.enabled)
	.iterations(link.iterations)
	.links(link.enabled ? edges : []);

	simulation.force('forceX')
	.strength((d) => {
		const hasLinks = (d.sourceCnt + d.targetCnt) > 0;
		return hasLinks ? 0 : forceX.strength * forceX.enabled;
	})
	.x(width * forceX.x);

	simulation.force('forceY')
	.strength((d) => {
		const hasLinks = (d.sourceCnt + d.targetCnt) > 0;
		return hasLinks ? 0 : forceY.strength * forceY.enabled;
	})
	.y(height * forceY.y);
};

draw = () => {
	ctx.save();
	ctx.clearRect(0, 0, width, height);
	ctx.translate(transform.x, transform.y);
	ctx.scale(transform.k, transform.k);

	edges.forEach(d => {
		if (!forceProps.links && (d.type == EdgeType.Link)) {
			return;
		};
		if (!forceProps.relations && (d.type == EdgeType.Relation)) {
			return;
		};
		if (!checkNodeInViewport(d.source) && !checkNodeInViewport(d.target)) {
			return;
		};

		drawLine(d, 1, 1, false, forceProps.markers);
	});

	nodes.forEach(d => {
		if (!forceProps.orphans && d.isOrphan && !d.isRoot) {
			return;
		};
		if (!checkNodeInViewport(d)) {
			return;
		};

		drawNode(d);
	});

	ctx.restore();
};

redraw = () => {
	cancelAnimationFrame(frame);
	frame = requestAnimationFrame(draw);
};

drawLine = (d, aWidth, aLength, arrowStart, arrowEnd) => {
	let x1 = d.source.x;
	let y1 = d.source.y;
	let r1 = d.source.radius + 3;
	let x2 = d.target.x;
	let y2 = d.target.y;
	let r2 = d.target.radius + 3;
	let bg = Color.link[d.type] || Color.link[0];

	ctx.globalAlpha = 1;

	if (forceProps.filter && !d.source.name.match(forceProps.filter) && !d.target.name.match(forceProps.filter)) {
		ctx.globalAlpha = 0.2;
	};

	if (d.source.isOver) {
		bg = Color.link.over;
	};

	if (d.target.isOver) {
		bg = Color.link.targetOver;
	};

    let a1 = Math.atan2(y2 - y1, x2 - x1);
	let a2 = Math.atan2(y1 - y2, x1 - x2);

	let sx1 = x1 + r1 * Math.cos(a1);
	let sy1 = y1 + r1 * Math.sin(a1);
	let sx2 = x2 + r2 * Math.cos(a2);
	let sy2 = y2 + r2 * Math.sin(a2);
	let mx = (x1 + x2) / 2;  
    let my = (y1 + y2) / 2;

	ctx.lineWidth = LineWidth;
	ctx.strokeStyle = bg;
	ctx.beginPath();
	ctx.moveTo(sx1, sy1);
	ctx.lineTo(sx2, sy2);
	ctx.stroke();

	if (arrowStart) {
		ctx.save();
		ctx.translate(sx1, sy1);
		ctx.rotate(a1);
		ctx.beginPath();
		ctx.moveTo(aLength, -aWidth);
        ctx.lineTo(0, 0);
        ctx.lineTo(aLength, aWidth);
		ctx.stroke();
		ctx.restore();
    };

    if (arrowEnd) {
		ctx.save();
		ctx.translate(sx2, sy2);
		ctx.rotate(a2);
		ctx.beginPath();
		ctx.moveTo(aLength, -aWidth);
        ctx.lineTo(0, 0);
        ctx.lineTo(aLength, aWidth);
		ctx.stroke();
		ctx.restore();
    };

	// draw name
	if (d.name && forceProps.labels && (transform.k >= transformThreshold)) {
		ctx.save();
		ctx.translate(mx, my);
		ctx.font = fontItalic;

		const metrics = ctx.measureText(d.name);
		const left = metrics.actualBoundingBoxLeft * -1;
		const top = metrics.actualBoundingBoxAscent * -1;
		const right = metrics.actualBoundingBoxRight;
		const bottom = metrics.actualBoundingBoxDescent;
		const width = right - left;
		const height = bottom - top;

		ctx.fillStyle = Color.bg;
		ctx.fillRect(left - width / 2 - 1, top + 0.5, width + 2, height + 1);

		ctx.fillStyle = bg;
		ctx.textAlign = 'center';
		ctx.fillText(d.name, 0, 1);

		ctx.restore();
	};
};

checkNodeInViewport = (d) => {
	const dr = d.radius * transform.k;
	const distX = transform.x + d.x * transform.k - dr;
	const distY = transform.y + d.y * transform.k - dr;

	return (distX >= -dr * 2) && (distX <= width) && (distY >= -dr * 2) && (distY <= height);
};

drawNode = (d) => {
	let bg = Color.node.common;
	let stroke = '';
	let img = images[d.src];
	let isMatched = forceProps.filter && d.name.match(forceProps.filter);

	ctx.save();
	ctx.lineWidth = 0;
	ctx.globalAlpha = 1;

	if (d.isRoot) {
		bg = Color.node.focused;
	};

	if (selected.includes(d.id)) {
		stroke = Color.link.selected;
		bg = Color.node.selected;
		ctx.lineWidth = 1;
	};

	if (d.isOver) {
		stroke = Color.node.over;
		ctx.lineWidth = 1;
	};

	if (isMatched) {
		stroke = Color.node.over;
		ctx.lineWidth = 2;
	};

	if (forceProps.filter && !isMatched) {
		ctx.globalAlpha = 0.4;
	};

	if (isIconCircle(d)) {
		ctx.beginPath();
		ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI, true);
		ctx.closePath();
	} else {
		const r = d.iconImage ? d.radius / 8 : d.radius / 4;
		roundedRect(d.x - d.radius, d.y - d.radius, d.radius * 2, d.radius * 2, r);
	};

	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.stroke();
	};
	
	ctx.fillStyle = bg;
	ctx.fill();

	if (forceProps.labels && d.textBitmap && (transform.k >= transformThreshold)) {
		const h = 5;
		const div = 6.25;
		ctx.drawImage(d.textBitmap, 0, 0, 250, 40, d.x - h * div / 2, d.y + d.radius + 1, h * div, h);
	};

	if (img) {
		let x = d.x - d.radius / 2;
		let y = d.y - d.radius / 2;
		let w = d.radius;
		let h = d.radius;
	
		if (d.iconImage) {
			x = d.x - d.radius;
			y = d.y - d.radius;
	
			if (isIconCircle(d)) {
				ctx.beginPath();
				ctx.arc(d.x, d.y, d.radius, 0, 2 * Math.PI, true);
				ctx.closePath();
			} else {
				const r = d.iconImage ? d.radius / 8 : d.radius / 4;
				roundedRect(d.x - d.radius, d.y - d.radius, d.radius * 2, d.radius * 2, r);
			};
	
			ctx.fill();
			ctx.clip();
	
			if (img.width > img.height) {
				h = d.radius * 2;
				w = h * (img.width / img.height)
				x -= (w - d.radius * 2) / 2;
			} else {
				w = d.radius * 2;
				h = w * (img.height / img.width);
				y -= (h - d.radius * 2) / 2;
			};
		};
	
		ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
	} else 
	if (isLayoutHuman(d) && (transform.k >= transformThreshold)) {
		nameCircleIcon(d);
	};

	ctx.restore();
};

roundedRect = (x, y, width, height, radius) => {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
};

rect = (x, y, width, height) => {
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width, y);
	ctx.lineTo(x + width, y + height);
	ctx.lineTo(x, y + height);
	ctx.lineTo(x, y);
	ctx.closePath();
};

onZoom = (data) => {
	const { x, y, k } = data.transform;

	transform.x = x;
	transform.y = y;
	transform.k = k;

	redraw();
};

onDragStart = ({ active }) => {
	if (!active) {
		simulation.alphaTarget(0.3).restart();
	};
};

onDragMove = ({ subjectId, active, x, y }) => {
	if (!subjectId) {
		return;
	};

	const d = nodes.find((it) => it.id == subjectId);
	if (d) {
		d.fx = transform.invertX(x) - d.radius / 2;
		d.fy = transform.invertY(y) - d.radius / 2;
		redraw();
	};
};

onDragEnd = ({ active }) => {
	if (!active) {
		simulation.alphaTarget(0);
	};
};

onClick = ({ x, y }) => {
  	const d = getNodeByCoords(x, y);
	if (d) {
		this.postMessage({ id: 'onClick', node: d });
	};
};

onSelect = ({ x, y }) => {
  	const d = getNodeByCoords(x, y);
	if (d) {
		this.postMessage({ id: 'onSelect', node: d });
	};
};

onMouseMove = ({ x, y }) => {
	const active = nodes.find(d => d.isOver);
	if (active) {
		active.isOver = false;
	};

	const d = getNodeByCoords(x, y);
	if (d) {
		d.isOver = true;
	};

	redraw();
	this.postMessage({ id: 'onMouseMove', node: (d ? d.id : ''), x, y });
};

onContextMenu = ({ x, y }) => {
	const active = nodes.find(d => d.isOver);
	if (active) {
		active.isOver = false;
	};

	const d = getNodeByCoords(x, y);
	if (d) {
		d.isOver = true;
	};

	redraw();
	this.postMessage({ id: 'onContextMenu', node: (d ? d.id : ''), x, y });
};

onAddNode = (data) => {
	const { sourceId, target } = data;
	const id = nodes.length;
	const source = nodes.find(it => it.id == sourceId);

	if (!source) {
		return;
	};

	const node = nameMapper({
		...target,
		index: id, 
		x: source.x + target.radius * 2, 
		y: source.y + target.radius * 2, 
		vx: 1, 
		vy: 1,
	});

	nodes.push(node);

	simulation.nodes(nodes);
	edges.push({ type: EdgeType.Link, source: source.id, target: target.id });

	updateForces();
	restart(0.3);
};

onRemoveNode = ({ ids }) => {
	nodes = nodes.filter(d => !ids.includes(d.id));
	edges = edges.filter(d => !ids.includes(d.source.id) && !ids.includes(d.target.id));
	
	updateForces();
	restart(0.3);
};

onSetEdges = (data) => {
	edges = data.edges.map((d) => {
		return { 
			...d, 
			source: nodes.find(n => d.source == n.id),
			target: nodes.find(n => d.target == n.id),
		};
	});

	updateForces();
	restart(0.3);
};

onSetSelected = ({ ids }) => {
	selected = ids;
};

getNodeByCoords = (x, y) => {
	return simulation.find(transform.invertX(x), transform.invertY(y), 10);
};

restart = (alpha) => {
	simulation.alphaTarget(alpha).restart();
};

resize = (data) => {
	width = data.width;
	height = data.height;
	density = data.density;

	ctx.canvas.width = width * density;
	ctx.canvas.height = height * density;
	ctx.scale(density, density);
	ctx.font = font;
};

onResize = (data) => {
	resize(data);
	redraw();
};

// Utils

const isLayoutHuman = (d) => {
	return d.layout === ObjectLayout.Human;
};

const isLayoutTask = (d) => {
	return d.layout === ObjectLayout.Task;
};

const isLayoutBookmark = (d) => {
	return d.layout === ObjectLayout.Bookmark;
};

const isIconCircle = (d) => {
	return isLayoutHuman(d) || isLayoutTask(d) || isLayoutBookmark(d);
};

const nameCircleIcon = (d) => {
	ctx.save();
	ctx.font = d.font;  
	ctx.fillStyle = Color.iconText;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillText(d.letter, d.x, d.y);
	ctx.restore();
};