/* ======================================================================
   PART 2: SWIPE & HINT EDITOR (from keyboard_swipe_hint_tools.html)
   ====================================================================== */
let layoutRows=[['1','2','3','4','5','6','7','8','9','0'],['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l','semicolon'],['z','x','c','v','b','n','m','comma','period','slash'],['numeric','shift','globe','space','perioddirect','backspace','enter']];
let swipeData={swipe_up:{},swipe_down:{}};
let hintSymbolsData={alphabetic:{},pinyin:{}};
let currentSelectedKey=null;let currentCategory='both';let activeCodeTab='swipe';let currentEditorMode='swipe';
let step2Loaded=false;let step3Loaded=false;let internalClipboard={swipe:"",hint:""};let longPressTimer=null;
let fileNames={swipe:'swipeData.libsonnet',hint:'hintSymbolsData.libsonnet'};
let defaultBgMap={'alphabeticBackgroundStyle':'#ffffff','systemButtonBackgroundStyle':'#e5e5ea','searchButtonBackgroundStyle':'#007aff'};
const darkBgMap={'alphabeticBackgroundStyle':'#4a4a4c','systemButtonBackgroundStyle':'#2c2c2e','searchButtonBackgroundStyle':'#0a60fe'};
function getKeyBg(style){const isDark=document.documentElement.getAttribute('data-theme')==='dark';return isDark?darkBgMap[style]:defaultBgMap[style];}
function getKeyTextColor(){return document.documentElement.getAttribute('data-theme')==='dark'?'#ffffff':'#1c1c1e';}

const noValueCommands=['backspace','enter','shift','tab','space','nextKeyboard','characterMargin','none'];
const presetShortcuts={'shortcut_undo':'#undo','shortcut_deleteText':'#deleteText','shortcut_copy':'#copy','shortcut_paste':'#paste','shortcut_cut':'#cut','shortcut_selectText':'#selectText','shortcut_home':'#行首','shortcut_end':'#行尾','shortcut_onehanded':'#左手模式','shortcut_rime2':'#次选上屏','shortcut_rime3':'#三选上屏'};
const reverseShortcutMap={};for(let key in presetShortcuts)reverseShortcutMap[presetShortcuts[key]]=key;
const shortCommandsGroups=[{group:'輸入法控制',options:[{value:'#中英切换',label:'中英切換'},{value:'#方案切换',label:'方案切換'},{value:'#重输',label:'重輸'},{value:'#清空',label:'清空'}]},{group:'編輯選取',options:[{value:'#撤销',label:'撤銷'},{value:'#剪切',label:'剪切'},{value:'#复制',label:'複製'},{value:'#粘贴',label:'貼上'},{value:'#全选',label:'全選'}]},{group:'游標移動',options:[{value:'#左移',label:'左移'},{value:'#右移',label:'右移'},{value:'#行首',label:'行首'},{value:'#行尾',label:'行尾'}]},{group:'系統功能',options:[{value:'#隐藏键盘',label:'隱藏鍵盤'},{value:'#左手键盘',label:'左手鍵盤'},{value:'#语音输入',label:'語音輸入'}]}];
const keyboardTypesList=[{value:'alphabetic',label:'英文鍵盤 (alphabetic)'},{value:'pinyin',label:'中文鍵盤 (pinyin)'},{value:'numeric',label:'數字 (numeric)'},{value:'symbolic',label:'符號 (symbolic)'}];
const sfSymbolEmojiMap={'globe':'🌐','delete.left':'⌫','trash':'🗑️','shift':'⇧','return':'⏎','keyboard.onehanded.left':'👈','keyboard.onehanded.right':'👉','space':'␣','arrow.uturn.backward':'↩️','doc.on.doc':'📄','doc.on.clipboard':'📋','scissors':'✂️','arrow.left.to.line':'⇤','arrow.right.to.line':'⇥','square.dashed':'⬚','2.circle':'②','3.circle':'③'};
const sfSymbolsList=[{name:'keyboard',visual:'⌨️',desc:'鍵盤'},{name:'return',visual:'⏎',desc:'換行'},{name:'delete.left',visual:'⌫',desc:'刪除'},{name:'shift',visual:'⇧',desc:'Shift'},{name:'space',visual:'␣',desc:'空白鍵'},{name:'globe',visual:'🌐',desc:'地球'},{name:'gear',visual:'⚙️',desc:'設定'},{name:'arrow.left.to.line',visual:'⇤',desc:'行首'},{name:'arrow.right.to.line',visual:'⇥',desc:'行尾'},{name:'scissors',visual:'✂️',desc:'剪切'},{name:'doc.on.clipboard',visual:'📋',desc:'貼上'},{name:'doc.on.doc',visual:'📄',desc:'複製'}];
const commandToSfMap={'shortcut_undo':'sf:arrow.uturn.backward','shortcut_deleteText':'sf:delete.left','shortcut_copy':'sf:doc.on.doc','shortcut_paste':'sf:doc.on.clipboard','shortcut_cut':'sf:scissors','shortcut_selectText':'sf:square.dashed','shortcut_home':'sf:arrow.left.to.line','shortcut_end':'sf:arrow.right.to.line','shortcut_onehanded':'sf:keyboard.onehanded.left','shortcut_rime2':'sf:2.circle','shortcut_rime3':'sf:3.circle','backspace':'sf:delete.left','enter':'sf:return','shift':'sf:shift','space':'sf:space','nextKeyboard':'🌐'};
let currentIconTargetIndex=null;
function renderIconGrid(){const grid=document.getElementById('iconGrid');grid.innerHTML='';sfSymbolsList.forEach(icon=>{const div=document.createElement('div');div.className='icon-cell';div.onclick=()=>selectIcon(icon.name);div.innerHTML=`<div style="font-size:24px;">${icon.visual}</div><div style="font-size:13px;font-weight:600;">${icon.desc}</div>`;grid.appendChild(div);});}
function openIconModal(index){currentIconTargetIndex=index;document.getElementById('iconModalOverlay').style.display='flex';}
function closeIconModal(){document.getElementById('iconModalOverlay').style.display='none';currentIconTargetIndex=null;}
function selectIcon(iconName){if(currentIconTargetIndex!==null){if(currentEditorMode==='hint')updateHintItemLabel(currentIconTargetIndex,'sf:'+iconName);}else if(typeof currentIconTargetT1!=='undefined'&&currentIconTargetT1!==null){let r=currentIconTargetT1.r;let k=currentIconTargetT1.k;if(typeof getSyncTargets==='function'&&typeof layouts!=='undefined'){getSyncTargets(currentMode).forEach(m=>{if(layouts[m]&&layouts[m].rows[r]&&layouts[m].rows[r].keys[k]){layouts[m].rows[r].keys[k].code='sf:'+iconName;}});if(typeof renderEditor==='function')renderEditor();if(typeof renderPreview==='function')renderPreview();}currentIconTargetT1=null;}closeIconModal();}

