// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the foreground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
    //alpha blending formula on slides, so let's consider alpha = fgOpac
    //alphaf -> alpha foreground
    //alphab -> alpha background
    //c -> color
    // c =alphaf * cf + (1 - alphaf) * alphab * cb / alpha
    // alpha = alphaf + (1 - alphaf) * alphab
    /*bgImg.data[3] = fgOpac + (1 - fgOpac) * bgImg.data[3]
    
    alert(bgImg.data[0])
    alert(bgImg.data[1])
    alert(bgImg.data[2])
    alert(bgImg.data[3])
    alert(fgOpac)*/
    
    
    var bgData = bgImg.data;
    var fgData = fgImg.data;
    var bgWidth = bgImg.width;
    var bgHeight = bgImg.height;
    var fgWidth = fgImg.width;
    var fgHeight = fgImg.height;
    
    for (let fy = 0; fy < fgHeight; fy++) {
        for (let fx = 0; fx < fgWidth; fx++) {  //looping through the fImage
            let bx = fx + fgPos.x;      //and now computing the position of bImage
            let by = fy + fgPos.y;
            
            if (bx < 0 || bx >= bgWidth || by < 0 || by >= bgHeight) {  //when the exercise says "The parts of the foreground image that fall outside of the background image should be ignored"
                continue;
            }
            
            let fgIndex = (fy * fgWidth + fx) * 4;  //index of a pixel is y * width + x, I add the *4 cuz they are stored in 1D array in RGBa format (4 values)
            let bgIndex = (by * bgWidth + bx) * 4;
            
            let alphaf = (fgData[fgIndex + 3] / 255) * fgOpac;  //the alpha value (fgData[3] cuz is the third value of the array RGBa), /255 to normalize 0-1
            let alphab = bgData[bgIndex + 3] / 255;     //same
            let alpha = alphaf + (1 - alphaf) * alphab;     //using slides formula
            
            if (alpha > 0) {            //actually applying alpha blending (slides formula) // c =alphaf * cf + (1 - alphaf) * alphab * cb / alpha
                bgData[bgIndex] = (alphaf * fgData[fgIndex] + (1 - alphaf) * alphab * bgData[bgIndex]) / alpha;                   //R
                bgData[bgIndex + 1] = (alphaf * fgData[fgIndex + 1] + (1 - alphaf) * alphab * bgData[bgIndex + 1]) / alpha;       //G
                bgData[bgIndex + 2] = (alphaf * fgData[fgIndex + 2] + (1 - alphaf) * alphab * bgData[bgIndex + 2]) / alpha;       //B
                bgData[bgIndex + 3] = alpha * 255;                                                                                //alpha
            }
        }
    }
}
