const CarpetaImagenes = "assets/images/";
const CarpetaMusica = "assets/music/";
const canvas = document.querySelector("canvas");
const Contexto = canvas.getContext("2d");
const Ancho = (canvas.width = 1000);
const Alto = (canvas.height = 600);
const iniciarpantalla = document.getElementById("iniciarpantalla");
const iniciarboton = document.getElementById("iniciarboton");
const reiniciarpantalla = document.getElementById("reiniciarpantalla");
const reiniciarboton = document.getElementById("reiniciarboton");
Howler.volume(0.2);
const audio = {
  backgroundMusic: new Howl({
    src: CarpetaMusica + "backgroundmusic.mp3",
    loop: true,
  }),
  hurt: new Howl({
    src: CarpetaMusica + "hurt.wav",
  }),
  gameOver: new Howl({
    src: CarpetaMusica + "gameOver.mp3",
  }),
  select: new Howl({
    src: CarpetaMusica + "select.mp3",
  }),
  shoot: new Howl({
    src: CarpetaMusica + "shoot.wav",
  }),
  start: new Howl({
    src: CarpetaMusica + "start.mp3",
  }),
};

class SpriteAnimado {
  constructor(nombreimagen) {
    const imagen = new Image();
    const State = {
      states: {},
      generateState: function (name, row, frameWidth, frameHeight, startIndex, endIndex) {
        if (!this.states[name]) {
          this.states[name] = {
            row: row,
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            frameIndex: startIndex,
            startIndex: startIndex,
            endIndex: endIndex,
          };
        }
      },
      getState: function (name) {
        if (this.states[name]) {
          return this.states[name];
        }
      },
    };
    imagen.src = CarpetaImagenes + nombreimagen + ".png";
    this.imagen = imagen;
    this.State = State;
  }
}

class Jugador {
  constructor() {
    this.velocidad = {
      x: 0,
      y: 0,
    };

    this.angulo = 0;
    this.anguloMov = 0;

    const imagen = new Image();
    imagen.src = CarpetaImagenes + "bfg.png";
    imagen.onload = () => {
      const Escalado = 0.07;
      this.imagen = imagen;
      this.ancho = imagen.width * Escalado;
      this.alto = imagen.height * Escalado;
      this.posicion = {
        x: canvas.width / 2 - this.ancho / 2,
        y: canvas.height - this.alto - 20,
      };
    };
  }

  Dibujar() {
    Contexto.save();
    Contexto.translate(this.posicion.x + this.ancho / 2, this.posicion.y + this.alto / 2);
    Contexto.rotate(this.angulo);
    Contexto.translate(-this.posicion.x - this.ancho / 2, -this.posicion.y - this.alto / 2);
    Contexto.drawImage(this.imagen, this.posicion.x, this.posicion.y, this.ancho, this.alto);
    // Contexto.fillStyle = "red";
    // Contexto.fillRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);
    Contexto.restore();
  }

  Actualizar() {
    if (this.imagen) {
      this.angulo += radianes(this.anguloMov);
      this.posicion.x += this.velocidad.x;
      this.Dibujar();
    }
  }
}

class Proyectil {
  constructor({ posicion, velocidad, angulo, color = "red" }) {
    this.posicion = posicion;
    this.velocidad = velocidad;
    this.angulo = angulo;
    this.ancho = 10;
    this.alto = 10;
    this.color = color;
  }

  Dibujar() {
    Contexto.beginPath();
    Contexto.fillRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);
    Contexto.fillStyle = this.color;
    Contexto.fill();
    Contexto.closePath();
  }

  Actualizar() {
    this.posicion.x += this.velocidad * Math.cos(this.angulo);
    this.posicion.y += this.velocidad * Math.sin(this.angulo);
    this.Dibujar();
  }
}

class Enemigo extends SpriteAnimado {
  constructor(nombreimagen) {
    super(nombreimagen);
    this.imagen.onload = () => {
      const Escalado = 0.15;
      this.ancho = this.imagen.width * Escalado;
      this.alto = this.imagen.height * Escalado;
      this.posicion = {
        x: Math.floor(Math.random() * (canvas.width - 200)),
        y: Math.floor(Math.random() * (canvas.height / 1.6)),
      };
      this.frameIndex = 0;
      this.count = 0;
    };

    this.State.generateState("enemyidle", 0, 127.8, 125, 0, 5);
    // this.State.generateState("enemyimpact", 3, 128, 130, 6, 8);
    this.State.generateState("enemydefeat", 5, 128, 130, 6, 8);
  }

  Dibujar(state) {
    if (typeof this.posicion == "undefined") return;
    if (this.imagen) {
      Contexto.drawImage(
        this.imagen,
        state.frameIndex * state.frameWidth,
        state.row * state.frameHeight,
        state.frameWidth,
        state.frameHeight,
        this.posicion.x,
        this.posicion.y,
        this.ancho,
        this.alto
      );
      // Contexto.fillStyle = "red";
      // Contexto.fillRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);

      this.count++;
      if (this.count > IntervaloFPS) {
        state.frameIndex++;
        this.count = 0;
      }

      if (state.frameIndex > state.endIndex) {
        state.frameIndex = state.startIndex;
      }
    }
  }
}

