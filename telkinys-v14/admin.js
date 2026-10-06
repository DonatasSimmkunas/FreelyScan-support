(()=>{
 const {E,s,button,field,form,submit,notice,panel,badge,money,date,toast,api,modal}=App;
 async function reviewListing(id){
  const item=await api('admin-listing',{id});
  const media=await api('private-images',{id});
  const photos=E('div',{class:'photo-grid'},media.images.map(x=>E('img',{src:x.url,alt:'Skelbimo nuotrauka'})));
  const controls=E('div',{class:'actions'},submit('Patvirtinti','active'),submit('Grąžinti taisyti','rejected',false),submit('Sustabdyti','paused',false));
  const f=form([badge(item.status),E('strong',{},money(item.price,item.priceUnit)),E('p',{class:'muted'},item.city+' · '+item.seller.name),E('p',{class:'text-wrap'},item.description),photos,E('p',{class:'hint'},JSON.stringify(item.attributes)),field('note','Sprendimo paaiškinimas','textarea','',{maxLength:1000}),controls],async(fd,status)=>{
   const note=String(fd.get('note')||'').trim();
   if(status!=='active'&&note.length<10)throw new Error('Paaiškink sprendimą bent 10 simbolių.');
   await api('moderate',{id:item.id,version:item.version,status,note});
   App.$('#dialog').close();toast('Sprendimas išsaugotas.');await App.render(false);
  });
  modal(item.title,f);
 }
 App.adminPane=async()=>{
  const data=await api('admin-overview');
  const root=E('section',{class:'stack'},E('div',{class:'section-head'},E('h2',{},'Administravimo centras'),button('Atnaujinti',()=>App.render(false),'btn small')));
  const metrics=[['users','Paskyros'],['listings','Vieši pasiūlymai'],['conversations','Pokalbiai'],['reviews','Atsiliepimai']];
  root.append(E('div',{class:'metric-grid'},metrics.map(([key,label])=>E('div',{class:'panel metric'},E('strong',{},data.counts[key]),E('span',{},label)))));
  root.append(notice('Uždara beta. Mokėjimai, tapatybės patikros ir automatiniai el. laiškai neįjungti. Automatinė priežiūra reikalauja atskiro platformos plano.','warning'));
  if(s.user.role==='admin')root.append(App.operatorPanel(data));
  const queue=panel(E('h3',{},'Laukia peržiūros ('+data.pending.length+')'));
  if(!data.pending.length)queue.append(E('p',{class:'muted'},'Eilė tuščia.'));
  for(const item of data.pending){
   queue.append(E('article',{class:'admin-row row between'},E('div',{},E('strong',{},item.title),E('p',{class:'hint'},item.city+' · @'+item.username+' · '+date(item.updated_at))),button('Peržiūrėti',()=>reviewListing(item.id),'btn small primary')));
  }
  root.append(queue);
  const reports=panel(E('h3',{},'Pranešimai apie pažeidimus ('+data.reports.length+')'));
  if(!data.reports.length)reports.append(E('p',{class:'muted'},'Neišspręstų pranešimų nėra.'));
  for(const report of data.reports){
   const actions=E('div',{class:'actions'});
   if(report.listing_id)actions.append(button('Skelbimas',()=>reviewListing(report.listing_id),'btn small'));
   if(report.thread_id)actions.append(button('Praneštas pokalbis',async()=>{
    const result=await api('report-thread',{reportId:report.id});
    const messages=E('div',{class:'stack'},result.messages.map(m=>panel(E('strong',{},'@'+m.username),E('p',{class:'text-wrap'},m.body),E('small',{class:'muted'},date(m.created_at)))));
    modal('Praneštas pokalbis',notice('Ši peržiūra įrašyta į veiksmų žurnalą.'),messages);
   },'btn small'));
   actions.append(button('Išspręsta',()=>{
    modal('Užbaik pranešimo nagrinėjimą',form([field('note','Sprendimas','textarea','',{required:true,minLength:10,maxLength:1000}),submit('Išsaugoti')],async fd=>{await api('resolve-report',{id:report.id,note:fd.get('note')});App.$('#dialog').close();await App.render(false);}));
   },'btn small'));
   reports.append(E('article',{class:'admin-row'},E('strong',{},'@'+report.username),E('p',{class:'text-wrap'},report.reason),actions));
  }
  root.append(reports);
  const tickets=panel(E('h3',{},'Pagalbos užklausos ('+data.tickets.length+')'));
  if(!data.tickets.length)tickets.append(E('p',{class:'muted'},'Neatsakytų užklausų nėra.'));
  for(const ticket of data.tickets){
   tickets.append(E('article',{class:'admin-row'},E('strong',{},'@'+(ticket.username||'paskyra pašalinta')),E('p',{class:'text-wrap'},ticket.body),button('Atsakyti',()=>{
    modal('Atsakymas dalyviui',E('p',{class:'muted text-wrap'},ticket.body),form([field('reply','Atsakymas','textarea','',{required:true,minLength:10,maxLength:3000}),submit('Siųsti atsakymą')],async fd=>{await api('ticket-reply',{id:ticket.id,reply:fd.get('reply')});App.$('#dialog').close();await App.render(false);}));
   },'btn small primary')));
  }
  root.append(tickets);
  if(s.user.role==='admin')root.append(App.usersPanel(data.users));
  const audit=E('details',{class:'panel'},E('summary',{},'Naujausi administraciniai veiksmai'));
  for(const entry of data.audit)audit.append(E('div',{class:'admin-row'},E('strong',{},entry.action),E('p',{class:'hint'},'@'+(entry.username||'sistema')+' · '+date(entry.created_at)),E('p',{class:'small-text text-wrap'},JSON.stringify(entry.detail))));
  root.append(audit);return root;
 };
})();
