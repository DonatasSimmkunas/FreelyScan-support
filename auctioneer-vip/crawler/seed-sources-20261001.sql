insert into public.vip_crawler_sources(id,name) values
 ('careers_epsog','EPSO-G — karjeros puslapis'),
 ('careers_interikeagroup','Inter IKEA Group — karjeros puslapis'),
 ('careers_wix2','Wix — karjeros puslapis'),
 ('careers_bazaarvoice','Bazaarvoice — karjeros puslapis'),
 ('careers_civitta','Civitta — karjeros puslapis'),
 ('careers_sgs','SGS — karjeros puslapis')
on conflict (id) do nothing;