let fps = 60;
let IntervaloFPS = 0.06 * fps;
let msPrevio = window.performance.now();
let jugador = new Jugador();
let enemigo = new Enemigo("ogre");
let proyectiles = [];
let teclas = {
  a: {
    presionada: false,
  },
  d: {
    presionada: false,
  },
  space: {
    presionada: false,
  },
  x: {
    presionada: false,
  },
  z: {
    presionada: false,
  },
};
let juego = {
  termino: false,
  activo: false,
};

function init() {
  jugador = new Jugador();
  enemigo = new Enemigo("ogre");
  proyectiles = [];
  teclas = {
    a: {
      presionada: false,
    },
    d: {
      presionada: false,
    },
    space: {
      presionada: false,
    },
    x: {
      presionada: false,
    },
    z: {
      presionada: false,
    },
  };
  juego = {
    termino: false,
    activo: true,
  };
}

function fin() {
  audio.gameOver.play();

  // Animacion de derrota enemigo
  setTimeout(() => {
    juego.termino = true;
  }, 0);

  // detiene el juego
  setTimeout(() => {
    juego.activo = false;
    reiniciarpantalla.style.display = "flex";
  }, 2000);
}

function animate() {
  if (!juego.activo) return;
  requestAnimationFrame(animate);
  const msAhora = window.performance.now();
  const transcurrido = msAhora - msPrevio;

  if (transcurrido < IntervaloFPS) return;

  msPrevio = msAhora - (transcurrido % IntervaloFPS); // 3.34

  Contexto.clearRect(0, 0, canvas.width, canvas.height);
  jugador.Actualizar();
  if (!juego.termino) {
    enemigo.Dibujar(enemigo.State.getState("enemyidle"));
  } else {
    enemigo.Dibujar(enemigo.State.getState("enemydefeat"));
  }

  proyectiles.forEach((proyectil, index) => {
    if (
      proyectil.posicion.y + proyectil.ancho + proyectil.alto <= 0 ||
      proyectil.posicion.y >= canvas.height ||
      proyectil.posicion.x >= canvas.width ||
      proyectil.posicion.x + proyectil.ancho + proyectil.alto <= 0
    ) {
      setTimeout(() => {
        proyectiles.splice(index, 1);
        // fin();
      }, 0);
    } else {
      proyectil.Actualizar();
    }
  });

  proyectiles.forEach((proyectil, index) => {
    if (
      proyectil.posicion.y - proyectil.alto <= enemigo.posicion.y + enemigo.alto &&
      proyectil.posicion.x + proyectil.ancho >= enemigo.posicion.x &&
      proyectil.posicion.x - proyectil.ancho <= enemigo.posicion.x + enemigo.ancho
    ) {
      setTimeout(() => {
        proyectiles.splice(index, 1);
        audio.hurt.play();
        fin();
      }, 0);
    }
  });

  if (teclas.a.presionada && jugador.posicion.x >= 9) {
    jugador.velocidad.x = -8;
  } else if (teclas.d.presionada && jugador.posicion.x + jugador.ancho <= canvas.width - 9) {
    jugador.velocidad.x = 8;
  } else {
    jugador.velocidad.x = 0;
  }

  if (teclas.x.presionada) {
    jugador.anguloMov = 3;
  } else if (teclas.z.presionada) {
    jugador.anguloMov = -3;
  } else {
    jugador.anguloMov = 0;
  }
}

function radianes(angulo) {
  return (angulo * Math.PI) / 180;
}

animate();

iniciarboton.addEventListener("click", () => {
  audio.backgroundMusic.play();
  audio.start.play();
  iniciarpantalla.style.display = "none";
  init();
  animate();
});

reiniciarboton.addEventListener("click", () => {
  audio.select.play();
  reiniciarpantalla.style.display = "none";
  init();
  animate();
});

addEventListener("keydown", ({ key }) => {
  if (juego.termino) return;

  switch (key) {
    case "a":
      teclas.a.presionada = true;
      break;
    case "d":
      teclas.d.presionada = true;
      break;
    case " ":
      if (teclas.space.presionada) return;
      teclas.space.presionada = true;

      audio.shoot.play();
      proyectiles.push(
        new Proyectil({
          posicion: {
            x: jugador.posicion.x + jugador.ancho / 2.2,
            y: jugador.posicion.y + jugador.alto / 2.2,
          },
          velocidad: 10,
          angulo: jugador.angulo,
          color: "green",
        })
      );
      break;
    case "x":
      teclas.x.presionada = true;
      break;
    case "z":
      teclas.z.presionada = true;
      break;
    default:
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "a":
      teclas.a.presionada = false;
      break;
    case "d":
      teclas.d.presionada = false;
      break;
    case " ":
      teclas.space.presionada = false;
      break;
    case "x":
      teclas.x.presionada = false;
      break;
    case "z":
      teclas.z.presionada = false;
      break;
    default:
      break;
  }
});
