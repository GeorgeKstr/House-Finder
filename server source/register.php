<?php
	include('database.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$message = '';
	if(!isset($_POST['username']) || 
		!isset($_POST['password']) ||
		!isset($_POST['password2']) ||
		!isset($_POST['name']) ||
		!isset($_POST['lastname']) ||
		!isset($_POST['email']))
		$message = 'Incorrect form data';
	else
	{
		if($db->connect_error)
			$message = 'Could not connect to database';
		else{
			$username = mysqli_real_escape_string($db, $_POST['username']);
			$password = mysqli_real_escape_string($db, $_POST['password']);
			$password2 = mysqli_real_escape_string($db, $_POST['password2']);
			$name = mysqli_real_escape_string($db, $_POST['name']);
			$lastname = mysqli_real_escape_string($db, $_POST['lastname']);
			$email = mysqli_real_escape_string($db, $_POST['email']);
			
			if(empty($username))
				$message = 'Username is required';
			else if(empty($password))
				$message = 'Password is required';
			else if(empty($password2))
				$message = 'You need to fill both password fields';
			else if($password != $password2)
				$message = 'Passwords do not match';
			else if(empty($name))
				$message = 'Real name is required';
			else if(empty($lastname))
				$message = 'Last name is required';
			else if(empty($email))
				$message = 'Email address is required';
			else{
				$sql = "SELECT id FROM accounts WHERE username='$username'";
				$result = $db->query($sql);
				if($result->num_rows>0)
					$message='An account with that username already exists !';
				else{
					$password = password_hash($password, PASSWORD_DEFAULT);
					$sql = "INSERT INTO accounts (username, password, name, lastname, email) 
							VALUES ('$username', '$password', '$name', '$lastname', '$email')";
					if($db->query($sql)===true)
						$status=true;
					else
						$message = 'Could not connect to database';
				}
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>