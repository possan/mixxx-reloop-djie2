// Reloop Digital Jockey Interface Edition 2 controller script
// Based on Tobias Rafreider work
// Modified by Per-Olov Jernberg - Added looping 

function RDJIE() {}

var ON = 0x7F;
var OFF = 0x00;

var DOWN = 0x7F;
var UP = 0x00;

var FINE = 0;
var SCRATCH = 1;
var SEARCH = 2;

RDJIE.jogmode1 = FINE;
RDJIE.jogmode1 = FINE;

RDJIE.scratchModeChannel1 = false;
RDJIE.scratchModeChannel2 = false;

RDJIE.searchModeChannel1 = false;
RDJIE.searchModeChannel2 = false;

//boolean value that indicated if CUP LED is active
RDJIE.CUP_Button1_IsActive = false;
RDJIE.CUP_Button2_IsActive = false;

RDJIE.init = function(id){
    //print ("Initalizing Reloop Digital Jockey 2 Controler Edition.");
  RDJIE.resetLEDs();

  engine.connectControl("[Channel1]","play","RDJIE.isChannel1_Playing");
  engine.connectControl("[Channel2]","play","RDJIE.isChannel2_Playing");
  
  engine.connectControl("[Channel1]","cue_default","RDJIE.isChannel1_Cue_Active");
  engine.connectControl("[Channel2]","cue_default","RDJIE.isChannel2_Cue_Active");
  
  engine.connectControl("[Channel1]","filterHighKill","RDJIE.OnFilterHigh_KillButton1");
  engine.connectControl("[Channel1]","filterLowKill","RDJIE.OnFilterLow_KillButton1");
  engine.connectControl("[Channel1]","filterMidKill","RDJIE.OnFilterMid_KillButton1");
  
  engine.connectControl("[Channel2]","filterHighKill","RDJIE.OnFilterHigh_KillButton2");
  engine.connectControl("[Channel2]","filterLowKill","RDJIE.OnFilterLow_KillButton2");
  engine.connectControl("[Channel2]","filterMidKill","RDJIE.OnFilterMid_KillButton2");
  
  engine.connectControl("[Channel1]","pfl","RDJIE.OnPFL_Button1");
  engine.connectControl("[Channel2]","pfl","RDJIE.OnPFL_Button2");
  
  //Looping
  engine.connectControl("[Channel1]","loop_enabled","RDJIE.LoopActiveLED1");
  engine.connectControl("[Channel2]","loop_enabled","RDJIE.LoopActiveLED2");
  
  //Key Lock
  engine.connectControl("[Channel1]","keylock","RDJIE.OnKeyLockChange1");
  engine.connectControl("[Channel2]","keylock","RDJIE.OnKeyLockChange2");
}
RDJIE.resetLEDs = function(){

  //Turn all LEDS off 
  midi.sendShortMsg(0x90, 0x19, OFF);   // Turn on the Play LED1 off
  midi.sendShortMsg(0x90, 0x17, OFF); //Turn CUP LED1 off
  midi.sendShortMsg(0x90, 0x18, OFF); //Turn CUE LED1 off
  midi.sendShortMsg(0x90, 0x5, OFF); //Turn PFL LED off
  midi.sendShortMsg(0x90, 0x14, OFF); //HighFilterKill
  midi.sendShortMsg(0x90, 0x15, OFF); //MidFilterKill
  midi.sendShortMsg(0x90, 0x16, OFF); //LowFilterKill
  midi.sendShortMsg(0x90, 0x1B, OFF); //disable scratch control
  midi.sendShortMsg(0x90, 0x1A, OFF); //disable search control
  midi.sendShortMsg(0x90, 0x1C, OFF); //disable fx dry/wet control
  midi.sendShortMsg(0x90, 0x02, OFF); //disable key lock deck 1
  
  
  midi.sendShortMsg(0x90, 0x55, OFF);   // Turn on the Play LED2 off
  midi.sendShortMsg(0x90, 0x53, OFF); //Turn CUP LED2 off
  midi.sendShortMsg(0x90, 0x54, OFF); //Turn CUE LED2 off
  midi.sendShortMsg(0x90, 0x41, OFF); //Turn PFL LED off
  midi.sendShortMsg(0x90, 0x50, OFF); //HighFilterKill
  midi.sendShortMsg(0x90, 0x51, OFF); //MidFilterKill
  midi.sendShortMsg(0x90, 0x52, OFF); //LowFilterKill
  midi.sendShortMsg(0x90, 0x57, OFF); //disable scratch control
  midi.sendShortMsg(0x90, 0x56, OFF); //disable search control
  midi.sendShortMsg(0x90, 0x58, OFF); //disable fx dry/wet control
  midi.sendShortMsg(0x90, 0x3E, OFF); //disable key lock deck 2
}
RDJIE.shutdown = function(id){
 //Turn all LEDs off by using init function
 RDJIE.resetLEDs();
}
 // Play button deck 1
