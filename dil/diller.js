// dil/diller.js — Desteklenen diller (tek yer): kod, görünen ad (dilin kendi adıyla), sayı biçimi için yerel kod, yazı tipi zinciri.
// Sıra: ayarlardaki dil seçicide bu sırayla görünür. Sözlüğü (dil/<kod>.js) olmayan dil listede durur, metinleri İngilizceye düşer.
// yazi: o dile özgü yazı tipleri (Japonca, Korece, Çince); sistem yazı tiplerine düşer, dosya indirilmez. Boşsa ortak zincir kullanılır.
var DILLER=[
  {kod:'en',ad:'English',yerel:'en-US'},
  {kod:'tr',ad:'Türkçe',yerel:'tr-TR'},
  {kod:'es',ad:'Español',yerel:'es-ES'},
  {kod:'pt',ad:'Português (Brasil)',yerel:'pt-BR'},
  {kod:'fr',ad:'Français',yerel:'fr-FR'},
  {kod:'de',ad:'Deutsch',yerel:'de-DE'},
  {kod:'it',ad:'Italiano',yerel:'it-IT'},
  {kod:'ru',ad:'Русский',yerel:'ru-RU'},
  {kod:'ja',ad:'日本語',yerel:'ja-JP',yazi:'"Hiragino Maru Gothic ProN","Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic UI","Yu Gothic","Meiryo","Noto Sans CJK JP","Noto Sans JP"'},
  {kod:'ko',ad:'한국어',yerel:'ko-KR',yazi:'"Apple SD Gothic Neo","Malgun Gothic","Noto Sans CJK KR","Noto Sans KR","Nanum Gothic"'},
  {kod:'zh',ad:'简体中文',yerel:'zh-CN',yazi:'"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC"'},
  {kod:'id',ad:'Bahasa Indonesia',yerel:'id-ID'}
];
