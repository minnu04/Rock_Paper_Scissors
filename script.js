/*
  Enhanced RPS script
  - Keeps the original 5-round game logic untouched
  - Adds UI animations, sound via WebAudio, and extra comments
*/

const choices = ['rock','paper','scissors'];
let playerScore = 0;
let computerScore = 0;
let round = 0;
const maxRounds = 5;

// DOM references
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const roundNumberEl = document.getElementById('round-number');
const resultMessageEl = document.getElementById('result-message');
const roundDetailsEl = document.getElementById('round-details');
const choiceButtons = Array.from(document.querySelectorAll('.choice'));
const playAgainBtn = document.getElementById('play-again');

// --- Sound: small WebAudio engine for simple effects (no external files required) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function ensureAudio(){ if(!audioCtx) audioCtx = new AudioCtx(); }

function playBeep(type = 'click'){
  try{
    ensureAudio();
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type === 'win' ? 'sine' : type === 'lose' ? 'triangle' : 'square';
    o.frequency.setValueAtTime(type === 'win' ? 880 : type === 'lose' ? 220 : 440, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(now); o.stop(now + 0.4);
  }catch(e){ /* audio blocked or unavailable */ }
}

// Core game functions (logic unchanged)
function computerPlay(){
  const idx = Math.floor(Math.random()*choices.length);
  return choices[idx];
}

function decideWinner(player, computer){
  if(player === computer) return 'draw';
  if(
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) return 'player';
  return 'computer';
}

// UI updates with animations & sound
function updateUIForChoice(playerChoice, computerChoice, result){
  // Clear state classes
  choiceButtons.forEach(b=>{
    b.classList.remove('win','lose','draw','disabled');
  });

  const playerBtn = choiceButtons.find(b=>b.dataset.choice===playerChoice);
  const compBtn = choiceButtons.find(b=>b.dataset.choice===computerChoice);

  // Update message + visual state
  if(result === 'player'){
    playerBtn.classList.add('win');
    compBtn.classList.add('lose');
    resultMessageEl.textContent = 'You win this round!';
    resultMessageEl.className = 'message win pulse';
    playBeep('win');
  } else if(result === 'computer'){
    playerBtn.classList.add('lose');
    compBtn.classList.add('win');
    resultMessageEl.textContent = 'You lose this round.';
    resultMessageEl.className = 'message lose pulse';
    playBeep('lose');
  } else {
    playerBtn.classList.add('draw');
    compBtn.classList.add('draw');
    resultMessageEl.textContent = "It's a draw.";
    resultMessageEl.className = 'message draw pulse';
    playBeep('click');
  }

  roundDetailsEl.textContent = `You chose ${playerChoice}. Computer chose ${computerChoice}.`;
  // temporarily disable choices until next round
  choiceButtons.forEach(b=>b.classList.add('disabled'));
}

function enableChoices(){
  choiceButtons.forEach(b=>b.classList.remove('disabled','win','lose','draw'));
}

function endGame(){
  let finalText = '';
  if(playerScore > computerScore) finalText = `You won the game ${playerScore} to ${computerScore}!`;
  else if(computerScore > playerScore) finalText = `You lost the game ${playerScore} to ${computerScore}.`;
  else finalText = `The game is a draw ${playerScore} to ${computerScore}.`;

  resultMessageEl.textContent = finalText;
  resultMessageEl.className = 'message';
  if(playerScore > computerScore) { resultMessageEl.classList.add('win'); playBeep('win'); }
  else if(computerScore > playerScore) { resultMessageEl.classList.add('lose'); playBeep('lose'); }
  else { resultMessageEl.classList.add('draw'); playBeep('click'); }

  playAgainBtn.classList.remove('hidden');
  choiceButtons.forEach(b=>b.classList.add('disabled'));
}

// Handle choice click
function onChoiceClicked(e){
  if(round >= maxRounds) return;
  const playerChoice = e.currentTarget.dataset.choice;
  const computerChoice = computerPlay();
  const winner = decideWinner(playerChoice, computerChoice);
  round++;

  if(winner === 'player') playerScore++;
  else if(winner === 'computer') computerScore++;

  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
  roundNumberEl.textContent = `${round} / ${maxRounds}`;

  updateUIForChoice(playerChoice, computerChoice, winner);

  if(round >= maxRounds){
    setTimeout(endGame, 800);
  } else {
    // after short delay re-enable choices for next round
    setTimeout(()=>{ enableChoices(); resultMessageEl.classList.remove('pulse'); }, 900);
  }
}

choiceButtons.forEach(b=>b.addEventListener('click', onChoiceClicked));

// Reset handler
playAgainBtn.addEventListener('click', ()=>{
  playerScore = 0; computerScore = 0; round = 0;
  playerScoreEl.textContent = '0';
  computerScoreEl.textContent = '0';
  roundNumberEl.textContent = `0 / ${maxRounds}`;
  resultMessageEl.textContent = 'Make your move!';
  resultMessageEl.className = 'message';
  roundDetailsEl.textContent = '';
  playAgainBtn.classList.add('hidden');
  enableChoices();
  playBeep('click');
});

// initial UI
roundNumberEl.textContent = `0 / ${maxRounds}`;
playerScoreEl.textContent = '0';
computerScoreEl.textContent = '0';
resultMessageEl.textContent = 'Make your move!';

// Accessibility: keyboard support
choiceButtons.forEach((b)=>{ b.setAttribute('tabindex', '0'); b.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') b.click(); }); });
