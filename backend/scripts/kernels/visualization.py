

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Instagram Analytics Visualization | Kaggle</title>
  <meta charset="utf-8" />
    <meta name="robots" content="index, follow" />
  <meta name="description" content="Explore and run machine learning code with Kaggle Notebooks | Using data from Instagram Analytics Dataset" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">
  <meta name="theme-color" content="#008ABC" />
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" type="text/javascript">
    window["pageRequestStartTime"] = 1774087933621;
    window["pageRequestEndTime"] = 1774087933626;
    window["initialPageLoadStartTime"] = new Date().getTime();
  </script>
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" id="gsi-client" src="https://accounts.google.com/gsi/client" async defer></script>
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==">window.KAGGLE_JUPYTERLAB_PATH = "/static/assets/jupyterlab-v4/jupyterlab-index-2292a337ec4e516c.html";</script>
  <link rel="preconnect" href="https://www.google-analytics.com" crossorigin="anonymous" /><link rel="preconnect" href="https://stats.g.doubleclick.net" /><link rel="preconnect" href="https://storage.googleapis.com" /><link rel="preconnect" href="https://apis.google.com" />
    <link href="/static/images/favicon.ico" rel="shortcut icon" type="image/x-icon" id="dynamic-favicon" />
  <link rel="manifest" href="/static/json/manifest.json" crossorigin="use-credentials">


  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <link href="https://fonts.googleapis.com/css?family=Inter:400,400i,500,500i,600,600i,700,700i&display=swap"
    rel="preload" as="style" />
  <link href="https://fonts.googleapis.com/css2?family=Google+Symbols:FILL@0..1&display=block"
    rel="preload" as="style" />
  <link href="https://fonts.googleapis.com/css?family=Inter:400,400i,500,500i,600,600i,700,700i&display=swap"
    rel="stylesheet" media="print" id="async-google-font-1" />
  <link href="https://fonts.googleapis.com/css2?family=Google+Symbols:FILL@0..1&display=block"
    rel="stylesheet" media="print" id="async-google-font-2" />
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" type="text/javascript">
    const styleSheetIds = ["async-google-font-1", "async-google-font-2"];
    styleSheetIds.forEach(function (id) {
      document.getElementById(id).addEventListener("load", function() {
        this.media = "all";
      });
    });
  </script>


    <link rel="canonical" href="/code/abubakerasiel/instagram-analytics-visualization" />
    <link rel="stylesheet" type="text/css" href="/static/assets/app.css?v=a53f951c511cf82e" />

  
    
 
      <script nonce="h1Hkm02rzWbvTtpCaWq9qA==">
        try{(function(a,s,y,n,c,h,i,d,e){d=s.createElement("style");
        d.appendChild(s.createTextNode(""));s.head.appendChild(d);d=d.sheet;
        y=y.map(x => d.insertRule(x + "{ opacity: 0 !important }"));
        h.start=1*new Date;h.end=i=function(){y.forEach(x => x<d.cssRules.length ? d.deleteRule(x) : {})};
        (a[n]=a[n]||[]).hide=h;setTimeout(function(){i();h.end=null},c);h.timeout=c;
        })(window,document,['.site-header-react__nav'],'dataLayer',2000,{'GTM-52LNT9S':true});}catch(ex){}
    </script>
    <script nonce="h1Hkm02rzWbvTtpCaWq9qA==">
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-T7QHS60L4Q', {
            'optimize_id': 'GTM-52LNT9S',
            'displayFeaturesTask': null,
            'send_page_view': false,
            'content_group1': 'Notebooks',
            'user_properties': {
                'logged_in': false,
            }
        });
    </script>
    <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" async src="https://www.googletagmanager.com/gtag/js?id=G-T7QHS60L4Q"></script>


  
    
    <meta name="og:url" content="https://kaggle.com/code/abubakerasiel/instagram-analytics-visualization" />
    <meta property="og:title" content="Instagram Analytics Visualization" />
    <meta property="og:description" content="Explore and run machine learning code with Kaggle Notebooks | Using data from Instagram Analytics Dataset" />
    <meta property="og:type" content="website" />

        <meta name="og:image" content="https://storage.googleapis.com/kaggle-avatars/thumbnails/29657784-kg.jpeg?t=2025-10-31-00-00-12" />
        <meta name="twitter:image" content="https://storage.googleapis.com/kaggle-avatars/thumbnails/29657784-kg.jpeg?t=2025-10-31-00-00-12" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@kaggledatasets" />




  <meta name="twitter:site" content="@Kaggle" /> 
  
    
    <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" type="application/ld+json">{"@context":"http://schema.org/","@type":"Article","author":{"@type":"Person","name":"abubakerasiel","sameAs":null},"headline":"Instagram Analytics Visualization","url":"https://www.kaggle.com","dateModified":"2025-12-08T18:31:56.06Z","datePublished":"2025-12-08T18:31:56.06Z","mainEntityOfPage":{"@type":"WebPage","@id":"https://www.kaggle.com"},"publisher":{"@type":"Organization","name":"Kaggle","sameAs":"https://www.kaggle.com","logo":{"type":"ImageObject","url":"https://www.kaggle.com/static/images/site-logo.png"}},"image":["https://storage.googleapis.com/kaggle-avatars/thumbnails/29657784-kg.jpeg?t=2025-10-31-00-00-12"],"description":""}</script>


  
    
        <link rel="alternate" type="application/json+oembed"
          href="https://www.kaggle.com/oembed/kernel?url=https%3A%2F%2Fwww.kaggle.com%2Fcode%2Fabubakerasiel%2Finstagram-analytics-visualization%3FscriptVersionId%3D284772130"
          title="Instagram Analytics Visualization" />


  
    



    <script nonce="h1Hkm02rzWbvTtpCaWq9qA==">window['useKaggleAnalytics'] = true;</script>

  <script id="gapi-target" nonce="h1Hkm02rzWbvTtpCaWq9qA==" src="https://apis.google.com/js/api.js" defer
    async></script>
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" src="/static/assets/runtime.js?v=d09951d599157034"></script>
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" src="/static/assets/vendor.js?v=b58ece3666e973c5"></script>
  <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" src="/static/assets/app.js?v=7bebfeb9a29bb850"></script>
    <script nonce="h1Hkm02rzWbvTtpCaWq9qA==" type="text/javascript">
      window.kaggleStackdriverConfig = {
        key: 'AIzaSyA4eNqUdRRskJsCZWVz-qL655Xa5JEMreE',
        projectId: 'kaggle-161607',
        service: 'web-fe',
        version: 'ci',
        userId: '0'
      }
    </script>
