/* ======================================================================
   PART 1b: gen() function — Code generation for layout/color tool
   ====================================================================== */
function gen(){
    const exportFormat=document.getElementById('exportFormat').value;
    const dmMode=document.getElementById('darkModeHandling').value;
    if(exportFormat==='jsonnet'){
        if(!rawTemplateStr){alert('⚠️ 請先上傳 .jsonnet 檔案作為模板，或將產出格式改為 .libsonnet！');return;}
        let newCode=rawTemplateStr;
        let isPinyinTemplate=newCode.includes('createSchemaStyles');
        const newComment="// ==========================================\n// 本配置檔由 WHY 製作的鍵盤佈局與顏色編輯器產出\n// ==========================================\n";
        if(newCode.includes('// 本配置檔由 WHY 製作的編輯器產出')){newCode=newCode.replace('// 本配置檔由 WHY 製作的編輯器產出','// 本配置檔由 WHY 製作的鍵盤佈局與顏色編輯器產出');}else if(!newCode.includes('// 本配置檔由 WHY 製作的鍵盤佈局與顏色編輯器產出')){newCode=newComment+"\n"+newCode;}
        let portMode=(currentFileName.includes('en')||currentFileName.includes('alphabetic'))?'portraitEn':'portraitPinyin';
        let landMode=(currentFileName.includes('en')||currentFileName.includes('alphabetic'))?'landscapeEn':'landscapePinyin';
        let uniqueKeys=new Map();
        const addKey=(k)=>{let code=k.code||'';let outCode=k.outCode||code;if(!code&&!outCode)return;let outUiCode=String(outCode).toLowerCase();let prefix=sysCodeMap[outUiCode]||outUiCode;if(prefix==='semicolon')prefix='semicolon';let cellName=`${prefix}Button`;uniqueKeys.set(cellName,{code:code,outCode:outCode,prefix:prefix});};
        layouts[portMode].rows.forEach(r=>r.keys.forEach(addKey));
        layouts[landMode].rows.forEach(r=>r.keys.forEach(addKey));

        const wrapBg=(sysKey,lightHex,darkHex)=>{if(dmMode==='unified')return`'${lightHex}'`;if(dmMode==='system')return`if theme == 'dark' then color['dark']['${sysKey}'] else '${lightHex}'`;if(dmMode==='custom')return`if theme == 'dark' then '${darkHex}' else '${lightHex}'`;};
        let kbBg=document.getElementById('kbBgHex').value||'#D1D5DB';let defTextC=document.getElementById('defKeyHex').value||'#000000';let generalKeyBg=document.getElementById('keyBgHex').value||'#FFFFFF';let sysKeyBg=document.getElementById('sysKeyHex').value||'#B3BCE2';let enterBg=document.getElementById('enterBgHex').value||'#007AFF';let enterText=document.getElementById('enterTextHex').value||'#FFFFFF';
        let kbBgD=document.getElementById('kbBgHexD').value||'#1C1C1E';let defTextCD=document.getElementById('defKeyHexD').value||'#FFFFFF';let generalKeyBgD=document.getElementById('keyBgHexD').value||'#4A4A4C';let sysKeyBgD=document.getElementById('sysKeyHexD').value||'#2C2C2E';let enterBgD=document.getElementById('enterBgHexD').value||'#0A60FE';let enterTextD=document.getElementById('enterTextHexD').value||'#FFFFFF';

        let btnInjectStr="";let styleInjectStr="";
        uniqueKeys.forEach((data,cellName)=>{let prefix=data.prefix;let isSystemKey=['enter','backspace','shift','space','numeric','tildedirect','perioddirect','comma','period','slash','semicolon','globe','nextkeyboard','undo','deletetext','copy','paste','cut','selecttext','home','end','onehanded','rime2','rime3','none'].includes(prefix.toLowerCase());let sameCode=String(data.code).toUpperCase()===String(data.outCode).toUpperCase()||(sysCodeMap[String(data.code).toLowerCase()]===prefix);let safeOutCode=String(data.outCode||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");let safePrefix=prefix.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");let btnDefRegex=new RegExp(`(?:^|[^a-zA-Z0-9_])['"]?${safePrefix}Button['"]?\\s*:`,'i');
            if(!btnDefRegex.test(newCode)){
                let themeArg=isPinyinTemplate?'theme, ':'';
                if(isSystemKey){
                    let sp = prefix.toLowerCase();
                    let specialObjStr = "";
                    let spText = "";
                    let userText = String(data.code || '');
                    let isSf = userText.toLowerCase().startsWith('sf:');
                    
                    if (sp === 'globe' || sp === 'nextkeyboard') { spText = isSf ? userText : 'sf:globe'; specialObjStr = `action: 'nextKeyboard', click: 'nextKeyboard'`; }
                    else if (sp === 'undo') { spText = isSf ? userText : 'sf:arrow.uturn.backward'; specialObjStr = `action: 'shortcut_undo', click: 'shortcut_undo'`; }
                    else if (sp === 'copy') { spText = isSf ? userText : 'sf:doc.on.doc'; specialObjStr = `action: 'shortcut_copy', click: 'shortcut_copy'`; }
                    else if (sp === 'paste') { spText = isSf ? userText : 'sf:doc.on.clipboard'; specialObjStr = `action: 'shortcut_paste', click: 'shortcut_paste'`; }
                    else if (sp === 'cut') { spText = isSf ? userText : 'sf:scissors'; specialObjStr = `action: 'shortcut_cut', click: 'shortcut_cut'`; }
                    else if (sp === 'selecttext') { spText = isSf ? userText : 'sf:square.dashed'; specialObjStr = `action: 'shortcut_selectText', click: 'shortcut_selectText'`; }
                    else if (sp === 'home') { spText = isSf ? userText : 'sf:arrow.left.to.line'; specialObjStr = `action: 'shortcut_home', click: 'shortcut_home'`; }
                    else if (sp === 'end') { spText = isSf ? userText : 'sf:arrow.right.to.line'; specialObjStr = `action: 'shortcut_end', click: 'shortcut_end'`; }
                    else if (sp === 'deletetext') { spText = isSf ? userText : 'sf:delete.left'; specialObjStr = `action: 'shortcut_deleteText', click: 'shortcut_deleteText'`; }
                    else if (sp === 'onehanded') { spText = isSf ? userText : 'sf:keyboard.onehanded.left'; specialObjStr = `action: 'shortcut_onehanded', click: 'shortcut_onehanded'`; }
                    else if (sp === 'backspace') { spText = isSf ? userText : 'sf:delete.left'; specialObjStr = `action: 'backspace', click: 'backspace'`; }
                    else if (sp === 'enter') { spText = isSf ? userText : 'sf:return'; specialObjStr = `action: 'enter', click: 'enter'`; }
                    else if (sp === 'shift') { spText = isSf ? userText : 'sf:shift'; specialObjStr = `action: 'shift', click: 'shift'`; }
                    else if (sp === 'space') { spText = isSf ? userText : 'sf:space'; specialObjStr = `action: 'space', click: 'space'`; }
                    else if (sp === 'tab') { spText = isSf ? userText : 'sf:arrow.right.to.line'; specialObjStr = `action: 'tab', click: 'tab'`; }
                    else {
                         spText = userText || safeOutCode;
                         specialObjStr = `action: { symbol: '${safeOutCode}' }`;
                    }
                    
                    let bgStyle = (sp==='enter')?'searchButtonBackgroundStyle':'systemButtonBackgroundStyle';
                    
                    btnInjectStr+=`    '${safePrefix}Button': createButton(${themeArg}{ key: '${sp}', text: '${spText}', size: ButtonSize['普通键size'] }) + {\n`;
                    btnInjectStr+=`      backgroundStyle: '${bgStyle}',\n`;
                    btnInjectStr+=`      foregroundStyle: ['${safePrefix}ButtonForegroundStyle'],\n`;
                    btnInjectStr+=`      ${specialObjStr},\n`;
                    btnInjectStr+=`      animation: ['ButtonScaleAnimation'],\n`;
                    btnInjectStr+=`    },\n`;
                    btnInjectStr+=`    '${safePrefix}ButtonForegroundStyle': utils.makeTextStyle({\n`;
                    btnInjectStr+=`      text: '${spText}',\n`;
                    btnInjectStr+=`      normalColor: if theme == 'dark' then '${defTextCD}' else '${(data.color||defTextC).toUpperCase()}',\n`;
                    btnInjectStr+=`      highlightColor: if theme == 'dark' then '${defTextCD}' else '${(data.color||defTextC).toUpperCase()}',\n`;
                    btnInjectStr+=`      fontSize: fontSize['按键前景文字大小'],\n`;
                    btnInjectStr+=`    }),\n`;
                    return;
                }
                btnInjectStr+=`    '${safePrefix}Button': createButton(${themeArg}{ key: '${safeOutCode}', size: ButtonSize['普通键size'] }),\n`;
                styleInjectStr+=`  + createHintStyle('${safeOutCode}')\n`;
                if(isPinyinTemplate){styleInjectStr+=`  + createSchemaStyles(theme, '${safeOutCode}')\n`;}
                else{styleInjectStr+=`  + createExtraStyles(theme, '${safeOutCode}')\n`;}
            }
        });
        let layoutStartMarker="// === EDITOR LAYOUT START ===";let layoutEndMarker="// === EDITOR LAYOUT END ===";
        const layoutReplacement=layoutStartMarker+"\n"+btnInjectStr+"    keyboardLayout: if orientation == 'portrait' then [\n"+layouts[portMode].rows.map(r=>`      { HStack: { subviews: [ ${r.keys.map(k=>`{ Cell: '${getCellName(k)}' }`).join(', ')} ] } }`).join(',\n')+"\n    ] else [\n"+layouts[landMode].rows.map(r=>`      { HStack: { subviews: [ ${r.keys.map(k=>`{ Cell: '${getCellName(k)}' }`).join(', ')} ] } }`).join(',\n')+"\n    ],\n    "+layoutEndMarker;
        let lSIdx=newCode.indexOf(layoutStartMarker);let lEIdx=newCode.indexOf(layoutEndMarker);
        if(lSIdx!==-1&&lEIdx!==-1){newCode=newCode.substring(0,lSIdx)+layoutReplacement+newCode.substring(lEIdx+layoutEndMarker.length);}else{let klRegex=/keyboardLayout\s*:\s*(?:if\s+orientation\s*==\s*['"]portrait['"]\s*then\s*)?\[/i;let klMatch=newCode.match(klRegex);if(klMatch){let startIndex=klMatch.index;let bracketCount=0;let endIndex=-1;let inArray=false;for(let i=startIndex;i<newCode.length;i++){if(newCode[i]==='['){bracketCount++;inArray=true;}else if(newCode[i]===']'){bracketCount--;}if(inArray&&bracketCount===0){let remainder=newCode.substring(i+1);if(remainder.match(/^\s*else\s*\[/)){inArray=false;}else{endIndex=i;break;}}}if(endIndex!==-1){newCode=newCode.substring(0,startIndex)+layoutReplacement+newCode.substring(endIndex+1);}}}

        let sysKeyBgStr=`{ normalColor: ${wrapBg('功能键背景颜色-普通',sysKeyBg,sysKeyBgD)}, highlightColor: ${wrapBg('功能键背景颜色-高亮',sysKeyBg,sysKeyBgD)} }`;
        let genKeyBgStr=`{ normalColor: ${wrapBg('字母键背景颜色-普通',generalKeyBg,generalKeyBgD)}, highlightColor: ${wrapBg('字母键背景颜色-高亮',generalKeyBg,generalKeyBgD)} }`;

        const overrideStartMarker="// === 編輯器強制顏色覆寫 ===";const overrideEndMarker="// === 覆寫結束 ===";const sIdx=newCode.indexOf(overrideStartMarker);const eIdx=newCode.indexOf(overrideEndMarker);
        let overrideMap=new Map();
        overrideMap.set('keyboardBackgroundStyle',`{ normalColor: ${wrapBg('键盘背景颜色',kbBg,kbBgD)} }`);
        overrideMap.set('alphabeticBackgroundStyle',genKeyBgStr);
        overrideMap.set('systemButtonBackgroundStyle',sysKeyBgStr);
        overrideMap.set('numberButtonBackgroundStyle',genKeyBgStr);
        let eBgLogic,eBgLowerLogic;
        if(dmMode==='unified'){eBgLogic=`'${enterBg}'`;eBgLowerLogic=`'${enterBg}'`;}else if(dmMode==='system'){eBgLogic=`if theme == 'dark' then '#0A60FE' else '${enterBg}'`;eBgLowerLogic=`if theme == 'dark' then '#0040A8' else '${enterBg}'`;}else{eBgLogic=`if theme == 'dark' then '${enterBgD}' else '${enterBg}'`;eBgLowerLogic=`if theme == 'dark' then '${enterBgD}' else '${enterBg}'`;}
        overrideMap.set('searchButtonBackgroundStyle',`{ normalColor: ${eBgLogic}, highlightColor: ${eBgLogic}, normalLowerEdgeColor: ${eBgLowerLogic}, highlightLowerEdgeColor: ${eBgLowerLogic} }`);
        overrideMap.set('returnKeyTypeChangedNotification',`{ backgroundStyle: 'searchButtonBackgroundStyle', foregroundStyle: 'enterButtonForegroundStyle' }`);
        let portWidths={};layouts[portMode].rows.forEach(r=>r.keys.forEach(k=>{portWidths[getCellName(k)]=parseFloat(k.width).toFixed(4);}));
        let landWidths={};layouts[landMode].rows.forEach(r=>r.keys.forEach(k=>{landWidths[getCellName(k)]=parseFloat(k.width).toFixed(4);}));
        let allCellNames=new Set([...Object.keys(portWidths),...Object.keys(landWidths)]);
        allCellNames.forEach(cell=>{let pw=portWidths[cell]||"0.1";let lw=landWidths[cell]||"0.1";let swipeInject='';if(cell==='commaButton'||cell==='periodButton'){let outC=(cell==='commaButton')?',':'.';let safeOut=String(outC).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");swipeInject=`, foregroundStyle: std.prune(['${cell}ForegroundStyle', if std.objectHas(swipe_up, '${safeOut}') then '${safeOut}ButtonUpForegroundStyle' else null, if std.objectHas(swipe_down, '${safeOut}') then '${safeOut}ButtonDownForegroundStyle' else null])`;}overrideMap.set(cell,`{ size: { width: { percentage: if orientation == 'portrait' then ${pw} else ${lw} } }, bounds: null${swipeInject} }`);});
        let allRows=layouts[portMode].rows.concat(layouts[landMode].rows);
        allRows.forEach(r=>{r.keys.forEach(k=>{let color=(k.color||defTextC).toUpperCase();let rawDisplay=String(k.code||'');let rawOutput=String(k.outCode||rawDisplay);let rawCode=rawOutput.toLowerCase();let prefix=sysCodeMap[rawCode]||rawCode;let isDefaultColor=(color===defTextC.toUpperCase()||color==='');let textInject='';if(rawDisplay!==rawOutput&&rawDisplay.toLowerCase()!==rawOutput.toLowerCase()&&rawDisplay!==''&&!['enter','backspace','shift','space','numeric','tab','globe'].includes(prefix.toLowerCase())){let safeDisplay=rawDisplay.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");textInject=`text: '${safeDisplay}', uppercaseText: '${safeDisplay}', `;}let colorStr;if(dmMode==='unified'){colorStr=`{ ${textInject}normalColor: '${color}', highlightColor: '${color}' }`;}else if(dmMode==='system'){if(isDefaultColor){colorStr=`{ ${textInject}normalColor: if theme == 'dark' then color['dark']['按键前景颜色'] else '${color}', highlightColor: if theme == 'dark' then color['dark']['按键前景颜色'] else '${color}' }`;}else{colorStr=`{ ${textInject}normalColor: '${color}', highlightColor: '${color}' }`;}}else if(dmMode==='custom'){if(isDefaultColor){colorStr=`{ ${textInject}normalColor: if theme == 'dark' then '${defTextCD}' else '${color}', highlightColor: if theme == 'dark' then '${defTextCD}' else '${color}' }`;}else{colorStr=`{ ${textInject}normalColor: '${color}', highlightColor: '${color}' }`;}}let permutations=new Set([rawCode,prefix]);permutations.forEach(p=>{if(!p)return;let isSys=systemKeys.includes(p.toUpperCase())||p==='globe'||p.startsWith('shortcut_');overrideMap.set(`${p}ButtonBackgroundStyle`,isSys?sysKeyBgStr:genKeyBgStr);overrideMap.set(`${p}BackgroundStyle`,isSys?sysKeyBgStr:genKeyBgStr);overrideMap.set(`${p}ButtonForegroundStyle`,colorStr);overrideMap.set(`${p}ForegroundStyle`,colorStr);overrideMap.set(`${p}SchemaLiurForegroundStyle`,colorStr);overrideMap.set(`${p}SchemaEasyEnForegroundStyle`,colorStr);overrideMap.set(`${p}ButtonUppercasedStateForegroundStyle`,colorStr);let upperP=p.toUpperCase();if(upperP!==p){overrideMap.set(`${upperP}ButtonForegroundStyle`,colorStr);overrideMap.set(`${upperP}ButtonUppercasedStateForegroundStyle`,colorStr);}if(/^[0-9]$/.test(p)){overrideMap.set(`number${p}ButtonForegroundStyle`,colorStr);}});if(prefix==='space'){overrideMap.set(`spaceButtonLiurForegroundStyle`,colorStr);overrideMap.set(`spaceButtonEasyEnForegroundStyle`,colorStr);}});});
        let eTextLogic;if(dmMode==='unified'){eTextLogic=`'${enterText}'`;}else if(dmMode==='system'){eTextLogic=`if theme == 'dark' then '#FFFFFF' else '${enterText}'`;}else if(dmMode==='custom'){eTextLogic=`if theme == 'dark' then '${enterTextD}' else '${enterText}'`;}let enterColorStr=`{ normalColor: ${eTextLogic}, highlightColor: ${eTextLogic} }`;
        let enterPermutations=['enter','return','↵','ENTER','RETURN'];enterPermutations.forEach(p=>{overrideMap.set(`${p}ButtonForegroundStyle`,enterColorStr);overrideMap.set(`${p}ForegroundStyle`,enterColorStr);overrideMap.set(`${p}SchemaLiurForegroundStyle`,enterColorStr);overrideMap.set(`${p}SchemaEasyEnForegroundStyle`,enterColorStr);overrideMap.set(`${p}ButtonUppercasedStateForegroundStyle`,enterColorStr);});
        let overrides=`\n    ${overrideStartMarker}\n    + {\n`;overrideMap.forEach((val,key)=>{let safeKey=key.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");overrides+=`      '${safeKey}'+: ${val},\n`;});overrides+=`    } ${overrideEndMarker}\n`;
        if(sIdx!==-1&&eIdx!==-1){let beforeStr=newCode.substring(0,sIdx);beforeStr=beforeStr.replace(/,\s*$/,'\n    ');newCode=beforeStr+styleInjectStr+overrides+newCode.substring(eIdx+overrideEndMarker.length);}else{let lastBraceIdx=newCode.lastIndexOf('}');if(lastBraceIdx!==-1){let beforeStr=newCode.substring(0,lastBraceIdx);beforeStr=beforeStr.replace(/,\s*$/,'\n    ');newCode=beforeStr+"    "+styleInjectStr+overrides+newCode.substring(lastBraceIdx);}}
        document.getElementById('outArea').value=newCode;flashBtn('btnGen','✅ jsonnet 產出成功');return;
    }
    // === 產出 LIBSONNET ===
    let out="// ==========================================\n";out+="// 本配置檔由 WHY 製作的鍵盤佈局與顏色編輯器產出\n";out+="// ==========================================\n\n";out+="// 鍵盤佈局定義\n";out+="local color = import 'color.libsonnet';\n\n";out+="local keyboardLayout(theme='light') = {\n";
    const ns={portraitPinyin:'竖屏中文26键',landscapePinyin:'横屏中文26键',portraitEn:'竖屏英文26键',landscapeEn:'横屏英文26键'};
    Object.entries(layouts).forEach(([m,d])=>{out+=`  '${ns[m]}': {\n    keyboardLayout: [\n`;d.rows.forEach(r=>{out+=`      { HStack: { subviews: [ ${r.keys.map(k=>`{ Cell: '${getCellName(k)}' }`).join(', ')} ] } },\n`;});out+=`    ],\n`;out+=`    keyboardStyle: { backgroundStyle: 'keyboardBackgroundStyle' },\n`;out+=`    keyboardBackgroundStyle: { buttonStyleType: 'geometry', normalColor: color[theme]['键盘背景颜色'] },\n`;out+=`  },\n\n`;});
    const getSizesBlock=(modes)=>{let sizeMap={};let commonWidths={};modes.forEach(m=>{layouts[m].rows.forEach(r=>{r.keys.forEach(k=>{let outCode=k.outCode||k.code;let sysCode=getSysCode(outCode);let sizeName=sysCode==='tildedirect'?'tilde':sysCode;if(sizeName){sizeMap[sizeName]=k.width;if(sizeName.length===1&&sizeName!==' '){commonWidths[k.width]=(commonWidths[k.width]||0)+1;}}});});});let defaultW=0.1;let maxCount=0;Object.keys(commonWidths).forEach(w=>{if(commonWidths[w]>maxCount){maxCount=commonWidths[w];defaultW=w;}});let block=`    '普通键size': { width: { percentage: ${defaultW} } },\n`;Object.keys(sizeMap).forEach(c=>{let safeC=c.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");block+=`    '${safeC}键size': { width: { percentage: ${sizeMap[c]} } },\n`;if(c==='t'||c==='y'){block+=`    '${safeC}键bounds': null,\n`;}else if(c==='a'){block+=`    '${safeC}键bounds': { width: '111/168.75', alignment: 'right' },\n`;}else if(c==='l'){block+=`    '${safeC}键bounds': { width: '111/168.75', alignment: 'left' },\n`;}else if(c==='shift'){block+=`    '${safeC}键bounds': null,\n`;}else if(c==='backspace'){block+=`    '${safeC}键bounds': null,\n`;}});return block;};
    out+=`  '竖屏按键尺寸': {\n${getSizesBlock(['portraitPinyin','portraitEn'])}  },\n\n`;out+=`  '横屏按键尺寸': {\n${getSizesBlock(['landscapePinyin','landscapeEn'])}  },\n`;out+="};\n\n";out+="{\n  getPinyinLayout(theme, orientation):\n    if orientation == 'portrait' then keyboardLayout(theme)['竖屏中文26键']\n    else keyboardLayout(theme)['横屏中文26键'],\n\n  getEnLayout(theme, orientation):\n    if orientation == 'portrait' then keyboardLayout(theme)['竖屏英文26键']\n    else keyboardLayout(theme)['横屏英文26键'],\n\n  getButtonSize(theme, orientation):\n    if orientation == 'portrait' then keyboardLayout(theme)['竖屏按键尺寸']\n    else keyboardLayout(theme)['横屏按键尺寸'],\n}\n";
    document.getElementById('outArea').value=out;flashBtn('btnGen','✅ libsonnet 產出成功');
}

function dl(){const exportFmt=document.getElementById('exportFormat').value;const b=new Blob([document.getElementById('outArea').value],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(exportFmt==='jsonnet'&&currentFileName)?currentFileName:"keyboardLayout.libsonnet";a.click();}
function addNewRowSync(){try{const defC=document.getElementById('defKeyColor').value;const rowTpl={keys:[{code:'',outCode:'',width:1.0,color:defC,fontSize:18}]};getSyncTargets(currentMode).forEach(m=>{layouts[m].rows.push(JSON.parse(JSON.stringify(rowTpl)));});renderEditor();renderPreview();}catch(e){console.error("Add Row Error: ",e);}}
function removeRSync(i){getSyncTargets(currentMode).forEach(m=>{layouts[m].rows.splice(i,1);});renderEditor();renderPreview();}
function removeKSync(r,k){getSyncTargets(currentMode).forEach(m=>{if(!layouts[m].rows[r])return;layouts[m].rows[r].keys.splice(k,1);const len=layouts[m].rows[r].keys.length;if(len>0){const avg=(1/len).toFixed(4);layouts[m].rows[r].keys.forEach(i=>i.width=parseFloat(avg));}});renderEditor();renderPreview();}
function applyG(){const s=document.getElementById('globalFontSize').value;Object.values(layouts).forEach(l=>l.rows.forEach(r=>r.keys.forEach(k=>k.fontSize=s)));renderEditor();renderPreview();}
