/**
 * assets.js — MIDNIGHT DEFENSE
 * 画像アセット管理・プリロード ＋ SE/BGM管理
 */

const Assets = (() => {
  const MANIFEST = {
    'fruit.png'          : 'assets/enemies/fruit.png',
    'soda_ice.png'       : 'assets/enemies/soda_ice.png',
    'macaron.png'        : 'assets/enemies/macaron.png',
    'pudding.png'        : 'assets/enemies/pudding.png',
    'shortcake.png'      : 'assets/enemies/shortcake.png',
    'bread.png'          : 'assets/enemies/bread.png',
    'onigiri.png'        : 'assets/enemies/onigiri.png',
    'pasta.png'          : 'assets/enemies/pasta.png',
    'hamburger.png'      : 'assets/enemies/hamburger.png',
    'shoyu_ramen.png'    : 'assets/enemies/shoyu_ramen.png',
    'butter.png'         : 'assets/enemies/butter.png',
    'french_fries.png'   : 'assets/enemies/french_fries.png',
    'steak.png'          : 'assets/enemies/steak.png',
    'karaage.png'        : 'assets/enemies/karaage.png',
    'backfat_ramen.png'  : 'assets/enemies/backfat_ramen.png',
    'beer.png'           : 'assets/enemies/beer.png',
    'wine.png'           : 'assets/enemies/wine.png',
    'tequila.png'        : 'assets/enemies/tequila.png',
    'cheese_plate.png'   : 'assets/enemies/cheese_plate.png',
    'pizza.png'          : 'assets/enemies/pizza.png',
    'item_dumbbell.png'  : 'assets/items/item_dumbbell.png',
    'item_macho.png'     : 'assets/items/item_macho.png',
    'title_bg'           : 'assets/backgrounds/title_bg.webp',
    'title_logo'         : 'assets/ui/title_logo.png',
    'result_bg'          : 'assets/backgrounds/result_bg.webp',
    'rank_S'             : 'assets/ui/rank_S.png',
    'rank_A'             : 'assets/ui/rank_A.png',
    'rank_B'             : 'assets/ui/rank_B.png',
    'rank_C'             : 'assets/ui/rank_C.png',
    'stage1_tutorial'    : 'assets/ui/stage1_tutorial.png',
    'stage1_rule'        : 'assets/ui/stage1_rule.png',
    'stage2_tutorial'    : 'assets/ui/stage2_tutorial.png',
    'stage3_tutorial'    : 'assets/ui/stage3_tutorial.png',
    'stage4_tutorial'    : 'assets/ui/stage4_tutorial.png',
    'endless_tutorial_01': 'assets/ui/endless_tutorial_01.png',
    'endless_tutorial_02': 'assets/ui/endless_tutorial_02.png',
    'endless_tutorial_03': 'assets/ui/endless_tutorial_03.png',
    'endless_result'     : 'assets/ui/endless_result.png',
    'bullet'             : 'assets/ui/bullet.png',
    'rabbit_lv1'         : 'assets/player/rabbit_lv1.png',
    'rabbit_lv2'         : 'assets/player/rabbit_lv2.png',
    'rabbit_lv3'         : 'assets/player/rabbit_lv3.png',
    'rabbit_lv4'         : 'assets/player/rabbit_lv4.png',
    'boss'               : 'assets/bosses/boss.png',
    'stage_bg'           : 'assets/backgrounds/stage_bg.webp',
  };

  const _cache = {};
  let _loaded = false;

  function load() {
    if (_loaded) return Promise.resolve();
    const entries = Object.entries(MANIFEST);
    const total = entries.length;
    const promises = entries.map(([key, path]) =>
      new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { _cache[key] = img; resolve(); };
        img.onerror = () => {
          console.error('[Assets] 画像ロード失敗: ' + path);
          _cache[key] = null;
          resolve();
        };
        img.src = path;
      })
    );
    return Promise.all(promises).then(() => {
      _loaded = true;
      const ok   = Object.values(_cache).filter(Boolean).length;
      const fail = total - ok;
      console.log('[Assets] プリロード完了: ' + ok + '/' + total + ' OK' + (fail ? ', ' + fail + ' 件失敗' : ''));
    });
  }

  function get(key) { return (key in _cache) ? _cache[key] : null; }
  function src(key) { return MANIFEST[key] || ''; }
  function isLoaded() { return _loaded; }

  return { load, get, src, isLoaded };
})();

