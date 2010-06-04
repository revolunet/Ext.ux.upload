<?php
header('Content-Type:text/html');
$success = 'false';
$path = 'uploads3';

$d = dir($path); 
while($entry = $d->read()) { 
  print var_dump($entry);
  if ($entry!= "." && $entry!= "..") { 
    unlink($path."/".$entry); 
  } 
} 

if (!strlen($_SERVER['HTTP_X_FILE_NAME'])) {
  foreach($_FILES as $file) {
    $path .= "/" . basename($file['name']);
    $ext = explode(".", $path);
    if (!$ext[1]) $ext[1] = "jpg";
    $path = "uploads3/image.".$ext[1];
    if (move_uploaded_file($file['tmp_name'], $path))
      $success = 'true';
  }
} else {
  $temp_file = tempnam($path, "my_file_");
  file_put_contents($temp_file, file_get_contents("php://input"));
  $filename = $path."/".$_SERVER['HTTP_X_FILE_NAME'];
  $ext = explode(".", $filename);
  if (!$ext[1]) $ext[1] = "jpg";
  $filename = "uploads3/image.".$ext[1];
  rename($temp_file, $filename);
  chmod($filename, 0644);
  $success = 'true';
}

print '{success:'.$success.'}';
?>
