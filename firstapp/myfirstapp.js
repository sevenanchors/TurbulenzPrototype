/*{{ javascript("jslib/camera.js") }}*/
/*{{ javascript("jslib/floor.js") }}*/
/*{{ javascript("jslib/requesthandler.js") }}*/
/*{{ javascript("jslib/observer.js") }}*/

TurbulenzEngine.onload = function onloadFn()
{
  var intervalID;
  var gd = TurbulenzEngine.createGraphicsDevice({});
	
  var md = TurbulenzEngine.createMathDevice({});

  var camera = Camera.create(md);
  camera.lookAt(md.v3BuildZero(),
                md.v3Build(0, 1, 0),
                md.v3Build(0, 20, 100));

  var floor = Floor.create(gd, md);
	
	var shader = null;
	var technique = null;
	
	// Load Shader
	var requestHandler = RequestHandler.create({});
	requestHandler.request({
		src: 'generic3D.cgfx.json',
		onload: function (shaderJSON)
		{
			var shaderParameters = JSON.parse(shaderJSON);
			shader = gd.createShader(shaderParameters);
			technique = shader.getTechnique('vertexColor3D');
		}
	});
	
	// Technique Parameters
	var techniqueParameters = gd.createTechniqueParameters({
		worldViewProjection: md.m44BuildIdentity()
	});
	
	// Create a vertex buffer for a cube
	var vertLBF = [ -20, -20,  20, 1, 0, 0, 1 ];
	var vertLTF = [ -20,  20,  20, 0, 1, 0, 1 ];
	var vertRTF = [ +20,  20,  20, 0, 0, 1, 1 ];
	var vertRBF = [ +20, -20,  20, 1, 1, 0, 1 ];
	var vertLBB = [ -20, -20, -20, 0, 0, 1, 1 ];
	var vertLTB = [ -20,  20, -20, 1, 1, 0, 1 ];
	var vertRTB = [ +20,  20, -20, 1, 0, 0, 1 ];
	var vertRBB = [ +20, -20, -20, 0, 1, 0, 1 ];
	var vertData = [].concat(
		vertLTF, vertLBF, vertRTF, vertRTF, vertLBF, vertRBF,  // front
		vertRTF, vertRBF, vertRTB, vertRTB, vertRBF, vertRBB,  // right
		vertLTB, vertLBB, vertLTF, vertLTF, vertLBB, vertLBF,  // left
		vertRTB, vertRBB, vertLTB, vertLTB, vertRBB, vertLBB,  // back
		vertLTB, vertLTF, vertRTB, vertRTB, vertLTF, vertRTF,  // top
		vertLBF, vertLBB, vertRBF, vertRBF, vertLBB, vertRBB   // bottom
	);
	var numVerts = vertData.length;
	
	var vertexBuffer = gd.createVertexBuffer({
		numVertices: numVerts,
		attributes: [gd.VERTEXFORMAT_FLOAT3, gd.VERTEXFORMAT_UBYTE4N],
		data: vertData,
	});
	
	// Semantics (bind vertices to shader inputs)
	var semantics = gd.createSemantics([ gd.SEMANTIC_POSITION,
										 gd.SEMANTIC_COLOR ]);
	
	// Up vector
	var upVector = md.v3Build(0, 1, 0);

  function tick()
  {
    if (gd.beginFrame())
    {
      gd.clear([0.0, 0.0, 1.0, 1.0], 1.0, 0.0);
	  camera.updateViewMatrix();
	  camera.updateViewProjectionMatrix();
	  floor.render(gd, camera);
			
		if (technique)
		{
			var angle = (TurbulenzEngine.time / (4 * Math.PI));
			angle = (angle - Math.floor(angle)) * (2 * Math.PI);

			var rotnMtx = md.m33FromAxisRotation(upVector, angle);
			techniqueParameters.worldViewProjection =
				md.m33MulM44(rotnMtx,
							 camera.viewProjectionMatrix,
							 techniqueParameters.worldViewProjection);
		
			gd.setTechnique(technique);
			gd.setTechniqueParameters(techniqueParameters);
		
			gd.setStream(vertexBuffer, semantics);
			gd.draw(gd.PRIMITIVE_TRIANGLES, numVerts, 0);
		}
		
      gd.endFrame();
    }
  }

  intervalID = TurbulenzEngine.setInterval(tick, 1000/60);
};

TurbulenzEngine.onunload = function gameOnunloadFn ()
{
  if (intervalID)
  {
    TurbulenzEngine.clearInterval(intervalID);
  }
  floor = null;
  camera = null;
  md = null;
  gd = null;
};

TurbulenzEngine.onerror = function gameErrorFn (msg)
{
  // Handle the error, using msg to inform the developer
  // what went wrong.

  window.alert(msg);
};