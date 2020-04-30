# AI API

## Install unilm-v1 on macos

PWD_DIR=$(pwd)
cd $(mktemp -d)
git clone -q https://github.com/NVIDIA/apex.git
cd apex
git reset --hard 1603407bf49c7fc3da74fceb6a6c7b47fece2ef8
python setup.py install --user --cuda_ext --cpp_ext --prefix=
cd $PWD_DIR




```
pip install --user tensorboardX six numpy tqdm path.py pandas scikit-learn lmdb pyarrow py-lz4framed methodtools py-rouge pyrouge nltk torch
python -c "import nltk; nltk.download('punkt')"
pip install -e git://github.com/Maluuba/nlg-eval.git#egg=nlg-eval
```


```
cd unilm/unilm-v1/src
pip install --user --editable .


DATA_DIR=~/workspace-ai/ai-api/data/unilm/qg/test
MODEL_RECOVER_PATH=~/workspace-ai/ai-api/data/unilm/fine_tuned_models/qg_model/qg_model.bin
EVAL_SPLIT=test
export PYTORCH_PRETRAINED_BERT_CACHE=~/workspace-ai/ai-api/data/unilm/.tmp/bert-cased-pretrained-cache
# run decoding
python biunilm/decode_seq2seq.py --bert_model bert-large-cased --new_segment_ids --mode s2s \
  --input_file ${DATA_DIR}/exp1_data_test.pa.tok.txt --split ${EVAL_SPLIT} --tokenized_input \
  --model_recover_path ${MODEL_RECOVER_PATH} \
  --max_seq_length 512 --max_tgt_length 48 \
  --batch_size 16 --beam_size 1 --length_penalty 0
# run evaluation using our tokenized data as reference
python qg/eval_on_unilm_tokenized_ref.py --out_file qg/output/qg.test.output.txt
# run evaluation using tokenized data of Du et al. (2017) as reference
python qg/eval.py --out_file qg/output/qg.test.output.txt