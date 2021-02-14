let util = {
	getColorElem() {
		let elem = Math.round(Math.random() * 255).toString(16);
		elem = elem.length === 1 ? 'f'+elem : elem;
		return  parseInt(elem, 16);
	},
	getRandomColor() {
		return [this.getColorElem(), this.getColorElem(), this.getColorElem()]
	}
}

let sCircle = {
	pri: {
		create(props = {}) {
			let {x, y, size, color = []} = props
			fill(...color);
			noStroke();
			circle(x, y, size, size);
		},
		setValue(props) {
			sCircle.pri.create(props);
		},
		defProps(props) {
			let here = sCircle.pri;
			Object.defineProperties(this, {
				x: {
					get() {return props.x;},
					set(v) {
						props.x = v;
						here.setValue(props);
					}
				},
				y: {
					get() {return props.y;},
					set(v) {
						props.y = v;
						here.setValue(props);
					}
				},
				size: {
					get() {return props.size;},
					set(v) {
						props.size = v;
						here.setValue(props);
					}
				},
				color: {
					get() {return props.color;},
					set(v) {
						props.color = v;
						here.setValue(props);
					}
				},
			})
		},
		init(props) {
			this.protoProp = Object.assign({}, props);
			sCircle.pri.defProps.call(this, props);
		}
	}
}
class Circle {
	/**
	 * @param {{
	 *  x: number,
	 *  y: number,
	 *  size: number
	 *  color: number[]
	 * }} props 
	 */
	constructor(props) {
		sCircle.pri.init.call(this, props);
		Object.defineProperty(this, "__initProp__", {
			get() {return props;}
		})
	}
	render() {
		sCircle.pri.create.call(this, this.__initProp__);
	}
}

class Particle {
	/**
	 * 
	 * @param {{
	 *  x: number,
	 *  y: number,
	 *  size: number
	 *  color: number[],
	 *  directionX: number,
	 *  directionY: number
	 * }} props 
	 * @param {object} location 
	 */
	constructor(props) {
		this.initX = props.x;
		this.initY = props.y;
		this.directionX = props.directionX;
		this.directionY = props.directionY;
		this.speed = null;
		this.circle = new Circle(props);
		this.circle.render();
	}
	move(speed) {
		if(this.speed) {
			this.circle.x+=this.directionX*this.speed
			this.circle.y+=this.directionY*this.speed
		}
		else {
			this.speed = speed*30
		}
		this.circle.render();
	}
	reset(rms=10) {
		this.speed = rms*30
		this.directionX = random(-1, 1);
		this.directionY = random(-1, 1);
		this.circle.x = this.initX;
		this.circle.y = this.initY;
		this.circle.size = 10 + rms * 100;
	}
	isOutside() {
		return windowWidth+this.circle.size < this.circle.x 
		? windowHeight+this.circle.size < this.circle.y ? true 
		: this.circle.y+this.circle.size < -1 ? true : false 
		: windowHeight+this.circle.size < this.circle.y ? true 
		: this.circle.y+this.circle.size < -1;
	}
}

