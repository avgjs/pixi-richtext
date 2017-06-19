attribute vec2 a_position;
uniform mat3 u_transformation;
void main() {
    gl_Position = vec4((u_transformation * vec3(a_position, 1)).xy, 0, 1);
}