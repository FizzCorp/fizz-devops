source_dir=$1
source_lambda=$2
package_file=$3.zip
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# make temp directory
temp_dir=temp_$(date +%s)
mkdir $temp_dir

# move source to temp directory
cp -rf $source_dir/config ./$temp_dir/config
cp -rf $source_dir/infra ./$temp_dir/infra
cp -rf $source_dir/kinesis ./$temp_dir/kinesis
cp -rf $source_dir/node_modules ./$temp_dir/node_modules
cp $source_dir/package.json ./$temp_dir/package.json
cp $source_dir/streamDequeuer.js ./$temp_dir/streamDequeuer.js
cp $source_dir/streamProcessor.js ./$temp_dir/streamProcessor.js
cp $source_dir/rollup.js ./$temp_dir/rollup.js
cp $source_dir/tsdbExport.js ./$temp_dir/tsdbExport.js
cp $source_dir/dailyBatchJob.js ./$temp_dir/dailyBatchJob.js
cp $source_dir/dailyJobEventStreaming.js ./$temp_dir/dailyJobEventStreaming.js
cp $source_dir/utils.js ./$temp_dir/utils.js
mv ./$temp_dir/$source_lambda ./$temp_dir/index.js
#cp $source_dir/$source_lambda ./$temp_dir/index.js

cd $temp_dir

rm -r ./node_modules
npm install --production

# zip contents of temp directory
zip -r -0 ./$package_file ./*
mv ./$package_file $script_dir/$package_file

# cleanup temp directory
cd $script_dir
rm -r $temp_dir
