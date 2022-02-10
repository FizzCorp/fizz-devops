lambda_func=$1
source_dir=$2
source_lambda=$3
package_file_name=$(date +%s)
package_file=$package_file_name.zip

sh ./package_lambda.sh $source_dir $source_lambda $package_file_name
aws lambda update-function-code --function-name $lambda_func --zip-file fileb://./$package_file
rm ./$package_file
