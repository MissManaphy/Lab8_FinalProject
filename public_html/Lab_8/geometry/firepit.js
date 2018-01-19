//Sophia 
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function firepit() {
    this.radius = 1;
    this.height = .3;
    
}

firepit.prototype.drawpit = function() {
    stack.push();
    stone.activate();  // activating stone texture
    stack.multiply(scalem(2, 2, 2));
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 0);
    Shapes.drawPrimitive(Shapes.cylinder);
    stack.pop();
};

firepit.prototype.drawfire = function() {
    stack.push();
    fire.activate();  // activating fire texture
    stack.multiply(translate(0, 1, 0));
    stack.multiply(scalem(1.5, 1, 1.5));
    gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
    gl.uniform1i(gl.getUniformLocation(program, "uColorMode"), 0);
    Shapes.drawPrimitive(Shapes.sphere);
    stack.pop();
    
};

firepit.prototype.draw = function() {
    this.drawpit();
    this.drawfire();
};



