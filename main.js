var vertex = `
precision mediump float;

attribute vec2 a_coord;

void main() {
  vec2 inverted = a_coord * vec2(1.0, -1.0);
  gl_Position = vec4(inverted, 1.0, 1.0);
}
`;

var fragment = `
precision mediump float;

uniform sampler2D u_tex;
uniform vec2 resolution;

void main() {
  vec2 invertedCoord = gl_FragCoord.xy / resolution.xy;
  invertedCoord.y = 1.0 - invertedCoord.y;
  gl_FragColor = texture2D(u_tex, invertedCoord);
}
`;

var canvas = document.querySelector(".crt");
var gl = new WebGL(canvas);
gl.compileProgram(vertex, fragment);

gl.defineUniform("resolution", 2, "f");
gl.setUniform("resolution", canvas.width, canvas.height);

gl.defineAttribute("a_coord", 2);
gl.setAttribute("a_coord", new Float32Array([-1, -1, 1, 1, 1, -1, -1, -1, -1, 1, 1, 1]));

gl.defineUniform("u_tex", 1, "i");

var img = new Image();
img.src = "./grump.jpg";
img.onload = function() {
  var texture = gl.createTexture(img);
  gl.setUniform("u_tex", texture);
  gl.drawTriangles(2);
}