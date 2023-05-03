{
    const canvas = document.getElementById("webgl_canvas_1") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext

    const vertexShaderSource = 
    `#version 300 es
    in vec2 attributePos;
    out vec2 uv;
    uniform mat2 rotate;
    void main()
    {
        uv =  attributePos + 0.5;
        gl_Position = vec4(rotate * attributePos, 0.0, 1.0);
    }
    `

    const fragmentShaderSource = 
    `#version 300 es
    precision mediump float;
    in vec2 uv;
    out vec4 fragColor;
    void main()
    {
        fragColor = vec4(uv, 0.0, 1.0);
    }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    const shaderProgram = gl.createProgram() as WebGLProgram;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(shaderProgram));
    }

    const posAttribLoc = gl.getAttribLocation(shaderProgram, "attributePos")
    const rotateLoc = gl.getUniformLocation(shaderProgram, "rotate") as WebGLUniformLocation;
    gl.useProgram(shaderProgram)

    const vao = gl.createVertexArray() as WebGLVertexArrayObject;
    gl.bindVertexArray(vao);
    const attributes = [
        -0.5, -0.5,
        0.5, -0.5,
        0.5,  0.5,
        -0.5,  0.5, 
    ]
    const vbo = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(attributes), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 2, gl.FLOAT, false, 8, 0);

    function animate(dt: number) {
        const s = Math.sin(dt / 1000);
        const c = Math.cos(dt / 1000);
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniformMatrix2fv(rotateLoc, false, [c, s, -s, c]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
        requestAnimationFrame(animate)
    }
    animate(0)
}