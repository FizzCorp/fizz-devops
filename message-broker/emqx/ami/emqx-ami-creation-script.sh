echo -n "Please select the region: \n"
echo "1) us-east-1 (N. Virginia)"
echo "2) us-west-1 (N. California)"
echo "3) us-east-2 (Ohio)"
echo "4) us-west-2 (Oregon)"

read REGION_OPTION

case $REGION_OPTION in
  1)
	REGION=us-east-1
    IMAGE_ID=ami-02eac2c0129f6376b
    ;;
  2)
	REGION=us-west-1
    IMAGE_ID=ami-074e2d6769f445be5
    ;;
  3)
	REGION=us-east-2
    IMAGE_ID=ami-0f2b4fc905b0bd1f1
    ;;
  4)
	REGION=us-west-2
    IMAGE_ID=ami-01ed306a12b7d1c96
    ;;
  *)
    exit "Entered wrong input";;
esac

echo -n "Please enter the name of ami e.g test-fizz-emqx: \n" 
read TAG_NAME_VALUE

echo -n "Please enter the name of key pair: \n" 
read KEY_PAIR_NAME

echo -n "Please enter the key pair path e.g /Documents: \n" 
read EC2_KEY_PATH

echo -n "Please enter the emqx-ami path e.g /fizz-devops/fizz-ami: \n" 
read AMI_SCRIPT_PATH

ROLE_NAME=$TAG_NAME_VALUE-ami-role
INSTANCE_PROFILE_NAME=$TAG_NAME_VALUE-instance-ami-profile

echo "Creating security group"
SECURITY_GROUP_ID=`aws ec2 create-security-group --group-name $TAG_NAME_VALUE-sg --description "Fizz emqx AMI security group" --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value='"$TAG_NAME_VALUE"'}]' --region $REGION --output text --query "GroupId" | awk '{print}'`
aws ec2 authorize-security-group-ingress --group-id $SECURITY_GROUP_ID --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $REGION

echo "Initializing instance"
INSTANCE_ID=`aws ec2 run-instances --image-id $IMAGE_ID --count 1 --instance-type t3.micro --key-name $KEY_PAIR_NAME --security-group-ids $SECURITY_GROUP_ID --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value='"$TAG_NAME_VALUE"'}]' --block-device-mappings 'DeviceName=/dev/sda1,Ebs={DeleteOnTermination=true}' --region $REGION --output text --query "Instances[].InstanceId" | awk '{print}'`

echo "Creating role"
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{"Effect": "Allow","Principal": {"Service": "ec2.amazonaws.com"},"Action": "sts:AssumeRole"}]}' --output text --query 'Role.Arn'

echo "Attaching policy to role"
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly --role-name $ROLE_NAME

echo "Creating instance profile"
aws iam create-instance-profile --instance-profile-name $INSTANCE_PROFILE_NAME --output text --query 'InstanceProfile.Arn'

echo "Associating role to instance profile"
aws iam add-role-to-instance-profile --role-name $ROLE_NAME --instance-profile-name $INSTANCE_PROFILE_NAME

sleep 15
echo "Associating instance profile to ec2"
aws ec2 associate-iam-instance-profile --instance-id $INSTANCE_ID --iam-instance-profile Name=$INSTANCE_PROFILE_NAME --region $REGION --output text --query 'IamInstanceProfileAssociation.State'

PUBLIC_DNS_NAME=`aws ec2 describe-instances --instance-ids $INSTANCE_ID --region $REGION --output text --query 'Reservations[].Instances[].PublicDnsName'`

echo "Connecting to instance"
sleep 90

echo "Running emqx initialization script"
chmod 400 $EC2_KEY_PATH/$KEY_PAIR_NAME.pem
scp -o StrictHostKeyChecking=no -i $EC2_KEY_PATH/$KEY_PAIR_NAME.pem $AMI_SCRIPT_PATH/emqx-ami.sh centos@$PUBLIC_DNS_NAME:/home/centos/emqx-ami.sh
ssh -o StrictHostKeyChecking=no -i $EC2_KEY_PATH/$KEY_PAIR_NAME.pem centos@$PUBLIC_DNS_NAME "sudo sh /home/centos/emqx-ami.sh"
sleep 60

echo "Creating AMI"
aws ec2 create-image --instance-id $INSTANCE_ID --name $TAG_NAME_VALUE-ami --reboot --tag-specifications ResourceType=snapshot,Tags="[{Key=Name,Value='"$TAG_NAME_VALUE-snaphot"'}]" ResourceType=image,Tags="[{Key=Name,Value='"$TAG_NAME_VALUE-ami"'}]" --region $REGION
sleep 360

echo "Deleting resources used to create AMI"
echo "Deleting instance"
aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $REGION --output text --query 'TerminatingInstances[].CurrentState.Name'
sleep 120
echo "Detachng role from instance profile "
aws iam remove-role-from-instance-profile --instance-profile-name $INSTANCE_PROFILE_NAME --role-name $ROLE_NAME
echo "Detaching policy from role"
aws iam detach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
echo "Deleting instance profile"
aws iam delete-instance-profile --instance-profile-name $INSTANCE_PROFILE_NAME
echo "Deleting role"
aws iam delete-role --role-name $ROLE_NAME
echo "Deleting security group"
aws ec2 delete-security-group --group-id $SECURITY_GROUP_ID --region $REGION

echo "END OF SCRIPT"