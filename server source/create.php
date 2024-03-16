<?php
	include('database.php');
	include('authenticate.php');
	header('Access-Control-Allow-Origin: *');
	$callback = isset($_GET['callback']) ? preg_replace('/[^a-z0-9$_]/si', '', $_GET['callback']) : false;
	header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
	$username=mysqli_real_escape_string($db, $_POST['username']);
	$session=mysqli_real_escape_string($db, $_POST['session']);
	$category=mysqli_real_escape_string($db, $_POST['category']);
	$title=mysqli_real_escape_string($db, $_POST['title']);
	$address=mysqli_real_escape_string($db, $_POST['address']);
	$details=mysqli_real_escape_string($db, $_POST['details']);
	$x=mysqli_real_escape_string($db, $_POST['x']);
	$y=mysqli_real_escape_string($db, $_POST['y']);
	$message='Your session has expired';
	$status=false;
	$thumbnail_width = 128;
	$thumbnail_height = 128;
	$imagefolder = "images/";
	$thumbfolder = "thumbnails/";
	if(empty($title))
		$message='Ad title is required';
	else if(empty($x) || empty($y))
		$message='GPS location is required';
	else{
		$id = authenticate($username, $session);
		if($id){
			$sql = "INSERT INTO ads (owner_id, category, title, address, details, x, y) 
					VALUES ('$id', '$category', '$title', '$address', '$details', '$x', '$y')";
			$db->query($sql);
			if(!empty($_FILES['image']))
			{
				$id=$db->insert_id;
				$img=$_FILES['image']['name'];
				$tmp=$_FILES['image']['tmp_name'];
				$ext=strtolower(pathinfo($img, PATHINFO_EXTENSION));
				$final_image=$id.".".$ext;
				$valid_extensions = array('jpeg', 'jpg', 'png', 'gif', 'bmp' , 'pdf' , 'doc' , 'ppt');
				if(in_array($ext, $valid_extensions))
				{
					$path=$imagefolder.strtolower($final_image);
					if(move_uploaded_file($tmp, $path))
					{
						$thumb=imagecreatetruecolor($thumb_width,$thumb_height);
						$thumb_path = $thumbfolder.strtolower($final_image);
						list($width,$height) = getimagesize($path);
						switch($ext){
							case 'gif':
								$src = imagecreatefromgif($path);
								break;
							case 'png':
								$src = imagecreatefrompng($path);
								break;
							case 'jpeg':
								$src = imagecreatefromjpeg($path);
								break;
							case 'jpg':
								$src = imagecreatefromjpeg($path);
								break;
							default:
								$src = imagecreatefromjpeg($path);
						}
						imagecopyresized($thumb,$src,0,0,0,0,$thumb_width,$thumb_height,$width,$height);
						switch($ext){
							case 'jpg' || 'jpeg':
								imagejpeg($thumb,$thumb_path,100);
								break;
							case 'png':
								imagepng($thumb,$thumb_path,100);
								break;

							case 'gif':
								imagegif($thumb,$thumb_path,100);
								break;
							default:
								imagejpeg($thumb,$thumb_path,100);
						}
						$sql="UPDATE ads SET imagefile='$path',thumbfile='$thumb_path' WHERE id='$id'";
						$db->query($sql);
					}
				}
			}
			$message='Report sent';
			$status=true;
			
		}
	}
	mysqli_close($db);
	$output = array('status' => $status, 'message' => $message);
	echo ($callback ? $callback . '(' : '') . json_encode($output) . ($callback ? ')' : '');


?>