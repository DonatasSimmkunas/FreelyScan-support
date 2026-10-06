(()=>{
 'use strict';
 const {E,s,link,notice}=App;
 App.categories.items='Daiktai ir prekės';App.categories.prices='Parduotuvės pasiūlymas';
 App.requireUser=()=>{
  if(s.user)return null;s.afterAuth={...App.current()};
  return E('section',{class:'auth panel'},E('p',{class:'kicker'},'MANO TELKINYS'),E('h1',{},'Tęsk savo paskyroje.'),E('p',{class:'muted'},'Poreikiai, pasiūlymai ir privatūs susitarimai saugomi tavo paskyroje. Prisijungęs grįši prie pasirinkto veiksmo.'),link('Prisijungti',{view:'login'},'btn primary wide'),E('div',{class:'v15-auth-help'},link('Neturi kvietimo? Pateik prašymą',{view:'access',kind:'invite'},'btn wide'),link('Pagalba be prisijungimo',{view:'access',kind:'help'},'btn quiet wide')),notice('Registracija tebėra su kvietimu. Mokėjimai ir nepriklausomos tapatybės patikros neįjungti.'));
 };
})();