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
    src: CarpetaMusica + "backgroundMusic.mp3",
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

// canvas.style.marginTop = window.innerHeight / 2 - Alto / 2 + "px";

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

    const imagen = new Image();
    imagen.src = CarpetaImagenes + "blackmage.png";
    imagen.onload = () => {
      const Escalado = 0.15;
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
    Contexto.drawImage(this.imagen, this.posicion.x, this.posicion.y, this.ancho, this.alto);
    // Contexto.fillStyle = "red";
    // Contexto.fillRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);
  }

  ActualizarMovimiento() {
    if (this.imagen) {
      this.Dibujar();
      this.posicion.x += this.velocidad.x;
    }
  }
}

class Proyectil {
  constructor({ posicion, velocidad, color = "red" }) {
    this.posicion = posicion;
    this.velocidad = velocidad;
    // this.radio = 3;
    this.ancho = 10;
    this.alto = 10;
    this.color = color;
  }

  DibujarProyectil() {
    Contexto.beginPath();
    // Contexto.arc(this.posicion.x, this.posicion.y, this.radio, 0, Math.PI * 2);
    Contexto.fillRect(this.posicion.x, this.posicion.y, this.ancho, this.alto);
    Contexto.fillStyle = this.color;
    Contexto.fill();
    Contexto.closePath();
  }

  ActualizarProyectil() {
    this.DibujarProyectil();
    this.posicion.x += this.velocidad.x;
    this.posicion.y += this.velocidad.y;
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
        // x: 200,
        // y: 200,
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
  jugador.ActualizarMovimiento();
  if (!juego.termino) {
    enemigo.Dibujar(enemigo.State.getState("enemyidle"));
  } else {
    enemigo.Dibujar(enemigo.State.getState("enemydefeat"));
  }

  proyectiles.forEach((proyectil, index) => {
    if (proyectil.posicion.y + proyectil.ancho + proyectil.alto <= 0) {
      setTimeout(() => {
        proyectiles.splice(index, 1);
        // fin();
      }, 0);
    } else {
      proyectil.ActualizarProyectil();
    }
  });

  proyectiles.forEach((proyectil, index) => {
    // NOTA: Colision circular
    // proyectil.posicion.y - proyectil.radio <= enemigo.posicion.y + enemigo.alto &&
    // proyectil.posicion.x + proyectil.radio >= enemigo.posicion.x &&
    // proyectil.posicion.x - proyectil.radio <= enemigo.posicion.x + enemigo.ancho
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
            x: jugador.posicion.x + jugador.ancho / 2.5,
            y: jugador.posicion.y,
          },
          velocidad: {
            x: 0,
            y: -10,
          },
          color: "blue",
        })
      );
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
    default:
      break;
  }
});
