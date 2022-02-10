# Update and upgrade packages
yum -y update
# Make sure the following packages are installed.
yum install unzip -y
yum install yum-utils -y
yum install device-mapper-persistent-data -y
yum install lvm2 -y
yum install wget -y

# Run the following commands in orders.

# Setting some defaults
# Linux Kernel Tuning
# The system-wide limit on max opened file handles
# 2 million system-wide
sysctl -w fs.file-max=2097152
sysctl -w fs.nr_open=2097152
echo 2097152 > /proc/sys/fs/nr_open
echo "fs.file-max = 2097152" >> /etc/sysctl.conf
ulimit -n 1048576
#Set the maximum number of file handles for the service in /etc/systemd/system.conf:
echo "DefaultLimitNOFILE=1048576" >> /etc/systemd/system.conf
#Persist the maximum number of opened file handles for users in /etc/security/limits.conf:
echo "*               soft    nofile            048576" >> /etc/security/limits.conf
echo "*               hard    nofile            1048576" >> /etc/security/limits.conf
# Network Tuning
# Increase number of incoming connections backlog
sysctl -w net.core.somaxconn=32768
sysctl -w net.ipv4.tcp_max_syn_backlog=16384
sysctl -w net.core.netdev_max_backlog=16384
# Local Port Range
sysctl -w net.ipv4.ip_local_port_range='1000 65535'
# Read/Write Buffer for TCP connections
sysctl -w net.core.rmem_default=262144
sysctl -w net.core.wmem_default=262144
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216
sysctl -w net.core.optmem_max=16777216
sysctl -w net.ipv4.tcp_rmem='1024 4096 16777216'
sysctl -w net.ipv4.tcp_wmem='1024 4096 16777216'
# Connection Tracking
sysctl -w net.nf_conntrack_max=1000000
sysctl -w net.netfilter.nf_conntrack_max=1000000
sysctl -w net.netfilter.nf_conntrack_tcp_timeout_time_wait=30
# The TIME-WAIT Buckets Pool, Recycling and Reuse
sysctl -w net.ipv4.tcp_max_tw_buckets=1048576
# Timeout for FIN-WAIT-2 sockets
sysctl -w net.ipv4.tcp_fin_timeout=15


# install ec2 meta
curl http://s3.amazonaws.com/ec2metadata/ec2-metadata -o /bin/ec2-metadata
chmod u+x /bin/ec2-metadata

# Using pip install awscli
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-2.2.20.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# install ssm agent
yum install -y https://s3.us-west-1.amazonaws.com/amazon-ssm-us-west-1/latest/linux_amd64/amazon-ssm-agent.rpm

#install openssl version 1.1.1
yum group install 'Development Tools' -y
yum install perl-core zlib-devel -y
cd /usr/local/src/
wget https://www.openssl.org/source/openssl-1.1.1c.tar.gz
tar -xf openssl-1.1.1c.tar.gz
cd openssl-1.1.1c
./config --prefix=/usr/local/ssl --openssldir=/usr/local/ssl shared zlib
make
make test
make install
cd /etc/ld.so.conf.d/
echo "/usr/local/ssl/lib" > openssl-1.1.1c.conf
ldconfig -v
mv /bin/openssl /bin/openssl.backup
echo  "#Set OPENSSL_PATH
OPENSSL_PATH="/usr/local/ssl/bin"
export OPENSSL_PATH
PATH=$PATH:$OPENSSL_PATH
export PATH" > /etc/profile.d/openssl.sh
chmod +x /etc/profile.d/openssl.sh
source /etc/profile.d/openssl.sh
echo $PATH

# install EMQX
rpm -ivh https://github.com/emqx/emqx/releases/download/v4.3.8/emqx-centos7-4.3.8-amd64.rpm
systemctl start emqx.service

# Configure EMQX
# Erlang VM Tuning
sed -i "/node.process_limit/c\node.process_limit = 2097152" /etc/emqx/emqx.conf
sed -i "/node.max_ports/c\node.max_ports = 1048576" /etc/emqx/emqx.conf
# The EMQ X Broker
sed -i "/listener.tcp.external = /c\listener.tcp.external = 0.0.0.0:1883" /etc/emqx/emqx.conf
sed -i "/listener.tcp.external.acceptors = /c\listener.tcp.external.acceptors = 64" /etc/emqx/emqx.conf
sed -i "/listener.tcp.external.max_connections = /c\listener.tcp.external.max_connections = 1024000" /etc/emqx/emqx.conf
# Cluster Configurations
sed -i "/zone.external.server_keepalive/c\zone.external.server_keepalive = 60" /etc/emqx/emqx.conf

# Exhooks plugin Configurations
echo "exhook.server.default.url = http://localhost:5000" > /etc/emqx/plugins/emqx_exhook.conf

# Start Broker
emqx restart

# Load required Plugin
emqx_ctl plugins load emqx_exhook
emqx_ctl plugins unload emqx_telemetry

# install docker
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install -y docker-ce
systemctl start docker
systemctl enable docker

# pull fizz emqx chat service image
FIZZ_EMQX_CHAT_IMAGE_URL=adminfizz/fizz-emqx-chat:latest
docker image pull $FIZZ_EMQX_CHAT_IMAGE_URL

# pull metrics service image
METRICS_IMAGE_URL=adminfizz/emqx-node-metrics:latest
docker image pull $METRICS_IMAGE_URL

# Reboot Node to apply changes
reboot