RDJIE.playButton1 = function (channel, control, value) {
  RDJIE.playTrack(1, control, value);  
}
// Play Button deck 2
RDJIE.playButton2 = function (channel, control, value) {
  RDJIE.playTrack(2, control, value);
}
RDJIE.playTrack = function (channel, control, value) {
  //If no song is loaded
   if (engine.getValue("[Channel"+channel+"]", "duration") == 0) { 
      return; 
  };
  //If a CUP is active, PlayButtons are disabled
  var isCupActive = engine.getValue("[Channel"+channel+"]","cue_default");
  if(isCupActive == true)
    return;
    
  var currentlyPlaying = engine.getValue("[Channel"+channel+"]","play");
  /*
   * We immediately want to start and stop playing as soon as play button has been pressed
   * KeyUp events are out of interest in this case
   */
  if(value == DOWN){
    
    if (currentlyPlaying == 1) {    // If currently playing
      engine.setValue("[Channel"+channel+"]","play",0);    // Stop
      midi.sendShortMsg(0x90, control, OFF);    // Turn off the Play LED
    }
    else {    // If not currently playing,
      engine.setValue("[Channel"+channel+"]","play",1);    // Start
      midi.sendShortMsg(0x90, control, ON);    // Turn on the Play LED
    }
  }
}
RDJIE.CueButton1 = function (channel, control, value) {
  RDJIE.Cue(1, control, value);  
}
RDJIE.CueButton2 = function (channel, control, value) {
  RDJIE.Cue(2, control, value);  
}
RDJIE.Cue = function (channel, control, value) {
  //If no song is loaded
  if (engine.getValue("[Channel"+channel+"]", "duration") == 0) { 
      return; 
  };
  midi.sendShortMsg(0x90, control, ON);
  // As soon as we press CUE, execute CUE Logic
  if(value == DOWN){
    engine.setValue("[Channel"+channel+"]","cue_default",1);
    if(channel == 1) {
      midi.sendShortMsg(0x90, 0x19, OFF);   // Turn on the Play LED off
      midi.sendShortMsg(0x90, 0x17, OFF); //Turn CUP LED off
      RDJIE.CUP_Button1_IsActive = false;
    }
    if(channel == 2){
      midi.sendShortMsg(0x90, 0x55, OFF);   // Turn on the Play LED off
      midi.sendShortMsg(0x90, 0x53, OFF); //Turn CUP LED off
      RDJIE.CUP_Button2_IsActive = false;
    }
  
    //Turn CUE LED on
    midi.sendShortMsg(0x90, control, ON);
    
  }
  if(value == UP){
    engine.setValue("[Channel"+channel+"]","cue_default",0);
    //TURN CUE LED OFF
    midi.sendShortMsg(0x90, control, OFF);
    
  }
  
}
RDJIE.CuePlayButton1 = function (channel, control, value) {
  RDJIE.CuePlay(1, control, value);  
}
RDJIE.CuePlayButton2 = function (channel, control, value) {
  RDJIE.CuePlay(2, control, value);  
}
RDJIE.CuePlay = function (channel, control, value) {
  //If no song is loaded
  if (engine.getValue("[Channel"+channel+"]", "duration") == 0) { 
      return; 
  };
  var isCupActive = engine.getValue("[Channel"+channel+"]","cue_default");
  var currentlyPlaying = engine.getValue("[Channel"+channel+"]","play");
  
  // As soon as we press CUP, execute CUP Logic
  if(value == DOWN){
    //If CUP is active, we disable and enable CUP in sequence as a user would do
    if(isCupActive == 1 || currentlyPlaying == 0){
      //print ("isCUPActive" + isCupActive);
      //print ("isPlaying" + currentlyPlaying);
      
      if(isCupActive == 1){ //diable CUP
        engine.setValue("[Channel"+channel+"]","cue_default",0);
        //Turn CUP LED off
        midi.sendShortMsg(0x90, control, OFF);
        midi.sendShortMsg(0x90, 0x55, OFF);   // Turn on the Play LED off
        if(channel == 1)
          RDJIE.CUP_Button1_IsActive = false;
        if(channel == 2)
          RDJIE.CUP_Button2_IsActive = false;
      }
      if(currentlyPlaying == 0){
        engine.setValue("[Channel"+channel+"]","cue_default",1);
        midi.sendShortMsg(0x90, 0x55, OFF); // Turn on the Play LED off
        //Turn CUP LED on
        midi.sendShortMsg(0x90, control, ON);
        if(channel == 1)
          RDJIE.CUP_Button1_IsActive = true;
        if(channel == 2)
          RDJIE.CUP_Button2_IsActive = true;
      }
    }
    else{
      //If track is playing, CUP = CUE
      engine.setValue("[Channel"+channel+"]","cue_default",1);
      engine.setValue("[Channel"+channel+"]","cue_default",0);
      engine.setValue("[Channel"+channel+"]","player",0);
      if(channel == 1) {
        midi.sendShortMsg(0x90, 0x19, OFF);   // Turn on the Play LED off
        midi.sendShortMsg(0x90, 0x17, OFF); //Turn CUP LED off
        RDJIE.CUP_Button1_IsActive = false;
      }
      if(channel == 2){
        midi.sendShortMsg(0x90, 0x55, OFF);   // Turn on the Play LED off
        midi.sendShortMsg(0x90, 0x53, OFF); //Turn CUP LED off
        RDJIE.CUP_Button2_IsActive = false;
      }
    }
    
  }
}
RDJIE.KeyLock1 = function (channel, control, value) {
  RDJIE.KeyLock(1, control, value);  
}
RDJIE.KeyLock2 = function (channel, control, value) {
  RDJIE.KeyLock(2, control, value);  
}
RDJIE.KeyLock = function (channel, control, value) {
  var isKeyLock = engine.getValue("[Channel"+channel+"]","keylock");

  if(value == DOWN){
    if(isKeyLock == 1){
      engine.setValue("[Channel"+channel+"]","keylock",0);
      midi.sendShortMsg(0x90, control, OFF); //Turn LED off
    }
    else{
      engine.setValue("[Channel"+channel+"]","keylock",1);
      midi.sendShortMsg(0x90, control, ON); //Turn LED off
    }
  }
}
RDJIE.EnableHeadPhone1 = function (channel, control, value) {
  RDJIE.EnableHeadPhone(1, control, value);
}
RDJIE.EnableHeadPhone2 = function (channel, control, value) {
  RDJIE.EnableHeadPhone(2, control, value);
}
RDJIE.EnableHeadPhone = function (channel, control, value) {
  var isHeadPhoneActive = engine.getValue("[Channel"+channel+"]","pfl");
  //print("Channel"+channel+" isHeadPhoneActive: " + isHeadPhoneActive);
  if(value == DOWN){
    if(isHeadPhoneActive == 1){
      engine.setValue("[Channel"+channel+"]","pfl",0);
      midi.sendShortMsg(0x90, control, OFF); //Turn LED off
    }
    else{
      engine.setValue("[Channel"+channel+"]","pfl",1);
      midi.sendShortMsg(0x90, control, ON); //Turn LED off
    }
  }
}

