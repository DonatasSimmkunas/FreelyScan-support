(()=>{
 const {E,s,button,field,form,submit,notice,panel,toast,api,modal}=App;
 App.operatorPanel=data=>{
  const operator=s.config?.operator||{};
  const root=E('section',{class:'stack'});
  const details=E('div',{class:'form-grid'},field('name','Operatoriaus vardas arba įmonės pavadinimas','text',operator.name||'',{required:true,minLength:2,maxLength:120}),field('businessId','Įmonės / veiklos kodas, jei taikoma','text',operator.businessId||'',{maxLength:50}),field('email','Viešas kontaktinis el. paštas','email',operator.email||'',{required:true,maxLength:200}),field('address','Kontaktinis veiklos adresas','text',operator.address||'',{required:true,minLength:5,maxLength:300}));
  const consent=E('label',{class:'checkline'},E('input',{type:'checkbox',name:'approved',required:true}),E('span',{},'Patvirtinu duomenų teisingumą ir tai, kad peržiūrėjau beta taisykles bei privatumo informaciją. Prieš kviesdamas kitus dalyvius pasirūpinsiu teisine peržiūra ir duomenų priežiūra.'));
  const settings=form([details,consent,submit('Išsaugoti operatoriaus duomenis')],async fd=>{
   await api('operator-settings',{settings:{name:fd.get('name'),businessId:fd.get('businessId'),email:fd.get('email'),address:fd.get('address'),approved:fd.has('approved')}});
   s.config=await App.get({op:'config'});toast('Operatoriaus informacija atnaujinta.');await App.render(false);
  });
  root.append(panel(E('h3',{},'Pirmiausia — operatoriaus informacija'),E('p',{class:'muted small-text'},'Ši informacija bus viešai rodoma taisyklių ir privatumo puslapiuose. Automatinis teisinis atitikties patvirtinimas neatliekamas.'),data.release.legalApproved?notice('Informacija pateikta. Galima kurti beta kvietimus.'):notice('Kvietimai kitiems dalyviams užrakinti iki operatoriaus informacijos pateikimo.','warning'),settings));
  const invites=form([E('div',{class:'form-grid'},field('role','Dalyvio teisės',[['member','Įprastas dalyvis'],['moderator','Moderatorius']],'member'),field('uses','Kiek paskyrų gali naudoti kodą','number',1,{required:true,min:1,max:20,step:1})),submit('Sukurti kvietimą')],async fd=>{
   const invite=await api('invite',{role:fd.get('role'),uses:Number(fd.get('uses'))});
   const contents='Telkinys beta\nRegistracija: '+location.origin+'/?view=login&mode=signup\nKvietimo kodas: '+invite.code+'\nPanaudojimų: '+invite.uses+'\nGalioja 14 dienų. Neviešink šio kodo.\n';
   modal('Naujas kvietimas',E('code',{class:'secure-code'},invite.code),E('p',{},'Galioja 14 dienų. Panaudojimų: '+invite.uses+'.'),button('Išsaugoti kvietimą',()=>App.download('telkinys-kvietimas.txt',contents),'btn primary'));
  });
  root.append(panel(E('h3',{},'Pakviesk beta dalyvius'),E('p',{class:'muted small-text'},'Kvietimą perduok tik pasirinktiems žmonėms. Moderatorius gauna teisę peržiūrėti skelbimus ir praneštus pokalbius.'),invites));
  if(App.backupPanel)root.append(App.backupPanel());
  return root;
 };
 App.usersPanel=users=>{
  const root=panel(E('h3',{},'Dalyviai'));
  for(const user of users){
   const info=E('div',{},E('strong',{},user.display_name),E('p',{class:'hint'},'@'+user.username+' · '+user.role+(user.banned?' · užblokuota':'')));
   const action=user.role==='admin'?E('span',{class:'badge'},'Administratorius'):button(user.banned?'Atblokuoti':'Blokuoti',()=>{
    const f=form([field('note','Priežastis','textarea','',{required:true,minLength:10,maxLength:1000}),submit('Patvirtinti')],async fd=>{await api('ban',{userId:user.id,banned:!user.banned,note:fd.get('note')});App.$('#dialog').close();await App.render(false);});
    modal(user.banned?'Atblokuoti dalyvį':'Blokuoti dalyvį',E('p',{},user.display_name+' (@'+user.username+')'),f);
   },'btn small '+(user.banned?'':'danger'));
   root.append(E('div',{class:'admin-row row between'},info,action));
  }
  return root;
 };
})();
