<?php

$uploads_dir = '/var/www/dev/upload/test/uploads/';

$_TEST = array("pof" => "pif");

$fp = fopen($uploads_dir.'log', 'a');
fwrite($fp, "upload:\n");
fwrite($fp, strval($_FILES));
fclose($fp);

foreach($_FILES as $file) {
  $path = $path . basename( $file['Filedata']);
  if (move_uploaded_file($file['tmp_name'], $path)) {
    $success = 'true';
  }
}
/*
foreach ($_FILES["Filedata"]["error"] as $key => $error) {
  if ($error == UPLOAD_ERR_OK) {
    $tmp_name = $_FILES["Filedata"]["tmp_name"][$key];
    $name = $_FILES["Filedata"]["name"][$key];
    move_uploaded_file($tmp_name, "$uploads_dir/$name");
  }
}
*/
?>
