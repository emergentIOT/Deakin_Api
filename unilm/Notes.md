# AI API


## Install unilm-v1 on Linux using Docker

After installing 
https://github.com/NVIDIA/nvidia-docker

Replaced --runtime=nvidia with --gpus all

## Run unilm-v1 on Linux using Docker

DATA_DIR=/home/joel/workspace-ai/ai-api/data/unilm/qg/test
MODEL_RECOVER_PATH=/home/joel/workspace-ai/ai-api/data/unilm/fine_tuned_models/qg_model/qg_model.bin
EVAL_SPLIT=test
export PYTORCH_PRETRAINED_BERT_CACHE=/home/joel/workspace-ai/ai-api/data/unilm/.tmp/bert-cased-pretrained-cache
# run decoding
python biunilm/decode_seq2seq.py --bert_model bert-large-cased --new_segment_ids --mode s2s \
  --input_file ${DATA_DIR}/exp1_data_test.pa.tok.txt --split ${EVAL_SPLIT} --tokenized_input \
  --model_recover_path ${MODEL_RECOVER_PATH} \
  --max_seq_length 512 --max_tgt_length 48 \
  --batch_size 16 --beam_size 1 --length_penalty 0


python gigaword/eval.py --pred ${MODEL_RECOVER_PATH}.${EVAL_SPLIT} \
  --gold ${DATA_DIR}/org_data/${EVAL_SPLIT}.tgt.txt --perl

  
# run evaluation using our tokenized data as reference
python qg/eval_on_unilm_tokenized_ref.py --out_file qg/output/qg.test.output.txt
# run evaluation using tokenized data of Du et al. (2017) as reference
python qg/eval.py --out_file qg/output/qg.test.output.txt