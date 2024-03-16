<?php
	header('Access-Control-Allow-Origin: *');
    $dburl = '127.0.0.1:49426';
    $dbname = 'localdb';
    $dbusername = 'azure';
    $dbpassword = '6#vWHD_$';

	foreach ($_SERVER as $key => $value) {
        if (strpos($key, "localdb") !== 0) {
            continue;
        }
        $dburl = preg_replace("/^.*Data Source=(.+?);.*$/", "\\1", $value);
        $dbname = preg_replace("/^.*Database=(.+?);.*$/", "\\1", $value);
        $dbusername = preg_replace("/^.*User Id=(.+?);.*$/", "\\1", $value);
        $dbpassword = preg_replace("/^.*Password=(.+?)$/", "\\1", $value);
    }
	$db = mysqli_connect($dburl, $dbusername, $dbpassword, $dbname);
	$db->query("SET NAMES 'utf8'");
    $db->query("SET CHARACTER SET 'utf8'");
?>