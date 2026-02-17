// 音效工具 - 使用 Web Audio API 生成音效
let audioContext: AudioContext | null = null;
let soundEnabled = true;

// 初始化音效上下文
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// 檢查音效是否啟用
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem('sound_enabled');
  return stored !== 'false';
}

// 設置音效開關
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  if (typeof window !== 'undefined') {
    localStorage.setItem('sound_enabled', String(enabled));
  }
}

// 播放音效
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3): void {
  if (!isSoundEnabled()) return;
  
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // 忽略音效錯誤
  }
}

// 答對音效 - 愉快上升的音調
export function playCorrectSound(): void {
  playTone(523.25, 0.1, 'sine', 0.3); // C5
  setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
  setTimeout(() => playTone(783.99, 0.2, 'sine', 0.3), 200); // G5
}

// 答錯音效 - 低沉的警告音
export function playWrongSound(): void {
  playTone(200, 0.3, 'triangle', 0.2);
}

// 連擊音效 - 更激勵的上升音調
export function playStreakSound(streak: number): void {
  const baseFreq = 400 + streak * 50;
  playTone(baseFreq, 0.1, 'sine', 0.4);
  setTimeout(() => playTone(baseFreq * 1.25, 0.1, 'sine', 0.4), 80);
  setTimeout(() => playTone(baseFreq * 1.5, 0.15, 'sine', 0.4), 160);
}

// 成就解鎖音效 - 勝利號角
export function playAchievementSound(): void {
  playTone(523.25, 0.15, 'square', 0.2);
  setTimeout(() => playTone(659.25, 0.15, 'square', 0.2), 150);
  setTimeout(() => playTone(783.99, 0.15, 'square', 0.2), 300);
  setTimeout(() => playTone(1046.50, 0.3, 'square', 0.3), 450);
}

// 按鈕點擊音效
export function playClickSound(): void {
  playTone(800, 0.05, 'sine', 0.1);
}

// 完成答題音效
export function playCompleteSound(): void {
  const notes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 120);
  });
}
