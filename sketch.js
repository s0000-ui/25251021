let t = 0.0;
let vel = 0.02;
let num;
let paletteSelected;
let paletteSelected1;
let paletteSelected2;

// 新增：側邊選單相關變數
let sidebarWidth = 220;
let sidebarDiv;
let btn1, btn2, btn3;
let selectedWork = 1;

// 新增：canvas 與滑出行為相關
let cnv; // p5 canvas element
let sidebarVisible = false;
let triggerWidth = 28; // 滑鼠靠近左側時觸發滑出（像素）
let hideMargin = 260;  // 滑開後若滑鼠超出此值則收回（像素）

// 新增：動畫狀態
let sidebarCurrentLeft = 0;
let sidebarTargetLeft = 0;
let animLerp = 0.12; // 動畫平滑參數 (0-1)

function setup() {
    // 建立滿版畫布（canvas 位置會依選單展開/收起動態調整）
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.position(0, 0);
    pixelDensity(2)
    angleMode(DEGREES);
    num = random(100000);
    paletteSelected = random(palettes);
    paletteSelected1 = random(palettes);
    paletteSelected2 = random(palettes);

  // 新增：建立左側白色選單
  sidebarDiv = createDiv();
  sidebarDiv.id("sidebar");
  sidebarDiv.style("position", "fixed");
  sidebarDiv.style("left", "0px");
  sidebarDiv.style("top", "0px");
  sidebarDiv.style("width", sidebarWidth + "px");
  sidebarDiv.style("height", windowHeight + "px");
  sidebarDiv.style("background", "#ffffff");
  sidebarDiv.style("box-shadow", "2px 0 8px rgba(0,0,0,0.15)");
  sidebarDiv.style("padding", "16px");
  sidebarDiv.style("box-sizing", "border-box");
  sidebarDiv.style("z-index", "9999");
  sidebarDiv.style("font-family", "sans-serif");
  // 預設收起：left 設為負值只留一小條觸發區（改為用數值動畫）
  const tabW = 24;
  sidebarCurrentLeft = -(sidebarWidth - tabW);
  sidebarTargetLeft = sidebarCurrentLeft;
  sidebarDiv.style("left", `${sidebarCurrentLeft}px`);
  // 讓 canvas 用絕對定位（位置將由動畫控制）
  cnv.elt.style.position = "absolute";
  cnv.elt.style.left = "0px";

  createElement('h3', '作品選單').parent(sidebarDiv).style("margin","0 0 12px 0");

  btn1 = createButton('作品一').parent(sidebarDiv);
  btn2 = createButton('作品二').parent(sidebarDiv);
  btn3 = createButton('作品三').parent(sidebarDiv);

  // 按鈕樣式
  [btn1, btn2, btn3].forEach(b => {
    b.style("display", "block");
    b.style("width", "100%");
    b.style("margin", "8px 0");
    b.style("padding", "10px");
    b.style("border", "none");
    b.style("text-align", "left");
    b.style("background", "transparent");
    b.style("cursor", "pointer");
    b.style("font-size", "16px");
  });

  // 按下時切換選擇
  btn1.mousePressed(()=> setSelected(1));
  btn2.mousePressed(()=> setSelected(2));
  btn3.mousePressed(()=> setSelected(3));

  // 初始化樣式
  updateButtonStyles();
}

function draw() {
  // 逐幀動畫：lerp current -> target，再把樣式寫回 DOM
  sidebarCurrentLeft = lerp(sidebarCurrentLeft, sidebarTargetLeft, animLerp);
  // 當接近目標時直接對齊（避免無限小差距)
  if (abs(sidebarCurrentLeft - sidebarTargetLeft) < 0.5) sidebarCurrentLeft = sidebarTargetLeft;
  if (sidebarDiv) sidebarDiv.style("left", `${Math.round(sidebarCurrentLeft)}px`);
  // canvas left 跟著滑動
  if (cnv && cnv.elt) {
    const canvasLeft = Math.round(sidebarCurrentLeft >= 0 ? sidebarWidth : 0);
    cnv.elt.style.left = `${canvasLeft}px`;
  }
  
  // 根據滑鼠位置自動顯示或隱藏側邊欄
  // 計算滑鼠相對於整個視窗的 X（若滑鼠在畫布外，mouseX 可能為 undefined）
  let absX = 9999;
  if (typeof mouseX !== 'undefined' && cnv && cnv.elt) {
    absX = mouseX + (cnv.elt.offsetLeft || 0);
  } else if (typeof window.event !== 'undefined' && window.event.clientX) {
    absX = window.event.clientX;
  }
  if (absX <= triggerWidth) {
    showSidebar();
  } else if (absX > hideMargin) {
    hideSidebar();
  }

  randomSeed(num);
  // background("#355070");
  background(bgCol())
  stroke("#355070");
  circlePacking();

  // ----- 新增：畫面中央的半透明白長方形與文字 -----
  push();
  rectMode(CENTER);
  noStroke();
  // 半透明白色長方形（調整為直向）
  const overlayW = min(width * 0.4, 400);  // 寬度較窄
  const overlayH = 200;  // 高度加長
  fill(255, 220); // 白色，alpha 220 (0-255)
  rect(width / 2, height / 2, overlayW, overlayH, 10);

  // 文字（兩行）
  textAlign(CENTER, TOP);
  fill(20, 220); // 深色文字
  textSize(32);
  // 第一行文字
  text("414730472", width / 2, height / 2 - overlayH / 2 + 30);
  // 第二行文字
  text("鍾采穎", width / 2, height / 2 - overlayH / 2 + 80);
  pop();
}

