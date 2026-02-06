const fs=require('fs');
const lines=fs.readFileSync('script.js','utf8').split('\n');
let stack=0,inStr=false,str='',esc=false,inLine=false,inBlock=false,firstZero=null;
for(let ln=0;ln<lines.length;ln++){
  const line=lines[ln];
  for(let i=0;i<line.length;i++){
    const ch=line[i],next=line[i+1];
    if(inLine) continue;
    if(inBlock){ if(ch==='*'&&next=='/'){inBlock=false;i++;} continue; }
    if(inStr){ if(esc){esc=false;continue;} if(ch==='\\'){esc=true;continue;} if(ch===str){inStr=false;} continue; }
    if(ch==='/'&&next=='/'){inLine=true;i++;continue;}
    if(ch==='/'&&next=='*'){inBlock=true;i++;continue;}
    if(ch==='"'||ch==="'"||ch==='`'){inStr=true;str=ch;continue;}
    if(ch==='(') stack++; else if(ch===')') stack--;
  }
  inLine=false;
  if(stack===0 && firstZero===null) firstZero=ln+1;
}
console.log('first zero at line',firstZero,'final',stack);
