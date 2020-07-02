var $ = function(el, p = document){ return p.querySelector(el) }

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
var speed = 500

var nodeConnectModal = $('#nodeConnectModal')
var nodeConnectModalBtn = $('.addNodeBtn')
var nodeConnectModalErr = $('.err', nodeConnectModal)
var nodeConnectModalInput = $('input', nodeConnectModal)

var runModal = $("#runModal")
var runModalErr = $('.err', runModal)
var runModalBtn = $(".runBtn")
var algoStart = $("#algoStart")
var algoEnd = $("#algoEnd")
var speedInput = $("#speedInput")



var toastSpecificEl = null;
var toastIsVisible = false;
function toast(txt, cls = ""){
	if(toastIsVisible){
		document.body.removeChild(toastSpecificEl);
		toastSpecificEl = null;
		toastIsVisible = false;
	}
	toastIsVisible = true;
	toastSpecificEl = document.createElement('div');
	if(cls != ""){
		toastSpecificEl.classList = "toast " + cls;
	}else{
		toastSpecificEl.classList = "toast";
	}	
	toastSpecificEl.innerHTML = txt;
	document.body.appendChild(toastSpecificEl);
	setTimeout(function(){
		toastSpecificEl && document.body.removeChild(toastSpecificEl);
		toastSpecificEl = null;
		toastIsVisible = false;
	}, 3000);
}



var drawNode = function(t, x, y, clr){
	c.beginPath()
	c.arc(x, y, r, 0, Math.PI * 2)
	c.fillStyle = "#fff"
	c.fill()
	c.fillStyle = "#000"
	c.fillText(t, x - fontSize / (4 / t.toString().length || 1), y + fontSize / 4);
	c.strokeStyle = clr || "#00C853"
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
			x: size * 0.5,
			y: size * 0.1,
			clr: false
		},
		{
			val: 2,
			x: size * 0.1,
			y: size * 0.4,
			clr: false
		},
		{
			val: 3,
			x: size * 0.9,
			y: size * 0.4,
			clr: false
		},
		{
			val: 4,
			x: size * 0.3,
			y: size * 0.9,
			clr: false
		},
		{
			val: 5,
			x: size * 0.7,
			y: size * 0.9,
			clr: false
		},
		{
			val: 6,
			x: size * 0.5,
			y: size * 0.55,
			clr: false
		}
	]
}
var nodeList = getNodeList()


var getRoutes = function(){
	return [
		[1, 4, false],
		[4, 3, false],
		[2, 5, false],
		[2, 3, false],
		[5, 1, false],
		[6, 1, false],
		[6, 2, false],
		[6, 3, false],
		[6, 4, false],
		[6, 5, false]
		
	]
}
var routes = getRoutes()


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
var connectingNodes = false
var nodeEl = undefined
var handlePos = function(e){
	tx = e.touches[0].clientX
	ty = e.touches[0].clientY
	nodeEl.style.left = tx + "px"
	nodeEl.style.top = ty + "px"
}
$('#addNodeBtn').addEventListener('touchstart', function(e){
	if(addNodeProcessRunning) return
	addNodeProcessRunning = true
	nodeEl = document.createElement('div')
	nodeEl.classList.add('node')
	nodeEl.innerText = nextNode
	container.appendChild(nodeEl)
	handlePos(e)
})
window.addEventListener('touchmove', function(e){
	if(!addNodeProcessRunning || connectingNodes) return
	handlePos(e)
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
	if(nodeList.length < 1){
		nodeList.push({
			val: 1,
			x: tx.toFixed(2) - ox,
			y: ty.toFixed(2) - oy,
			clr: false
		})
		nextNode++
		container.removeChild(nodeEl)
		nodeEl = undefined
		addNodeProcessRunning = false
		nodeConnectModal.classList.remove('active')
		return
	}
	connectingNodes = true
	nodeConnectModal.classList.add('active')
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
		node.clr = false
		addNode(node.val)
	}
	for(var route of routes){
		route[2] = false
		addEdge(route[0], route[1])
	}
}

var delay = function(t){
	return new Promise(function(resolve, reject){
		setTimeout(resolve, t)
	})
}