function showPopup(keyElement,keyChar){const activeCat=currentCategory==='both'?'alphabetic':currentCategory;if(!hintSymbolsData[activeCat]||!hintSymbolsData[activeCat][keyChar])return;const keyData=hintSymbolsData[activeCat][keyChar];if(!keyData.list||keyData.list.length===0)return;let popup=document.getElementById('keyPopup');popup.innerHTML='';keyData.list.forEach((item,index)=>{const div=document.createElement('div');div.className='popup-item';if(index===(keyData.selectedIndex||0)){div.classList.add('selected');}let text='';if(item.label&&item.label.systemImageName){text=sfSymbolEmojiMap[item.label.systemImageName]||'❖';}else if(item.label&&item.label.text!==""&&item.label.text!==undefined){text=item.label.text;}else if(item.action){if(item.action.symbol)text=item.action.symbol;else if(item.action.character)text=item.action.character;else if(item.action.shortcut)text='⚙️';else if(item.action.keyboardType)text='⌨️';else text='❖';}else{text='❖';}div.innerText=text;if(keyData.size&&keyData.size.width){div.style.minWidth=keyData.size.width+'px';div.style.width=keyData.size.width+'px';}popup.appendChild(div);});const rect=keyElement.getBoundingClientRect();popup.style.left=(rect.left+rect.width/2)+'px';popup.style.top=(rect.top-8)+'px';popup.classList.add('show');}
function hidePopup(){const popup=document.getElementById('keyPopup');if(popup){popup.classList.remove('show');}}

