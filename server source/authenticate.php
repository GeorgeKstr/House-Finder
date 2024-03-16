<?php
	function authenticate($username, $session){
		include('database.php');
		if(empty($username)||empty($session))
			return false;
		$sql = "SELECT id FROM accounts WHERE username='$username' AND session='$session'";
		if($db->connect_error){
			return false;
		}
		else{
			$result = $db->query($sql);
			if($result->num_rows>0){
				$row=$result->fetch_assoc();
				$id=$row['id'];
				return $id;
			}
		}
		return false;
	}
?>