let mediaArt = {
	pri: {
		centerCircle: [],
		audio: {
			song: null,
			analyzer: null,
		},
		location: {
			center: {
				x: null,
				y: null
			}
		},
		setCenterCircle(location, count=1, size=100) {
			for(let i=0; i<count; i++) {
				mediaArt.pri.centerCircle.push(
					new Circle({
						x: location.center.x,
						y: location.center.y,
						size: size + (i*30),
						color: util.getRandomColor(),
					})
				);
			}
		},
		renderCenterCircle() {
			let centerCircle = mediaArt.pri.centerCircle;
			for(let i=centerCircle.length-1; 0<=i; i--) {
				centerCircle[i].render();
			}
		},
		renderCanvas() {
			createCanvas(windowWidth, windowHeight);
		},
		setAnalyzer() {
			this.audio.analyzer = new p5.Amplitude();
			this.audio.analyzer.setInput(this.audio.song);
		},
		bounceCircle(rms) {
			let pri = mediaArt.pri;
			if(pri.audio.song.isPlaying) {
				mediaArt.pri.centerCircle.forEach(circle => {
					circle.size = circle.protoProp.size+(rms*120);
					circle.color = circle.protoProp.color.map(color => color+(rms*random(100, 220)))
				});
			}
		},
		flyingParticles(particles, rms) {
			particles.forEach(particle => {
				particle.move(rms*10);
				particle.circle.color = particle.circle
				.protoProp.color.map((color, i) => {
					return i < 3 
					? color+(rms*150)
					: color+(rms*50)+random(10, 50)
				})
				if(particle.isOutside()) {
					particle.reset(rms);
				}
			});
		},
		setCenterLocation() {
			this.location.center.x = width / 2;
			this.location.center.y = height / 2;
		},
		createParticles(location, rms, count) {
			let result = [], color
			for(let i=0; i<count; i++) {
				color = util.getRandomColor();
				color.push(10);
				result.push(new Particle({
					x: location.center.x, 
					y: location.center.y, 
					size: 20 + rms * 200, 
					color,
					directionX: random(-1, 1), 
					directionY: random(-1, 1)
				}, location));
			}
			return result;
		},
		initParticleSpeed(particles) {
			particles.forEach(p => {
				p.speed = 15;
			});
		},
		resetCircleInitLocaltion(location) {
			let pri = mediaArt.pri;
			pri.centerCircle.forEach(circle => {
				circle.x = location.center.x;
				circle.y = location.center.y;
			});
		},
		resetParticlesInitLocaltion(particles, location) {
			particles.forEach(particle => {
				particle.initX = location.center.x;
				particle.initY = location.center.y;
				if(!mediaArt.pri.audio.song.isPlaying()) {
					particle.circle.x = location.center.x;
					particle.circle.y = location.center.y;
				}
			})
		},
		createMusicInfo(composer, title) {
			let musicInfo = document.createElement("div"),
			composerDiv = document.createElement("div"),
			titleDiv = document.createElement("div");
			musicInfo.id = "musicInfo";
			musicInfo.style.top = `${windowHeight-80}px`;
			musicInfo.style.left = "30px"
			musicInfo.onclick = function(e) {
				window.open("https://youtu.be/ZfBhmPCb5xg");
			}

			composerDiv.innerText = composer;
			composerDiv.id = "composer";

			titleDiv.innerText = title;
			titleDiv.id = "title";


			musicInfo.appendChild(composerDiv);
			musicInfo.appendChild(titleDiv);
			document.body.appendChild(musicInfo);
		},
		resetTitle() {
			musicInfo.style.top = `${windowHeight-80}px`;
		}
	},
	main() {
		let pri = mediaArt.pri,
		pf = window, audio = mediaArt.pri.audio, location = mediaArt.pri.location, rms,
		particles = [];

		pf.preload = () => {
			audio.song = loadSound('./src/cosmos.mp3');
		}
		
		pf.setup = () => {
			pri.renderCanvas();
			pri.setAnalyzer();
			pri.setCenterLocation();
			rms = audio.analyzer.getLevel();
			particles = pri.createParticles(location, rms, 400);
			pri.setCenterCircle(location, 5);
			pri.createMusicInfo("natreemu", "- cosmos (youtube link)");
		}
		pf.draw = () => {
			mediaArt.pri.setCenterLocation();
			rms = audio.analyzer.getLevel();
			background(35, 10, 25);
			pri.flyingParticles(particles, rms);
			pri.bounceCircle(rms);
			pri.renderCenterCircle();
		}
		pf.mousePressed = () => {
			if (audio.song.isPlaying()) {
				audio.song.stop();
			} 
			else {
				mediaArt.pri.setAnalyzer();
				audio.song.play();
				pri.initParticleSpeed(particles);
			}
		}
		pf.windowResized = () => {
			pri.renderCanvas();
			pri.resetCircleInitLocaltion(location);
			pri.resetParticlesInitLocaltion(particles, location);
			pri.resetTitle();
		}
	}
}
mediaArt.main();

