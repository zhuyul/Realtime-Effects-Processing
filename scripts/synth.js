// The following skeleton for synth belongs to: 
// Keyboard from http://stuartmemo.com/qwerty-hancock/

var keyboard = new QwertyHancock({
     id: 'keyboard',
     width: 600,
     height: 150,
     octaves: 2
});

var context = new AudioContext(),
    masterVolume = context.createGain(),
	vca = context.createGain(),    
	oscillators = {};

// Set the ADSR;
var a = 0,
	d = 0,
	s = 1,
	r = 0.1;

masterVolume.gain.value = 0.2;

vca.connect(masterVolume);
masterVolume.connect(context.destination);

/*VOLUME*/

// Reference to volume: http://webaudioapi.com/samples/volume/
changeVolume = function(element) {
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  // Let's use an x*x curve (x-squared) since simple linear (x) does not
  // sound as good.
  masterVolume.gain.value = fraction * fraction;
}

/*CONTROL PANELS: ADSR & Wave Type & Pitch*/
var waveType1 = document.querySelector('.wavetype1');
var waveType2 = document.querySelector('.wavetype2');
var Attack = document.querySelector('.eg-attack');
var Decay = document.querySelector('.eg-decay');
var Sustain = document.querySelector('.eg-sustain');
var Release = document.querySelector('.eg-release');
var Pitch1 = document.querySelector('.Pitch1');
var Pitch2 = document.querySelector('.Pitch2');
var Vibrato = document.querySelector(".Vibrato");

var FadeIn = document.getElementById("FadeIn");
var FadeOut = document.getElementById("FadeOut");


// Sets the adsr
Attack.oninput = function () {
    a = Attack.value;
}

Decay.oninput = function () {
    d = Decay.value;
}

Sustain.oninput = function () {
    s = Sustain.value;
}

Release.oninput = function () {
    r = Release.value;
}

// Envelope Generator Function
function envGenOn(vcaGain, a, d, s) {
    var now = context.currentTime;
    vcaGain.cancelScheduledValues(0);
    vcaGain.setValueAtTime(0, now);
    vcaGain.linearRampToValueAtTime(1, now + parseFloat(a));
    vcaGain.linearRampToValueAtTime(parseFloat(s), now + parseFloat(a) + parseFloat(d));
}

function envGenOff(vcaGain, r) {
    var now = context.currentTime;
    vcaGain.cancelScheduledValues(0);
    vcaGain.setValueAtTime(vcaGain.value, now);
    vcaGain.linearRampToValueAtTime(0, now + parseFloat(r));
}


function startItF(final) {
    masterVolume.gain.setValueAtTime( 0.0, context.currentTime ); // set initial volume
    masterVolume.gain.linearRampToValueAtTime( final, context.currentTime+2 );
}

function stopItF(final) {
    masterVolume.gain.setValueAtTime( 1.0, context.currentTime );
    masterVolume.gain.linearRampToValueAtTime( final, context.currentTime+2 );
}


/*PIANO KEYBOARD FUNCTIONALITY*/
keyboard.keyDown = function (note, frequency) {
    var osc = context.createOscillator();
    var osc2 = context.createOscillator();

    
    if (Vibrato.value == 'true'){
        
        var modulatorOscillator = context.createOscillator();
        modulatorOscillator.frequency.value = 6; //desired vibrato rate
        var modulatorGain = context.createGain();
        modulatorGain.gain.value = 20;
        
        modulatorOscillator.connect( modulatorGain );
        modulatorGain.connect( osc.frequency );
        modulatorOscillator.start();
    }
    
    
    if (FadeIn.value != ""){
        startItF(FadeIn.value);
    }
    else{
    	masterVolume.gain.setValueAtTime( 0.2, context.currentTime + 0.1  );
    }
    if (FadeOut.value != ""){
        stopItF(FadeOut.value);
    }
    else {
    	masterVolume.gain.setValueAtTime( 0.2, context.currentTime + 0.1 );

    }

    
    osc.frequency.value = frequency * Pitch1.value;
    osc.type = waveType1.value;
    osc.detune.value = -10;

    osc2.frequency.value = frequency * Pitch2.value;
    osc2.type = waveType2.value;
    osc2.detune.value = 10;
	envGenOn(vca.gain, a, d, s);

	osc.connect(vca);
	osc2.connect(vca);
	
	vca.connect(masterVolume);

	
    masterVolume.connect(context.destination);

    oscillators[frequency] = [osc, osc2];

    osc.start(context.currentTime);
    osc2.start(context.currentTime);


};

keyboard.keyUp = function (note, frequency) {

    oscillators[frequency].forEach(function (oscillator) {
		envGenOff(vca.gain, r)
        oscillator.stop(context.currentTime);
    });
};


//// setVolume should be the current volume ( relates to change volume feature )
//function fadeIn (myAudio, setVolume){
//    if (myAudio.volume){
//        var num = 0;
//        var increaseRate = 0.1;
//        //var setVolume = 0.2;
//        myAudio.volume = num;
//        var fadeinaudio = setInterval(function(){
//                                      num += increaseRate;
//                                      if(num.toFixed(1) >= setVolume){
//                                      clearInterval(fadeinaudio);
//                                      };
//                                      }, 50);
//    };
//};
//
//function fadeOut (myAudio, currentVolume){
//    if (myAudio.volume){
//        var num = currentVolume;
//        var decreseRate = 0.1;
//        var setVolume = 0;
//        myAudio.volume = num;
//        var fadeoutaudio = setInterval(function(){
//                                       num -= decreseRate;
//                                       if(num.toFixed(1) <= setVolume){
//                                       clearInterval(fadeoutaudio);
//                                       };
//                                       }, 50);
//    };
//};

