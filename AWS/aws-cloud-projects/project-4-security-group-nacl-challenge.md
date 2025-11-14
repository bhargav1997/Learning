# Security Group and NACL Challenge

In this challenge you will create a custom VPC and two security groups. You will then launch EC2 instances and test connectivity using different protocols

# 1. Create a Custom VPC

1. Create a VPC choosing the "VPC and more" option
2. Provide a name for the VPC, e.g. lab1-custom
3. No NAT Gateway
4. Use defaults for other selections
5. Modify the public subnets to auto assign IPv4 addresses

# 2. Security Groups and NACLs

***all actions to be performed using the VPC created in Lab 1***

1. Create a security group called SGA
2. Create a security group called SGB
3. Configure security group rules:

## Rules for SGA

| Direction | Protocol | Port  | Source        | Description                 |
|-----------|----------|-------|---------------|-----------------------------|
| Inbound   | HTTP     | 80    | 0.0.0.0/0     | Allows HTTP traffic from anywhere. |
| Inbound   | SSH      | 22    | 0.0.0.0/0     | Allows SSH traffic from anywhere.  |
| Outbound  | All      | All   | 0.0.0.0/0     | Allows all outbound traffic anywhere. |


## Rules for SGB

| Direction | Type         | Protocol | Port Range | Source/Destination | Description                      |
|-----------|--------------|----------|------------|--------------------|----------------------------------|
| Inbound   | HTTP         | TCP      | 80         | 0.0.0.0/0          | Inbound HTTP from anywhere       |
| Inbound   | SSH          | TCP      | 22         | 0.0.0.0/0          | Inbound SSH from anywhere        |
| Inbound   | All ICMP - IPv4 | ICMP  | N/A        | SGA                | Inbound All ICMP - IPv4 from SGA |
| Outbound  | All traffic  | All      | All        | 0.0.0.0/0          | Allow all traffic anywhere       |


4. Launch two instances in the same or separate public subnets within the custom VPC. Add one to SGA and one to SGB

- Use the following user data:

***user data for instances***

```bash
#!/bin/bash
yum update -y
yum install -y httpd
systemctl start httpd
systemctl enable httpd
```

6. Attempt to make the following connections (all should work):

- Connect via a web browser to public IP each instance (should display the Apache test page)
- Connect via EC2 instance connect to each instance
- Ping the the private IP address of the instance in SGB from the instance in SGA
- Attempt to retrieve the Apache test page on the instance in SGA from the instance in SGB using 'curl http://<public ip of public instance>'

7. Make the following changes:
- Enable inbound HTTP access only from your home IP address for SGA (then test)
- Use a NACL to deny traffic from your home IP (then test again)
- Update SGB so that it only allows HTTP from SGA
- Enable ICMP in both directions

8. Test all of the above changes to ensure the relevant traffic flows work correctly