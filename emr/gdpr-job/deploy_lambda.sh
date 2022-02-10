package_file_name=$(date +%s)
package_file=$package_file_name.zip

sh ./package_lambda.sh ./emr gdprJob.js $package_file_name
aws lambda update-function-code --function-name fizz-gdpr-job --zip-file fileb://./$package_file
rm ./$package_file
