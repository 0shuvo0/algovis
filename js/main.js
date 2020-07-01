var $ = function(el){ return document.querySelector(el) }

var container = $('.container')
var graph = $('.graph')
var c = graph.getContext('2d')
var r = 25
var size = Math.min(window.innerWidth, window.innerHeight) - 50
var ox = 25
var oy = ((window.innerHeight - 50) / 2) - (size / 2)
graph.width = size
graph.height = size
var fontSize = 20
c.font = fontSize + "px Poppins";


var drawNode = function(t, x, y, clr){
	c.beginPath()
	c.arc(x, y, r, 0, Math.PI * 2)
	c.fillStyle = "#fff"
	c.fill()
	c.fillStyle = "#000"
	c.fillText(t, x - fontSize / (4 / t.toString().length || 1), y + fontSize / 4);
	c.strokeStyle = clr || "green"
	c.lineWidth = 5
	c.stroke()
	
}
var connectNode = function(n1, n2, clr){
	c.beginPath()
	c.strokeStyle = clr || "#000"
	c.moveTo(n1.x, n1.y)
	c.lineTo(n2.x, n2.y)
	c.lineWidth = 3
	c.stroke()
}

var getNodeList = function(){
	return [
		{
			val: 1,
			x: size * 0.3,
			y: size * 0.1,
			clr: false
		},
		{
			val: 2,
			x: size * 0.4,
			y: size * 0.05,
			clr: false
		},
		{
			val: 3,
			x: size * 0.7,
			y: size * 0.15,
			clr: false
		},
		{
			val: 4,
			x: size * 0.2,
			y: size * 0.3,
			clr: false
		},
		{
			val: 5,
			x: size * 0.2,
			y: size * 0.4,
			clr: false
		},
		{
			val: 6,
			x: size * 0.55,
			y: size * 0.2,
			clr: false
		},
		{
			val: 7,
			x: size * 0.4,
			y: size * 0.32,
			clr: false
		},
		{
			val: 8,
			x: size * 0.8,
			y: size * 0.25,
			clr: false
		},
		{
			val: 9,
			x: size * 0.9,
			y: size * 0.7,
			clr: false
		},
		{
			val: 10,
			x: size * 0.7,
			y: size * 0.45,
			clr: false
		},
		{
			val: 11,
			x: size * 0.3,
			y: size * 0.8,
			clr: false
		},
		
	]
}
var nodeList = getNodeList()

var routes = [
	[1, 2, false],
	[1, 3, false],
	[1, 4, false],
	[2, 3, false],
	[2, 6, false],
	[6, 7, false],
	[7, 4, false],
	[4, 5, false],
	[4, 8, false],
	[10, 11, false],
	[7, 10, false],
	[10, 8, false],
	[10, 9, false],
	[8, 5, false],
	[5, 9, false],
	[6, 4, false]
]
var draw = function(){
	c.clearRect(0, 0, size, size)
	for(var route of routes){
		connectNode(nodeList[route[0] - 1], nodeList[route[1] - 1], route[2]);
	}
	for(var node of nodeList){
		drawNode(node.val, node.x, node.y, node.clr)
	}
	requestAnimationFrame(draw)
}
draw()




var nextNode = nodeList.length + 1
var tx = 200, ty = 200
var addNodeProcessRunning = false
var nodeEl = undefined
$('#addNodeBtn').onclick = function(){
	if(addNodeProcessRunning) return
	addNodeProcessRunning = true
	nodeEl = document.createElement('div')
	nodeEl.classList.add('node')
	nodeEl.innerText = nextNode
	container.appendChild(nodeEl)
}
window.addEventListener('touchmove', function(e){
	if(!addNodeProcessRunning) return
		tx = e.touches[0].clientX
		ty = e.touches[0].clientY
		nodeEl.style.left = tx + "px"
		nodeEl.style.top = ty + "px"
})
window.addEventListener('touchend', function(e){
	if(!addNodeProcessRunning) return
	if(tx < ox){
		tx = ox
	}else if(tx > ox + size){
		tx = size + ox
	}
	if(ty < oy){
		ty = oy
	}else if(ty > oy + size){
		ty = size + oy
	}
	nodeList.push({
		val: nextNode,
		x: tx.toFixed(2) - ox,
		y: ty.toFixed(2) - oy,
		clr: false
	})
	try{
		var indexes = prompt("Connect with node no(s):  ")
		indexes = (indexes && indexes.trim().toString().split(",")) || ["1"]
		for(var i of indexes){
			routes.push([parseInt(i.trim()), nextNode, false])
		}
	}catch(e){
		alert(e)
	}
	nextNode++
	container.removeChild(nodeEl)
	nodeEl = undefined
	addNodeProcessRunning = false
})



var list = {}

var addNode = function(node){
	list[node] = []
}

var addEdge = function(n1, n2){
	list[n1].push(n2)
	list[n2].push(n1)
}

var init = function(){
	list = {}
	for(var node of nodeList){
		addNode(node.val)
	}
	for(var route of routes){
		addEdge(route[0], route[1])
	}
}

var bfs = function(start, end, visited = []){
	visited.push(start)
	nodeList[start - 1].clr = "orange"
	var dests = list[start]
	setTimeout(function(){
	for(var dest of dests){
		if(dest == end){
				var e = routes.find(function(route){
					return route.indexOf(start) > -1 && route.indexOf(end) > -1
				})
				e[2] = "red"
				bfs(dest, end, visited)
			return
		}
		if(visited.indexOf(dest) == -1){
			//setTimeout(function(){
				var e = routes.find(function(route){
					return route.indexOf(start) > -1 && route.indexOf(dest) > -1
				})
				e[2] = "red"
				bfs(dest, end, visited)
			//}, 1000)
		}
	}
	}, 1000)
	return false
}

var run = function(){
	init()
	bfs(1, 11)
}
try{
	run()
}catch(e){
	alert(e)
}