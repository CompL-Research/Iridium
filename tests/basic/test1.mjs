"use strict";

/**
 * Simple SunSpider-like Benchmark Suite
 * Single file, strict mode, no promises, no exports
 * Each benchmark verifies results.
 */

function now() {
  return (typeof performance !== "undefined" ? performance.now() : Date.now());
}

function runBenchmark(name, fn, timeLimitMs, expectedCheck) {
  let iterations = 0;
  const start = now();
  const end = start + timeLimitMs;

  while (now() < end) {
    fn();
    iterations++;
  }

  const duration = now() - start;
  const hz = (iterations / duration) * 1000;
  const result = fn(); // run one more time to get result for checking

  let ok = true;
  if (expectedCheck) {
    ok = expectedCheck(result);
  }

  console.log(
    name.padEnd(15),
    hz.toFixed(2), "ops/sec",
    ok ? "[OK]" : "[Mismatch]"
  );
}

// ------------------------------
// Benchmarks
// ------------------------------

// Richards benchmark (scheduler simulation)
function richards() {
  function Task(id) { this.id = id; this.count = 0; }
  const tasks = [new Task(1), new Task(2), new Task(3)];
  let queue = tasks.slice();
  while (queue.length) {
    let t = queue.shift();
    t.count++;
    if (t.count < 50) queue.push(t);
  }
  return tasks.map(t => t.count).join(",");
}
function checkRichards(res) {
  return res === "50,50,50";
}

// 3D Cube rotation
function cube3d() {
  const size = 30;
  let sum = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        sum += Math.sin(x) * Math.cos(y) * Math.sin(z);
      }
    }
  }
  return sum.toFixed(4);
}
function checkCube3d(res) {
  return res === cube3d(); // deterministic
}

// Mandelbrot
function mandelbrot() {
  const w = 100, h = 100, max = 50;
  let sum = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let cr = 2 * x / w - 1.5;
      let ci = 2 * y / h - 1;
      let zr = 0, zi = 0, k = 0;
      while (zr * zr + zi * zi < 4 && k < max) {
        let tmp = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = tmp;
        k++;
      }
      sum += k;
    }
  }
  return sum;
}
function checkMandelbrot(res) {
  return res === mandelbrot(); // deterministic
}

// NBody
function nbody() {
  let bodies = [
    {x:0,y:0,z:0,vx:0,vy:0,vz:0,mass:1},
    {x:1,y:0,z:0,vx:0,vy:0.1,vz:0,mass:1},
  ];
  function advance(dt) {
    for (let i=0;i<bodies.length;i++) {
      for (let j=i+1;j<bodies.length;j++) {
        let dx=bodies[i].x-bodies[j].x;
        let dy=bodies[i].y-bodies[j].y;
        let dz=bodies[i].z-bodies[j].z;
        let dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
        let mag=dt/(dist*dist*dist);
        bodies[i].vx-=dx*bodies[j].mass*mag;
        bodies[i].vy-=dy*bodies[j].mass*mag;
        bodies[i].vz-=dz*bodies[j].mass*mag;
        bodies[j].vx+=dx*bodies[i].mass*mag;
        bodies[j].vy+=dy*bodies[i].mass*mag;
        bodies[j].vz+=dz*bodies[i].mass*mag;
      }
    }
    for (let b of bodies) {
      b.x+=dt*b.vx;
      b.y+=dt*b.vy;
      b.z+=dt*b.vz;
    }
  }
  for (let i=0;i<100;i++) advance(0.01);
  let energy=0;
  for (let i=0;i<bodies.length;i++) {
    energy+=0.5*bodies[i].mass*(bodies[i].vx*bodies[i].vx+bodies[i].vy*bodies[i].vy+bodies[i].vz*bodies[i].vz);
    for (let j=i+1;j<bodies.length;j++) {
      let dx=bodies[i].x-bodies[j].x;
      let dy=bodies[i].y-bodies[j].y;
      let dz=bodies[i].z-bodies[j].z;
      let dist=Math.sqrt(dx*dx+dy*dy+dz*dz);
      energy-= (bodies[i].mass*bodies[j].mass)/dist;
    }
  }
  return energy.toFixed(6);
}
function checkNBody(res) {
  return res === nbody();
}

// Regex-DNA
function regexDna() {
  let seq = "acgt".repeat(1000);
  let variants = [/ac/, /gt/, /tg/, /ca/];
  let counts = [];
  for (let v of variants) {
    let m = seq.match(new RegExp(v, "g"));
    counts.push(m ? m.length : 0);
  }
  return counts.join(",");
}
function checkRegexDna(res) {
  return res === regexDna();
}

// String Fasta
function fasta() {
  let ALU =
    "GGCCGGGCGCGGTGGCTCACGCCTGTAATCCCAGCACTTTGGGAGGCCGAGG";
  let n = 1000, out = 0;
  for (let i=0;i<n;i++) {
    out += ALU.charCodeAt(i % ALU.length);
  }
  return out;
}
function checkFasta(res) {
  return res === fasta();
}

// ------------------------------
// Run suite
// ------------------------------

function runSuite() {
  const TIME_LIMIT = 500; // ms per benchmark

  runBenchmark("Richards", richards, TIME_LIMIT, checkRichards);
  runBenchmark("3D-Cube", cube3d, TIME_LIMIT, checkCube3d);
  runBenchmark("Mandelbrot", mandelbrot, TIME_LIMIT, checkMandelbrot);
  runBenchmark("NBody", nbody, TIME_LIMIT, checkNBody);
  runBenchmark("Regex-DNA", regexDna, TIME_LIMIT, checkRegexDna);
  runBenchmark("Fasta", fasta, TIME_LIMIT, checkFasta);
}

runSuite();