RDJIE.BassKillChannel1 = function (channel, control, value){
  var deck = 1;
  if(value == DOWN){
    var isKillButtonIsActive = engine.getValue("[Channel"+deck+"]","filterLowKill");
    if(isKillButtonIsActive == true){
      engine.setValue("[Channel"+deck+"]","filterLowKill",0);
      midi.sendShortMsg(0x90, control, OFF);
    }
    else{
      engine.setValue("[Channel"+deck+"]","filterLowKill",1);
      midi.sendShortMsg(0x90, control, ON);
    }
  }
}
RDJIE.MidKillChannel1 = function (channel, control, value){
  var deck = 1;
  if(value == DOWN){
    var isKillButtonIsActive = engine.getValue("[Channel"+deck+"]","filterMidKill");
    if(isKillButtonIsActive == true){
      engine.setValue("[Channel"+deck+"]","filterMidKill",0);
      midi.sendShortMsg(0x90, control, OFF);
    }
    else{
      engine.setValue("[Channel"+deck+"]","filterMidKill",1);
      midi.sendShortMsg(0x90, control, ON);
    }
  }
}

RDJIE.HighKillChannel1 = function (channel, control, value){
  var deck = 1;
  if(value == DOWN){
    var isKillButtonIsActive = engine.getValue("[Channel"+deck+"]","filterHighKill");
    if(isKillButtonIsActive == true){
      engine.setValue("[Channel"+deck+"]","filterHighKill",0);
      midi.sendShortMsg(0x90, control, OFF);
    }
    else{
      engine.setValue("[Channel"+deck+"]","filterHighKill",1);
      midi.sendShortMsg(0x90, control, ON);
    }
  }
}
RDJIE.BassKillChannel2 = function (channel, control, value){
  var deck = 2;
  if(value == DOWN){
    var isKillButtonIsActive = engine.getValue("[Channel"+deck+"]","filterLowKill");
    if(isKillButtonIsActive == true){
      engine.setValue("[Channel"+deck+"]","filterLowKill",0);
      midi.sendShortMsg(0x90, control, OFF);
    }
    else{
      engine.setValue("[Channel"+deck+"]","filterLowKill",1);
      midi.sendShortMsg(0x90, control, ON);
    }
  }
}
RDJIE.MidKillChannel2 = function (channel, control, value){
  var deck = 2;
  if(value == DOWN){
    var isKillButtonIsActive = engine.getValue("[Channel"+deck+"]","filterMidKill");
    if(isKillButtonIsActive == true){
      engine.setValue("[Channel"+deck+"]","filterMidKill",0);
      midi.sendShortMsg(0x90, control, OFF);
    }
    else{
      engine.setValue("[Channel"+deck+"]","filterMidKill",1);
      midi.sendShortMsg(0x90, control, ON);
    }
  }
}
RDJIE.HighKillChannel2 = function (channel, control, value){
  var deck = 2;
  if(value == DOWN){
    var isKillButtonIsActive = engine.getValue("[Channel"+deck+"]","filterHighKill");
    if(isKillButtonIsActive == true){
      engine.setValue("[Channel"+deck+"]","filterHighKill",0);
      midi.sendShortMsg(0x90, control, OFF);
    }
    else{
      engine.setValue("[Channel"+deck+"]","filterHighKill",1);
      midi.sendShortMsg(0x90, control, ON);
    }
  }
}
RDJIE.Scratch1 = function (channel, control, value){
  RDJIE.Scratch(1, control, value);
}
RDJIE.Scratch2 = function (channel, control, value){
  RDJIE.Scratch(2, control, value);
}
RDJIE.Scratch = function (channel, control, value){
  if(value == DOWN){
    if(channel == 1){
      if(RDJIE.scratchModeChannel1 == true){
        RDJIE.scratchModeChannel1 = false;
        midi.sendShortMsg(0x90, control, OFF);
      }
      else{
        RDJIE.scratchModeChannel1 = true;
        midi.sendShortMsg(0x90, control, ON);
      }
    }
    if(channel == 2){
      if(RDJIE.scratchModeChannel2 == true){
        RDJIE.scratchModeChannel2 = false;
        midi.sendShortMsg(0x90, control, OFF);
      }
      else{
        RDJIE.scratchModeChannel2 = true;
        midi.sendShortMsg(0x90, control, ON);   
      }
    }
  }
}

