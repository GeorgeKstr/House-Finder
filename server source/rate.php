<?php
	include('database.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$username = mysqli_real_escape_string($db, $_POST['username']);
	$session = mysqli_real_escape_string($db, $_POST['session']);
	$rating = mysqli_real_escape_string($db, $_POST['rating']);
	$ad = mysqli_real_escape_string($db, $_POST['ad']);
	$status = false;
	$message = 'Could not authenticate your session';
	$id=authenticate($username, $session);
	if($id){
		if(isset($_POST['rating']) && isset($_POST['ad'])){
			if($db->connect_error){
				$message = 'Could not connect to database';
			}
			else{
				$sql = "SELECT id FROM ratings WHERE ad_id='$ad' AND user_id='$id'";
				$result = $db->query($sql);
				if($result->num_rows>0)
					$db->query("UPDATE ratings SET rating='$rating' WHERE user_id='$id'");
				
				else
					$db->query("INSERT INTO ratings (ad_id, user_id, rating) VALUES ('$ad', '$id', '$rating')");
				$message = $id;
				$status = true;
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>