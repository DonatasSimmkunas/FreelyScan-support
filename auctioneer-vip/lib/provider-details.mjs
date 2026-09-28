import {cleanCategory} from './catalog.mjs';
// Reviewed source facts are joined to the exact original identity, never by name alone.
export function applyProviderDetails(records,details=[]){
 if(!Array.isArray(details))throw new Error('Netinkami paslaugų aprašymai.');
 const byId=new Map(records.map(r=>[r.id,r])),updates=new Map();
 for(const detail of details){
  const original=byId.get(detail.id);
  if(!original||original.provider!==detail.provider||original.profile_url!==detail.profile_url||updates.has(detail.id))throw new Error('Paslaugų aprašymo tapatybė nesutampa.');
  if(typeof detail.service_description!=='string'||!detail.service_description.trim()||detail.service_description.length>4000||!/^https:\/\/paslaugos\.lt\/[a-z0-9-]+$/.test(detail.profile_url))throw new Error('Netinkamas paslaugų aprašymas.');
  const patch={service_description:detail.service_description.trim(),service_source_url:detail.profile_url};
  if(!cleanCategory(original.category)||original.category==='Kita')patch.category=cleanCategory(detail.category)||original.category;
  updates.set(detail.id,patch);
 }
 return records.map(record=>updates.has(record.id)?{...record,...updates.get(record.id)}:record);
}
