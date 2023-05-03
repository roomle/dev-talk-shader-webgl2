{
    const canvas = document.getElementById("webgl_canvas_2") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext

    const vertexShaderSource = 
    `#version 300 es
    in vec3 attributePos;
    in vec2 attributeUV;
    out vec2 uv;
    uniform mat4 projection;
    uniform mat4 view;
    uniform mat4 model;
    void main()
    {
        uv = attributeUV;
        gl_Position = projection * view * model * vec4(attributePos, 1.0);
    }
    `

    const fragmentShaderSource = 
    `#version 300 es
    precision mediump float;
    in vec2 uv;
    uniform sampler2D tex;
    out vec4 fragColor;
    void main()
    {
        vec4 color = texture(tex, uv);
        fragColor = color;
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
    const uvAttribLoc = gl.getAttribLocation(shaderProgram, "attributeUV")
    const projectionLoc = gl.getUniformLocation(shaderProgram, "projection") as WebGLUniformLocation;
    const viewLoc = gl.getUniformLocation(shaderProgram, "view") as WebGLUniformLocation;
    const modelLoc = gl.getUniformLocation(shaderProgram, "model") as WebGLUniformLocation;
    const texLoc = gl.getUniformLocation(shaderProgram, "tex") as WebGLUniformLocation;
    gl.useProgram(shaderProgram)

    const vao = gl.createVertexArray() as WebGLVertexArrayObject;
    gl.bindVertexArray(vao);
    const attributes = [
        -1,-1,-1, 0,0,
        -1,1,-1, 0,1,
        1,-1,-1, 1,0,
        1,1,-1, 1,1,
        1,-1,1, 0,0,
        1,1,1, 0,1,
        -1,-1,1, 1,0,
        -1,1,1, 1,1,
    ]
    const indices = [0,1,2,3,4,5,6,7,0,1];
    const vbo = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(attributes), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(uvAttribLoc);
    gl.vertexAttribPointer(uvAttribLoc, 2, gl.FLOAT, false, 20, 12);
    const ibo = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    const image = [255,0,0,255, 0,255,0,255, 0,0,255,255, 255,255,0,255];
    const to = gl.createTexture() as WebGLTexture;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, to);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(image));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    function animate(dt: number) {
        const s = Math.sin(dt / 1000);
        const c = Math.cos(dt / 1000);
        const n = 0.1;
        const f = 10;
        const t = 1/Math.tan(Math.PI/8);
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniformMatrix4fv(projectionLoc, false, [t,0,0,0, 0,t,0,0, 0, 0,-(f+n)/(f-n),-1, 0,0,-2*f*n/(f-n),0]);
        gl.uniformMatrix4fv(viewLoc, false, [1,0,0,0, 0,0.707,0.707,0, 0,-0.707,0.707,0, 0,0,-7,1]);
        gl.uniformMatrix4fv(modelLoc, false, [c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1]);
        gl.uniform1i(texLoc, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.bindTexture(gl.TEXTURE_2D, to);
        gl.drawElements(gl.TRIANGLE_STRIP, 10, gl.UNSIGNED_INT, 0);
        requestAnimationFrame(animate)
    } 
    animate(0)
}