RDJIE.Search1 = function (channel, control, value, status, group){
    if(value == DOWN){
      if(RDJIE.searchModeChannel1 == false){
          RDJIE.searchModeChannel1 = true;
        midi.sendShortMsg(0x90, 0x1A, ON); //Turn LED on
      }
      else{
          RDJIE.searchModeChannel1 = false;
        midi.sendShortMsg(0x90, 0x1A, OFF); //Turn LED off
      }
      //print("Search 1: " + RDJIE.searchModeChannel1);
  }
}
RDJIE.Search2 = function (channel, control, value, status, group){
    if(value == DOWN){
      if(RDJIE.searchModeChannel2 == false){
          RDJIE.searchModeChannel2 = true;
        midi.sendShortMsg(0x90, 0x56, ON); //Turn LED on
      }
      else{
          RDJIE.searchModeChannel2 = false;
        midi.sendShortMsg(0x90, 0x56, OFF); //Turn LED off
      }
      //print("Search 2: " + RDJIE.searchModeChannel2);
  }
}

RDJIE.JogWheel1 = function (channel, control, value){
  RDJIE.JogWheel(1, control, value);
}

RDJIE.JogWheel2 = function (channel, control, value){
  RDJIE.JogWheel(2, control, value);
}

RDJIE.PitchBend1Enabled = false;
RDJIE.PitchBend2Enabled = false;

RDJIE.DisablePitchBending1 = function () {
    if (engine.getValue("[Channel1]", "rate_temp_up"))
  engine.setValue("[Channel1]", "rate_temp_up", 0);
    if (engine.getValue("[Channel1]", "rate_temp_down"))
  engine.setValue("[Channel1]", "rate_temp_down", 0);
    RDJIE.PitchBend1Enabled = false;
}
RDJIE.DisablePitchBending2 = function () {
    if (engine.getValue("[Channel2]", "rate_temp_up"))
  engine.setValue("[Channel2]", "rate_temp_up", 0);
    if (engine.getValue("[Channel2]", "rate_temp_down"))
  engine.setValue("[Channel2]", "rate_temp_down", 0);
    RDJIE.PitchBend2Enabled = false;
}

RDJIE.PitchBend1Timer = 0;
RDJIE.PitchBend2Timer = 0;

RDJIE.PitchBendTimerResolution = 40;
RDJIE.PitchBendSensitivity = 0.00001;

RDJIE.Scratch1Enabled = false;
RDJIE.Scratch2Enabled = false;

RDJIE.DisableScratching1 = function () {
    engine.scratchDisable(1);
    RDJIE.Scratch1Enabled = false;
}
RDJIE.DisableScratching2 = function () {
    engine.scratchDisable(2);
    RDJIE.Scratch2Enabled = false;
}

