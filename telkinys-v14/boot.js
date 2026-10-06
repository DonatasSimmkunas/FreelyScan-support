(async()=>{
 try{App.s.config=await App.get({op:'config'});}catch(error){App.s.config={operator:null,release:{phase:'closed_beta',legalApproved:false}};App.toast('Konfigūracijos kol kas nepavyko įkelti. '+error.message,true);}
 if(App.s.token){try{await App.refreshMe();}catch(error){if(error.status!==401)App.toast(error.message,true);}}
 App.updateHeader();await App.render(false);if(App.s.user)App.connectLive();
})();
