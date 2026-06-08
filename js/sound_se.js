/**
 * sound_se.js — MIDNIGHT DEFENSE
 * SE管理（WebAudio API / AudioBuffer方式）
 *
 * 設計方針:
 *   - AudioContext を1つ共有し、SE再生ごとに BufferSource を生成して使い捨て。
 *   - 低遅延・同時発音・連打のすべてに対応。
 *   - スマホの自動再生制限に対応するため、最初のユーザー操作で unlock。
 *   - BGMは sound_bgm.js が担当。Sound.se / Sound.seCombo のAPIは維持。
 */

const Sound = (() => {

  // =================================================================
  // SE定義
  // =================================================================
  const SE_DEF = {
    next          : { file: 'assets/sound/se/se_next.wav',           vol: 0.7  },
    back          : { file: 'assets/sound/se/se_back.wav',           vol: 0.7  },
    shoot         : { file: 'assets/sound/se/se_shoot.wav',          vol: 0.8  },
    rush_start    : { file: 'assets/sound/se/se_rush_start.wav',     vol: 0.9  },
    clear         : { file: 'assets/sound/se/se_clear.wav',          vol: 1.0  },
    gameover      : { file: 'assets/sound/se/se_gameover.wav',       vol: 1.0  },
    shield        : { file: 'assets/sound/se/se_shield.wav',         vol: 0.8  },
    heal          : { file: 'assets/sound/se/se_heal.wav',           vol: 0.8  },
    kill          : { file: 'assets/sound/se/se_kill.wav',           vol: 0.6  },
    damage        : { file: 'assets/sound/se/se_damage.wav',         vol: 0.9  },
    macho_start   : { file: 'assets/sound/se/se_macho_start.wav',    vol: 0.9  },
    macho_bomb    : { file: 'assets/sound/se/se_macho_bomb.wav',     vol: 1.0  },
    toggle        : { file: 'assets/sound/se/se_toggle.wav',         vol: 0.7  },
    endless_result: { file: 'assets/sound/se/se_endless_result.wav', vol: 1.0  },
    combo_1       : { file: 'assets/sound/se/se_combo_1.wav',        vol: 0.7  },
    combo_2       : { file: 'assets/sound/se/se_combo_2.wav',        vol: 0.75 },
    combo_3       : { file: 'assets/sound/se/se_combo_3.wav',        vol: 0.8  },
    combo_4       : { file: 'assets/sound/se/se_combo_4.wav',        vol: 0.85 },
    combo_5       : { file: 'assets/sound/se/se_combo_5.wav',        vol: 0.9  },
    combo_6       : { file: 'assets/sound/se/se_combo_6.wav',        vol: 1.0  },
  };

  // =================================================================
  // AudioContext（共有・1インスタンス）
  // =================================================================
  const _ctx = new (window.AudioContext || window.webkitAudioContext)();

  // key → AudioBuffer のキャッシュ
  const _buffers = {};

  let _seEnabled = true;

  // =================================================================
  // スマホ unlock
  // iOS/Android は最初のユーザー操作まで AudioContext が suspended になる。
  // touchstart / click で一度 resume() を呼び、以降は正常に再生できる。
  // =================================================================
  function _unlock() {
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }
  }
  document.addEventListener('touchstart', _unlock, { once: true, passive: true });
  document.addEventListener('click',      _unlock, { once: true });

  // =================================================================
  // SE プリロード（fetch → decodeAudioData → _buffers に格納）
  // =================================================================
  (function _preloadSE() {
    Object.keys(SE_DEF).forEach(function(key) {
      var def = SE_DEF[key];
      fetch(def.file)
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.arrayBuffer();
        })
        .then(function(ab) {
          return _ctx.decodeAudioData(ab);
        })
        .then(function(buffer) {
          _buffers[key] = buffer;
        })
        .catch(function(err) {
          console.error('[Sound] SE ロード失敗: ' + def.file, err);
        });
    });
  })();

  // =================================================================
  // SE 再生
  // BufferSource は使い捨て（再生終了後に GC が回収）。
  // GainNode でボリュームを適用してから destination へ接続。
  // =================================================================

  /**
   * SE を再生する
   * @param {string} key
   */
  function se(key) {
    if (!_seEnabled) return;

    var buffer = _buffers[key];
    if (!buffer) {
      // ロード未完了 or ファイルなし → サイレントスキップ
      return;
    }

    // AudioContext が suspended のままなら resume を試みる
    if (_ctx.state === 'suspended') {
      _ctx.resume();
    }

    var gain   = _ctx.createGain();
    gain.gain.value = SE_DEF[key].vol;
    gain.connect(_ctx.destination);

    var source = _ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(0);
    // source は再生後に自動的に切断される（使い捨て設計）
  }

  /**
   * コンボレベルに応じた SE を再生する
   * @param {number} combo
   */
  function seCombo(combo) {
    if      (combo <= 1) se('combo_1');
    else if (combo <= 2) se('combo_2');
    else if (combo <= 3) se('combo_3');
    else if (combo <= 4) se('combo_4');
    else if (combo <= 5) se('combo_5');
    else                 se('combo_6');
  }

  function setSEEnabled(v) { _seEnabled = v; }

  // BGMは sound_bgm.js が担当。既存呼び出しがあっても安全に無視するスタブ。
  function bgmPlay()       {}
  function bgmStop()       {}
  function bgmStopAll()    {}
  function setBGMEnabled() {}

  return { se, seCombo, bgmPlay, bgmStop, bgmStopAll, setSEEnabled, setBGMEnabled };
})();
