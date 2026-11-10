/* UKSCA Pass Project: Edge-only private document shelf for the public GitHub Pages site. */
(function () {
  "use strict";
  var DOC_ITEMS=[
    ["resources/Essentials of Strength Training and Conditioning 3.pdf","Essentials of Strength Training and Conditioning · 3rd edition","Your textbook · used for lesson reading links"],
    ["resources/UKSCA Competency Document.pdf","UKSCA ASCC Competency Document","The full UKSCA competency criteria"],
    ["resources/Sample 1 Questions.pdf","UKSCA Sample Paper 1 · questions","Previous paper · baseline 33/50"],
    ["resources/Sample 1 Answers.pdf","UKSCA Sample Paper 1 · answers","Your supplied answer key"],
    ["resources/Sample 2 Questions.pdf","UKSCA Sample Paper 2 · questions","Previous paper · baseline 30/50"],
    ["resources/Sample 2 Answers.pdf","UKSCA Sample Paper 2 · answers","Your supplied answer key"],
    ["resources/Feb 2019 Questions.pdf","UKSCA 9 February 2019 · questions","Historical paper · baseline 36/50"],
    ["resources/Feb 2019 Answers.pdf","UKSCA 9 February 2019 · answers","Your supplied answer key"],
    ["resources/March 2020 Questions.pdf","UKSCA 1 March 2020 · questions","Historical paper · baseline 34/50"],
    ["resources/March 2020 Answers.pdf","UKSCA 1 March 2020 · answers","Your supplied answer key"]
  ];
  var DB_NAME="uksca-pass-project-edge-documents-v1";
  var accepted=new Set(DOC_ITEMS.map(function(x){return x[0]}));
  function openDb(){
    return new Promise(function(resolve,reject){
      if(!("indexedDB" in window)){reject(new Error("This browser does not support local document storage."));return;}
      var request=indexedDB.open(DB_NAME,1);
      request.onupgradeneeded=function(){if(!request.result.objectStoreNames.contains("pdfs"))request.result.createObjectStore("pdfs");};
      request.onsuccess=function(){resolve(request.result);};
      request.onerror=function(){reject(request.error||new Error("Unable to open document storage."));};
    });
  }
  async function fetchPdf(key){
    var db=await openDb();
    return new Promise(function(resolve,reject){
      var tx=db.transaction("pdfs","readonly");
      var request=tx.objectStore("pdfs").get(key);
      request.onsuccess=function(){resolve(request.result||null);};
      request.onerror=function(){reject(request.error||new Error("Unable to read PDF."));};
      tx.oncomplete=function(){db.close();};
    });
  }
  async function retainPdf(key,file){
    var db=await openDb();
    return new Promise(function(resolve,reject){
      var tx=db.transaction("pdfs","readwrite");
      tx.objectStore("pdfs").put({blob:file,name:file.name,date:new Date().toISOString(),size:file.size},key);
      tx.oncomplete=function(){db.close();resolve(true);};
      tx.onerror=function(){db.close();reject(tx.error||new Error("Unable to store PDF."));};
      tx.onabort=function(){db.close();reject(tx.error||new Error("Saving the PDF was cancelled."));};
    });
  }
  function clean(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");}
  function closeViewer(){
    var e=document.getElementById("edgePdfViewer");
    if(!e)return;
    var u=e.dataset.objectUrl;
    e.remove();
    if(u)URL.revokeObjectURL(u);
    document.body.style.overflow="";
  }
  function displayPdf(file,key,page){
    closeViewer();
    var u=URL.createObjectURL(file.blob);
    var title=DOC_ITEMS.find(function(x){return x[0]===key;});
    var overlay=document.createElement("div");
    overlay.id="edgePdfViewer";
    overlay.dataset.objectUrl=u;
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    overlay.setAttribute("aria-label","PDF document viewer");
    overlay.style.cssText="position:fixed;inset:0;z-index:99999;background:#091219;display:flex;flex-direction:column;";
    var heading=document.createElement("div");
    heading.style.cssText="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:12px 18px;background:#132431;color:#f0f7f6;border-bottom:1px solid #27404d;font:14px system-ui;";
    var name=document.createElement("strong");name.textContent=title?title[1]:file.name;heading.appendChild(name);
    var close=document.createElement("button");close.textContent="✕ Close PDF";close.className="btn primary";close.addEventListener("click",closeViewer);heading.appendChild(close);
    var frame=document.createElement("iframe");frame.title=name.textContent;
    frame.src=u+(page?"#page="+encodeURIComponent(page):"");
    frame.style.cssText="border:0;flex:1;width:100%;background:white;";
    overlay.appendChild(heading);overlay.appendChild(frame);
    document.body.appendChild(overlay);
    document.body.style.overflow="hidden";
    close.focus();
  }
  function choosePdf(key,openAfter,page){
    if(!accepted.has(key))return;
    var input=document.createElement("input");input.type="file";input.accept=".pdf,application/pdf";input.style.display="none";
    document.body.appendChild(input);
    input.addEventListener("change",async function(){
      var file=input.files&&input.files[0];input.remove();if(!file)return;
      if(!(/\.pdf$/i.test(file.name)||file.type==="application/pdf")){alert("Please choose a PDF document.");return;}
      if(file.size>80*1024*1024){alert("This PDF is too large for the document shelf (maximum 80 MB).");return;}
      try{
        await retainPdf(key,file);
        refreshPdfStatuses();
        if(openAfter){var saved=await fetchPdf(key);displayPdf(saved,key,page);}
        else alert("Saved privately in Edge. You can open it from this website whenever you return in this Edge profile.");
      }catch(err){alert("Could not save this PDF in Edge: "+err.message);}
    },{once:true});
    input.click();
  }
  async function openStoredPdf(key,page){
    if(!accepted.has(key))return;
    try{
      var doc=await fetchPdf(key);
      if(doc&&doc.blob){displayPdf(doc,key,page);}
      else if(confirm("This PDF has not been added to Microsoft Edge yet. Choose the matching PDF from your laptop now? It will stay private in this browser, not on GitHub.")){choosePdf(key,true,page);}
    }catch(err){alert("Unable to access the saved PDF: "+err.message);}
  }
  function refreshPdfStatuses(){
    document.querySelectorAll("[data-pdf-status]").forEach(async function(el){
      try{
        var doc=await fetchPdf(el.getAttribute("data-pdf-status"));
        el.textContent=doc&&doc.blob?"✓ Saved in Edge · "+Math.round(doc.size/1024/1024*10)/10+" MB":"Not added yet";
        el.style.color=doc&&doc.blob?"#c6f37a":"#9db1bc";
      }catch(err){el.textContent="Browser storage unavailable";}
    });
  }
  function onlineDocuments(){
    setTimeout(refreshPdfStatuses,0);
    var rows=DOC_ITEMS.map(function(d,i){
      return '<div class="resource"><div class="ic">'+(i===0?"📕":i===1?"📋":i%2===0?"📃":"✅")+'</div><div style="flex:1"><b>'+clean(d[1])+'</b><div class="muted small">'+clean(d[2])+'</div><div class="small" data-pdf-status="'+clean(d[0])+'">Checking Edge storage…</div><div class="actions" style="margin-top:7px"><a class="btn small" href="'+clean(d[0])+'">Open PDF</a><button class="btn small ghost" data-pdf-choose="'+clean(d[0])+'">Add / replace PDF</button></div></div></div>';
    }).join("");
    return '<div class="kicker">Free hosted website · private Edge documents</div><h1 class="page-title">Documents and reference library</h1>'+
     '<p class="lead">Your quizzes, lessons, mocks and progress run directly on this website. Copyrighted textbooks and past papers are not uploaded publicly. Add a PDF once from your laptop and this site can open it from your private Microsoft Edge storage, including the textbook links inside daily lessons.</p>'+
     '<div class="twocol"><div class="panel"><h3>My private PDF shelf</h3><p class="muted small">Optional setup: choose your own PDF files. They never leave this browser and cannot be viewed by other site visitors.</p>'+rows+'</div>'+
     '<div class="stack">'+
     '<div class="panel"><h3>Official online sources</h3><p class="muted small">These links open without adding local files.</p>'+
     '<div class="resource"><div class="ic">🌐</div><div><b>UKSCA assessments</b><div><a href="https://www.uksca.org.uk/assessments" target="_blank" rel="noopener">Official UKSCA assessment page ↗</a></div></div></div>'+
     '<div class="resource"><div class="ic">🌐</div><div><b>UKSCA assessment-day guidelines</b><div><a href="https://cdn.uksca.org.uk/assets/pdfs/ASCCdocs/AssessmentDayGuidelines2022.pdf" target="_blank" rel="noopener">Guidelines PDF ↗</a></div></div></div>'+
     '<div class="resource"><div class="ic">🌐</div><div><b>UKSCA FAQs</b><div><a href="https://www.uksca.org.uk/faq" target="_blank" rel="noopener">Official FAQs ↗</a></div></div></div></div>'+
     '<div class="panel"><h3>My LinkedIn profile photo</h3><div class="row">'+profilePhotoMarkup()+'<p class="muted small">Your photo stays in Edge and is included in your progress backup.</p></div><div class="actions"><button class="btn primary" onclick="document.getElementById(\'photoDocs\').click()">Choose profile picture</button><a class="btn" href="https://uk.linkedin.com/in/barny-wharin-b1095b29b" target="_blank" rel="noopener">LinkedIn profile</a></div><input id="photoDocs" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="changeProfilePhoto(this)"></div>'+
     '<div class="panel"><h3>Autosave in Microsoft Edge</h3><p class="muted small">Your responses, confidence, mock results, daily tasks and adaptive review schedule save automatically on this website in your Edge profile. Keep the same Edge profile; InPrivate mode, resetting Edge, or deleting site data may remove them. This is not cloud sync.</p>'+
     '<div class="actions"><button class="btn primary" onclick="exportBackup()">Export progress backup</button><button class="btn" onclick="document.getElementById(\'fileImport\').click()">Import old progress</button><button class="btn" onclick="downloadReport()">Export score history</button><input id="fileImport" type="file" accept=".json,application/json" style="display:none" onchange="importBackup(this)"></div>'+
     '<p class="muted small">If you used the previous downloaded edition, export its progress there and import it here once. Progress cannot automatically cross from a local file to this website.</p></div>'+
     '<div class="panel"><h3>How your personalised revision adapts</h3><p class="muted small">Every answer is tagged by competency, certainty and recall date. Weak and uncertain answers are tested sooner. Stronger answers return at longer intervals. All eight mocks and the Random 10 quiz remain available from the menu.</p></div>'+
     '</div></div>';
  }
  document.addEventListener("click",function(evt){
    var chooser=evt.target.closest("[data-pdf-choose]");
    if(chooser){evt.preventDefault();choosePdf(chooser.getAttribute("data-pdf-choose"),false);return;}
    var a=evt.target.closest('a[href^="resources/"]');
    if(a){
      evt.preventDefault();
      var href=a.getAttribute("href")||"";
      var split=href.split("#");
      var match=(split[1]||"").match(/^page=(\d+)/);
      openStoredPdf(split[0],match?parseInt(match[1],10):null);
    }
  },true);
  document.addEventListener("keydown",function(evt){if(evt.key==="Escape"&&document.getElementById("edgePdfViewer"))closeViewer();});
  window.openStoredPdf=openStoredPdf;
  window.choosePdf=choosePdf;
  documents=onlineDocuments;
  try{if(navigator.storage&&navigator.storage.persisted){navigator.storage.persisted().then(function(saved){if(!saved)console.info("Consider exporting a weekly UKSCA progress backup.");});}}catch(e){}
})();
