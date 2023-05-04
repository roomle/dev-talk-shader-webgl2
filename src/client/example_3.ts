{
    const canvas = document.getElementById("webgl_canvas_3") as HTMLCanvasElement
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext

    const vertexShaderSource = 
    `#version 300 es
    in vec3 attributePos;
    in vec3 attributeNormal;
    in vec2 attributeUV;
    out vec3 position;
    out vec3 normal;
    out vec2 uv;
    uniform mat4 projection;
    uniform mat4 view;
    uniform mat4 model;
    void main()
    {
        vec4 viewPos = view * model * vec4(attributePos, 1.0);
        position = viewPos.xyz;
        normal = inverse(transpose(mat3(view * model))) * attributeNormal;
        uv = attributeUV;
        gl_Position = projection * viewPos;
    }
    `

    const fragmentShaderSource = 
    `#version 300 es
    precision mediump float;
    in vec3 position;
    in vec3 normal;
    in vec2 uv;
    uniform sampler2D tex;
    out vec4 fragColor;
    void main()
    {
        vec4 color = texture(tex, uv);
        vec3 dirToLight = normalize(vec3(1.0, 1.0, 1.0));
        // bidirectional reflectance distribution function: Blinn-Phong
        float diffuse = max(0.0, dot(dirToLight, normalize(normal)));
        float specular = pow(max(0.0, dot(normalize(normal), normalize(-position + dirToLight))), 100.0);
        fragColor = vec4(color.rgb * (0.2 + diffuse * 0.8 + specular * 1.0), color.a);
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
    const normalAttribLoc = gl.getAttribLocation(shaderProgram, "attributeNormal")
    const uvAttribLoc = gl.getAttribLocation(shaderProgram, "attributeUV")
    const projectionLoc = gl.getUniformLocation(shaderProgram, "projection") as WebGLUniformLocation;
    const viewLoc = gl.getUniformLocation(shaderProgram, "view") as WebGLUniformLocation;
    const modelLoc = gl.getUniformLocation(shaderProgram, "model") as WebGLUniformLocation;
    const texLoc = gl.getUniformLocation(shaderProgram, "tex") as WebGLUniformLocation;
    gl.useProgram(shaderProgram)

    const vao = gl.createVertexArray() as WebGLVertexArrayObject;
    gl.bindVertexArray(vao);
    const attributes: number[] = []
    const noSeg = 32;
    const noStack = 16;
    for (let i = 0; i <= noStack; i++) {
        for (let j = 0; j <= noSeg; j++) {
            const theta = i * Math.PI / noStack;
            const phi = j * 2 * Math.PI / noSeg;
            const x = Math.cos(phi) * Math.sin(theta);
            const y = Math.cos(theta);
            const z = Math.sin(phi) * Math.sin(theta);
            const u = j * 2 / noSeg;
            const v = i / noStack;
            attributes.push(x, y, z, x, y, z, u, v);
        }
    }
    const indices: number[] = [];
    for (let i = 0; i < noStack; i++) {
        for (let j = 0; j < noSeg; j++) {
            const first = i * (noSeg + 1) + j;
            const second = first + noSeg + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }
    const vbo = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(attributes), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttribLoc);
    gl.vertexAttribPointer(posAttribLoc, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(uvAttribLoc);
    gl.vertexAttribPointer(normalAttribLoc, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(normalAttribLoc);
    gl.vertexAttribPointer(uvAttribLoc, 2, gl.FLOAT, false, 32, 24);
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
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

    function animate(dt: number) {
        const s = Math.sin(dt / 1000);
        const c = Math.cos(dt / 1000);
        const n = 0.1;
        const f = 10;
        const t = 1/Math.tan(Math.PI/8);
        gl.clearColor(0, 0, 0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniformMatrix4fv(projectionLoc, false, [t,0,0,0, 0,t,0,0, 0, 0,-(f+n)/(f-n),-1, 0,0,-2*f*n/(f-n),0]);
        gl.uniformMatrix4fv(viewLoc, false, [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,-5,1]);
        gl.uniformMatrix4fv(modelLoc, false, [c,0,s,0, 0,1,0,0, -s,0,c,0, 0,0,0,1]);
        gl.uniform1i(texLoc, 0);
        gl.enable(gl.DEPTH_TEST);
        gl.bindTexture(gl.TEXTURE_2D, to);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
        requestAnimationFrame(animate)
    } 
    animate(0)
}