function bindColorInputs(colorId,textId){const colorEl=document.getElementById(colorId);const textEl=document.getElementById(textId);colorEl.addEventListener('input',(e)=>textEl.value=e.target.value.toUpperCase());textEl.addEventListener('input',(e)=>{let val=e.target.value.trim();if(val.match(/^#[0-9A-Fa-f]{6}$/i))colorEl.value=val.toLowerCase();});}

function extractKeyName(cellName){if(!cellName)return null;let name=cellName.replace(/Button/i,'').trim().toLowerCase();const map={'one':'1','two':'2','three':'3','four':'4','five':'5','six':'6','seven':'7','eight':'8','nine':'9','zero':'0','semicolon':';','slash':'/','comma':'comma','period':'period','tildedirect':'tildedirect','perioddirect':'perioddirect','spacedirect':'space','backspacedirect':'backspace','shiftdirect':'shift','numericdirect':'numeric','enterdirect':'enter'};return map[name]||name;}
function parseStep1Safe(text){let extractedRows=[];const hstackRegex=/HStack:\s*\{\s*subviews:\s*\[([\s\S]*?)\]\s*\}/g;let match;while((match=hstackRegex.exec(text))!==null){const cellsMatch=match[1].match(/Cell:\s*['"]([^'"]+)['"]/g);if(cellsMatch)extractedRows.push(cellsMatch.map(c=>c.match(/Cell:\s*['"]([^'"]+)['"]/)[1]));}if(extractedRows.length>0)layoutRows=extractedRows;const colorRegex=/['"]([^'"]+)['"]\+?:\s*\{\s*[\s\S]*?normalColor:\s*['"]([^'"]+)['"]/g;let cMatch;while((cMatch=colorRegex.exec(text))!==null){if(cMatch[1].includes('BackgroundStyle'))defaultBgMap[cMatch[1]]=cMatch[2];}}
function migrateOldCommands(data){if(!data)return;Object.keys(data).forEach(category=>{if(data[category]&&typeof data[category]==='object'){Object.keys(data[category]).forEach(key=>{const keyData=data[category][key];if(keyData&&keyData.list&&Array.isArray(keyData.list)){keyData.list.forEach(item=>{if(item.action&&typeof item.action==='object'){if(item.action.shortCommand!==undefined){item.action.shortcut=item.action.shortCommand;delete item.action.shortCommand;}}if(!item.label){item.label={text:""};}});}});}});}
function parseDataFile(text){let cleanText=text.replace(/\/\/.*$/gm,'').replace(/\/\*[\s\S]*?\*\//g,'').replace(/,\s*([}\]])/g,'$1');return new Function("return ("+cleanText+");")();}

function renderKeyboard(){
    const area=document.getElementById('keyboardRenderContainer');
    area.innerHTML='';
    const isDark=document.documentElement.getAttribute('data-theme')==='dark';
    const GAP = 6;
    
    // Determine portrait and landscape mode names
    let portraitMode, landscapeMode, portraitLabel, landscapeLabel;
    if (typeof currentMode !== 'undefined' && currentMode && currentMode.includes('En')) {
        portraitMode = 'portraitEn'; landscapeMode = 'landscapeEn';
        portraitLabel = '豎屏英文 (Portrait)'; landscapeLabel = '橫屏英文 (Landscape)';
    } else {
        portraitMode = 'portraitPinyin'; landscapeMode = 'landscapePinyin';
        portraitLabel = '豎屏中文 (Portrait)'; landscapeLabel = '橫屏中文 (Landscape)';
    }
    
    function buildKeyboardSection(modeKey, label) {
        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'text-align:center; font-size:13px; font-weight:600; color:var(--text-secondary); margin:8px 0 6px; letter-spacing:0.5px;';
        labelDiv.innerText = label;
        area.appendChild(labelDiv);
        
        let useLayouts = (typeof layouts !== 'undefined' && layouts && layouts[modeKey] && layouts[modeKey].rows.length > 0);
        
        if (useLayouts) {
            let rows = layouts[modeKey].rows;
            rows.forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'keyboard-row';
                rowDiv.style.gap = GAP + 'px';
                const keyCount = row.keys.length;
                const totalGap = GAP * (keyCount - 1);
                row.keys.forEach(keyObj => {
                    let code = String(keyObj.outCode || keyObj.code).toLowerCase();
                    let keyChar = code;
                    if(code === ',') keyChar = 'comma';
                    else if(code === '.') keyChar = 'period';
                    else if(code === '/') keyChar = 'slash';
                    else if(code === ';') keyChar = 'semicolon';
                    else if(code === '~') keyChar = 'tildedirect';
                    else if(code === 'perioddirect') keyChar = 'perioddirect';
                    const keyBtn=document.createElement('div');
                    keyBtn.className='key';
                    let upperCode = String(keyObj.outCode || keyObj.code).toUpperCase();
                    let isEnter = ['ENTER','↵','RETURN'].includes(upperCode);
                    let sysKeys = (typeof systemKeys !== 'undefined') ? systemKeys : ['BACKSPACE','ENTER','SHIFT','SPACE','NUMERIC'];
                    let isSys = sysKeys.includes(upperCode);
                    let bgStyle='alphabeticBackgroundStyle';
                    if(isSys) bgStyle='systemButtonBackgroundStyle';
                    if(isEnter) bgStyle='searchButtonBackgroundStyle';
                    keyBtn.style.backgroundColor=getKeyBg(bgStyle);
                    keyBtn.style.color=getKeyTextColor();
                    if(isEnter) keyBtn.style.color='#ffffff';
                    const pct = (keyObj.width * 100);
                    keyBtn.style.width = 'calc(' + pct + '% - ' + (keyObj.width * totalGap) + 'px)';
                    let displayChar = upperCode;
                    if(typeof symbolMap !== 'undefined' && symbolMap && symbolMap[upperCode] !== undefined) displayChar = symbolMap[upperCode];
                    if(upperCode === 'SPACE') displayChar = '空白鍵';
                    if(upperCode === 'NUMERIC') displayChar = '123';
                    keyBtn.innerText = displayChar;
                    const upData=swipeData.swipe_up[keyChar];
                    if(upData&&upData.label){const s=document.createElement('span');s.className='swipe-label swipe-up-label';s.innerText=upData.label.systemImageName?(sfSymbolEmojiMap[upData.label.systemImageName]||'❖'):(upData.label.text||'');if(upData.fontSize)s.style.fontSize=upData.fontSize+'px';let c2=upData.normalColor||upData.label.color;if(c2)s.style.color=c2;keyBtn.appendChild(s);}
                    const downData=swipeData.swipe_down[keyChar];
                    if(downData&&downData.label){const s=document.createElement('span');s.className='swipe-label swipe-down-label';s.innerText=downData.label.systemImageName?(sfSymbolEmojiMap[downData.label.systemImageName]||'❖'):(downData.label.text||'');if(downData.fontSize)s.style.fontSize=downData.fontSize+'px';let c2=downData.normalColor||downData.label.color;if(c2)s.style.color=c2;keyBtn.appendChild(s);}
                    let hasHint=false;
                    if(currentCategory==='both'){hasHint=(hintSymbolsData.alphabetic&&hintSymbolsData.alphabetic[keyChar]&&hintSymbolsData.alphabetic[keyChar].list.length>0)||(hintSymbolsData.pinyin&&hintSymbolsData.pinyin[keyChar]&&hintSymbolsData.pinyin[keyChar].list.length>0);}else{hasHint=hintSymbolsData[currentCategory]&&hintSymbolsData[currentCategory][keyChar]&&hintSymbolsData[currentCategory][keyChar].list.length>0;}
                    if(hasHint)keyBtn.classList.add('has-hint');
                    keyBtn.onclick=()=>selectKey(keyChar);
                    keyBtn.onmousedown=(e)=>{if(e.button!==0)return;longPressTimer=setTimeout(()=>showPopup(keyBtn,keyChar),350);};
                    keyBtn.onmouseup=()=>{clearTimeout(longPressTimer);hidePopup();};
                    keyBtn.onmouseleave=()=>{clearTimeout(longPressTimer);hidePopup();};
                    keyBtn.ontouchstart=()=>{longPressTimer=setTimeout(()=>showPopup(keyBtn,keyChar),350);};
                    keyBtn.ontouchend=()=>{clearTimeout(longPressTimer);hidePopup();};
                    keyBtn.ontouchcancel=()=>{clearTimeout(longPressTimer);hidePopup();};
                    keyBtn.oncontextmenu=(e)=>{e.preventDefault();return false;};
                    rowDiv.appendChild(keyBtn);
                });
                area.appendChild(rowDiv);
            });
        } else {
            const defaultRows = layoutRows;
            defaultRows.forEach(row=>{
                const rowDiv=document.createElement('div');
                rowDiv.className='keyboard-row';
                rowDiv.style.gap = GAP + 'px';
                row.forEach(cellName=>{
                    let keyChar=extractKeyName(cellName);
                    if(!keyChar)return;
                    const keyBtn=document.createElement('div');
                    keyBtn.className='key';
                    let bgStyle='alphabeticBackgroundStyle';
                    if(['backspace','enter','shift','numeric','space','nextkeyboard'].includes(keyChar))bgStyle='systemButtonBackgroundStyle';
                    if(keyChar==='enter'||keyChar==='search')bgStyle='searchButtonBackgroundStyle';
                    keyBtn.style.backgroundColor=getKeyBg(bgStyle);
                    keyBtn.style.color=getKeyTextColor();
                    if(keyChar==='enter'||keyChar==='search')keyBtn.style.color='#ffffff';
                    keyBtn.style.flex = '1';
                    if(keyChar==='space') keyBtn.style.flex='4';
                    else if(keyChar==='backspace') keyBtn.style.flex='1.5';
                    else if(keyChar==='shift') keyBtn.style.flex='1.5';
                    else if(keyChar==='numeric') keyBtn.style.flex='1.5';
                    else if(keyChar==='enter'||keyChar==='search') keyBtn.style.flex='2';
                    let displayChar=keyChar;
                    if(keyChar==='space') displayChar='空白鍵';
                    else if(keyChar==='backspace') displayChar='⌫';
                    else if(keyChar==='shift') displayChar='⇧';
                    else if(keyChar==='numeric') displayChar='123';
                    else if(keyChar==='enter'||keyChar==='search') displayChar='Enter';
                    else if(keyChar.includes('tilde')) displayChar='~';
                    else if(keyChar.includes('perioddirect')) displayChar='.';
                    else if(keyChar==='comma') displayChar=',';
                    else if(keyChar==='period') displayChar='.';
                    else if(keyChar==='semicolon'||keyChar===';') displayChar=';';
                    else if(keyChar==='/'||keyChar==='slash') displayChar='/';
                    keyBtn.innerText=displayChar;
                    const upData=swipeData.swipe_up[keyChar];if(upData&&upData.label){const s=document.createElement('span');s.className='swipe-label swipe-up-label';s.innerText=upData.label.systemImageName?(sfSymbolEmojiMap[upData.label.systemImageName]||'❖'):(upData.label.text||'');if(upData.fontSize)s.style.fontSize=upData.fontSize+'px';let c2=upData.normalColor||upData.label.color;if(c2)s.style.color=c2;keyBtn.appendChild(s);}
                    const downData=swipeData.swipe_down[keyChar];if(downData&&downData.label){const s=document.createElement('span');s.className='swipe-label swipe-down-label';s.innerText=downData.label.systemImageName?(sfSymbolEmojiMap[downData.label.systemImageName]||'❖'):(downData.label.text||'');if(downData.fontSize)s.style.fontSize=downData.fontSize+'px';let c2=downData.normalColor||downData.label.color;if(c2)s.style.color=c2;keyBtn.appendChild(s);}
                    let hasHint=false;if(currentCategory==='both'){hasHint=(hintSymbolsData.alphabetic&&hintSymbolsData.alphabetic[keyChar]&&hintSymbolsData.alphabetic[keyChar].list.length>0)||(hintSymbolsData.pinyin&&hintSymbolsData.pinyin[keyChar]&&hintSymbolsData.pinyin[keyChar].list.length>0);}else{hasHint=hintSymbolsData[currentCategory]&&hintSymbolsData[currentCategory][keyChar]&&hintSymbolsData[currentCategory][keyChar].list.length>0;}if(hasHint)keyBtn.classList.add('has-hint');
                    keyBtn.onclick=()=>selectKey(keyChar);keyBtn.onmousedown=(e)=>{if(e.button!==0)return;longPressTimer=setTimeout(()=>showPopup(keyBtn,keyChar),350);};keyBtn.onmouseup=()=>{clearTimeout(longPressTimer);hidePopup();};keyBtn.onmouseleave=()=>{clearTimeout(longPressTimer);hidePopup();};keyBtn.ontouchstart=()=>{longPressTimer=setTimeout(()=>showPopup(keyBtn,keyChar),350);};keyBtn.ontouchend=()=>{clearTimeout(longPressTimer);hidePopup();};keyBtn.ontouchcancel=()=>{clearTimeout(longPressTimer);hidePopup();};keyBtn.oncontextmenu=(e)=>{e.preventDefault();return false;};
                    rowDiv.appendChild(keyBtn);
                });
                area.appendChild(rowDiv);
            });
        }
    }
    
    // Render portrait keyboard
    buildKeyboardSection(portraitMode, portraitLabel);
    
    // Separator between portrait and landscape
    const sep = document.createElement('div');
    sep.style.cssText = 'border-top:1px dashed var(--border); margin:12px 0 4px;';
    area.appendChild(sep);
    
    // Render landscape keyboard
    buildKeyboardSection(landscapeMode, landscapeLabel);
    
    // Highlight selected key in both keyboards
    if(currentSelectedKey){
        document.querySelectorAll('#keyboardRenderContainer .key').forEach(k => {
            // The onclick is bound to selectKey(keyChar), we mark via class
        });
    }
}

function switchCategory(cat){if(currentSelectedKey)silentSaveCurrentKey();currentCategory=cat;document.getElementById('btn-both').className=cat==='both'?'btn btn-primary btn-sm':'btn btn-ghost btn-sm';document.getElementById('btn-pinyin').className=cat==='pinyin'?'btn btn-primary btn-sm':'btn btn-ghost btn-sm';document.getElementById('btn-alphabetic').className=cat==='alphabetic'?'btn btn-primary btn-sm':'btn btn-ghost btn-sm';currentSelectedKey=null;document.getElementById('editorArea').style.opacity='0.5';document.getElementById('editorArea').style.pointerEvents='none';document.getElementById('currentKeyDisplay').innerText='-';renderKeyboard();}
function switchEditorMode(mode){currentEditorMode=mode;document.getElementById('editorModeSwipe').className=mode==='swipe'?'btn btn-primary btn-sm':'btn btn-ghost btn-sm';document.getElementById('editorModeHint').className=mode==='hint'?'btn btn-primary btn-sm':'btn btn-ghost btn-sm';document.getElementById('swipeEditorSection').style.display=mode==='swipe'?'block':'none';document.getElementById('hintEditorSection').style.display=mode==='hint'?'block':'none';document.getElementById('copyPastePanelSwipe').style.display=mode==='swipe'?'flex':'none';document.getElementById('copyPastePanelHint').style.display=mode==='hint'?'flex':'none';document.getElementById('categoryTabs').style.display=mode==='hint'?'flex':'none';switchCodeTab(mode);}

function selectKey(keyChar){if(currentSelectedKey&&currentSelectedKey!==keyChar)silentSaveCurrentKey();currentSelectedKey=keyChar;renderKeyboard();let displayName=keyChar.toUpperCase();if(keyChar==='perioddirect')displayName='. (符號)';else if(keyChar==='comma')displayName=', (COMMA)';else if(keyChar==='period')displayName='. (PERIOD)';else if(keyChar===';')displayName='; (SEMICOLON)';else if(keyChar==='/')displayName='/ (SLASH)';document.getElementById('currentKeyDisplay').innerText=`${displayName}`;document.getElementById('editorArea').style.opacity='1';document.getElementById('editorArea').style.pointerEvents='auto';setupSwipePanel('up',swipeData.swipe_up[keyChar]||{});setupSwipePanel('down',swipeData.swipe_down[keyChar]||{});if(!hintSymbolsData.alphabetic)hintSymbolsData.alphabetic={};if(!hintSymbolsData.pinyin)hintSymbolsData.pinyin={};if(currentCategory==='both'){if(!hintSymbolsData.alphabetic[keyChar])hintSymbolsData.alphabetic[keyChar]={selectedIndex:0,list:[]};if(!hintSymbolsData.pinyin[keyChar])hintSymbolsData.pinyin[keyChar]={selectedIndex:0,list:[]};}else{if(!hintSymbolsData[currentCategory][keyChar])hintSymbolsData[currentCategory][keyChar]={selectedIndex:0,list:[]};}const activeCat=currentCategory==='both'?'alphabetic':currentCategory;document.getElementById('selectedIndexInput').value=hintSymbolsData[activeCat][keyChar].selectedIndex||0;const widthInput=document.getElementById('hintWidthInput');if(hintSymbolsData[activeCat][keyChar].size&&hintSymbolsData[activeCat][keyChar].size.width){widthInput.value=hintSymbolsData[activeCat][keyChar].size.width;}else{widthInput.value='';}renderHintItems();}

function updateSfPreview(prefix){const val=document.getElementById(prefix+'Label').value.trim();const box=document.getElementById(prefix+'SfPreview');if(val.toLowerCase().startsWith('sf:'))box.innerText=sfSymbolEmojiMap[val.substring(3).trim()]||'❖';else if(val.length>0)box.innerText=Array.from(val)[0];else box.innerText='';}
function autoFillSf(prefix){const typeVal=document.getElementById(prefix+'Type').value;const labelInput=document.getElementById(prefix+'Label');if(commandToSfMap[typeVal])labelInput.value=commandToSfMap[typeVal];else labelInput.value='';updateSfPreview(prefix);}
function handleTypeChange(prefix){const typeVal=document.getElementById(prefix+'Type').value;const symbolInput=document.getElementById(prefix+'Symbol');if(noValueCommands.includes(typeVal)||typeVal.startsWith('shortcut_')){symbolInput.disabled=true;symbolInput.value='';}else symbolInput.disabled=false;}
function setupSwipePanel(prefix,data){let type="none",val="",labelText="";if(data.action){if(typeof data.action==='string'){if(noValueCommands.includes(data.action))type=data.action;else{type="symbol";val=data.action;}}else if(typeof data.action==='object'){if(data.action.shortcut){if(reverseShortcutMap[data.action.shortcut])type=reverseShortcutMap[data.action.shortcut];else{type="shortcut";val=data.action.shortcut;}}else if(data.action.character){type="character";val=data.action.character;}else if(data.action.symbol){type="symbol";val=data.action.symbol;}else if(data.action.sendKeys){type="sendKeys";val=data.action.sendKeys;}else if(data.action.keyboardType){type="keyboardType";val=data.action.keyboardType;}}}if(data.label){if(data.label.systemImageName)labelText="sf:"+data.label.systemImageName;else labelText=data.label.text||'';}document.getElementById(prefix+'Type').value=type;document.getElementById(prefix+'Symbol').value=val;document.getElementById(prefix+'Label').value=labelText;const sizeInput=document.getElementById(prefix+'Size');sizeInput.value=data.fontSize||'';let colorVal=data.normalColor||data.label?.color||'#8e8e93';document.getElementById(prefix+'Color').value=colorVal;document.getElementById(prefix+'ColorText').value=colorVal.toUpperCase();handleTypeChange(prefix);updateSfPreview(prefix);}
function buildSwipeNode(prefix,existingData){const type=document.getElementById(prefix+'Type').value;const val=document.getElementById(prefix+'Symbol').value.trim();const labelText=document.getElementById(prefix+'Label').value.trim();const size=document.getElementById(prefix+'Size').value;const color=document.getElementById(prefix+'Color').value;if(type==='none'&&!labelText)return null;let node=existingData?JSON.parse(JSON.stringify(existingData)):{action:{},label:{}};if(!node.label)node.label={};delete node.action;if(type!=='none'){if(noValueCommands.includes(type))node.action=type;else if(type.startsWith('shortcut_'))node.action={"shortcut":presetShortcuts[type]};else if(val){node.action={};node.action[type]=val;}}if(labelText){if(labelText.toLowerCase().startsWith('sf:')){node.label.systemImageName=labelText.substring(3).trim();delete node.label.text;}else{node.label.text=labelText;delete node.label.systemImageName;}}else{delete node.label.text;delete node.label.systemImageName;}if(size)node.fontSize=parseInt(size);else delete node.fontSize;if(color&&color.toLowerCase()!=='#8e8e93'){node.normalColor=node.highlightColor=color;}else{delete node.normalColor;delete node.highlightColor;if(node.label&&node.label.color)delete node.label.color;}if(Object.keys(node.label).length===0){node.label={text:""};}if(!node.action&&(!node.label||(node.label.text===""&&!node.label.systemImageName))&&!node.fontSize&&!node.normalColor)return null;return node;}