RDJIE.Scratch1Timer = 0;
RDJIE.Scratch2Timer = 0;

RDJIE.ScratchTimerResolution = 40;

RDJIE.Search1Enabled = false;
RDJIE.Search2Enabled = false;

RDJIE.DisableSearching1 = function () {
    if (engine.getValue("[Channel1]", "fwd"))
  engine.setValue("[Channel1]", "fwd", 0);
    if (engine.getValue("[Channel1]", "back"))
  engine.setValue("[Channel1]", "back", 0);
    RDJIE.Search1Enabled = false;
}
RDJIE.DisableSearching2 = function () {
    if (engine.getValue("[Channel2]", "fwd"))
  engine.setValue("[Channel2]", "fwd", 0);
    if (engine.getValue("[Channel2]", "back"))
  engine.setValue("[Channel2]", "back", 0);
    RDJIE.Search2Enabled = false;
}

RDJIE.Search1Timer = 0;
RDJIE.Search2Timer = 0;

RDJIE.SearchTimerResolution = 40;
RDJIE.SearchSensitivity = 0.01;

RDJIE.JogWheel = function (channel, control, value) {
  /*
   * The JogWheels of the controler work as follows.
   * Spinning around in reverse order produces decimal values of 63 or lower
   * depending on the the speed you drag the wheel.
   * 
   * Spinning around in a forward manner produces values of 65 or higher.
   */
  var jogValue = (value - 64); //RDJIE.WheelSensitivity;
  
  //Functionality of Jog Wheel if we're in scratch mode 
  if(channel == 1){
      if (RDJIE.scratchModeChannel1 == true && RDJIE.searchModeChannel1 == true) {
          var currentlyPlaying = engine.getValue("[Channel1]","play");
          if (currentlyPlaying) {
        var rtu = engine.getValue("[Channel1]", "rate_temp_up");
        var rtd = engine.getValue("[Channel1]", "rate_temp_down");
              if (jogValue > 0) {
                  if (rtd)
          engine.setValue("[Channel1]", "rate_temp_down", 0);
      if (rtu !=1)
          engine.setValue("[Channel1]", "rate_temp_up", 1);
                  
              }
              else if (jogValue < 0) {
                  if (rtu)
          engine.setValue("[Channel1]", "rate_temp_up", 0);
                  if (rtd != 1)
          engine.setValue("[Channel1]", "rate_temp_down", 1);
              }
              else
                  return;
              if (RDJIE.PitchBend1Enabled == false)
        {
      RDJIE.PitchBend1Enabled = true;
      // Start timer1
      RDJIE.PitchBend1Timer = engine.beginTimer(RDJIE.PitchBendTimerResolution, "RDJIE.DisablePitchBending1()", true);
      //print("PitchBend1Timer started!");
        }
        else
        {
      // Restart timer1
      engine.stopTimer(RDJIE.PitchBend1Timer);
      RDJIE.PitchBend1Timer = engine.beginTimer(RDJIE.PitchBendTimerResolution, "RDJIE.DisablePitchBending1()", true);
      //print("PitchBend1Timer restarted!");
        }
          }
          else {
              var playpos = engine.getValue("[Channel1]", "playposition");
        if (jogValue > 0) {
            if (playpos < 1 - RDJIE.PitchBendSensitivity)
                playpos += RDJIE.PitchBendSensitivity;
            else
                playpos = 1;
              }
              else if (jogValue < 0) {
                  if (playpos > RDJIE.PitchBendSensitivity)
                      playpos -= RDJIE.PitchBendSensitivity;
                  else
                      playpos = 0;
              }
              engine.setValue("[Channel1]", "playposition", playpos);
          }
      }
      else if (RDJIE.scratchModeChannel1 == true && RDJIE.searchModeChannel1 == false) {
        if (RDJIE.Scratch1Enabled == false)
        {
            engine.scratchEnable(1, 128, 33+1/3, 1.0/8, (1.0/8)/32);
            RDJIE.Scratch1Enabled = true;
            // Start timer1
            RDJIE.Scratch1Timer = engine.beginTimer(RDJIE.ScratchTimerResolution, "RDJIE.DisableScratching1()", true);
            //print("Scratch1Timer started!");
        }
        else
        {
      engine.scratchTick(1,jogValue);
      // Restart timer1
      engine.stopTimer(RDJIE.Scratch1Timer);
      RDJIE.Scratch1Timer = engine.beginTimer(RDJIE.ScratchTimerResolution, "RDJIE.DisableScratching1()", true);
      //print("Scratch1Timer restarted!");
        }
      }
      else if (RDJIE.scratchModeChannel1 == false && RDJIE.searchModeChannel1 == true) {
    var currentlyPlaying = engine.getValue("[Channel1]","play");
          if (currentlyPlaying) {
        if (jogValue == 0)
      return;
        var fwd = engine.getValue("[Channel1]", "fwd");
        var back = engine.getValue("[Channel1]", "back");
        if (jogValue > 0) {
      if (back)
          engine.setValue("[Channel1]", "back", 0);
      if (fwd != 1)
          engine.setValue("[Channel1]", "fwd", 1);
        }
        else if (jogValue < 0) {
      if (fwd)
          engine.setValue("[Channel1]", "fwd", 0);
      if (back != 1)
          engine.setValue("[Channel1]", "back", 1);
        }
        if (RDJIE.Search1Enabled == false)
        {
      RDJIE.Search1Enabled = true;
      // Start timer1
      RDJIE.Search1Timer = engine.beginTimer(RDJIE.SearchTimerResolution, "RDJIE.DisableSearching1()", true);
      //print("Search1Timer started!");
        }
        else
        {
      // Restart timer1
      engine.stopTimer(RDJIE.Search1Timer);
      RDJIE.Search1Timer = engine.beginTimer(RDJIE.SearchTimerResolution, "RDJIE.DisableSearching1()", true);
      //print("Search1Timer started!");
        }
    }
    else {
        var playpos = engine.getValue("[Channel1]", "playposition");
        if (jogValue > 0) {
            if (playpos < 1 - RDJIE.SearchSensitivity)
                playpos += RDJIE.SearchSensitivity;
            else
                playpos = 1;
        }
        else if (jogValue < 0) {
      if (playpos > RDJIE.SearchSensitivity)
          playpos -= RDJIE.SearchSensitivity;
      else
          playpos = 0;
        }
        engine.setValue("[Channel1]", "playposition", playpos);
    }
      }   
  }
  if(channel == 2){
      if (RDJIE.scratchModeChannel2 == true && RDJIE.searchModeChannel2 == true) {
          var currentlyPlaying = engine.getValue("[Channel2]","play");
          if (currentlyPlaying) {
              var rtu = engine.getValue("[Channel2]", "rate_temp_up");
        var rtd = engine.getValue("[Channel2]", "rate_temp_down");
              if (jogValue > 0) {
                  if (rtd)
          engine.setValue("[Channel2]", "rate_temp_down", 0);
      if (rtu !=1)
          engine.setValue("[Channel2]", "rate_temp_up", 1);
                  
              }
              else if (jogValue < 0) {
                  if (rtu)
          engine.setValue("[Channel2]", "rate_temp_up", 0);
                  if (rtd != 1)
          engine.setValue("[Channel2]", "rate_temp_down", 1);
              }
              else
                  return;
              if (RDJIE.PitchBend2Enabled == false)
        {
      RDJIE.PitchBend2Enabled = true;
      // Start timer2
      RDJIE.PitchBend2Timer = engine.beginTimer(RDJIE.PitchBendTimerResolution, "RDJIE.DisablePitchBending2()", true);
      //print("PitchBend2Timer started!");
        }
        else
        {
      // Restart timer2
      engine.stopTimer(RDJIE.PitchBend2Timer);
      RDJIE.PitchBend2Timer = engine.beginTimer(RDJIE.PitchBendTimerResolution, "RDJIE.DisablePitchBending2()", true);
      //print("PitchBend2Timer restarted!");
        }
          }
          else {
              var playpos = engine.getValue("[Channel2]", "playposition");
        if (jogValue > 0) {
            if (playpos < 1 - RDJIE.PitchBendSensitivity)
                playpos += RDJIE.PitchBendSensitivity;
            else
                playpos = 1;
              }
              else if (jogValue < 0) {
                  if (playpos > RDJIE.PitchBendSensitivity)
                      playpos -= RDJIE.PitchBendSensitivity;
                  else
                      playpos = 0;
              }
              engine.setValue("[Channel2]", "playposition", playpos);
          }
      }
      else if (RDJIE.scratchModeChannel2 == true && RDJIE.searchModeChannel2 == false) {
        if (RDJIE.Scratch2Enabled == false)
        {
            engine.scratchEnable(2, 128, 33+1/3, 1.0/8, (1.0/8)/32);
            RDJIE.Scratch2Enabled = true;
            // Start timer2
            RDJIE.Scratch2Timer = engine.beginTimer(RDJIE.ScratchTimerResolution, "RDJIE.DisableScratching2()", true);
            //print("Scratch2Timer started!");
        }
        else
        {
      engine.scratchTick(2, jogValue);
      // Restart timer2
      engine.stopTimer(RDJIE.Scratch2Timer);
      RDJIE.Scratch2Timer = engine.beginTimer(RDJIE.ScratchTimerResolution, "RDJIE.DisableScratching2()", true);
      //print("Scratch2Timer restarted!");
        }
      }
      else if (RDJIE.scratchModeChannel2 == false && RDJIE.searchModeChannel2 == true) {
    var currentlyPlaying = engine.getValue("[Channel2]","play");
          if (currentlyPlaying) {
        if (jogValue == 0)
      return;
        var fwd = engine.getValue("[Channel2]", "fwd");
        var back = engine.getValue("[Channel2]", "back");
        if (jogValue > 0) {
      if (back)
          engine.setValue("[Channel2]", "back", 0);
      if (fwd != 1)
          engine.setValue("[Channel2]", "fwd", 1);
        }
        else if (jogValue < 0) {
      if (fwd)
          engine.setValue("[Channel2]", "fwd", 0);
      if (back != 1)
          engine.setValue("[Channel2]", "back", 1);
        }
        if (RDJIE.Search2Enabled == false)
        {
      RDJIE.Search2Enabled = true;
      // Start timer2
      RDJIE.Search2Timer = engine.beginTimer(RDJIE.SearchTimerResolution, "RDJIE.DisableSearching2()", true);
      //print("Search2Timer started!");
        }
        else
        {
      // Restart timer2
      engine.stopTimer(RDJIE.Search2Timer);
      RDJIE.Search2Timer = engine.beginTimer(RDJIE.SearchTimerResolution, "RDJIE.DisableSearching2()", true);
      //print("Search2Timer started!");
        }
    }
    else {
        var playpos = engine.getValue("[Channel2]", "playposition");
        if (jogValue > 0) {
            if (playpos < 1 - RDJIE.SearchSensitivity)
                playpos += RDJIE.SearchSensitivity;
            else
                playpos = 1;
        }
        else if (jogValue < 0) {
      if (playpos > RDJIE.SearchSensitivity)
          playpos -= RDJIE.SearchSensitivity;
      else
          playpos = 0;
        }
        engine.setValue("[Channel2]", "playposition", playpos);
    }
      }   
  }
}

