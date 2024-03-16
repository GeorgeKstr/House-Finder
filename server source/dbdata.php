<?php
    $dburl = '';
    $dbname = '';
    $dbusername = '';
    $dbpassword = '';

    foreach ($_SERVER as $key => $value) {
        if (strpos($key, "MYSQLCONNSTR_localdb") !== 0) {
            continue;
        }
    
        $dburl = preg_replace("/^.*Data Source=(.+?);.*$/", "\\1", $value);
        $dbname = preg_replace("/^.*Database=(.+?);.*$/", "\\1", $value);
        $dbusername = preg_replace("/^.*User Id=(.+?);.*$/", "\\1", $value);
        $dbpassword = preg_replace("/^.*Password=(.+?)$/", "\\1", $value);
    }
	$accountstable = 'accounts';
	$reportstable = 'reports';
	$likestable = 'likes';
	$dislikestable = 'dislikes';
	$imagefolder = 'pictures/';
	$thumbfolder = 'thumbnails/';
	$thumb_width = 128;
	$thumb_height = 128;
	$db = mysqli_connect($dburl, $dbusername, $dbpassword, $dbname);
?>