function circlePacking() {
    push();

    translate(width / 2, height / 2)
    let points = [];
    let count = 2000;
    for (let i = 0; i < count; i++) {
        let a = random(360);
        let d = random(width * 0.35);
        let s = random(200);
        let x = cos(a) * (d - s / 2);
        let y = sin(a) * (d - s / 2);
        let add = true;
        for (let j = 0; j < points.length; j++) {
            let p = points[j];
            if (dist(x, y, p.x, p.y) < (s + p.z) * 0.6) {
                add = false;
                break;
            }
        }
        if (add) points.push(createVector(x, y, s));
    }
    for (let i = 0; i < points.length; i++) {

        let p = points[i];
        let rot = random(360);
        push();
        translate(p.x, p.y);
        rotate(rot);
        blendMode(OVERLAY)
        let r = p.z - 5;
        gradient(r)
        shape(0, 0, r)
        pop();
    }
    pop();
 }

function shape(x, y, r) {
    push();
noStroke();
//fill(randomCol())
    translate(x, y);
    let radius = r; //半径
    let nums = 8
    for (let i = 0; i < 360; i += 360 / nums) {
        let ex = radius * sin(i);
        let ey = radius * cos(i);
        push();
        translate(ex,ey)
        rotate(atan2(ey, ex))
        distortedCircle(0,0,r);
    
        pop();
        stroke(randomCol())
        strokeWeight(0.5)
        line(0,0,ex,ey)
        ellipse(ex,ey,2)
    }


    pop();
}

function distortedCircle(x, y, r) {
    push();
    translate(x, y)
    //points
    let p1 = createVector(0, -r / 2);
    let p2 = createVector(r / 2, 0);
    let p3 = createVector(0, r / 2);
    let p4 = createVector(-r / 2, 0)
    //anker
    let val = 0.3;
    let random_a8_1 = random(-r * val, r * val)
    let random_a2_3 = random(-r * val, r * val)
    let random_a4_5 = random(-r * val, r * val)
    let random_a6_7 = random(-r * val, r * val)
    let ran_anker_lenA = r * random(0.2, 0.5)
    let ran_anker_lenB = r * random(0.2, 0.5)
    let a1 = createVector(ran_anker_lenA, -r / 2 + random_a8_1);
    let a2 = createVector(r / 2 + random_a2_3, -ran_anker_lenB);
    let a3 = createVector(r / 2 - random_a2_3, ran_anker_lenA);
    let a4 = createVector(ran_anker_lenB, r / 2 + random_a4_5);
    let a5 = createVector(-ran_anker_lenA, r / 2 - random_a4_5);
    let a6 = createVector(-r / 2 + random_a6_7, ran_anker_lenB);
    let a7 = createVector(-r / 2 - random_a6_7, -ran_anker_lenA);
    let a8 = createVector(-ran_anker_lenB, -r / 2 - random_a8_1);
    beginShape();
    vertex(p1.x, p1.y);
    bezierVertex(a1.x, a1.y, a2.x, a2.y, p2.x, p2.y)
    bezierVertex(a3.x, a3.y, a4.x, a4.y, p3.x, p3.y)
    bezierVertex(a5.x, a5.y, a6.x, a6.y, p4.x, p4.y)
    bezierVertex(a7.x, a7.y, a8.x, a8.y, p1.x, p1.y)
    endShape();
    pop();
}

// 顯示側邊選單（滑出） - 改成設定目標位置以觸發動畫
function showSidebar(){
  if(sidebarVisible) return;
  sidebarVisible = true;
  sidebarTargetLeft = 0;
}

// 隱藏側邊選單（收起） - 改成設定目標位置以觸發動畫
function hideSidebar(){
  if(!sidebarVisible) return;
  sidebarVisible = false;
  const tabW = 24;
  sidebarTargetLeft = -(sidebarWidth - tabW);
}

// 新增：切換作品與更新按鈕顯示
function setSelected(n){
  selectedWork = n;
  // 這裡可以根據 selectedWork 做不同設定，例如更換 palette 或更換參數
  // if(selectedWork === 1) paletteSelected = palettes[0];
  updateButtonStyles();
}

function updateButtonStyles(){
  btn1.style("background", selectedWork === 1 ? "#f0f0f0" : "transparent");
  btn2.style("background", selectedWork === 2 ? "#f0f0f0" : "transparent");
  btn3.style("background", selectedWork === 3 ? "#f0f0f0" : "transparent");
}

// 新增：視窗調整時更新畫布與選單高度（確保動畫變數同步）
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  if(cnv && cnv.elt) {
    // 根據 sidebarVisible 調整 canvas left
    cnv.elt.style.position = 'absolute';
    // 若目前 sidebarTargetLeft 為展開（0），則 canvas 應推右
    cnv.elt.style.left = (sidebarTargetLeft >= 0) ? sidebarWidth + 'px' : '0px';
  }
  if(sidebarDiv) sidebarDiv.style("height", windowHeight + "px");
}