RDJIE.JogWheel1_Hold = function (channel, control, value){
  
}

RDJIE.JogWheel2_Hold = function (channel, control, value){
  
}
/*****************************************************
 * Put functions here to handle controlobjets functions
 ******************************************************/
RDJIE.isChannel1_Playing = function (value){
    if(value == 0){
      midi.sendShortMsg(0x90, 0x19, OFF);   // Turn on the Play LED1 off
      //midi.sendShortMsg(0x90, 0x17, OFF); //Turn CUP LED1 off
      midi.sendShortMsg(0x90, 0x18, OFF); //Turn CUE LED1 off
    }
    else{ //if deck is playing but not in CUE modus
      if( engine.getValue("[Channel1]","cue_default") == 0){
        midi.sendShortMsg(0x90, 0x19, ON);   // Turn on the Play LED1 on
      }
    } 
}
RDJIE.isChannel2_Playing = function (value){
    if(value == 0){
      midi.sendShortMsg(0x90, 0x55, OFF);   // Turn on the Play LED2 off
      //midi.sendShortMsg(0x90, 0x53, OFF);  //Turn CUP LED2 off
      midi.sendShortMsg(0x90, 0x54, OFF); //Turn CUE LED2 off
    }
    else{
      if( engine.getValue("[Channel2]","cue_default") == 0)
        midi.sendShortMsg(0x90, 0x55, ON);   // Turn on the Play LED2 on
    } 
}
RDJIE.isChannel1_Cue_Active = function (value){
  if(value == 0){
    if(RDJIE.CUP_Button1_IsActive == true)
      midi.sendShortMsg(0x90, 0x17, ON); //Turn CUP LED1 on
    midi.sendShortMsg(0x90, 0x18, OFF); //Turn CUE LED1 off
  }
  else{
    //if CUP LED is active leave, we can switch off CUE Botton
    if(RDJIE.CUP_Button1_IsActive == true){
      midi.sendShortMsg(0x90, 0x18, OFF); //Turn CUE LED1 off
      midi.sendShortMsg(0x90, 0x17, ON); // Turn CUP LED1 on
    }
    else
      midi.sendShortMsg(0x90, 0x18, ON); //Turn CUE LED1 on
    
  }
}

