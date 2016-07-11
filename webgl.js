class WebGL {

  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("webgl");
    this.programs = {};
    this.program = null;

    //add constants to the wrapper
    for (var key in this.context) {
      if (key.match(/^[A-Z_]+$/)) {
        this[key] = this.context[key];
      }
    }
  }

  compileShader(source, type) {
    var gl = this.context;
    var shader = gl.createShader(type == "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var error = gl.getShaderInfoLog(shader);
    if (error) throw error;
    return shader;
  }

  compileVertex(source) {
    return this.compileShader(source, "vertex");
  }

  compileFragment(source) {
    return this.compileShader(source, "fragment");
  }

  linkProgram(v, f) {
    var gl = this.context;
    var program = gl.createProgram();
    var vertex = this.compileVertex(v);
    var fragment = this.compileFragment(f);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    var error = gl.getProgramInfoLog(program);
    if (error) throw error;
    program.uniforms = {};
    program.attributes = {};
    return program;
  }

  compileProgram(name, vector, fragment) {
    if (!fragment) {
      fragment = vector;
      vector = name;
      name = "default";
    }
    var p = this.linkProgram(vector, fragment);
    this.programs[name] = p;
    if (!this.program) this.switchProgram(name);
  }

  switchProgram(name) {
    var p = this.program = this.programs[name];
    this.context.useProgram(p);
  }

  defineUniform(name, length, type) {
    var setter = `uniform${length}${type}`;
    var gl = this.context;
    var location = gl.getUniformLocation(this.program, name);
    this.program.uniforms[name] = function(...values) {
      gl[setter](location, ...values);
    }
  }

  setUniform(name, ...values) {
    this.program.uniforms[name](...values);
  }

  fillBuffer(data, type, drawType) {
    var buffer = this.context.createBuffer();
    this.context.bindBuffer(type || this.context.ARRAY_BUFFER, buffer);
    this.context.bufferData(type || this.context.ARRAY_BUFFER, data, drawType || this.context.STATIC_DRAW);
  }

  defineAttribute(name, length, type, normalize = false, stride = 0, offset = 0) {
    var gl = this.context;
    var location = gl.getAttribLocation(this.program, name);
    this.program.attributes[name] = buffer => {
      this.fillBuffer(buffer);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, length, type || gl.FLOAT, normalize, stride, offset);
    }
  }

  setAttribute(name, data) {
    this.program.attributes[name](data);
  }

  drawTriangles(count, offset = 0) {
    this.context.drawArrays(this.context.TRIANGLES, offset, count * 3);
  }

  createTexture(image, filter = this.context.NEAREST) {
    var gl = this.context;
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    return texture;
  }

  setActiveTexture(texture, index = 0) {
    var gl = this.context;
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
  }

}