<?php
$success = 'false';
$path = $_REQUEST['folder'];

$d = dir($path); 
while($entry = $d->read()) { 
  print var_dump($entry);
  if ($entry!= "." && $entry!= "..") { 
    unlink($path."/".$entry); 
  } 
} 

header('Content-Type:text/plain');
print '{success:'.$success.'}';
?>
