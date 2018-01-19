/* Anna and Sophia
 * This class contains the code to produce the grid outlined in FractalDEM
 */

function fractal(x,z) {
    frac = new IslandGenerator(8);
    
    this.name = "fractal";
    this.landscape = frac;
    this.grid = this.landscape.gridSize; 
    
    this.numTriangles = this.grid * this.grid * 2; 
    this.numVertices = this.numTriangles * 3;
    this.scaleX = x/this.grid;
    this.scaleZ = z/this.grid;
    this.scaleY = 3; 
    
    radius = frac.rad;
    
    
    
    scaleXG = this.scaleX;
    scaleZG = this.scaleZ; 
    scaleYG = this.scaleY;
    
    totalX = x;
    totalZ = z; 
    
    //yes these are properly set up. some stuff got flipped around
    flatx = (this.landscape.cityz/256)*z;
    flaty = .1*scaleYG;
    flatz = (this.landscape.cityx/256)*x;

    this.vertices = [];
    this.normals = [];
    this.colors = [];
    this.texCoords = []; 
    
    this.makeTriangles(); 
        
} 

fractal.prototype.makeTriangles = function () {
    for (var j = 0; j < this.grid; j++) {
        for (var i = 0; i < this.grid; i++ ) {
            
            // top triangle in square
            this.vertices.push(vec4(i*this.scaleX, this.landscape.getH(i,j)*this.scaleY, j*this.scaleZ, 1));
            this.vertices.push(vec4((i+1)*this.scaleX, this.landscape.getH(i+1,j)*this.scaleY, j*this.scaleZ, 1));
            this.vertices.push(vec4((i+1)*this.scaleX, this.landscape.getH(i+1, j+1)*this.scaleY, (j+1)*this.scaleZ, 1));
            
            this.colors.push(this.getColor(this.landscape.getH(i,j)));
            this.colors.push(this.getColor(this.landscape.getH(i+1,j)));
            this.colors.push(this.getColor(this.landscape.getH(i+1,j+1)));
            
            this.normals.push(this.calcNormal(i,j));            
            this.normals.push(this.calcNormal(i+1, j));
            this.normals.push(this.calcNormal(i+1, j+1));
                        
            // bottom triangle in square
            this.vertices.push(vec4(i*this.scaleX, this.landscape.getH(i,j)*this.scaleY, j*this.scaleZ, 1));
            this.vertices.push(vec4(i*this.scaleX, this.landscape.getH(i,j+1)*this.scaleY,(j+1)*this.scaleZ, 1)); 
            this.vertices.push(vec4((i+1)*this.scaleX, this.landscape.getH(i+1,j+1)*this.scaleY, (j+1)*this.scaleZ, 1));
            
            this.colors.push(this.getColor(this.landscape.getH(i,j)));
            this.colors.push(this.getColor(this.landscape.getH(i,j+1)));
            this.colors.push(this.getColor(this.landscape.getH(i+1,j+1)));

            this.normals.push(this.calcNormal(i,j));
            this.normals.push(this.calcNormal(i, j+1));
            this.normals.push(this.calcNormal(i+1, j+1));
           

        }
    }
    
    for (var i = 0; i < this.vertices.length; i++) {
        this.texCoords.push(vec2(0,0));

    }
};

fractal.prototype.getColor = function (height) {
    var color = vec4(0.0, 0.0, 0.0, 1.0);
    var div = 255;
    //colors can be entered in standard rgb 0-255 format, just divide all numbers by div
    if (height >= 0.7){ // this is mountian peaks
        color = vec4(244/div, 245/div, 247/div,1.0);
    }

    if ((height >= 0.55) && (height < 0.7)){ //darker rocky mountian area
        color = vec4(196/div, 185/div, 172/div,1.0);
    }
    
    if ((height >= 0.3) && (height < 0.55)){ //evergreen forests
        color = vec4(99/div, 168/div, 99/div,1.0);
    }
    if ((height >= 0.1) && (height < 0.3)){ //lighter deciduous forests
        color = vec4(130/div, 224/div, 130/div, 1.0);
    }
    if ((height >= 0.05) && (height < 0.1)){ //dark, fertile soil
        color = vec4(124/div, 118/div, 91/div,1.0);
    }
    if ((height > 0) && (height < 0.05)){ //sand
        color = vec4(224/div, 217/div, 186/div,1.0);
    }
    if (height === 0){ //water
        color = vec4(29/div, 75/div, 193/div,1.0);
    }
        
    return color;
};

fractal.prototype.calcNormal = function (i,j) {
    var cross1 = subtract(vec4((i+1)*this.scaleX, this.landscape.getH(i+1, j)*this.scaleY,j*this.scaleZ, 1), vec4((i-1)*this.scaleX, this.landscape.getH(i-1, j)*this.scaleY, j*this.scaleZ, 1));
    var cross2 = subtract(vec4(i*this.scaleX, this.landscape.getH(i, j-1)*this.scaleY, (j-1)*this.scaleZ, 1), vec4(i*this.scaleX, this.landscape.getH(i, j+1)*this.scaleY, (j+1)*this.scaleZ, 1));
    var crossed = normalize(cross(cross1, cross2));

    var final = vec4(crossed[0], crossed[1], crossed[2], 0);
    
    return final;
};