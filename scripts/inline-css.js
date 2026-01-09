const fs = require('fs');
const path = require('path');

// 再帰的にHTMLファイルを検索
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 絶対パスを相対パスに変換
function convertToRelativePath(absolutePath, htmlFile, outDir) {
  if (!absolutePath.startsWith('/')) {
    return absolutePath; // 既に相対パスの場合
  }
  
  // HTMLファイルのディレクトリを取得
  const htmlDir = path.dirname(htmlFile);
  const targetPath = path.join(outDir, absolutePath.substring(1));
  
  // 相対パスを計算
  const relativePath = path.relative(htmlDir, targetPath);
  
  // Windowsのパス区切りを/に変換
  return relativePath.split(path.sep).join('/');
}

// outディレクトリ内のHTMLファイルを処理
function inlineCSS() {
  const outDir = path.join(__dirname, '..', 'out');
  
  if (!fs.existsSync(outDir)) {
    console.error('out directory not found');
    return;
  }

  // すべてのHTMLファイルを検索
  const htmlFiles = findHtmlFiles(outDir);
  
  if (htmlFiles.length === 0) {
    console.warn('No HTML files found in out directory');
    return;
  }

  htmlFiles.forEach(htmlFile => {
    // HTMLファイルを読み込む
    let html = fs.readFileSync(htmlFile, 'utf8');
    let modified = false;
    
    // CSSファイルのパスを抽出してインライン化
    const cssLinkRegex = /<link[^>]*href="([^"]*\.css)"[^>]*>/g;
    const cssMatches = [...html.matchAll(cssLinkRegex)];
    
    for (const match of cssMatches) {
      const cssPath = match[1];
      // 絶対パスを相対パスに変換
      const relativePath = cssPath.startsWith('/') 
        ? cssPath.substring(1) 
        : cssPath;
      const fullCssPath = path.join(outDir, relativePath);
      
      if (fs.existsSync(fullCssPath)) {
        // CSSファイルを読み込む
        const cssContent = fs.readFileSync(fullCssPath, 'utf8');
        
        // <link>タグを<style>タグに置き換え
        const styleTag = `<style>${cssContent}</style>`;
        html = html.replace(match[0], styleTag);
        modified = true;
        
        console.log(`Inlined CSS: ${cssPath} -> ${path.relative(outDir, htmlFile)}`);
      } else {
        console.warn(`CSS file not found: ${fullCssPath}`);
      }
    }
    
    // JavaScriptファイルのパスを相対パスに変換
    // <script src="..."> と <link rel="preload" href="...">
    const jsSrcRegex = /(<script[^>]*src=")([^"]+)("[^>]*>)/g;
    const jsPreloadRegex = /(<link[^>]*rel="preload"[^>]*href=")([^"]+\.js)("[^>]*>)/g;
    
    // scriptタグのsrc属性を変換
    html = html.replace(jsSrcRegex, (match, prefix, srcPath, suffix) => {
      if (srcPath.startsWith('/_next/')) {
        const relativePath = convertToRelativePath(srcPath, htmlFile, outDir);
        modified = true;
        console.log(`Converted JS path: ${srcPath} -> ${relativePath} in ${path.relative(outDir, htmlFile)}`);
        return `${prefix}${relativePath}${suffix}`;
      }
      return match;
    });
    
    // preload linkタグのhref属性を変換
    html = html.replace(jsPreloadRegex, (match, prefix, hrefPath, suffix) => {
      if (hrefPath.startsWith('/_next/')) {
        const relativePath = convertToRelativePath(hrefPath, htmlFile, outDir);
        modified = true;
        console.log(`Converted preload path: ${hrefPath} -> ${relativePath} in ${path.relative(outDir, htmlFile)}`);
        return `${prefix}${relativePath}${suffix}`;
      }
      return match;
    });
    
    // HTMLファイルを書き込む
    if (modified) {
      fs.writeFileSync(htmlFile, html, 'utf8');
    }
  });
  
  console.log(`CSS inlining and path conversion completed! Processed ${htmlFiles.length} HTML file(s).`);
  
  // JavaScriptファイル内の/_next/パスも相対パスに変換
  console.log('Converting /_next/ paths in JavaScript files...');
  const jsFiles = [];
  function findJsFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findJsFiles(filePath);
      } else if (file.endsWith('.js')) {
        jsFiles.push(filePath);
      }
    });
  }
  findJsFiles(path.join(outDir, '_next'));
  
  let jsModifiedCount = 0;
  jsFiles.forEach(jsFile => {
    let content = fs.readFileSync(jsFile, 'utf8');
    const originalContent = content;
    
    // d.p="/_next/" を空文字列に設定（相対パスを使用）
    content = content.replace(/d\.p\s*=\s*"\/_next\/"/g, 'd.p=""');
    
    // CSSファイルへの参照を完全に削除（既にインライン化されているため）
    // 1. 文字列リテラル内のCSSパスを空文字列に置換（より広範囲にマッチ）
    content = content.replace(/["']\/_next\/static\/css\/[^"']*["']/g, '""');
    
    // 2. 動的に生成されるCSSパスを無効化
    // d.p + "/_next/static/css/..." のようなパターン
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*\s*\+\s*["']\/_next\/static\/css\/[^"']*["'])/g, '""');
    content = content.replace(/(["'][^"']*["']\s*\+\s*["']\/_next\/static\/css\/[^"']*["'])/g, '""');
    
    // 3. CSSファイルを含む配列からCSSを削除
    // ["/_next/static/css/xxx.css", ...] のようなパターン
    content = content.replace(/(\[[^\]]*)"\/_next\/static\/css\/[^"']*["']([^\]]*\])/g, (match, before, after) => {
      // 前後のカンマを処理
      let newBefore = before.replace(/,\s*$/, '');
      let newAfter = after.replace(/^\s*,/, '');
      return newBefore + newAfter;
    });
    
    // 4. CSSファイルをフィルタリングする処理を追加
    // .filter(e => e.endsWith('.css')) のような処理を無効化
    content = content.replace(/\.filter\([^)]*\.css[^)]*\)/g, '.filter(() => false)');
    
    // 5. CSSファイルを読み込む処理を無効化
    // .css で終わるファイルを読み込む処理をスキップ
    content = content.replace(/(\.endsWith\(["']\.css["']\)|\.match\([^)]*\.css[^)]*\))/g, 'false');
    
    // 6. CSSファイルをpreloadする処理を無効化
    // link要素を作成してCSSを読み込む処理をスキップ
    content = content.replace(/(link\.rel\s*=\s*["']stylesheet["']|link\.href\s*=\s*["'][^"']*\.css[^"']*["'])/g, '/* CSS already inlined */ false && $1');
    
    // 7. CSSファイルを含む文字列連結を無効化
    // d.p + "/_next/static/css/..." のようなパターン
    content = content.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*\s*\+\s*["']\/_next\/static\/css\/)/g, '"" + ""');
    
    // その他の "/_next/" パスを相対パスに変換
    // JavaScriptファイルは out/_next/static/chunks/ 内にあるので、
    // out ディレクトリは ../../ になる
    const relativePath = path.relative(path.dirname(jsFile), outDir);
    const relativePathStr = relativePath ? relativePath.split(path.sep).join('/') + '/' : '';
    
    // "/_next/" を相対パスに変換（ただし、CSSとd.pは既に処理済み）
    // CSSファイルへの参照は既に削除されているので、JSファイルのみ変換
    content = content.replace(/"\/_next\/static\/(?!css\/)([^"']+)"/g, `"${relativePathStr}_next/static/$1"`);
    
    if (content !== originalContent) {
      fs.writeFileSync(jsFile, content, 'utf8');
      jsModifiedCount++;
      console.log(`Converted paths in: ${path.relative(outDir, jsFile)}`);
    }
  });
  
  console.log(`JavaScript path conversion completed! Modified ${jsModifiedCount} file(s).`);
}

inlineCSS();