var highlightEdge = function(start, end){
	var e = routes.find(function(route){
		return route.indexOf(start) > -1 && route.indexOf(end) > -1
	})
	(e && e.length) && (e[2] = "#D50000")
}

var dfs = async function(start, end, visited = []){
	visited.push(start)
	!nodeList[start - 1].clr && (nodeList[start - 1].clr = "#FFC400")
	var dests = list[start]
	for(var dest of dests){
		
		if(dest == end){
			toast("Found: " + dest)
			highlightEdge(start, end)
			nodeList[dest - 1].clr = "#2979FF"
			//return
		}
		if(visited.indexOf(dest) == -1){
			await delay(speed)
			highlightEdge(start, dest)
			dfs(dest, end, visited)
		}
	}
}

var bfs = async function(start, end){
	var queue = [start]
	var visited = []
	!nodeList[start - 1].clr && (nodeList[start - 1].clr = "#FFC400")
	while(queue.length){
		var ap = queue.shift()
		var dests = list[ap]
		for(var dest of dests){
			if(dest === end){
				toast("Found: " + dest)
				highlightEdge(ap, dest)
				nodeList[dest - 1].clr = "#2979FF"
				//return
			}
			if(visited.indexOf(dest) == -1){
				await delay(speed)
				highlightEdge(ap, dest)
				!nodeList[dest - 1].clr && (nodeList[dest - 1].clr = "#FFC400")
				visited.push(dest)
				queue.push(dest)
			}
		}
	}
}

var algo = "bfs"
var setAlgo = function(e){
	algo = e
}


$('#runBtn').addEventListener('click', function(){
	if(nodeList.length < 2){
		toast("You need to have at least 2 nodes to run")
		return
	}
	runModal.classList.add('active')
})
$('#resetBtn').addEventListener('click', function(){
	nodeList = getNodeList()
	routes = getRoutes()
	nextNode = nodeList.length + 1
	speed = 500
	addNodeProcessRunning = false
	nodeEl = undefined
})




nodeConnectModalBtn.addEventListener('click', function(){
	var val = nodeConnectModalInput.value
	if(!val || !val.trim()){
		nodeConnectModalErr.innerText = "Enter atleast one node to connect with."
		return
	}
	if(!(/^[0-9 ,]+$/.test(val))){
		nodeConnectModalErr.innerText = "Unacceptable input."
		return
	}
	try{
		indexes = val.toString().trim().split(",")
		for(var i of indexes){
			i = parseInt(i.trim())
			if(i < 1 || i > nextNode - 1){
				toast("Could not connect with node " + i)
				continue
			}
			routes.push([i, nextNode, false])
		}
	}catch(e){
		nodeConnectModalErr.innerText = e
	}
	nodeList.push({
		val: nextNode,
		x: tx.toFixed(2) - ox,
		y: ty.toFixed(2) - oy,
		clr: false
	})
	nodeConnectModalErr.innerText = ""
	nodeConnectModalInput.value = ""
	nextNode++
	container.removeChild(nodeEl)
	nodeEl = undefined
	addNodeProcessRunning = false
	connectingNodes = false
	nodeConnectModal.classList.remove('active')
})

runModalBtn.addEventListener('click', function(){
	var s = algoStart.value
	var e = algoEnd.value
	if(!s || !s.trim() || !e || !e.trim()){
		runModalErr.innerText = "Fill in all fields"
		return
	}
	try{
		s = parseInt(s.trim())
		e = parseInt(e.trim())
	}catch(e){
		runModalErr.innerText = e
		return
	}
	if(s < 1 || s > nextNode - 1){
		runModalErr.innerText = "Starting node is out of range"
		return
	}
	if(e < 1 || e > nextNode - 1){
		runModalErr.innerText = "Ending node is out of range"
		return
	}
	if(s == e){
		runModalErr.innerText = "Enter unique starting and ending node"
		return
	}
	runModalErr.innerText = ""
	try{
		speed = parseInt(speedInput.value)
		init() 
		if(algo == "bfs"){
			bfs(s, e)
		}else{
			dfs(s, e)
		}
	}catch(e){
		toast(e)
	}
	runModal.classList.remove('active')
})



$('#emptyBtn').addEventListener('click', function(){
	nodeList = []
	routes = []
	nextNode = 1
})