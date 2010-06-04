<?php
$index = 0;
$files['data'] = array();
$hd = opendir('uploads3');
while ($file = readdir($hd)) {
  if ($file != '.' and $file != '..') {
    $files['data'][$index]['name'] = $file;
    $files['data'][$index]['lastmod'] = 1272391250000;
    $index++;
  }
}
header("Content-Type:text/plain");
print json_encode($files);
?>
