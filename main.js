var vertex = `
precision mediump float;

uniform vec2 dimensions;
attribute vec2 a_grid;
attribute vec2 a_uv;
varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  vec2 projected = a_grid / dimensions * 2.0 + vec2(-1.0, -1.0);
  vec2 inverted = projected * vec2(1.0, -1.0);
  gl_Position = vec4(inverted, 1.0, 1.0);
}
`;

var fragment = `
precision mediump float;

uniform sampler2D u_tex;
uniform vec2 resolution;
uniform vec2 dimensions;
varying vec2 v_uv;

void main() {
  float charSize = 1.0 / 16.0;
  vec2 uv = v_uv * charSize;
  gl_FragColor = texture2D(u_tex, uv);
}
`;

var makeGrid = function(width, height) {
  var grid = [];
  var charWidth = 1 / width;
  var charHeight = 1 / height;
  for (var h = 0; h < height; h++) {
    for (var w = 0; w < width; w++) {
      var index = h * w + w;
      grid.push(w, h, w, h + 1, w + 1, h);
      grid.push(w, h + 1, w + 1, h + 1, w + 1, h);
    }
  }
  return new Float32Array(grid);
};

var makeText = function(characters) {
  var uv = [];
  var dims = 40 * 25;
  var d = 1;
  for (var i = 0; i < dims; i++) {
    var index = i % 256;
    var x = index % 16;
    var y = Math.floor(index / 16);
    uv.push(x, y, x, y + d, x + d, y);
    uv.push(x, y + d, x + d, y + d, x + d, y);
  }
  return new Float32Array(uv);
}

var page437 = `*☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ `;

var canvas = document.querySelector(".crt");
var gl = new WebGL(canvas);
gl.compileProgram(vertex, fragment);

gl.defineUniform("resolution", 2, "f");
gl.setUniform("resolution", canvas.width, canvas.height);

gl.defineUniform("dimensions", 2, "f");
gl.setUniform("dimensions", 40, 25);

gl.defineAttribute("a_grid", 2);
gl.setAttribute("a_grid", makeGrid(40, 25));

gl.defineAttribute("a_uv", 2);
gl.setAttribute("a_uv", makeText());

gl.defineUniform("u_tex", 1, "i");

var img = new Image();
img.src = "./ascii.png";
img.onload = function() {
  var texture = gl.createTexture(img);
  gl.setUniform("u_tex", texture);
  gl.drawTriangles(40 * 25 * 2);
}