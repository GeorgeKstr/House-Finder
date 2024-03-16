<?php
	include('database.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$username = mysqli_real_escape_string($db, $_POST['username']);
	$session = mysqli_real_escape_string($db, $_POST['session']);
	$ad = mysqli_real_escape_string($db, $_POST['ad']);
	$status = false;
	$message = 'Could not authenticate your session';
	$id=authenticate($username, $session);
	if($id){
		if(isset($_POST['ad'])){
			if($db->connect_error){
				$message = 'Could not connect to database';
			}
			else{
				$results = $db->query("SELECT owner_id FROM ads WHERE id='$ad'");
				if($results && $results->num_rows>0)
				{	
					$db->query("DELETE FROM ads WHERE id='$ad';");
					$db->query("DELETE FROM ratings WHERE ad_id='$ad';");
				}
				$message = $ad;
				$status = true;
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>