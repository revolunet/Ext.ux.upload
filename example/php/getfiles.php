<?php

$xaction = $_REQUEST['xaction'];

if ($xaction == 'removeall') {
  $success = 'false';
  $path = '/Users/goldledoigt/uploads/'.$_REQUEST['folder'];
  $d = dir($path); 
  while($entry = $d->read()) { 
    if ($entry!= "." && $entry!= "..") {
      unlink($path."/".$entry); 
    } 
  }
  $xaction = 'read';
} 


if ($xaction == 'read') {
  $index = 0;
  $files['data'] = array();
  $hd = opendir('/Users/goldledoigt/uploads/'.$_REQUEST['folder']);
  while ($file = readdir($hd)) {
    if ($file != '.' and $file != '..') {
      $files['data'][$index]['name'] = $file;
      $files['data'][$index]['lastmod'] = 1272391250000;
      $index++;
    }
  }
  header("Content-Type:text/plain");
  print json_encode($files);
} 

?>
