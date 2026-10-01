(function(){
  const transit={LT:[2,4],LV:[3,6],EE:[3,6],PL:[4,7],DE:[5,9],NL:[6,10],BE:[6,10],FR:[7,12],IT:[7,12],ES:[8,14],SE:[6,11],FI:[6,12],DK:[5,9],CZ:[5,9],SK:[5,9],NO:[8,15]};
  function estimate(p,country){
    if(!transit[country]||p.stockStatus==='quote'||p.discontinued)return null;
    const confirmed=p.stockStatus==='in_stock';
    const commercial=/AmberAir|Compact Lite/.test(p.category||'');
    // Planning allowances, not a supplier availability feed or delivery promise.
    const preparation=confirmed?[3,5]:commercial?[60,80]:[50,65];
    const oversized=Number(p.weightKg)>100;
    const buffer=5+(country==='NO'?5:0)+(oversized?3:0);
    return{min:preparation[0]+transit[country][0]+buffer,max:preparation[1]+transit[country][1]+buffer,preparation,transit:transit[country],buffer,confirmed};
  }
  function label(p,country,lang='en'){
    const e=estimate(p,country);
    const t={lt:['Preliminariai','darbo dienų','Terminas pagal užklausą'],en:['Estimated','business days','Delivery on request'],no:['Anslått','virkedager','Levering på forespørsel']}[lang]||['Estimated','business days','Delivery on request'];
    return e?`${t[0]} ${e.min}–${e.max} ${t[1]}`:t[2];
  }
  window.VentDelivery={estimate,label,countries:Object.keys(transit)};
})();
