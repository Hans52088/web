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

        const wrapBg=(labels,lightHex,darkHex)=>{
            if(dmMode==='unified') return `'${lightHex}'`;
            if(dmMode==='custom') return `if theme == 'dark' then '${darkHex}' else '${lightHex}'`;
            if(dmMode==='system') {
                let labelArray = Array.isArray(labels) ? labels : [labels];
                let checkStr = labelArray.map(l => `if std.objectHas(color['dark'], '${l}') then color['dark']['${l}']`).join(' else ');
                return `if theme == 'dark' then (${checkStr} else '${darkHex}') else '${lightHex}'`;
            }
        };
        
        const wrapSize = (label) => {
            return `if std.objectHas(ButtonSize, '${label}鍵size') then ButtonSize['${label}鍵size'] else ButtonSize['${label}键size']`;
        };
        
        const wrapFontSize = (label) => {
            return `if std.objectHas(fontSize, '${label}') then fontSize['${label}'] else fontSize['${label.replace('鍵','键')}']`;
        };

        let kbBg=document.getElementById('kbBgHex').value||'#D1D5DB';let defTextC=document.getElementById('defKeyHex').value||'#000000';let generalKeyBg=document.getElementById('keyBgHex').value||'#FFFFFF';let sysKeyBg=document.getElementById('sysKeyHex').value||'#AAAAAA';let enterBg=document.getElementById('enterBgHex').value||'#007AFF';let enterText=document.getElementById('enterTextHex').value||'#FFFFFF';
        let kbBgD=document.getElementById('kbBgHexD').value||'#1C1C1E';let defTextCD=document.getElementById('defKeyHexD').value||'#FFFFFF';let generalKeyBgD=document.getElementById('keyBgHexD').value||'#4A4A4C';let sysKeyBgD=document.getElementById('sysKeyHexD').value||'#2C2C2E';let enterBgD=document.getElementById('enterBgHexD').value||'#0A60FE';let enterTextD=document.getElementById('enterTextHexD').value||'#FFFFFF';

        let btnInjectStr="";let styleInjectStr="";
        uniqueKeys.forEach((data,cellName)=>{let prefix=data.prefix;let isSystemKey=['enter','backspace','shift','space','numeric','tildedirect','perioddirect','comma','period','slash','semicolon','globe','nextkeyboard','tab','undo','deletetext','copy','paste','cut','selecttext','home','end','onehanded','rime2','rime3','none'].includes(prefix.toLowerCase());let sameCode=String(data.code).toUpperCase()===String(data.outCode).toUpperCase()||(sysCodeMap[String(data.code).toLowerCase()]===prefix);let safeOutCode=String(data.outCode||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");let safePrefix=prefix.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");let btnDefRegex=new RegExp(`(?:^|[^a-zA-Z0-9_])['"]?${safePrefix}Button['"]?\\s*:`,'i');
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
                    let sKey = sp === 'enter' ? 'enter' : (sp === 'shift' ? 'shift' : (sp === 'backspace' ? 'backspace' : (sp==='numeric'?'numeric': '普通')));
                    
                    btnInjectStr+=`    '${safePrefix}Button': createButton(${themeArg}{ key: '${sp}', text: '${spText}', size: ${wrapSize(sKey)} }) + {\n`;
                    btnInjectStr+=`      backgroundStyle: '${bgStyle}',\n`;
                    btnInjectStr+=`      foregroundStyle: ['${safePrefix}ButtonForegroundStyle'],\n`;
                    btnInjectStr+=`      ${specialObjStr},\n`;
                    btnInjectStr+=`      animation: ['ButtonScaleAnimation'],\n`;
                    btnInjectStr+=`    },\n`;
                    btnInjectStr+=`    '${safePrefix}ButtonForegroundStyle': utils.makeTextStyle({\n`;
                    btnInjectStr+=`      text: '${spText}',\n`;
                    btnInjectStr+=`      normalColor: if theme == 'dark' then '${defTextCD}' else '${(data.color||defTextC).toUpperCase()}',\n`;
                    btnInjectStr+=`      highlightColor: if theme == 'dark' then '${defTextCD}' else '${(data.color||defTextC).toUpperCase()}',\n`;
                    btnInjectStr+=`      fontSize: ${wrapFontSize('按鍵前景文字大小')},\n`;
                    btnInjectStr+=`    }),\n`;
                    return;
                }
                btnInjectStr+=`    '${safePrefix}Button': createButton(${themeArg}{ key: '${safeOutCode}', size: ${wrapSize('普通')} }),\n`;
                styleInjectStr+=`  + createHintStyle('${safeOutCode}')\n`;
                if(isPinyinTemplate){styleInjectStr+=`  + createSchemaStyles(theme, '${safeOutCode}')\n`;}
                else{styleInjectStr+=`  + createExtraStyles(theme, '${safeOutCode}')\n`;}
            }
        });
        let layoutStartMarker="// === EDITOR LAYOUT START ===";let layoutEndMarker="// === EDITOR LAYOUT END ===";
        const layoutReplacement=layoutStartMarker+"\n"+btnInjectStr+"    keyboardLayout: if orientation == 'portrait' then [\n"+layouts[portMode].rows.map(r=>`      { HStack: { subviews: [ ${r.keys.map(k=>`{ Cell: '${getCellName(k)}' }`).join(', ')} ] } }`).join(',\n')+"\n    ] else [\n"+layouts[landMode].rows.map(r=>`      { HStack: { subviews: [ ${r.keys.map(k=>`{ Cell: '${getCellName(k)}' }`).join(', ')} ] } }`).join(',\n')+"\n    ],\n    "+layoutEndMarker;
        let lSIdx=newCode.indexOf(layoutStartMarker);let lEIdx=newCode.indexOf(layoutEndMarker);
        if(lSIdx!==-1&&lEIdx!==-1){newCode=newCode.substring(0,lSIdx)+layoutReplacement+newCode.substring(lEIdx+layoutEndMarker.length);}else{let klRegex=/keyboardLayout\s*:\s*(?:if\s+orientation\s*==\s*['"]portrait['"]\s*then\s*)?\[/i;let klMatch=newCode.match(klRegex);if(klMatch){let startIndex=klMatch.index;let bracketCount=0;let endIndex=-1;let inArray=false;for(let i=startIndex;i<newCode.length;i++){if(newCode[i]==='['){bracketCount++;inArray=true;}else if(newCode[i]===']'){bracketCount--;}if(inArray&&bracketCount===0){let remainder=newCode.substring(i+1);if(remainder.match(/^\s*else\s*\[/)){inArray=false;}else{endIndex=i;break;}}}if(endIndex!==-1){newCode=newCode.substring(0,startIndex)+layoutReplacement+newCode.substring(endIndex+1);}}}

        const overrideStartMarker="// === 編輯器強制顏色覆寫 ===";const overrideEndMarker="// === 覆寫結束 ===";const sIdx=newCode.indexOf(overrideStartMarker);const eIdx=newCode.indexOf(overrideEndMarker);
        let overrideMap=new Map();
        const addToOverrideMap=(btn,prop,val)=>{if(!overrideMap.has(btn))overrideMap.set(btn,new Map());overrideMap.get(btn).set(prop,val);};
        
        addToOverrideMap('keyboardBackgroundStyle','normalColor',wrapBg(['鍵盤背景顏色','键盘背景颜色'],kbBg,kbBgD));
        addToOverrideMap('alphabeticBackgroundStyle','normalColor',wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
        addToOverrideMap('alphabeticBackgroundStyle','highlightColor',wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
        addToOverrideMap('systemButtonBackgroundStyle','normalColor',wrapBg(['功能鍵背景顏色','功能键背景颜色'],sysKeyBg,sysKeyBgD));
        addToOverrideMap('systemButtonBackgroundStyle','highlightColor',wrapBg(['功能鍵背景顏色','功能键背景颜色'],sysKeyBg,sysKeyBgD));
        addToOverrideMap('numberButtonBackgroundStyle','normalColor',wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
        addToOverrideMap('numberButtonBackgroundStyle','highlightColor',wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
        
        let eBgLogic,eBgLowerLogic;
        if(dmMode==='unified'){eBgLogic=`'${enterBg}'`;eBgLowerLogic=`'${enterBg}'`;}else if(dmMode==='system'){eBgLogic=`if theme == 'dark' then '#0A60FE' else '${enterBg}'`;eBgLowerLogic=`if theme == 'dark' then '#0040A8' else '${enterBg}'`;}else{eBgLogic=`if theme == 'dark' then '${enterBgD}' else '${enterBg}'`;eBgLowerLogic=`if theme == 'dark' then '${enterBgD}' else '${enterBg}'`;}
        
        addToOverrideMap('searchButtonBackgroundStyle','normalColor',eBgLogic);
        addToOverrideMap('searchButtonBackgroundStyle','highlightColor',eBgLogic);
        addToOverrideMap('searchButtonBackgroundStyle','normalLowerEdgeColor',eBgLowerLogic);
        addToOverrideMap('searchButtonBackgroundStyle','highlightLowerEdgeColor',eBgLowerLogic);
        addToOverrideMap('returnKeyTypeChangedNotification','backgroundStyle',"'searchButtonBackgroundStyle'");
        addToOverrideMap('returnKeyTypeChangedNotification','foregroundStyle',"'enterButtonForegroundStyle'");
        
        let portWidths={};layouts[portMode].rows.forEach(r=>r.keys.forEach(k=>{portWidths[getCellName(k)]=parseFloat(k.width).toFixed(4);}));
        let landWidths={};layouts[landMode].rows.forEach(r=>r.keys.forEach(k=>{landWidths[getCellName(k)]=parseFloat(k.width).toFixed(4);}));
        let allCellNames=new Set([...Object.keys(portWidths),...Object.keys(landWidths)]);
        allCellNames.forEach(cell=>{let pw=portWidths[cell]||"0.1";let lw=landWidths[cell]||"0.1";let swipeInject='';let loopSafeOut='';if(cell==='commaButton'||cell==='periodButton'){let outC=(cell==='commaButton')?',':'.';loopSafeOut=String(outC).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");swipeInject=`, foregroundStyle: std.prune(['${cell}ForegroundStyle', if std.objectHas(swipe_up, '${loopSafeOut}') then '${loopSafeOut}ButtonUpForegroundStyle' else null, if std.objectHas(swipe_down, '${loopSafeOut}') then '${loopSafeOut}ButtonDownForegroundStyle' else null])`;}
            addToOverrideMap(cell,'size',`{ width: { percentage: if orientation == 'portrait' then ${pw} else ${lw} } }`);
            addToOverrideMap(cell,'bounds',`null`);
            if(swipeInject){addToOverrideMap(cell,'foregroundStyle',`std.prune(['${cell}ForegroundStyle', if std.objectHas(swipe_up, '${loopSafeOut}') then '${loopSafeOut}ButtonUpForegroundStyle' else null, if std.objectHas(swipe_down, '${loopSafeOut}') then '${loopSafeOut}ButtonDownForegroundStyle' else null])`);}
        });
        
        let allRows=layouts[portMode].rows.concat(layouts[landMode].rows);
        allRows.forEach(r=>{r.keys.forEach(k=>{
            let color=(k.color||defTextC).toUpperCase();
            let rawDisplay=String(k.code||'');
            let rawOutput=String(k.outCode||rawDisplay);
            let rawCode=rawOutput.toLowerCase();
            let prefix=sysCodeMap[rawCode]||rawCode;
            let isDefaultColor=(color===defTextC.toUpperCase()||color==='');
            let textInject='';
            if(rawDisplay!==rawOutput&&rawDisplay.toLowerCase()!==rawOutput.toLowerCase()&&rawDisplay!==''&&!['enter','backspace','shift','space','numeric','tab','globe'].includes(prefix.toLowerCase())){
                let safeDisplay=rawDisplay.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");
                textInject=`text: '${safeDisplay}', uppercaseText: '${safeDisplay}', `;
            }
            
            let colorStr;
            if(dmMode==='unified'){
                colorStr=`{ ${textInject}normalColor: '${color}', highlightColor: '${color}' }`;
            }else if(dmMode==='system'){
                if(isDefaultColor){
                    colorStr=`{ ${textInject}normalColor: if theme == 'dark' then '${defTextCD}' else '${color}', highlightColor: if theme == 'dark' then '${defTextCD}' else '${color}' }`;
                }else{
                    colorStr=`{ ${textInject}normalColor: '${color}', highlightColor: '${color}' }`;
                }
            }else if(dmMode==='custom'){
                if(isDefaultColor){
                    colorStr=`{ ${textInject}normalColor: if theme == 'dark' then '${defTextCD}' else '${color}', highlightColor: if theme == 'dark' then '${defTextCD}' else '${color}' }`;
                }else{
                    colorStr=`{ ${textInject}normalColor: '${color}', highlightColor: '${color}' }`;
                }
            }
            
            let permutations=new Set([rawCode,prefix]);
            permutations.forEach(p=>{
                if(!p)return;
                let isSys=systemKeys.includes(p.toUpperCase())||p==='globe'||p==='tab'||p.startsWith('shortcut_');
                addToOverrideMap(`${p}ButtonBackgroundStyle`,'normalColor',isSys?wrapBg(['功能鍵背景顏色','功能键背景颜色'],sysKeyBg,sysKeyBgD):wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
                addToOverrideMap(`${p}ButtonBackgroundStyle`,'highlightColor',isSys?wrapBg(['功能鍵背景顏色','功能键背景颜色'],sysKeyBg,sysKeyBgD):wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
                addToOverrideMap(`${p}BackgroundStyle`,'normalColor',isSys?wrapBg(['功能鍵背景顏色','功能键背景颜色'],sysKeyBg,sysKeyBgD):wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
                addToOverrideMap(`${p}BackgroundStyle`,'highlightColor',isSys?wrapBg(['功能鍵背景顏色','功能键背景颜色'],sysKeyBg,sysKeyBgD):wrapBg(['字母鍵背景顏色','字母键背景颜色'],generalKeyBg,generalKeyBgD));
                
                let ncMatch = colorStr.match(/normalColor:\s*(.*?)[,}]/);
                let hcMatch = colorStr.match(/highlightColor:\s*(.*?)[,}]/);
                if(ncMatch) addToOverrideMap(`${p}ButtonForegroundStyle`,'normalColor',ncMatch[1]);
                if(hcMatch) addToOverrideMap(`${p}ButtonForegroundStyle`,'highlightColor',hcMatch[1]);
                
                if(textInject){
                    addToOverrideMap(`${p}ButtonForegroundStyle`,'text',`'${rawDisplay.replace(/'/g,"\\'")}'`);
                    addToOverrideMap(`${p}ButtonForegroundStyle`,'uppercaseText',`'${rawDisplay.replace(/'/g,"\\'")}'`);
                }
                
                if(isSys){
                    let sp=p.toLowerCase();
                    if(sp==='globe'||sp==='nextkeyboard'||sp==='tab'){
                        let act=sp==='tab'?"'tab'":"'nextKeyboard'";
                        let txt=sp==='tab'?"'sf:arrow.right.to.line'":"'sf:globe'";
                        addToOverrideMap(`${p}Button`,'action',act);
                        addToOverrideMap(`${p}Button`,'text',txt);
                        addToOverrideMap(`${p}Button`,'foregroundStyle',`['systemButtonForegroundStyle']`);
                    }
                }
            });
            if(prefix==='space'){
                let ncMatch = colorStr.match(/normalColor:\s*(.*?)[,}]/);
                if(ncMatch) {
                    addToOverrideMap(`spaceButtonLiurForegroundStyle`,'normalColor',ncMatch[1]);
                    addToOverrideMap(`spaceButtonEasyEnForegroundStyle`,'normalColor',ncMatch[1]);
                }
            }
        });});

        let eTextLogic;
        if(dmMode==='unified'){
            eTextLogic=`'${enterText}'`;
        }else if(dmMode==='system'){
            eTextLogic=`if theme == 'dark' then (if std.objectHas(color['dark'], '確定按鍵前景顏色') then color['dark']['確定按鍵前景顏色'] else if std.objectHas(color['dark'], '确定按键前景颜色') then color['dark']['确定按键前景颜色'] else '#FFFFFF') else '${enterText}'`;
        }else if(dmMode==='custom'){
            eTextLogic=`if theme == 'dark' then '${enterTextD}' else '${enterText}'`;
        }
        let enterColorStr=`{ normalColor: ${eTextLogic}, highlightColor: ${eTextLogic} }`;
        let enterPermutations=['enter', 'return', '↵', 'ENTER', 'RETURN'];enterPermutations.forEach(p=>{addToOverrideMap(`${p}ButtonForegroundStyle`,'normalColor',eTextLogic);addToOverrideMap(`${p}ButtonForegroundStyle`,'highlightColor',eTextLogic);});

        let overrides=`\n    ${overrideStartMarker}\n    + {\n`;
        overrideMap.forEach((props, btnName) => {
            let fieldsStr = "{ " + Array.from(props).map(([f, v]) => `${f}: ${v}`).join(", ") + " }";
            let safeKey=btnName.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");
            overrides += `      '${safeKey}'+: ${fieldsStr},\n`;
        });
        overrides += `    } ${overrideEndMarker}\n`;

        if(sIdx!==-1&&eIdx!==-1){let beforeStr=newCode.substring(0,sIdx);beforeStr=beforeStr.replace(/,\s*$/,'\n    ');newCode=beforeStr+styleInjectStr+overrides+newCode.substring(eIdx+overrideEndMarker.length);}else{let lastBraceIdx=newCode.lastIndexOf('}');if(lastBraceIdx!==-1){let beforeStr=newCode.substring(0,lastBraceIdx);beforeStr=beforeStr.replace(/,\s*$/,'\n    ');newCode=beforeStr+"    "+styleInjectStr+overrides+newCode.substring(lastBraceIdx);}}
        document.getElementById('outArea').value=newCode;flashBtn('btnGen','✅ jsonnet 產出成功');return;
    }
    // === 產出 LIBSONNET ===
    let out="// ==========================================\n";out+="// 本配置檔由 WHY 製作的鍵盤佈局與顏色編輯器產出\n";out+="// ==========================================\n\n";out+="// 鍵盤佈局定義\n";out+="local color = import 'color.libsonnet';\n\n";out+="local keyboardLayout(theme='light') = {\n";
    const ns={portraitPinyin:'竖屏中文26键',landscapePinyin:'横屏中文26键',portraitEn:'竖屏英文26键',landscapeEn:'横屏英文26键'};
    Object.entries(layouts).forEach(([m,d])=>{out+=`  '${ns[m]}': {\n    keyboardLayout: [\n`;d.rows.forEach(r=>{out+=`      { HStack: { subviews: [ ${r.keys.map(k=>`{ Cell: '${getCellName(k)}' }`).join(', ')} ] } },\n`;});out+=`    ],\n`;out+=`    keyboardStyle: { backgroundStyle: 'keyboardBackgroundStyle' },\n`;out+=`    keyboardBackgroundStyle: { buttonStyleType: 'geometry', normalColor: color[theme]['键盘背景颜色'] },\n`;out+=`  },\n\n`;});
    const getSizesBlock=(modes)=>{let sizeMap={};let commonWidths={};modes.forEach(m=>{layouts[m].rows.forEach(r=>{r.keys.forEach(k=>{let outCode=k.outCode||k.code;let sysCode=getSysCode(outCode);let sizeName=sysCode==='tildedirect'?'tilde':sysCode;if(sizeName){sizeMap[sizeName]=k.width;if(sizeName.length===1&&sizeName!==' '){commonWidths[k.width]=(commonWidths[k.width]||0)+1;}}});});});let defaultW=0.1;let maxCount=0;Object.keys(commonWidths).forEach(w=>{if(commonWidths[w]>maxCount){maxCount=commonWidths[w];defaultW=w;}});
        let block = `    '普通鍵size': { width: { percentage: ${defaultW} } },\n    '普通键size': { width: { percentage: ${defaultW} } },\n`;
        Object.keys(sizeMap).forEach(c=>{
            let safeC=c.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,"");
            let sLine = ` { width: { percentage: ${sizeMap[c]} } }`;
            block+=`    '${safeC}鍵size':${sLine},\n    '${safeC}键size':${sLine},\n`;
            if(c==='t'||c==='y'){
                block+=`    '${safeC}鍵bounds': null,\n    '${safeC}键bounds': null,\n`;
            }else if(c==='a'){
                block+=`    '${safeC}鍵bounds': { width: '111/168.75', alignment: 'right' },\n    '${safeC}键bounds': { width: '111/168.75', alignment: 'right' },\n`;
            }else if(c==='l'){
                block+=`    '${safeC}鍵bounds': { width: '111/168.75', alignment: 'left' },\n    '${safeC}键bounds': { width: '111/168.75', alignment: 'left' },\n`;
            }else if(c==='shift'){
                block+=`    '${safeC}鍵bounds': null,\n    '${safeC}键bounds': null,\n`;
            }else if(c==='backspace'){
                block+=`    '${safeC}鍵bounds': null,\n    '${safeC}键bounds': null,\n`;
            }
        });
        return block;
    };
    out+=`  '豎屏按鍵尺寸': {\n${getSizesBlock(['portraitPinyin','portraitEn'])}  },\n\n`;out+=`  '橫屏按鍵尺寸': {\n${getSizesBlock(['landscapePinyin','landscapeEn'])}  },\n`;out+="};\n\n";out+="{\n  getPinyinLayout(theme, orientation):\n    if orientation == 'portrait' then keyboardLayout(theme)['竖屏中文26键']\n    else keyboardLayout(theme)['横屏中文26键'],\n\n  getEnLayout(theme, orientation):\n    if orientation == 'portrait' then keyboardLayout(theme)['豎屏英文26鍵']\n    else keyboardLayout(theme)['橫屏英文26鍵'],\n\n  getButtonSize(theme, orientation):\n    if orientation == 'portrait' then keyboardLayout(theme)['豎屏按鍵尺寸']\n    else keyboardLayout(theme)['橫屏按鍵尺寸'],\n}\n";
    document.getElementById('outArea').value=out;flashBtn('btnGen','✅ libsonnet 產出成功');
}
