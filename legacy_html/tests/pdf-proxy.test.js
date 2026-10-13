'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {PassThrough,Writable}=require('node:stream');
const {EventEmitter,once}=require('node:events');
const {pdfTarget,createPdfProxy}=require('../js/pdf-proxy');
const bucket='tk-design-f43f6.firebasestorage.app';
const valid='https://firebasestorage.googleapis.com/v0/b/'+bucket+'/o/folder%2Ffile.pdf?alt=media&token=test-only';
test('both legitimate storage URL forms survive; alternate parser representations fail closed',()=>{
  assert.equal(pdfTarget(valid,bucket).href,valid);
  assert.equal(pdfTarget('https://storage.googleapis.com/'+bucket+'/graphic/file.pdf',bucket).hostname,'storage.googleapis.com');
  for(const url of ['https://googleapis.com.evil.invalid/file.pdf','https://firebasestorage.googleapis.com.evil.invalid/file.pdf','http://firebasestorage.googleapis.com/v0/b/'+bucket+'/o/file','https://user:password@firebasestorage.googleapis.com/v0/b/'+bucket+'/o/file','https://firebasestorage.googleapis.com:8443/v0/b/'+bucket+'/o/file','https://storage.googleapis.com/other-bucket/file.pdf','https://firebasestorage.googleapis.com/v0/b/other-bucket/o/file','https://127.0.0.1/file.pdf','https://storage.googleapis.com/'+bucket+'-other/file.pdf','https://firebasestorage.googleapis.com/v0/b/'+bucket+'/o/'])assert.throws(()=>pdfTarget(url,bucket));
});
function fixture({status=200,type='application/pdf',length='4',maxBytes=50}={}){
  const remote=new PassThrough();remote.statusCode=status;remote.headers={'content-type':type,'content-length':length};
  const request=new EventEmitter();request.setTimeout=()=>request;request.destroy=()=>{request.destroyed=true;};
  let calls=0,options,target;
  const https={get:(url,opts,callback)=>{calls++;target=url;options=opts;queueMicrotask(()=>callback(remote));return request;}};
  const chunks=[],res=new Writable({write(chunk,_encoding,done){chunks.push(chunk);res.headersSent=true;done();}});
  res.statusCode=200;res.headers={};res.status=n=>{res.statusCode=n;return res;};res.send=text=>{res.end(text);return res;};res.setHeader=(k,v)=>res.headers[k]=v;
  return {remote,request,res,chunks,get calls(){return calls;},get options(){return options;},handler:createPdfProxy({getBucket:()=>bucket,https,maxBytes})};
}
test('invalid URL never reaches outgoing transport, and redirects are not followed',async()=>{
  const blocked=fixture();blocked.handler({query:{url:'https://googleapis.com.evil.invalid/file.pdf'}},blocked.res);assert.equal(blocked.calls,0);assert.equal(blocked.res.statusCode,403);
  const f=fixture({status:302});f.handler({query:{url:valid},headers:{authorization:'do-not-forward'}},f.res);await once(f.res,'finish');assert.equal(f.res.statusCode,502);assert.equal(f.calls,1);assert.equal(f.remote.destroyed,true);assert.equal(f.options.headers.Authorization,undefined);
});
test('legitimate PDF streams survive legacy metadata; oversized and non-PDF bytes are rejected',async()=>{
  for(const type of ['application/pdf','application/octet-stream','application/x-pdf','text/plain']){
    const f=fixture({type});f.handler({query:{url:valid}},f.res);await Promise.resolve();
    f.remote.write(Buffer.from('%PD'));f.remote.end(Buffer.from('F-1.7\nexample'));
    await once(f.res,'finish');assert.equal(Buffer.concat(f.chunks).toString(),'%PDF-1.7\nexample');assert.equal(f.res.headers['Content-Type'],'application/pdf');
  }
  const large=fixture({length:'1000',maxBytes:10});large.handler({query:{url:valid}},large.res);await once(large.res,'finish');assert.equal(large.res.statusCode,413);assert.equal(large.remote.destroyed,true);
  for(const type of ['text/html','application/pdf']){
    const bad=fixture({type});bad.handler({query:{url:valid}},bad.res);await Promise.resolve();bad.remote.end(Buffer.from('<html>not a PDF</html>'));await once(bad.res,'finish');assert.equal(bad.res.statusCode,502);assert.equal(bad.remote.destroyed,true);
  }
});