RDJIE.isChannel2_Cue_Active = function (value) {
    
  if(value == 0){
    if(RDJIE.CUP_Button2_IsActive == true)
      midi.sendShortMsg(0x90, 0x53, ON);  //Turn CUP LED2 on
    midi.sendShortMsg(0x90, 0x54, OFF); //Turn CUE LED2 off
  }
  else{
    //if CUP LED is active leave, we can switch off CUE Botton
    if(RDJIE.CUP_Button2_IsActive == true){
      midi.sendShortMsg(0x90, 0x54, OFF); //Turn CUE LED2 off
      midi.sendShortMsg(0x90, 0x53, ON);  //Turn CUP LED2 on
    }
    else
      midi.sendShortMsg(0x90, 0x54, ON); //Turn CUE LED2 on
    
  }
}

RDJIE.SelectNextTrack_or_prevTrack = function (channel, control, value, status) {
  engine.setValue("[Playlist]", (value == 65) ? "SelectNextTrack" : "SelectPrevTrack",1);
}

/*
 * Toggles LED status light on/off if you press kill buttons through Mixxx
 */
RDJIE.OnFilterHigh_KillButton2 = function (value) { midi.sendShortMsg(0x90, 0x50, (value == 1) ? ON : OFF); }
RDJIE.OnFilterMid_KillButton2 = function (value) { midi.sendShortMsg(0x90, 0x51, (value == 1) ? ON : OFF); }
RDJIE.OnFilterLow_KillButton2 = function (value) { midi.sendShortMsg(0x90, 0x52, (value == 1) ? ON : OFF); }

