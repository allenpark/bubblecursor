var numClicksTotal = 0;

var data = "";
var numSamples = 6;
var initBubble = true;
    
var trialSetNum = 0;
var factor = 0.875;
var possibleW = [8*factor, 16*factor, 32*factor];
var possibleEWW = [1.33, 2, 3];
var possibleD = [0, 0.5, 1];
var possibleA = [256*factor, 512*factor, 768*factor];
var getLikertRatings;
$(document).ready(function() {
    var layer1 = document.getElementById('layer1');
    var l1 = layer1.getContext('2d');
    var layer2 = document.getElementById('layer2');
    var l2 = layer2.getContext('2d');
    layer1.width = window.innerWidth - 30;
    layer1.height = window.innerHeight - 40;
    layer2.width = window.innerWidth - 30;
    layer2.height = window.innerHeight - 40;
    var swidth = $('#layer1').width();
    var sheight = $('#layer1').height();
    
    var bubbleOn;
    var setBubble = function(bub) {
        bubbleOn = bub;
        if (bubbleOn) {
            $('canvas').css('cursor', 'none');
        } else {
            $('canvas').css('cursor', 'none');
            //$('canvas').css('cursor', 'auto');
        }
    };
    var amplitude;
    var width;
    var EWWRatio;
    var distractorDensity;
    
    var goal;
    var closestBubble = [0, 0];
    var distractors = [];
    var x;
    var y;
    
    var samplesDone;
    var nextCursor = function(starting) {
        l2.clearRect(0, 0, swidth, sheight);
        if (starting) {
            setBubble(initBubble);
        } else {
            setBubble(!initBubble);
        }
        samplesDone = 0;
        blockNum = 0;
        $('#text').show();
        $('#text').html('Click on the green circle as quickly as you can. After each click, the circles will move around. You will be given some sample runs to get used to your cursor. Click on the green circle to begin.');
        nextBlock();
    };
    
    var ratingTypes = ['DifficultyFirst', 'SatisfactionFirst', 'EfficiencyFirst', 'FrustrationFirst',
                       'DifficultySecond', 'SatisfactionSecond', 'EfficiencySecond', 'FrustrationSecond',];
    getLikertRatings = function() {
        $('#everything').hide();
        $('#ratings').show();
        for (var i = 0; i < ratingTypes.length; i++) {
            var type = ratingTypes[i];
            for (var j = 1; j <= 7; j++) {
                $('#rating' + type).append('<input type="radio" name="' + type + '" value="' + j + '">' + j);
            }
        }
    };
    
    var blockNum;
    var nextBlock = function() {
        if (blockNum >= 1) {
            if (bubbleOn == initBubble) {
                nextCursor(false);
            } else {
                getLikertRatings();
            }
            return false;
        }
        trialSetNum = 0;
        nextTrialSet();
        blockNum ++;
        return true;
    };
    var cross = [];
    for (var i = 0; i < possibleW.length; i++) {
        for (var j = 0; j < possibleEWW.length; j++) {
            for (var k = 0; k < possibleD.length; k++) {
                cross.push([possibleW[i], possibleEWW[j], possibleD[k]]);
            }
        }
    }
    cross = shuffle(cross);
    var Aorder;
    var Anum;
    var nextTrialSet = function() {
        if (samplesDone < numSamples) {
            samplesDone ++;
        } else if (samplesDone == numSamples) {
            blockNum = 0;
            samplesDone ++;
            $('#text').show();
            $('#text').html('Your sample run is done. The directions are reproduced below, if you would like to read them again. Click on the green circle to begin.<br/><br/>Click on the green circle as quickly as you can. After each click, the circles will move around.');
            nextBlock();
            return false;
        }
        if (trialSetNum >= cross.length) {
            nextBlock();
            return false;
        }
        width = cross[trialSetNum][0];
        EWWRatio = cross[trialSetNum][1];
        distractorDensity = cross[trialSetNum][2];
        console.log('width: ' + width + ', EWWRatio: ' + EWWRatio + ' , D: ' + distractorDensity);
        Aorder = [];
        for (var i = 0; i < possibleA.length; i++) {
            for (var j = 0; j < 3; j++) {
                Aorder.push(possibleA[i]);
            }
        }
        Aorder = shuffle(Aorder);
        Anum = -1;
        nextGoal();
        trialSetNum ++;
        return true;
    };
    
    var directionOfGoal;
    var nextGoal = function() {
        if (Anum >= Aorder.length) {
            nextTrialSet();
            return false;
        }
        if (Anum == -1) {
            goal = [swidth/2, sheight/2];
            directionOfGoal = 0;
            placeDistractors();
        } else {
            amplitude = Aorder[Anum];
            console.log('A: ' + amplitude);
            pickGoal();
            placeDistractors();
        }
        
        // draw goal
        l1.clearRect(0, 0, swidth, sheight);
        l1.beginPath();
        l1.fillStyle = '#00FF00';
        l1.arc(goal[0], goal[1], width/2, 0, 2*Math.PI);
        l1.fill();
        
        drawDistractors();
        
        numErrors = 0;
        timeGoalPresented = (new Date()).getTime();
        Anum ++;
    };
    
    var pickGoal = function() {
        do {
            directionOfGoal = Math.random() * 2 * Math.PI;
            goal[0] = x + amplitude * Math.cos(directionOfGoal);
            goal[1] = y + amplitude * Math.sin(directionOfGoal);
        } while (!inBounds(goal));
    };
    
    var inBounds = function(p) {
        var xIn = width/2 <= p[0] && p[0] <= swidth - width/2;
        var yIn = width/2 <= p[1] && p[1] <= sheight - width/2;
        return xIn && yIn;
    };
    
    var placeDistractors = function() {
        distractors = [];
        distractors.push(pointInDirection(goal, width * EWWRatio * 2, directionOfGoal));
        distractors.push(pointInDirection(goal, width * EWWRatio * 2, directionOfGoal + Math.PI / 2));
        distractors.push(pointInDirection(goal, width * EWWRatio * 2, directionOfGoal + Math.PI));
        distractors.push(pointInDirection(goal, width * EWWRatio * 2, directionOfGoal + 3 * Math.PI / 2));
        if (distractorDensity == 0) {
            return;
        }
        var currentLoc = [x, y];
        for (var i = 0; i < 18; i++) {
            var offset = 2 * Math.PI * i / 18;
            var dist = width / (distractorDensity - 0.05);
            var distractorLoc = pointInDirection(currentLoc, dist, directionOfGoal + offset);
            while (inBounds(distractorLoc)) {
                addDistractor(pointInDirection(currentLoc, dist, directionOfGoal + offset + (Math.random() - 0.5) * 2 * Math.PI / 18));
                dist += width / (distractorDensity - 0.05);
                distractorLoc = pointInDirection(currentLoc, dist, directionOfGoal + offset);
            }
        }
    };
    
    var dist = function(p1, p2) {
        var xdiff = p1[0] - p2[0];
        var ydiff = p1[1] - p2[1];
        return Math.sqrt(xdiff * xdiff + ydiff * ydiff);
    };
    
    var addDistractor = function(d) {
        if (dist(goal, d) < width * EWWRatio * 2 + width) {
            return false;
        }
        for (var i = 0; i < distractors.length; i++) {
            if (dist(distractors[i], d) < width) {
                return false;
            }
        }
        distractors.push(d);
        return true;
    };
    
    var pointInDirection = function(origin, distance, angle) {
        var p = [origin[0], origin[1]];
        p[0] += distance * Math.cos(angle);
        p[1] += distance * Math.sin(angle);
        return p;
    };
    
    var drawDistractors = function(dx, dy) {
        for (var i = 0; i < distractors.length; i++) {
            l1.beginPath();
            l1.fillStyle = '#555555';
            l1.arc(distractors[i][0], distractors[i][1], width/2, 0, 2*Math.PI);
            l1.fill();
            l1.beginPath();
            l1.fillStyle = '#FFFFFF';
            l1.lineWidth = width/8;
            l1.arc(distractors[i][0], distractors[i][1], width/2, 0, 2*Math.PI);
            l1.stroke();
        }
    };
    
    var drawBubble = function() {
        var currentLoc = [x, y];
        closestBubble = goal;
        var closestDist = dist(goal, currentLoc);
        var secondClosestBubble = null;
        var secondClosestDist = Number.MAX_VALUE;
        for (var i = 0; i < distractors.length; i++) {
            var d = dist(distractors[i], currentLoc);
            if (d < closestDist) {
                secondClosestDist = closestDist;
                secondClosestBubble = closestBubble;
                closestDist = d;
                closestBubble = distractors[i];
            } else if (d < secondClosestDist) {
                secondClosestDist = d;
                secondClosestBubble = distractors[i];
            }
        }
        var bubbleSize = Math.min(closestDist + width/ 2, secondClosestDist - width/2);
        
        // draw bubble
        l2.clearRect(0, 0, swidth, sheight);
        l2.fillStyle = '#000000';
        l2.globalAlpha = 0.5;
        l2.beginPath();
        l2.arc(x, y, bubbleSize, 0, 2*Math.PI);
        l2.arc(closestBubble[0], closestBubble[1], width/2 + 5, 0, 2*Math.PI);
        l2.fill();
        
        // draw xhair
        l2.globalAlpha = 1;
        var xhairW = 2;
        var xhairH = 5;
        l2.fillRect(x - xhairW, y - xhairH, 2 * xhairW, 2 * xhairH);
        l2.fillRect(x - xhairH, y - xhairW, 2 * xhairH, 2 * xhairW);
        
        // color closest bubble red
        l2.beginPath();
        l2.fillStyle = '#FF0000';
        l2.arc(closestBubble[0], closestBubble[1], width/2, 0, 2*Math.PI);
        l2.fill();
    };
    
    var drawCross = function() {
        l2.clearRect(0, 0, swidth, sheight);
        l2.fillStyle = '#000000';
        l2.globalAlpha = 1;
        l2.beginPath();
        var rect1 = 5;
        var rect2 = 1;
        l2.rect(x-rect1, y-rect2, rect1*2, rect2*2);
        l2.rect(x-rect2, y-rect1, rect2*2, rect1*2);
        l2.fill();
    };
    
    $('#layer2').mousemove(function (e) {
        var rect = layer2.getBoundingClientRect();
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;
        
        if (bubbleOn) {
            drawBubble();
        } else {
            drawCross();
        }
    });
    
    var numErrors;
    var timeGoalPresented;
    $('#layer2').click(function (e) {
        numClicksTotal ++;
        x = e.pageX - this.offsetLeft;
        y = e.pageY - this.offsetTop;
        if ((bubbleOn && closestBubble === goal) ||
            (!bubbleOn && dist([x, y], goal) < width/2)) {
            $('#text').hide();
            if (samplesDone > numSamples && Anum > 0) {
                var timeTaken = (new Date()).getTime() - timeGoalPresented;
                var writeToData = '';
                writeToData += bubbleOn + ',';
                writeToData += blockNum + ',';
                writeToData += trialSetNum + ',';
                writeToData += Anum + ',';
                writeToData += width + ',';
                writeToData += EWWRatio + ',';
                writeToData += distractorDensity + ',';
                writeToData += amplitude + ',';
                writeToData += timeTaken + ',';
                writeToData += numErrors;
                writeToData += '\n';
                data += writeToData;
                var encodedUri = encodeURI(data);
                $('#download').attr('href', encodedUri);
            }
            nextGoal();
        } else {
            numErrors ++;
        }
    });
    
    data = "data:text/csv;charset=utf-8,";
    data += "bubbleOn, blockNum, trialSetNum, goalNum, width, EWWRatio, D, A, time, numErrors\n";
    $('#download').attr('download', 'data.csv');
    $('#download').click(function(e) {
        var writeToData = '';
        for (var i = 0; i < ratingTypes.length; i++) {
            var type = ratingTypes[i];
            writeToData += $('input[name=' + type + ']:checked').val() + ',';
        }
        writeToData += '\n';
        data += writeToData;
        var encodedUri = encodeURI(data);
        $('#download').attr('href', encodedUri);
    });
    nextCursor(true);
});

function shuffle(array) {
  var currentIndex = array.length;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};