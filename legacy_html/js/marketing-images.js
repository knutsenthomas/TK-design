'use strict';
function createImageLibrary({env=process.env,fetcher=globalThis.fetch}={}) {
 async function read(path) {
  const key=String(env.UNSPLASH_ACCESS_KEY||'').trim();
  if(!key)throw Error('Unsplash mangler serverinnstillinger på TK-design.');
  const response=await fetcher('https://api.unsplash.com'+path,{headers:{Authorization:'Client-ID '+key,'Accept-Version':'v1'},redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(response.status===429)throw Error('Unsplash har nådd søkegrensen. Vent litt før du søker igjen.');
  if(!response.ok)throw Error('Unsplash svarte ikke. Prøv igjen senere.');
  return response.json();
 }
 function safeUrl(raw,host) {const url=new URL(raw);if(url.protocol!=='https:'||url.hostname!==host||url.username||url.password)throw Error('Ugyldig bildesvar.');return url.href;}
 function credit(raw) {const url=new URL(safeUrl(raw,'unsplash.com'));url.searchParams.set('utm_source','tk_design_markedsagent');url.searchParams.set('utm_medium','referral');return url.href;}
 function photo(value) {
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(value?.id||''))throw Error('Ugyldig bildesvar.');
  return {id:value.id,url:safeUrl(value.urls.regular,'images.unsplash.com'),small:safeUrl(value.urls.small,'images.unsplash.com'),alt:String(value.alt_description||value.description||'Foto fra Unsplash').slice(0,500),photographer:String(value.user.name||'Fotograf').slice(0,160),photographerUrl:credit(value.user.links.html),sourceUrl:credit(value.links.html)};
 }
 return {
  async search(query,page=1) {
   if(typeof query!=='string'||!query.trim()||query.length>120||!Number.isInteger(page)||page<1||page>20)throw Error('Skriv et søkeord på opptil 120 tegn.');
   const data=await read('/search/photos?query='+encodeURIComponent(query.trim())+'&page='+page+'&per_page=12&content_filter=high');
   return {success:true,images:(data.results||[]).map(photo),page,hasMore:page<Number(data.total_pages||0)};
  },
  async select(id) {
   if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(id))throw Error('Ugyldig bilde-ID.');
   const value=await read('/photos/'+encodeURIComponent(id));const image=photo(value);
   const download=new URL(safeUrl(value.links.download_location,'api.unsplash.com'));
   if(download.pathname!=='/photos/'+id+'/download')throw Error('Ugyldig nedlastingsadresse.');
   // Unsplash requires tracking when a user chooses a photo for an article/post.
   await read(download.pathname+download.search);
   return {success:true,image};
  }
 };
}
module.exports={createImageLibrary};