RDJIE.OnFilterHigh_KillButton1 = function (value) { midi.sendShortMsg(0x90, 0x14, value == 1 ? ON : OFF); }
RDJIE.OnFilterMid_KillButton1 = function (value) { midi.sendShortMsg(0x90, 0x15, (value == 1) ? ON : OFF); }
RDJIE.OnFilterLow_KillButton1 = function (value) { midi.sendShortMsg(0x90, 0x16, (value == 1) ? ON : OFF); }

RDJIE.OnPFL_Button1 = function (value) { midi.sendShortMsg(0x90, 0x05, (value == 1) ? ON : OFF); }
RDJIE.OnPFL_Button2 = function (value) { midi.sendShortMsg(0x90, 0x41, (value == 1) ? ON : OFF); }

RDJIE.OnKeyLockChange1 = function(value) { midi.sendShortMsg(0x90, 0x02, (value == 1) ? ON : OFF); }
RDJIE.OnKeyLockChange2 = function(value) { midi.sendShortMsg(0x90, 0x3E, (value == 1) ? ON : OFF); }

RDJIE.LoopActiveLED1 = function (value) { midi.sendShortMsg(0x90, 0x12, (value == 1) ? ON : OFF); }
RDJIE.LoopActiveLED2 = function (value) { midi.sendShortMsg(0x90, 0x4E, (value == 1) ? ON : OFF); }

RDJIE.LoopIn = function (channel, control, value, status, group) {
  if(value == DOWN) {
    midi.sendShortMsg(status, control, ON); //Turn LED on
    engine.setValue(group,"loop_in", 1);
  }
  else{
    midi.sendShortMsg(status, control, OFF); //Turn LED on
  }
}
RDJIE.LoopOut = function (channel, control, value, status, group) {
  if(value == DOWN) {
    midi.sendShortMsg(status, control, ON); //Turn LED on
    engine.setValue(group,"loop_out", 1);
  }
  else{
    midi.sendShortMsg(status, control, OFF); //Turn LED on
  }
}
RDJIE.ReloopExit = function (channel, control, value, status, group){
  //if loop is active, we exit the loop
  if(engine.getValue(group,"loop_enabled")){
    engine.setValue(group,"reloop_exit",1);
  }
  else{
    engine.setValue(group,"reloop_exit",0);
  }
}

RDJIE.Autoloop = function(channel, control, value, status, group) {
  if (value == DOWN) {
    engine.setValue(group, "reloop_exit", 1);
    engine.setValue(group, 'beatloop', 4);
  }
  midi.sendShortMsg(status, control, (value == DOWN) ? ON : OFF);
}

RDJIE.LoopLength = function(channel, control, value, status, group) {
  if (value < 0x40) engine.setValue(group, 'loop_halve', 1);
  if (value > 0x40) engine.setValue(group, 'loop_double', 1);
}

RDJIE.Flanger1 = function (channel, control, value, status, group){
  if(value == DOWN){
      var flanger = engine.getValue("[Channel1]", "flanger");
    if(flanger){
        engine.setValue("[Channel1]", "flanger", 0);
        midi.sendShortMsg(0x90, 0xe, OFF); //Turn LED off
    }
    else{
        engine.setValue("[Channel1]", "flanger", 1);
      midi.sendShortMsg(0x90, 0xe, ON); //Turn LED on
    }
  }
}
RDJIE.Flanger2 = function (channel, control, value, status, group){
    if(value == DOWN){
        var flanger = engine.getValue("[Channel2]", "flanger");
      if(flanger){
          engine.setValue("[Channel2]", "flanger", 0);
          midi.sendShortMsg(0x90, 0x45, OFF); //Turn LED off
      }
      else{
          engine.setValue("[Channel2]", "flanger", 1);
        midi.sendShortMsg(0x90, 0x45, ON); //Turn LED on
      }
  }
}
