<?php
	include('database.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$message = '';
	$session = '';
	$username = '';
	if($db->connect_error){
		$message = 'Could not connect to database';
	}
	else if(!isset($_POST['username'])){
		$message = 'Username is required';
	}
	else if(!isset($_POST['password'])){
		$message = 'Password is required';
	}
	else{
		$username = mysqli_real_escape_string($db, $_POST['username']);
		$password = mysqli_real_escape_string($db, $_POST['password']);
		$sql = "SELECT id,password FROM accounts WHERE username='$username'";
		$result = $db->query($sql);
		if($result->num_rows>0){
			$row=$result->fetch_assoc();
			if(password_verify($password, $row['password'])){
				$id=$row['id'];
				$testsession=md5(uniqid());
				$sql = "UPDATE accounts SET session='$testsession' WHERE id='$id'";
				if($db->query($sql)==TRUE){
					$session = $testsession;
					$status = true;
				}
				else
					$message = 'Could not connect to database';
			}
			else
				$message = 'Wrong password';
		}
		else
			$message = 'No user found with that data';
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message, 'session' => $session, 'id' => $id);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>