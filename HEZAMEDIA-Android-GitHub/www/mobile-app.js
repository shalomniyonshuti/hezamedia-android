/* HEZA MEDIA Android shell, compatible with the existing single-page news app. */
(function(){
  'use strict';
  var native = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  // ?appPreview=1 enables mobile UI testing in a desktop browser without changing production site.
  var preview = new URLSearchParams(location.search).get('appPreview') === '1';
  if (!native && !preview) return;
  document.documentElement.classList.add('heza-android');
  var items = [
    ['home','Ahabanza','<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>'],
    ['politics','Politiki','<path d="M3 21h18M5 21V10m4 11V10m6 11V10m4 11V10M2 10h20L12 3z"/>'],
    ['sport','Siporo','<circle cx="12" cy="12" r="9"/><path d="m12 5-4 3 1 5h6l1-5zm-3 8-4 4m10-4 4 4"/>'],
    ['entertainment','Imyidagaduro','<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'],
    ['video','Video','<rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 6 3-6 3z"/>']
  ];
  var nav = document.createElement('nav'); nav.className='heza-mobile-tabs'; nav.setAttribute('aria-label','HEZA MEDIA mobile navigation');
  items.forEach(function(it){
    var btn=document.createElement('button');btn.type='button';btn.className='heza-mobile-tab';btn.dataset.section=it[0];
    btn.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24">'+it[2]+'</svg><span>'+it[1]+'</span>';
    btn.addEventListener('click',function(){
      if(it[0]==='video') {
        // Original front page is the video hub: scroll to embedded featured video.
        var home=document.getElementById('brandHome'); if(home) home.click();
        setTimeout(function(){var v=document.getElementById('trendingVideo');if(v)v.scrollIntoView({behavior:'smooth',block:'start'});},180);
      } else if (it[0]==='home') {
        var brand=document.getElementById('brandHome');if(brand) brand.click();
      } else {
        var original=document.querySelector('.navbar .nav-item[data-target="'+it[0]+'"]');
        if(original)original.click();
        else location.href='?section='+encodeURIComponent(it[0]);
      }
      updateTabs(it[0]);
    });
    nav.appendChild(btn);
  });
  document.body.appendChild(nav);
  function updateTabs(selected){
    var current=selected || new URLSearchParams(location.search).get('section') || 'home';
    nav.querySelectorAll('button').forEach(function(b){
      if(b.dataset.section===current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
  }
  updateTabs();
  window.addEventListener('popstate',function(){ updateTabs(); });
  document.addEventListener('click',function(e){
    var item=e.target.closest('[data-target]');
    if(item && item.dataset.target) setTimeout(function(){updateTabs(item.dataset.target);},30);
  });
  if(native){
    // Android hardware Back follows article/section browser history before leaving the app.
    var appPlugin=window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if(appPlugin && appPlugin.addListener){appPlugin.addListener('backButton',function(){
      var overlay=document.getElementById('articleOverlay');
      if(overlay && overlay.classList.contains('open')) {history.back();return;}
      if(location.search){history.back();return;}
      if(window.scrollY>150){window.scrollTo({top:0,behavior:'smooth'});return;}
      appPlugin.exitApp();
    });}
    // Keep external social media/navigation links in the user's actual browser.
    document.addEventListener('click',function(e){
      var a=e.target.closest('a[href]');if(!a)return;
      var href=a.getAttribute('href');
      if(!href || href[0]==='#' || href.startsWith('javascript:'))return;
      try{
        var url=new URL(href,location.href);
        if(url.protocol==='http:' || url.protocol==='https:'){
          if(url.hostname!==location.hostname && !url.hostname.endsWith('.hezamedia.com')){
            e.preventDefault();
            var browser=window.Capacitor.Plugins && window.Capacitor.Plugins.Browser;
            if(browser && browser.open)browser.open({url:url.href}); else window.open(url.href,'_blank');
          }
        }
      }catch(_e){}
    },true);
  }
})();
