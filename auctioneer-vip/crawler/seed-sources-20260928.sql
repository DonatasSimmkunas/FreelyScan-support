insert into public.vip_crawler_sources(id,name) values
 ('careers_scale3c','ScaleTech — karjeros puslapis'),
 ('careers_palantir','Palantir — karjeros puslapis'),
 ('careers_transfergo','TransferGo — karjeros puslapis'),
 ('careers_wargamingen','Wargaming — karjeros puslapis'),
 ('careers_robinhood','Robinhood — karjeros puslapis'),
 ('careers_wrike','Wrike — karjeros puslapis'),
 ('careers_tide','Tide — karjeros puslapis'),
 ('careers_flohealth','Flo Health — karjeros puslapis'),
 ('careers_ignitisgroup','Ignitis grupė — karjeros puslapis'),
 ('careers_jyskbaltics','JYSK Baltics — karjeros puslapis'),
 ('careers_continental','Continental — karjeros puslapis'),
 ('careers_betsson','Betsson — karjeros puslapis'),
 ('careers_evolution','Evolution — karjeros puslapis'),
 ('careers_hmgroup','H&M Group — karjeros puslapis'),
 ('careers_devoteam','Devoteam — karjeros puslapis'),
 ('careers_nielseniq','NielsenIQ — karjeros puslapis')
on conflict(id) do nothing;