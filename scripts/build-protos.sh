#!/usr/bin/env bash

# Generate js clients for third party protos
# Ref: https://github.com/grpc/grpc-web/tree/master/net/grpc/gateway/examples/helloworld#generate-protobuf-messages-and-client-service-stub

echo "Starting protoc gRPC generator"
set -eo pipefail

echo "Cleaning build"
rm -rf third_party/build/*

echo "Generating js & ts files"
proto_dirs=$(find ./third_party/proto -path -prune -o -name '*.proto' -print0 | xargs -0 -n1 dirname | sort | uniq)
for dir in $proto_dirs; do
  protoc \
  -I "third_party/proto" \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out="third_party/build" \
  --js_out=import_style=commonjs,binary:./third_party/build \
  --grpc-web_out=import_style=commonjs,mode=grpcwebtext:./third_party/build \
  $(find "${dir}" -maxdepth 1 -name '*.proto')
done

echo "Renaming grpc ts files"
for file in `find ./third_party/build -iname "*grpc_pb.d.ts"`; do
  mv -f "$file" "${file/grpc_pb.d.ts/grpc_web_pb.d.ts}"
done

echo "Copying compiled files from third_party/build to src/proto"
rm -rf ./src/proto/*
cp -r ./third_party/build/* ./src/proto/.

echo "Cleaning build"
rm -rf third_party/build/*

echo "Process has completed"