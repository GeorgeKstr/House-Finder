<?php
	include('database.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$status = false;
	$houses = array();
	$message = 'Could not authenticate your session';
	$username = mysqli_real_escape_string($db, $_POST['username']);
	$session = mysqli_real_escape_string($db, $_POST['session']);
	$id=authenticate($username, $session);
	if($id){
		if($db->connect_error){
			$message = 'Could not connect to database';
		}
		else{
			$status = true;
			$sql = "SELECT * FROM ads";
			$result = $db->query($sql);
			while($row=$result->fetch_assoc())
			{
				$house_id = $row['id'];
				$owner_id = $row['owner_id'];
				$rating = 0;
				$sql = "SELECT user_id, rating FROM ratings WHERE ad_id='$house_id'";
				$ratingresults = $db->query($sql);
				$totalrating = 0;
				$totalusers = 0;
				$userrating = 0;
				if($ratingresults){
					while($r = $ratingresults->fetch_assoc()){
						$totalrating+=$r['rating'];
						$totalusers++;
						if($r['user_id']==$id)
							$userrating = $r['rating'];
					}
				}
				$row['avg_rating']=0;
				if($totalusers>0)
					$row['avg_rating'] = $totalrating/$totalusers;
				$row['user_rating'] = $userrating;
				$sql = "SELECT email,username FROM accounts WHERE id='$owner_id'";
				$ownerresults = $db->query($sql);
				if($ownerresults){
					if($r = $ownerresults->fetch_assoc()){
						$row['email']=$r['email'];
						$row['owner']=$r['username'];
					}
					else{
						$row['email']="N/A";
						$row['owner']="N/A";
					}
				}
				array_push($houses, $row);
			}
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message, 'houses' => $houses);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');
?>