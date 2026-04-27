const PY_KEYWORDS = new Set(['false','none','true','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield']);
const PY_BUILTINS = new Set(['print','input','range','len','int','str','float','list','dict','tuple','set','type','self','super','open','abs','all','any','bin','bool','bytes','chr','complex','dir','divmod','enumerate','eval','filter','format','frozenset','getattr','globals','hasattr','hash','help','hex','id','isinstance','issubclass','iter','map','max','min','next','object','oct','ord','pow','property','repr','reversed','round','setattr','slice','sorted','staticmethod','sum','vars','zip','Exception','ValueError','TypeError','KeyError','IndexError','AttributeError','NameError','RuntimeError','StopIteration','GeneratorExit','SystemExit','NotImplementedError','IOError','OSError','FileNotFoundError']);

const MATH_OPS = ['**=','//=','<<=','>>=','**','//','=>','<<','>>','+=','-=','*=','/=','%=','&=','|=','^=','==','!=','<=','>=','->',':=','+','-','*','/','%','=','<','>','&','|','^','~','@'];

function tokenizePython(code) {
  const tokens = [];
  const lines = code.split('\n');

  lines.forEach((line) => {
    let pos = 0;
    while (pos < line.length) {
      if (/\s/.test(line[pos])) { pos++; continue; }
      
      if (line[pos] === '#') {
        tokens.push({ value: line.slice(pos), type: 'comment' });
        break; 
      }

      if ((line.slice(pos,pos+3)==='"""'||line.slice(pos,pos+3)==="'''")) {
        const q3 = line.slice(pos,pos+3);
        let i = pos+3, str = q3, closed = false;
        while(i <= line.length-3) {
          if(line.slice(i,i+3)===q3){ str+=q3; i+=3; closed=true; break; }
          str+=line[i++];
        }
        if(!closed) str += line.slice(i);
        tokens.push({ value: str, type: 'string' });
        pos = closed ? pos + str.length : line.length;
        continue;
      }

      const fstrMatch = line.slice(pos).match(/^[fFbBrRuU]+(['"])/);
      if(fstrMatch) {
        const prefix = line.slice(pos, pos + fstrMatch[0].length - 1);
        const q = fstrMatch[1];
        let str = prefix + q, i = pos + fstrMatch[0].length;
        while(i < line.length) {
          if(line[i]==='\\'){str+=line[i]+(line[i+1]||'');i+=2;continue}
          if(line[i]===q){str+=q;i++;break}
          str+=line[i++];
        }
        tokens.push({ value: str, type: 'string' });
        pos = i;
        continue;
      }

      if (line[pos]==='"'||line[pos]==="'") {
        const q = line[pos];
        let str = q, i = pos+1;
        while(i<line.length){
          if(line[i]==='\\'){str+=line[i]+(line[i+1]||'');i+=2;continue}
          if(line[i]===q){str+=q;i++;break}
          str+=line[i++];
        }
        tokens.push({ value: str, type: 'string' });
        pos = i;
        continue;
      }

      const numMatch = line.slice(pos).match(/^(0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\d+\.?\d*([eE][+-]?\d+)?j?)/);
      if(numMatch){
        tokens.push({ value: numMatch[0], type: 'math' });
        pos += numMatch[0].length;
        continue;
      }

      const identMatch = line.slice(pos).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
      if(identMatch){
        const word = identMatch[0];
        const lw = word.toLowerCase();
        if(PY_KEYWORDS.has(lw) || PY_BUILTINS.has(word)){
          tokens.push({ value: word, type: 'reserved' });
        } else {
          tokens.push({ value: word, type: 'variable' });
        }
        pos += word.length;
        continue;
      }

      let matchedOp = false;
      for(const op of MATH_OPS){
        if(line.slice(pos,pos+op.length)===op){
          tokens.push({ value: op, type: 'math' });
          pos+=op.length;
          matchedOp=true;
          break;
        }
      }
      if(matchedOp) continue;

      tokens.push({ value: line[pos], type: 'symbol' });
      pos++;
    }
  });
  return tokens;
}

function analyze() {
  const code = document.getElementById('input').value;
  if (!code.trim()) return;
  const tokens = tokenizePython(code);
  display(tokens);
}

function display(tokens) {
  const out = document.getElementById('output');
  out.innerHTML = ''; 
  tokens.forEach(t => {
    const el = document.createElement('span');
    el.className = 'token ' + t.type;
    el.textContent = `${t.value} (${t.type})`;
    out.appendChild(el);
  });
}