</head>
<body>
  <div id="root">
    










<script nonce="h1Hkm02rzWbvTtpCaWq9qA==" type="text/x-mathjax-config">
    MathJax.Hub.Config({
    jax: ['input/TeX', 'output/SVG'],
    "HTML-CSS": {
    preferredFont: "TeX",
    availableFonts: ["STIX", "TeX"],
    linebreaks: {
    automatic: true
    },
    EqnChunk: (MathJax.Hub.Browser.isMobile ? 10 : 50)
    },
    tex2jax: {
    inlineMath: [["\\(", "\\)"], ["\\\\(", "\\\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    ignoreClass: "tex2jax_ignore|dno"
    },
    TeX: {
    noUndefined: {
    attributes: {
    mathcolor: "red",
    mathbackground: "#FFEEEE",
    mathsize: "90%"
    }
    }
    },
    Macros: {
    href: "{}"
    },
    skipStartupTypeset: true,
    messageStyle: "none",
    extensions: ["Safe.js"],
    });
</script>
<script type="text/javascript" nonce="h1Hkm02rzWbvTtpCaWq9qA==">
  window.addEventListener("DOMContentLoaded", () => {
    const head = document.getElementsByTagName("head")[0];
    const lib = document.createElement("script");
    lib.type = "text/javascript";
    // Always use the production asset in local dev, which is served from GCS. We tried to proxy and / or serve this
    // in a better way in localhost, but it didn't work out. See b/328073416#comment8 for details.
    const forceProdHost = window.location.hostname === "localhost";
    lib.src = `${forceProdHost ? "https://www.kaggle.com" : ""}/static/mathjax/2.7.9/MathJax.js?config=TeX-AMS_SVG`;
    head.appendChild(lib);
  });
</script>





  </div>
</body>
</html>
