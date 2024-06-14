varying vec2 vUv;

uniform sampler2D uPictureTexture;

uniform float uRows;
uniform float uColumns;
uniform float uOffset;


void main()
{

    


    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    
    float radius = 3.0;
    float deltaY = (modelPosition.y + 2.0);
    float deltaZ = radius - pow((radius*radius - deltaY*deltaY), 0.5);

    modelPosition.z = deltaZ;


    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    // Varyings
    vUv = uv;


}