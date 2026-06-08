/**
 * sound_bgm.js — MIDNIGHT DEFENSE
 * BGM管理（HTMLAudioElement方式）
 *
 * 設計方針:
 *   - HTMLAudioElement を使用し、ループ再生を前提とする。
 *   - BGMキーごとにAudioインスタンスを1つ保持（遅延ロード）。
 *   - スマホの自動再生制限に対応するため、最初のユーザー操作で再生を開始する。
 *   - SE管理（sound_se.js）とは完全に独立。
 */

const BGM = (() => {

  // =================================================================
  // BGM定義
  // =================================================================
  const BGM_DEF = {
    title   : { file: 'assets/sound/bgm/bgm_title.mp3',   vol: 0.7 },
    select  : { file: 'assets/sound/bgm/bgm_select.mp3',  vol: 0.7 },
    stage   : { file: 'assets/sound/bgm/bgm_stage.mp3',   vol: 0.7 },
    endless : { file: 'assets/sound/bgm/bgm_endless.mp3', vol: 0.7 },
    rush    : { file: 'assets/sound/bgm/bgm_rush.mp3',    vol: 0.8 },
    result  : { file: 'assets/sound/bgm/bgm_result.mp3',  vol: 0.7 },
  };

  // key → HTMLAudioElement のキャッシュ
  const _audios = {};

  let _bgmEnabled = true;
  let _currentKey = null;   // 再生中のBGMキー
  let _masterVol  = 1.0;    // マスターボリューム（0.0〜1.0）

  // 再生待ち（スマホ自動再生制限対応用）
  let _pendingKey = null;

  // =================================================================
  // スマホ unlock
  // 最初のユーザー操作で pending があれば再生を開始する。
  // =================================================================
  function _unlock() {
    if (_pendingKey !== null) {
      const key = _pendingKey;
      _pendingKey = null;
      _playAudio(key);
    }
  }
  document.addEventListener('touchstart', _unlock, { once: true, passive: true });
  document.addEventListener('click',      _unlock, { once: true });

  // =================================================================
  // 内部: AudioElement を取得（なければ生成）
  // =================================================================
  function _getAudio(key) {
    if (_audios[key]) return _audios[key];

    const def = BGM_DEF[key];
    if (!def) {
      console.warn('[BGM] 未定義のキー: ' + key);
      return null;
    }

    const audio = new Audio(def.file);
    audio.loop    = true;
    audio.preload = 'auto';
    audio.volume  = Math.min(1, def.vol * _masterVol);
    _audios[key]  = audio;
    return audio;
  }

  // =================================================================
  // 内部: 実際の再生処理
  // =================================================================
  function _playAudio(key) {
    const audio = _getAudio(key);
    if (!audio) return;

    // ボリュームを最新値に更新
    const def = BGM_DEF[key];
    audio.volume = Math.min(1, def.vol * _masterVol);
    audio.currentTime = 0;

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(err => {
        // 自動再生ポリシーによるブロック → ユーザー操作まで保留
        console.warn('[BGM] 自動再生ブロック: ' + key + ' (' + err.message + ')');
        _pendingKey = key;
      });
    }
  }

  // =================================================================
  // 公開API
  // =================================================================

  /**
   * BGMを再生する（同じキーが既に再生中なら何もしない）
   * @param {string} key
   */
  function play(key) {
    if (!_bgmEnabled) return;
    if (!BGM_DEF[key]) {
      console.warn('[BGM] 未定義のキー: ' + key);
      return;
    }

    // 同じキーが再生中なら何もしない
    if (_currentKey === key) return;

    // 現在再生中のBGMを停止
    _stopCurrent();

    _currentKey = key;
    _playAudio(key);
  }

  /**
   * 現在再生中のBGMを停止する
   */
  function stop() {
    _stopCurrent();
  }

  /**
   * 全BGMを停止する
   */
  function stopAll() {
    Object.keys(_audios).forEach(key => {
      const audio = _audios[key];
      audio.pause();
      audio.currentTime = 0;
    });
    _currentKey = null;
    _pendingKey = null;
  }

  /**
   * マスターボリュームを設定する（0.0〜1.0）
   * @param {number} value
   */
  function setVolume(value) {
    _masterVol = Math.max(0, Math.min(1, value));
    // 再生中のBGMに即時反映
    Object.keys(_audios).forEach(key => {
      const def = BGM_DEF[key];
      _audios[key].volume = Math.min(1, def.vol * _masterVol);
    });
  }

  /**
   * BGM有効/無効を切り替える
   * @param {boolean} v
   */
  function setBGMEnabled(v) {
    _bgmEnabled = v;
    if (!v) stopAll();
  }

  // =================================================================
  // 内部: 現在再生中のBGMを停止
  // =================================================================
  function _stopCurrent() {
    if (_currentKey && _audios[_currentKey]) {
      _audios[_currentKey].pause();
      _audios[_currentKey].currentTime = 0;
    }
    _currentKey = null;
    _pendingKey = null;
  }

  return { play, stop, stopAll, setVolume, setBGMEnabled };
})();
